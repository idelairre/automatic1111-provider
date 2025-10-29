/**
 * Base error class for ComfyUI provider errors
 */
export declare class ComfyUIError extends Error {
    readonly cause?: unknown | undefined;
    constructor(message: string, cause?: unknown | undefined);
}
/**
 * Error thrown when a requested model is not found
 */
export declare class ComfyUIModelNotFoundError extends ComfyUIError {
    constructor(modelId: string);
}
/**
 * Error thrown when the ComfyUI API returns an error
 */
export declare class ComfyUIAPIError extends ComfyUIError {
    constructor(status: number, statusText: string, details?: string);
}
/**
 * Error thrown when image generation times out
 */
export declare class ComfyUITimeoutError extends ComfyUIError {
    constructor(attempts: number, timeoutSeconds: number);
}
/**
 * Error thrown when image generation is aborted
 */
export declare class ComfyUIAbortError extends ComfyUIError {
    constructor(reason?: string);
}
/**
 * Error thrown when there's a network or connection issue
 */
export declare class ComfyUINetworkError extends ComfyUIError {
    constructor(message: string);
}
