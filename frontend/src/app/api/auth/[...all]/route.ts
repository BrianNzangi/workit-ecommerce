export const dynamic = 'force-dynamic';

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

const logAuthRequest = (request: Request) => {
    if (process.env.OTP_DEBUG !== "true") return;
    try {
        const url = new URL(request.url);
        console.info("[Auth Route] Request", {
            method: request.method,
            path: url.pathname,
        });
    } catch {
        console.info("[Auth Route] Request", { method: request.method });
    }
};

export const GET = async (request: Request) => {
    logAuthRequest(request);
    return handler.GET(request);
};

export const POST = async (request: Request) => {
    logAuthRequest(request);
    return handler.POST(request);
};
