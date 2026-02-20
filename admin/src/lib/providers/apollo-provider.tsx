"use client";

import { HttpLink } from "@apollo/client";
import {
    ApolloNextAppProvider,
    ApolloClient,
    InMemoryCache,
} from "@apollo/experimental-nextjs-app-support";

function getGraphqlUri() {
    const env = process.env as Record<string, string | undefined>;
    const explicit = env.NEXT_PUBLIC_GRAPHQL_URL?.trim();
    if (explicit) return explicit;

    const backend =
        env.BACKEND_API_URL ||
        env.BACKEND_URL ||
        env.NEXT_PUBLIC_BACKEND_URL ||
        env.NEXT_PUBLIC_API_URL ||
        "http://localhost:3001";

    return `${backend.replace(/\/$/, "")}/api/graphql`;
}

function makeClient() {
    const httpLink = new HttpLink({
        // Keep URI env-driven to avoid local/prod drift.
        uri: getGraphqlUri(),
        // simple fetch options if needed
        fetchOptions: { cache: "no-store" },
    });

    return new ApolloClient({
        cache: new InMemoryCache(),
        link: httpLink,
    });
}

export function ApolloProvider({ children }: React.PropsWithChildren) {
    return (
        <ApolloNextAppProvider makeClient={makeClient}>
            {children}
        </ApolloNextAppProvider>
    );
}
