"use client";

import { HttpLink } from "@apollo/client";
import {
    ApolloNextAppProvider,
    ApolloClient,
    InMemoryCache,
} from "@apollo/experimental-nextjs-app-support";

function makeClient() {
    const httpLink = new HttpLink({
        // this needs to be an absolute url, as relative urls cannot be used in SSR
        uri: "http://localhost:3001/api/graphql",
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
