import { Request, Response, NextFunction } from "express";
import { redis } from "@/lib/utills/redis";
import { RateLimitConfig } from "./rate-limit.types";
import { SLIDING_WINDOW_SCRIPT } from "./rate-limit.script";
import { fallbackCheck } from "./rate-limit.fallback";
import {
  buildRedisKey,
  getIp,
  uniqueRequestId,
  setRateLimitHeaders,
} from "./rate-limit.helpers";

export type { Tier, RateLimitConfig } from "./rate-limit.types";

// ─── Middleware Factory ────────────────────────────────────────────────────

export function rateLimit(config: RateLimitConfig) {
  const {
    action,
    tiers,
    keyResolver,
    message = "Too many requests. Try again later.",
    failBehavior = "open",
    skip,
  } = config;

  if (!action || !tiers?.length) {
    throw new Error(
      `[rateLimit] "action" and at least one "tier" are required.`,
    );
  }

  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (skip?.(req)) return next();

    const identity = keyResolver
      ? (keyResolver(req) ?? getIp(req))
      : getIp(req);
    const requestId = uniqueRequestId();

    // Track most restrictive tier across all tiers for response headers
    let worstRemaining = Infinity;
    let worstLimit = Infinity;
    let worstResetAt = 0;
    let worstInterval = 0;

    try {
      for (const tier of tiers) {
        const { limit, interval, weight = 1 } = tier;
        const redisKey = buildRedisKey(action, identity, interval);

        // ioredis eval: (script, numkeys, ...keys, ...args)
        // Returns [newCount, oldestScore] from the Lua script
        const raw = (await redis.eval(
          SLIDING_WINDOW_SCRIPT,
          1, // numkeys
          redisKey, // KEYS[1]
          String(interval), // ARGV[1]
          String(limit), // ARGV[2]
          requestId, // ARGV[3]
          String(weight), // ARGV[4]
        )) as [number, number];

        const count = raw[0];
        const oldestScore = raw[1];
        const resetAt = oldestScore + interval;
        const remaining = Math.max(0, limit - count);

        if (remaining < worstRemaining) {
          worstRemaining = remaining;
          worstLimit = limit;
          worstResetAt = resetAt;
          worstInterval = interval;
        }

        if (count > limit) {
          setRateLimitHeaders(res, limit, 0, resetAt, interval);
          res.status(429).json({
            success: false,
            status: 429,
            message,
            error: {
              retryAfter: Math.max(0, Math.ceil(resetAt - Date.now() / 1000)),
            },
          });
          return;
        }
      }

      // All tiers passed — attach headers from the most restrictive tier
      setRateLimitHeaders(
        res,
        worstLimit,
        worstRemaining,
        worstResetAt,
        worstInterval,
      );
      next();
    } catch (err) {
      console.error("[rateLimit] Redis error:", err);

      if (failBehavior === "closed") {
        res.status(503).json({
          success: false,
          status: 503,
          message: "Service temporarily unavailable.",
        });
        return;
      }

      // fail-open → check in-memory fallback before allowing through
      let blocked = false;

      for (const tier of tiers) {
        const { limit, interval, weight = 1 } = tier;
        const allowed = fallbackCheck(
          `${action}:${identity}:${interval}`,
          interval,
          limit,
          weight,
        );

        if (!allowed) {
          blocked = true;
          res.status(429).json({
            success: false,
            status: 429,
            message: `${message} (fallback)`,
            error: { retryAfter: interval },
          });
          break;
        }
      }

      if (!blocked) next();
    }
  };
}
