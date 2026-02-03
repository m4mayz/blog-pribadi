/**
 * Simple in-memory rate limiter
 * Good for single-server deployments
 * For production with multiple servers, consider Redis-based solutions like @upstash/ratelimit
 */

interface RateLimitConfig {
    interval: number; // Time window in milliseconds
    maxRequests: number; // Maximum requests per interval
}

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

// Store rate limit data in memory
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup old entries every 10 minutes
setInterval(
    () => {
        const now = Date.now();
        for (const [key, record] of rateLimitStore.entries()) {
            if (now > record.resetTime) {
                rateLimitStore.delete(key);
            }
        }
    },
    10 * 60 * 1000,
);

/**
 * Rate limit checker
 * @param identifier - Unique identifier (e.g., userId, IP address)
 * @param config - Rate limit configuration
 * @returns Object with success status and remaining requests
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig,
): {
    success: boolean;
    remaining: number;
    resetTime: number;
} {
    const now = Date.now();
    const key = identifier;
    const record = rateLimitStore.get(key);

    // No record or expired record - create new
    if (!record || now > record.resetTime) {
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.interval,
        });
        return {
            success: true,
            remaining: config.maxRequests - 1,
            resetTime: now + config.interval,
        };
    }

    // Check if limit exceeded
    if (record.count >= config.maxRequests) {
        return {
            success: false,
            remaining: 0,
            resetTime: record.resetTime,
        };
    }

    // Increment count
    record.count++;
    rateLimitStore.set(key, record);

    return {
        success: true,
        remaining: config.maxRequests - record.count,
        resetTime: record.resetTime,
    };
}

/**
 * Predefined rate limit configurations
 */
export const RateLimits = {
    // Comments: 10 per 5 minutes
    COMMENT_CREATE: {
        interval: 5 * 60 * 1000,
        maxRequests: 10,
    },
    // Comment deletion: 20 per minute
    COMMENT_DELETE: {
        interval: 60 * 1000,
        maxRequests: 20,
    },
    // Post mutations: 20 per hour (admin only)
    POST_MUTATION: {
        interval: 60 * 60 * 1000,
        maxRequests: 20,
    },
    // View increments: 100 per hour per post
    POST_VIEW: {
        interval: 60 * 60 * 1000,
        maxRequests: 100,
    },
} as const;

/**
 * Format time remaining for error messages
 */
export function formatTimeRemaining(resetTime: number): string {
    const seconds = Math.ceil((resetTime - Date.now()) / 1000);
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? "s" : ""}`;
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
}
