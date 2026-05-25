"use client";

type MetaEventName =
  | "AddToCart"
  | "InitiateCheckout"
  | "Contact"
  | "Search"
  | "Purchase"
  | "ViewContent";

type TrackMetaEventBody = {
  eventName: MetaEventName;
  eventId?: string;
  eventSourceUrl?: string;
  userData?: Record<string, unknown>;
  customData?: Record<string, unknown>;
  optOut?: boolean;
};

const META_FBP_COOKIE = "_fbp";
const META_FBC_COOKIE = "_fbc";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

const getCookieValue = (key: string) => {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${key}=`));

  return match ? decodeURIComponent(match.slice(key.length + 1)) : null;
};

const setCookieValue = (key: string, value: string) => {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:";
  document.cookie = [
    `${key}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${COOKIE_MAX_AGE}`,
    "SameSite=Lax",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
};

const randomToken = () => Math.floor(Math.random() * 1_000_000_0000);

const createFbpValue = () => `fb.1.${Date.now()}.${randomToken()}`;
const createFbcValue = (fbclid: string) => `fb.1.${Date.now()}.${fbclid}`;

export const ensureMetaCookies = () => {
  if (typeof window === "undefined") return;

  if (!getCookieValue(META_FBP_COOKIE)) {
    setCookieValue(META_FBP_COOKIE, createFbpValue());
  }

  const url = new URL(window.location.href);
  const fbclid = url.searchParams.get("fbclid");
  if (fbclid) {
    setCookieValue(META_FBC_COOKIE, createFbcValue(fbclid));
  }
};

export const trackMetaEvent = async (payload: TrackMetaEventBody) => {
  if (typeof window === "undefined") return;

  ensureMetaCookies();

  try {
    await fetch("/api/meta/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        eventSourceUrl: payload.eventSourceUrl || window.location.href,
      }),
      credentials: "same-origin",
      keepalive: true,
    });
  } catch (error) {
    console.error("[Meta CAPI] Client event relay failed:", error);
  }
};
