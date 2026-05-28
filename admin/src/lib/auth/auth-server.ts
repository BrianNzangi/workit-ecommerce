export type User = {
    id: string;
    email?: string | null;
    name?: string | null;
    role?: string | null;
    firstName?: string | null;
    lastName?: string | null;
};

export type Session = {
    user: User;
    session?: unknown;
};

const getBackendUrl = () => {
    const env = process.env as Record<string, string | undefined>;
    return (
        env.BACKEND_API_URL ||
        env.BACKEND_URL ||
        env.NEXT_PUBLIC_BACKEND_URL ||
        env.NEXT_PUBLIC_API_URL ||
        "http://localhost:3001"
    ).replace(/\/$/, "");
};

async function getSession({ headers }: { headers: Headers }): Promise<Session | null> {
    const cookie = headers.get("cookie");
    const response = await fetch(`${getBackendUrl()}/auth/get-session`, {
        headers: cookie ? { cookie } : undefined,
        cache: "no-store",
    });

    if (!response.ok) {
        return null;
    }

    return response.json();
}

export const auth = {
    api: {
        getSession,
    },
};
