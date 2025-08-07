import { ImageModelV2, NoSuchModelError, ProviderV2 } from '@ai-sdk/provider';
import {
  FetchFunction,
  withoutTrailingSlash,
} from '@ai-sdk/provider-utils';
import { Automatic1111ImageModel } from './Automatic1111-image-model.js';
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
  /**
Custom fetch implementation. You can use it as a middleware to intercept requests,
or to provide a custom fetch implementation for e.g. testing.
  */
  fetch?: FetchFunction;
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

const defaultBaseURL = 'http://127.0.0.1:7860';

export function createAutomatic1111(options: Automatic1111ProviderSettings = {}): Automatic1111Provider {
  const baseURL = withoutTrailingSlash(options.baseURL ?? defaultBaseURL);
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    ...options.headers,
  });

  const createImageModel = (modelId: Automatic1111ImageModelId) =>
    new Automatic1111ImageModel(modelId, {
      provider: 'automatic1111',
      baseURL: baseURL ?? defaultBaseURL,
      headers: getHeaders,
      fetch: options.fetch,
    });

  return {
    image: createImageModel,
    imageModel: createImageModel,
    languageModel: () => {
      throw new NoSuchModelError({
        modelId: 'languageModel',
        modelType: 'languageModel',
      });
    },
    textEmbeddingModel: () => {
      throw new NoSuchModelError({
        modelId: 'textEmbeddingModel',
        modelType: 'textEmbeddingModel',
      });
    },
  };
}

export const automatic1111 = createAutomatic1111();
