/**
 * Base error class for ComfyUI provider errors
 */
export class ComfyUIError extends Error {
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = 'ComfyUIError';
    }
}
/**
 * Error thrown when a requested model is not found
 */
export class ComfyUIModelNotFoundError extends ComfyUIError {
    constructor(modelId) {
        super(`Model "${modelId}" not found in ComfyUI. Use getAvailableCheckpoints() to see available models.`);
        this.name = 'ComfyUIModelNotFoundError';
    }
}
/**
 * Error thrown when the ComfyUI API returns an error
 */
export class ComfyUIAPIError extends ComfyUIError {
    constructor(status, statusText, details) {
        super(`ComfyUI API error: ${status} ${statusText}${details ? ` - ${details}` : ''}`);
        this.name = 'ComfyUIAPIError';
    }
}
/**
 * Error thrown when image generation times out
 */
export class ComfyUITimeoutError extends ComfyUIError {
    constructor(attempts, timeoutSeconds) {
        super(`Image generation timed out after ${attempts} attempts (${timeoutSeconds}s)`);
        this.name = 'ComfyUITimeoutError';
    }
}
/**
 * Error thrown when image generation is aborted
 */
export class ComfyUIAbortError extends ComfyUIError {
    constructor(reason) {
        super(`Image generation was aborted${reason ? `: ${reason}` : ''}`);
        this.name = 'ComfyUIAbortError';
    }
}
/**
 * Error thrown when there's a network or connection issue
 */
export class ComfyUINetworkError extends ComfyUIError {
    constructor(message) {
        super(`Network error: ${message}`);
        this.name = 'ComfyUINetworkError';
    }
}
