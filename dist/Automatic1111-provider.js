import { NoSuchModelError } from '@ai-sdk/provider';
import { withoutTrailingSlash, } from '@ai-sdk/provider-utils';
import { Automatic1111ImageModel } from './Automatic1111-image-model.js';
const defaultBaseURL = 'http://127.0.0.1:7860';
export function createAutomatic1111(options = {}) {
    const baseURL = withoutTrailingSlash(options.baseURL ?? defaultBaseURL);
    const getHeaders = () => ({
        'Content-Type': 'application/json',
        ...(options.apiKey ? { 'Authorization': `Bearer ${options.apiKey}` } : {}),
        ...options.headers,
    });
    const createImageModel = (modelId) => new Automatic1111ImageModel(modelId, {
        provider: 'automatic1111',
        baseURL: baseURL ?? defaultBaseURL,
        headers: getHeaders,
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
