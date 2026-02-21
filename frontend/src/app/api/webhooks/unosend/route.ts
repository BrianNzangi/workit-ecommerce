import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

type UnosendEventType =
    | "email.sent"
    | "email.delivered"
    | "email.opened"
    | "email.clicked"
    | "email.bounced"
    | "email.complained"
    | "email.failed"
    | "contact.unsubscribed";

interface UnosendWebhookEvent {
    id: string;
    type: UnosendEventType | string;
    created_at?: string;
    data?: {
        email_id?: string;
        from?: string;
        to?: string;
        subject?: string;
        timestamp?: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

const verifyUnosendSignature = ({
    rawBody,
    signature,
    secret,
}: {
    rawBody: string;
    signature: string;
    secret: string;
}) => {
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const expectedBuffer = Buffer.from(expected, "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (expectedBuffer.length !== signatureBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
};

const logWebhookEvent = (event: UnosendWebhookEvent) => {
    const recipient = event.data?.to || "unknown";
    const emailId = event.data?.email_id || "unknown";
    console.log(`[Unosend Webhook] ${event.type} recipient=${recipient} email_id=${emailId}`);
};

export async function POST(request: NextRequest) {
    const rawBody = await request.text();
    const signature = request.headers.get("x-unosend-signature");
    const webhookSecret = process.env.UNOSEND_WEBHOOK_SECRET?.trim();

    if (webhookSecret) {
        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 401 });
        }

        const valid = verifyUnosendSignature({
            rawBody,
            signature,
            secret: webhookSecret,
        });

        if (!valid) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
    } else {
        console.warn("[Unosend Webhook] UNOSEND_WEBHOOK_SECRET is not set; signature verification is disabled.");
    }

    let event: UnosendWebhookEvent;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    logWebhookEvent(event);

    return NextResponse.json({ received: true });
}

export async function GET() {
    return NextResponse.json({
        status: "ok",
        endpoint: "/api/webhooks/unosend",
    });
}

