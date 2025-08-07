import { ImageModelV2, ProviderV2 } from '@ai-sdk/provider';
import { Automatic1111ImageModelId } from './Automatic1111-image-settings.js';
export interface Automatic1111ProviderSettings {
    /**
  Not needed for Automatic1111.
    */
    apiKey?: string;
    /**
  Base URL for the API calls.
    */
    baseURL?: string;
    /**
  Custom headers to include in the requests.
    */
    headers?: Record<string, string>;
}
export interface Automatic1111Provider extends ProviderV2 {
    /**
  Creates a model for image generation.
    */
    image(modelId: Automatic1111ImageModelId): ImageModelV2;
    /**
  Creates a model for image generation.
     */
    imageModel(modelId: Automatic1111ImageModelId): ImageModelV2;
}
export declare function createAutomatic1111(options?: Automatic1111ProviderSettings): Automatic1111Provider;
export declare const automatic1111: Automatic1111Provider;
