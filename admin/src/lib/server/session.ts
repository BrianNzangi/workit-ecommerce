import { auth } from "@/lib/auth/auth-server";
import { headers } from "next/headers";

export async function getSession() {
    return await auth.api.getSession({
        headers: await headers()
    });
}
