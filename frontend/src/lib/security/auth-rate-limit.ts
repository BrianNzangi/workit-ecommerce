const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const MAX_REQUESTS = Number(process.env.AUTH_RATE_LIMIT_MAX) || 10;
const WINDOW_MS = (Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 60_000);

export function checkAuthRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS) return false;

  record.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}, 60_000);
