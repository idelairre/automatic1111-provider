import { ImageModelV2, ProviderV2 } from '@ai-sdk/provider';
/**
 * Base provider settings that can be extended by specific providers
 */
export interface ComfyUIProviderSettings {
    /**
     * Base URL for the ComfyUI API calls
     */
    baseURL?: string;
    /**
     * API key for authentication (if required)
     */
    apiKey?: string;
    /**
     * Custom headers to send with requests
     */
    headers?: Record<string, string>;
    /**
     * ComfyUI client ID for tracking requests
     */
    clientId?: string;
}
/**
 * Image model identifier type
 */
export type ComfyUIImageModelId = string;
/**
 * Common image generation settings for ComfyUI
 */
export interface ComfyUIImageSettings {
    /**
     * Negative prompt to avoid certain elements
     */
    negativePrompt?: string;
    /**
     * Random seed for reproducible results
     */
    seed?: number;
    /**
     * Number of inference steps
     */
    steps?: number;
    /**
     * Classifier-free guidance scale
     */
    cfgScale?: number;
    /**
     * Sampler algorithm to use
     */
    sampler?: string;
    /**
     * Scheduler for the sampler
     */
    scheduler?: string;
    /**
     * Image width in pixels
     */
    width?: number;
    /**
     * Image height in pixels
     */
    height?: number;
    /**
     * Denoising strength for img2img operations (0.0-1.0)
     */
    denoisingStrength?: number;
    /**
     * Predefined styles to apply
     */
    styles?: string[];
    /**
     * Whether to validate model exists before generation
     */
    checkModelExists?: boolean;
}
/**
 * Model schema definition for ComfyUI models
 */
export interface ComfyUIModelSchema {
    /**
     * Unique identifier for the model (lowercase, dashes, no extension)
     */
    id: string;
    /**
     * Human-readable display name
     */
    name: string;
    /**
     * Checkpoint filename as it appears in ComfyUI
     */
    checkpoint: string;
    /**
     * Description of the model
     */
    description?: string;
}
/**
 * Resolve a model ID to its checkpoint filename for ComfyUI
 * Follows naming convention: lowercase, dashes, no extensions
 */
export declare function resolveModelCheckpoint(modelId: string): string;
/**
 * Create a model schema from a checkpoint filename
 */
export declare function createModelSchema(checkpoint: string): ComfyUIModelSchema;
/**
 * Check if a specific checkpoint exists in ComfyUI
 */
export declare function checkpointExists(baseURL: string, checkpointName: string): Promise<boolean>;
export interface ComfyUIWorkflow {
    [key: string]: {
        class_type: string;
        inputs: Record<string, unknown>;
    };
}
export interface ComfyUIProvider extends ProviderV2 {
    /**
     * Creates a model for image generation.
     */
    image(modelId: ComfyUIImageModelId, settings?: ComfyUIImageSettings): ImageModelV2;
    /**
     * Creates a model for image generation.
     */
    imageModel(modelId: ComfyUIImageModelId, settings?: ComfyUIImageSettings): ImageModelV2;
}
export interface ComfyUIResponse {
    images: Array<{
        filename: string;
        subfolder: string;
        type: string;
    }>;
    prompt: ComfyUIWorkflow;
    prompt_id: string;
}
/**
 * Creates a ComfyUI-specific image model for generating images using ComfyUI workflows.
 *
 * @param modelId - The model identifier (e.g., 'sdxl-base', 'realistic-vision-v4')
 * @param settings - Default settings for the model
 * @param providerSettings - Provider configuration including API endpoints and authentication
 * @returns An ImageModelV2 instance configured for ComfyUI
 */
export declare function createComfyUIImageModel(modelId: ComfyUIImageModelId, settings?: ComfyUIImageSettings, providerSettings?: ComfyUIProviderSettings): ImageModelV2;
/**
 * Creates a ComfyUI provider with image generation support.
 *
 * @param options - Provider configuration options
 * @returns A ComfyUI provider instance implementing the ProviderV2 interface
 */
export declare function createComfyUIProvider(options?: ComfyUIProviderSettings): ComfyUIProvider;
export declare const comfyUIProvider: ComfyUIProvider;
export default comfyUIProvider;
