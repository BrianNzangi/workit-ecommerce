import "server-only";

import { createHash } from "node:crypto";
import { auth } from "@/lib/auth/auth";

export type MetaEventName =
  | "AddToCart"
  | "InitiateCheckout"
  | "Contact"
  | "Search"
  | "Purchase"
  | "ViewContent";

type MetaSessionUser = {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
};

type MetaUserDataInput = {
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  firstName?: string | null;
  dateOfBirth?: string | null;
  city?: string | null;
  region?: string | null;
  postcode?: string | null;
  country?: string | null;
  externalId?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  subscriptionId?: string | null;
};

type MetaCustomData = Record<string, unknown>;

type SendMetaEventInput = {
  request: Request;
  eventName: MetaEventName;
  eventId?: string;
  eventSourceUrl?: string | null;
  userData?: MetaUserDataInput;
  customData?: MetaCustomData;
  optOut?: boolean;
};

const META_GRAPH_VERSION = process.env.META_CAPI_API_VERSION?.trim() || "v22.0";
const META_PIXEL_ID = process.env.META_PIXEL_ID?.trim();
const META_ACCESS_TOKEN = process.env.META_CONVERSIONS_ACCESS_TOKEN?.trim();
const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE?.trim();
const META_ENDPOINT =
  META_PIXEL_ID && META_ACCESS_TOKEN
    ? `https://graph.facebook.com/${META_GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(META_ACCESS_TOKEN)}`
    : null;

const getHeader = (request: Request, name: string) => request.headers.get(name);

const getCookieValue = (request: Request, key: string) => {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${key}=`));

  if (!match) return null;
  return decodeURIComponent(match.slice(key.length + 1));
};

const getClientIpAddress = (request: Request) => {
  const forwardedFor = getHeader(request, "x-forwarded-for");
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(",");
    if (firstIp?.trim()) return firstIp.trim();
  }

  return getHeader(request, "x-real-ip") || null;
};

const normalizeEmail = (value?: string | null) => value?.trim().toLowerCase() || null;
const normalizePhone = (value?: string | null) => {
  const digits = value?.replace(/[^\d]/g, "") || "";
  return digits || null;
};
const normalizeGeneric = (value?: string | null) => value?.trim().toLowerCase() || null;
const normalizeCompact = (value?: string | null) =>
  value?.trim().toLowerCase().replace(/\s+/g, "") || null;
const normalizeGender = (value?: string | null) => value?.trim().toLowerCase().slice(0, 1) || null;
const normalizeDob = (value?: string | null) => value?.replace(/[^\d]/g, "") || null;

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const hashValue = (
  value: string | null | undefined,
  normalizer: (value?: string | null) => string | null,
) => {
  const normalized = normalizer(value);
  return normalized ? sha256(normalized) : null;
};

const pickFullNameParts = (name?: string | null) => {
  if (!name) return { firstName: null, lastName: null };
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return {
    firstName: firstName || null,
    lastName: rest.length ? rest.join(" ") : null,
  };
};

const buildUserData = (
  request: Request,
  sessionUser: MetaSessionUser | null,
  userData: MetaUserDataInput = {},
) => {
  const sessionNameParts = pickFullNameParts(sessionUser?.name);
  const email = userData.email ?? sessionUser?.email ?? null;
  const phone = userData.phone ?? sessionUser?.phoneNumber ?? null;
  const firstName = userData.firstName ?? sessionUser?.firstName ?? sessionNameParts.firstName;
  const externalId = userData.externalId ?? sessionUser?.id ?? null;

  const payload: Record<string, unknown> = {};

  const hashedFields: Array<[string, string | null]> = [
    ["em", hashValue(email, normalizeEmail)],
    ["ph", hashValue(phone, normalizePhone)],
    ["ge", hashValue(userData.gender, normalizeGender)],
    ["fn", hashValue(firstName, normalizeCompact)],
    ["ct", hashValue(userData.city, normalizeCompact)],
    ["st", hashValue(userData.region, normalizeCompact)],
    ["zp", hashValue(userData.postcode, normalizeCompact)],
    ["country", hashValue(userData.country, normalizeGeneric)],
    ["external_id", hashValue(externalId, normalizeGeneric)],
    ["db", hashValue(userData.dateOfBirth, normalizeDob)],
  ];

  hashedFields.forEach(([key, value]) => {
    if (value) {
      payload[key] = [value];
    }
  });

  const clientIpAddress = userData.clientIpAddress ?? getClientIpAddress(request);
  const clientUserAgent = userData.clientUserAgent ?? getHeader(request, "user-agent");
  const fbp = userData.fbp ?? getCookieValue(request, "_fbp");
  const fbc = userData.fbc ?? getCookieValue(request, "_fbc");

  if (clientIpAddress) payload.client_ip_address = clientIpAddress;
  if (clientUserAgent) payload.client_user_agent = clientUserAgent;
  if (fbp) payload.fbp = fbp;
  if (fbc) payload.fbc = fbc;
  if (userData.subscriptionId) payload.subscription_id = userData.subscriptionId;

  return payload;
};

const getEventSourceUrl = (request: Request, explicitUrl?: string | null) =>
  explicitUrl || getHeader(request, "referer") || request.url;

export const isMetaConversionsConfigured = () => Boolean(META_ENDPOINT);

export const getMetaSessionUser = async (request: Request): Promise<MetaSessionUser | null> => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    return (session?.user as MetaSessionUser | undefined) || null;
  } catch (error) {
    console.error("[Meta CAPI] Failed to resolve session user:", error);
    return null;
  }
};

export const sendMetaEvent = async ({
  request,
  eventName,
  eventId,
  eventSourceUrl,
  userData,
  customData,
  optOut,
}: SendMetaEventInput) => {
  if (!META_ENDPOINT) {
    return {
      ok: false,
      skipped: true,
      reason: "missing_meta_config",
    };
  }

  try {
    const sessionUser = await getMetaSessionUser(request);
    const eventTime = Math.floor(Date.now() / 1000);

    const payload: Record<string, unknown> = {
      data: [
        {
          event_name: eventName,
          event_time: eventTime,
          action_source: "website",
          event_source_url: getEventSourceUrl(request, eventSourceUrl),
          ...(eventId ? { event_id: eventId } : {}),
          ...(optOut ? { opt_out: true } : {}),
          user_data: buildUserData(request, sessionUser, userData),
          ...(customData ? { custom_data: customData } : {}),
          original_event_data: {
            event_name: eventName,
            event_time: eventTime,
          },
        },
      ],
    };

    if (META_TEST_EVENT_CODE) {
      payload.test_event_code = META_TEST_EVENT_CODE;
    }

    const response = await fetch(META_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await response.text();
    const body = parseJsonSafely(text);

    if (!response.ok) {
      console.error("[Meta CAPI] Request failed:", {
        eventName,
        status: response.status,
        body,
      });

      return {
        ok: false,
        skipped: false,
        status: response.status,
        body,
      };
    }

    return {
      ok: true,
      skipped: false,
      status: response.status,
      body,
    };
  } catch (error) {
    console.error("[Meta CAPI] Unexpected error sending event:", {
      eventName,
      error,
    });

    return {
      ok: false,
      skipped: false,
      error: error instanceof Error ? error.message : "Unknown Meta CAPI error",
    };
  }
};
const parseJsonSafely = (text: string) => {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};
