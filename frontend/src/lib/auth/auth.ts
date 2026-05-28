type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
};

type SessionResult = {
  user: SessionUser;
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

const forwardHeaders = (headers: Headers) => {
  const forwarded = new Headers();
  const cookie = headers.get("cookie");
  if (cookie) forwarded.set("cookie", cookie);
  return forwarded;
};

async function getSession({ headers }: { headers: Headers }): Promise<SessionResult | null> {
  const response = await fetch(`${getBackendUrl()}/auth/get-session`, {
    headers: forwardHeaders(headers),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

async function updateUser({ headers, body }: { headers: Headers; body: Record<string, unknown> }) {
  const response = await fetch(`${getBackendUrl()}/auth/update-user`, {
    method: "POST",
    headers: {
      ...Object.fromEntries(forwardHeaders(headers)),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Backend auth update failed with status ${response.status}`);
  }

  return response.json();
}

export const auth = {
  api: {
    getSession,
    updateUser,
  },
};

export type Session = SessionResult;
export type User = SessionUser;
