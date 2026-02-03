/**
 * Retry utility for handling transient failures
 * Useful for database operations that might fail temporarily
 */

export async function retryOperation<T>(
    operation: () => Promise<T>,
    options: {
        maxRetries?: number;
        delayMs?: number;
        backoff?: boolean;
    } = {},
): Promise<T> {
    const { maxRetries = 3, delayMs = 1000, backoff = true } = options;

    let lastError: Error | unknown;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            // Don't retry on last attempt
            if (attempt === maxRetries - 1) {
                break;
            }

            // Calculate delay with optional exponential backoff
            const delay = backoff ? delayMs * Math.pow(2, attempt) : delayMs;

            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

/**
 * Execute operation with timeout
 * Prevents hanging operations
 */
export async function withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number = 5000,
): Promise<T> {
    return Promise.race([
        operation(),
        new Promise<T>((_, reject) =>
            setTimeout(
                () =>
                    reject(new Error(`Operation timeout after ${timeoutMs}ms`)),
                timeoutMs,
            ),
        ),
    ]);
}

/**
 * Silent fail wrapper - executes operation but doesn't throw errors
 * Perfect for non-critical operations like view tracking
 */
export async function silentFail<T>(
    operation: () => Promise<T>,
    onError?: (error: unknown) => void,
): Promise<T | null> {
    try {
        return await operation();
    } catch (error) {
        if (onError) {
            onError(error);
        } else {
            console.error("Silent fail:", error);
        }
        return null;
    }
}
