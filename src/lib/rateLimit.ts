import { headers } from "next/headers";
import { dbConnect } from "@/lib/mongodb";
import { RateLimitHitModel } from "@/models/RateLimitHit";

export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headersList.get("x-real-ip") ?? "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMinutes: number;
}

/**
 * Simple MongoDB-backed rate limiter: counts hits for `key` in the trailing
 * `windowMs`, and records this attempt if still under `maxAttempts`.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult> {
  await dbConnect();
  const windowStart = new Date(Date.now() - windowMs);
  const retryAfterMinutes = Math.ceil(windowMs / 60000);

  const count = await RateLimitHitModel.countDocuments({ key, createdAt: { $gte: windowStart } });
  if (count >= maxAttempts) {
    return { allowed: false, retryAfterMinutes };
  }

  await RateLimitHitModel.create({ key });
  return { allowed: true, retryAfterMinutes };
}
