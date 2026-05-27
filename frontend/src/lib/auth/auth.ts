import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db, schema } from "@workit/db";
import { renderEmail } from "@/lib/email/renderEmail";
import { buildLoginCodeHtml } from "@/lib/email/templates/loginCode";

type OtpType = "sign-in" | "email-verification" | "forget-password";

const OTP_EXPIRES_MINUTES = 5;
const timeoutFromEnv = Number(process.env.OTP_EMAIL_TIMEOUT_MS ?? "10000");
const EMAIL_REQUEST_TIMEOUT_MS = Number.isFinite(timeoutFromEnv) && timeoutFromEnv > 0
    ? timeoutFromEnv
    : 10000;

const otpMessageByType: Record<OtpType, { subject: string }> = {
    "sign-in": {
        subject: "Your code: {{otp_code}}",
    },
    "email-verification": {
        subject: "Your code: {{otp_code}}",
    },
    "forget-password": {
        subject: "Your code: {{otp_code}}",
    },
};

const getOtpType = (type: string): OtpType =>
    type === "email-verification" || type === "forget-password" || type === "sign-in"
        ? type
        : "sign-in";

const buildOtpEmail = ({
    otp,
    type,
    email,
}: {
    otp: string;
    type: OtpType;
    email: string;
}) => {
    const message = otpMessageByType[type];
    const body = buildLoginCodeHtml({ otp, email, expiresMinutes: OTP_EXPIRES_MINUTES });
    const html = renderEmail({
        previewText: `Your Workit login code: ${otp}`,
        body,
    });

    const text =
        `${message.subject}\n\n` +
        `Enter your email to receive a one-time login code.\n\n` +
        `We've sent a 6-digit login code to ${email}.\n\n` +
        `Code: ${otp}\n` +
        `Expires in ${OTP_EXPIRES_MINUTES} minutes.\n\n` +
        `If you didn't request this, you can ignore this email.`;

    return {
        subject: message.subject,
        html,
        text,
        templateData: { otp_code: otp, email },
    };
};

const fetchWithTimeout = async (
    url: string,
    init: RequestInit,
    timeoutMs: number = EMAIL_REQUEST_TIMEOUT_MS,
) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            ...init,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timer);
    }
};

const runWithTimeout = async <T>(
    action: Promise<T>,
    timeoutMs: number,
    timeoutMessage: string,
) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    });

    try {
        return await Promise.race([action, timeoutPromise]);
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
};

const sendOtpViaResend = async ({
    to,
    subject,
    html,
    text,
}: {
    to: string;
    subject: string;
    html: string;
    text: string;
    templateData?: Record<string, string>;
}) => {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || process.env.OTP_FROM_EMAIL?.trim();
    if (!apiKey || !fromEmail) {
        console.warn("[Auth OTP] Resend not configured", {
            hasApiKey: !!apiKey,
            hasFromEmail: !!fromEmail,
        });
        return false;
    }

    const response = await fetchWithTimeout("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            from: fromEmail,
            to: [to],
            subject,
            html,
            text,
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        console.error("[Auth OTP] Resend send failed", {
            status: response.status,
            body: body.slice(0, 500),
        });
        throw new Error(`Resend send failed (${response.status}): ${body}`);
    }

    return true;
};

const sendOtpViaPlunk = async ({
    to,
    subject,
    html,
    text,
    templateData,
}: {
    to: string;
    subject: string;
    html: string;
    text: string;
    templateData?: Record<string, string>;
}) => {
    const apiKey = process.env.PLUNK_API_KEY?.trim();
    const fromEmail = process.env.PLUNK_FROM_EMAIL?.trim() || process.env.OTP_FROM_EMAIL?.trim();
    const plunkTemplateId = process.env.PLUNK_TEMPLATE_ID?.trim();
    if (!apiKey || !fromEmail) {
        console.warn("[Auth OTP] Plunk not configured", {
            hasApiKey: !!apiKey,
            hasFromEmail: !!fromEmail,
        });
        return false;
    }

    const body: Record<string, unknown> = {
        to,
        subject,
        from: fromEmail,
    };

    if (plunkTemplateId && templateData) {
        body.templateId = plunkTemplateId;
        body.data = templateData;
    } else {
        body.body = html;
    }

    const response = await fetchWithTimeout("https://next-api.useplunk.com/v1/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error("[Auth OTP] Plunk send failed", {
            status: response.status,
            body: errText.slice(0, 500),
            usedTemplate: !!plunkTemplateId,
        });
        throw new Error(`Plunk send failed (${response.status}): ${errText}`);
    }

    if (process.env.OTP_DEBUG === "true") {
        console.info("[Auth OTP] Plunk send accepted", {
            status: response.status,
            to,
            subject,
            usedTemplate: !!plunkTemplateId,
        });
    }

    return true;
};

const sendOtpViaUnosend = async ({
    to,
    subject,
    html,
    text,
}: {
    to: string;
    subject: string;
    html: string;
    text: string;
    templateData?: Record<string, string>;
}) => {
    const apiKey = process.env.UNOSEND_API_KEY?.trim();
    const fromEmail = process.env.UNOSEND_FROM_EMAIL?.trim() || process.env.OTP_FROM_EMAIL?.trim();
    const fromName = process.env.UNOSEND_FROM_NAME?.trim() || "Workit";
    if (!apiKey || !fromEmail) {
        console.warn("[Auth OTP] Unosend not configured", {
            hasApiKey: !!apiKey,
            hasFromEmail: !!fromEmail,
        });
        return false;
    }
    const from = `${fromName} <${fromEmail}>`;

    const response = await fetchWithTimeout("https://www.unosend.co/api/v1/emails", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            from,
            to: [to],
            subject,
            html,
            text,
        }),
    });

    const shouldLogResponseBody = process.env.OTP_DEBUG === "true";
    const responseText = shouldLogResponseBody || !response.ok ? await response.text() : "";

    if (!response.ok) {
        const body = responseText;
        console.error("[Auth OTP] Unosend send failed", {
            status: response.status,
            body: body.slice(0, 500),
        });
        throw new Error(`Unosend send failed (${response.status}): ${body}`);
    }

    if (process.env.OTP_DEBUG === "true") {
        let parsedBody: unknown = responseText;
        if (responseText) {
            try {
                parsedBody = JSON.parse(responseText);
            } catch {
                parsedBody = responseText;
            }
        }
        console.info("[Auth OTP] Unosend send accepted", {
            status: response.status,
            to,
            subject,
            body: parsedBody,
        });
    }

    return true;
};

const splitOrigins = (value?: string): string[] =>
    (value ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

const configuredOrigins = Array.from(
    new Set([
        ...splitOrigins(process.env.BETTER_AUTH_TRUSTED_ORIGINS),
        ...splitOrigins(process.env.CORS_ORIGIN),
        ...splitOrigins(process.env.NEXT_PUBLIC_APP_URL),
        ...splitOrigins(process.env.NEXT_PUBLIC_FRONTEND_BASE_URL),
        ...splitOrigins(process.env.FRONTEND_URL),
        ...splitOrigins(process.env.NEXT_PUBLIC_AUTH_BASE_URL),
        ...splitOrigins(process.env.ADMIN_URL),
    ]),
);

const authBaseUrl =
    process.env.NEXT_PUBLIC_AUTH_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_FRONTEND_BASE_URL;
const authCookiePrefix =
    process.env.NEXT_PUBLIC_AUTH_COOKIE_PREFIX?.trim() ||
    process.env.AUTH_COOKIE_PREFIX?.trim() ||
    "store-auth";
const betterAuthSecret =
    process.env.BETTER_AUTH_SECRET?.trim() ||
    (process.env.NEXT_PHASE === "phase-production-build"
        ? "build-placeholder-secret"
        : undefined);

if (!betterAuthSecret) {
    throw new Error("BETTER_AUTH_SECRET is required for storefront auth.");
}

export const auth = betterAuth({
    secret: betterAuthSecret,
    ...(authBaseUrl ? { baseURL: authBaseUrl } : {}),
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "CUSTOMER",
            },
            firstName: {
                type: "string",
            },
            lastName: {
                type: "string",
            },
        },
    },
    ...(configuredOrigins.length ? { trustedOrigins: configuredOrigins } : {}),
    advanced: {
        cookiePrefix: authCookiePrefix,
    },
    plugins: [
        emailOTP({
            disableSignUp: true,
            allowedAttempts: 5,
            async sendVerificationOTP({ email, otp, type }) {
                const normalizedType = getOtpType(type);
                const { subject, html, text, templateData } = buildOtpEmail({
                    otp,
                    type: normalizedType,
                    email,
                });

                try {
                    const providerOrder = (
                        process.env.OTP_EMAIL_PROVIDER?.trim().toLowerCase() === "resend"
                            ? [sendOtpViaResend, sendOtpViaPlunk, sendOtpViaUnosend]
                            : process.env.OTP_EMAIL_PROVIDER?.trim().toLowerCase() === "plunk"
                                ? [sendOtpViaPlunk, sendOtpViaResend, sendOtpViaUnosend]
                                : [sendOtpViaPlunk, sendOtpViaUnosend, sendOtpViaResend]
                    );

                    if (process.env.OTP_DEBUG === "true") {
                        console.info("[Auth OTP] Sending OTP", {
                            type: normalizedType,
                            email,
                            providerOrder: providerOrder.map((provider) => provider.name),
                            hasPlunkKey: !!process.env.PLUNK_API_KEY,
                            hasUnosendKey: !!process.env.UNOSEND_API_KEY,
                            hasResendKey: !!process.env.RESEND_API_KEY,
                            fromPlunk: !!process.env.PLUNK_FROM_EMAIL,
                            fromUnosend: !!process.env.UNOSEND_FROM_EMAIL,
                            fromResend: !!process.env.RESEND_FROM_EMAIL,
                            fromFallback: !!process.env.OTP_FROM_EMAIL,
                        });
                    }

                    const failures: string[] = [];
                    let attempted = false;

                    for (const provider of providerOrder) {
                        try {
                            const sent = await runWithTimeout(
                                provider({
                                    to: email,
                                    subject,
                                    html,
                                    text,
                                    templateData,
                                }),
                                EMAIL_REQUEST_TIMEOUT_MS,
                                "OTP email provider timeout",
                            );
                            if (sent) return;
                        } catch (err) {
                            attempted = true;
                            const message = err instanceof Error ? err.message : String(err);
                            failures.push(`${provider.name}: ${message}`);
                            console.error("[Auth OTP] Provider failed", {
                                provider: provider.name,
                                message,
                            });
                        }
                    }

                    if (failures.length) {
                        throw new Error(`OTP email providers failed: ${failures.join(" | ")}`);
                    }

                    throw new Error(
                        "OTP email provider is not configured. Set PLUNK_API_KEY and PLUNK_FROM_EMAIL (or OTP_FROM_EMAIL). You can force provider with OTP_EMAIL_PROVIDER=plunk.",
                    );
                } catch (error) {
                    const message = error instanceof Error ? error.message : "Unknown OTP provider error";
                    console.error(`[Auth OTP] Failed to send OTP (${normalizedType}) to ${email}: ${message}`);
                    throw error;
                }
            },
        }),
        nextCookies(),
    ],
});
