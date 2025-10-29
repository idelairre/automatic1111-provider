import {
  ImageModelV2,
  ImageModelV2CallWarning,
  NoSuchModelError,
  ProviderV2,
} from '@ai-sdk/provider';
import { withoutTrailingSlash, combineHeaders } from '@ai-sdk/provider-utils';
import {
  ComfyUIModelNotFoundError,
  ComfyUIAPIError,
  ComfyUITimeoutError,
  ComfyUIAbortError,
  ComfyUINetworkError,
} from './errors.js';

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
export function resolveModelCheckpoint(modelId: string): string {
  // If it's already a checkpoint filename, return as-is
  if (modelId.endsWith('.safetensors') || modelId.endsWith('.ckpt')) {
    return modelId;
  }

  // Convert model ID to checkpoint filename
  // Replace dashes with underscores for common checkpoint naming
  const checkpointBase = modelId.replace(/-/g, '_');

  // For now, prefer .safetensors as it's more common in ComfyUI
  return `${checkpointBase}.safetensors`;
}

/**
 * Create a model schema from a checkpoint filename
 */
export function createModelSchema(checkpoint: string): ComfyUIModelSchema {
  return {
    id: checkpoint,
    name: checkpoint.replace(/\.(safetensors|ckpt)$/, ''),
    checkpoint: checkpoint,
    description: `Model: ${checkpoint}`,
  };
}

/**
 * Check if a specific checkpoint exists in ComfyUI
 */
export async function checkpointExists(baseURL: string, checkpointName: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseURL}/models/checkpoints`);
    if (!response.ok) {
      return false;
    }
    const checkpoints: string[] = await response.json();
    return checkpoints.includes(checkpointName);
  } catch {
    return false; // Assume it exists if we can't check
  }
}

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
 * Creates a ComfyUI-specific image model
 */

// ComfyUI Image Model Configuration
interface ComfyUIImageModelConfig {
  provider: string;
  baseURL: string;
  clientId: string;
  defaultSettings: ComfyUIImageSettings;
  headers: () => Record<string, string>;
}

/**
 * Creates a ComfyUI-specific image model for generating images using ComfyUI workflows.
 *
 * @param modelId - The model identifier (e.g., 'sdxl-base', 'realistic-vision-v4')
 * @param settings - Default settings for the model
 * @param providerSettings - Provider configuration including API endpoints and authentication
 * @returns An ImageModelV2 instance configured for ComfyUI
 */
export function createComfyUIImageModel(
  modelId: ComfyUIImageModelId,
  settings: ComfyUIImageSettings = {},
  providerSettings: ComfyUIProviderSettings = {}
): ImageModelV2 {
  const config: ComfyUIImageModelConfig = {
    provider: 'comfyui',
    baseURL: providerSettings.baseURL || 'http://127.0.0.1:8188',
    clientId: providerSettings.clientId || 'comfyui',
    defaultSettings: settings,
    headers: () => ({
      ...(providerSettings.apiKey ? { Authorization: `Bearer ${providerSettings.apiKey}` } : {}),
      ...providerSettings.headers,
    }),
  };

  return new ComfyUIImageModel(modelId, config);
}

class ComfyUIImageModel implements ImageModelV2 {
  readonly maxImagesPerCall = 4;
  readonly specificationVersion = 'v2' as const;

  constructor(
    readonly modelId: string,
    private readonly config: ComfyUIImageModelConfig
  ) {}

  get provider(): string {
    return this.config.provider;
  }

  async doGenerate({
    prompt,
    n,
    size,
    aspectRatio,
    seed,
    providerOptions,
    headers,
    abortSignal,
  }: Parameters<ImageModelV2['doGenerate']>[0]): Promise<
    Awaited<ReturnType<ImageModelV2['doGenerate']>>
  > {
    const warnings: Array<ImageModelV2CallWarning> = [];

    if (aspectRatio != null) {
      warnings.push({
        type: 'unsupported-setting',
        setting: 'aspectRatio',
        details: 'This model does not support the `aspectRatio` option. Use `size` instead.',
      });
    }

    // Extract provider options with proper typing
    const {
      negativePrompt,
      styles,
      steps,
      cfgScale,
      sampler,
      denoisingStrength,
      checkModelExists,
      ...providerRequestOptions
    } = (providerOptions?.comfyui as ComfyUIImageSettings) || {};

    const settings: ComfyUIImageSettings = {
      ...this.config.defaultSettings,
      negativePrompt,
      styles,
      steps,
      cfgScale,
      sampler,
      denoisingStrength,
      checkModelExists,
      ...providerRequestOptions,
    };

    // Parse size string if provided (e.g., "512x512")
    if (size) {
      const [width, height] = size.split('x').map(Number);
      if (width && height) {
        settings.width = width;
        settings.height = height;
      }
    }

    // Combine headers from provider config and request
    const combinedHeaders = combineHeaders(this.config.headers(), headers);

    // Filter out undefined values to satisfy TypeScript
    const cleanHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(combinedHeaders)) {
      if (value !== undefined) {
        cleanHeaders[key] = value;
      }
    }

    const { images } = await this.generateImages({
      prompt,
      count: n,
      size,
      seed,
      settings,
      headers: cleanHeaders,
      abortSignal,
    });

    return {
      images,
      warnings,
      response: {
        modelId: this.modelId,
        timestamp: new Date(),
        headers: {},
      },
    };
  }

  private async generateImages({
    prompt,
    count = 1,
    size: _size,
    seed,
    settings,
    headers,
    abortSignal,
  }: {
    prompt: string;
    count?: number;
    size?: string;
    seed?: number;
    settings: ComfyUIImageSettings;
    headers: Record<string, string>;
    abortSignal?: AbortSignal;
  }) {
    const baseURL = this.config.baseURL;
    const clientId = this.config.clientId;

    // Resolve checkpoint filename from model ID
    const checkpointName = resolveModelCheckpoint(this.modelId);

    // Validate model exists if requested
    if (settings.checkModelExists) {
      const exists = await checkpointExists(baseURL, checkpointName);
      if (!exists) {
        throw new ComfyUIModelNotFoundError(this.modelId);
      }
    }

    // Detect SDXL models for resolution defaults
    const isSDXL =
      checkpointName.toLowerCase().includes('xl') || checkpointName.toLowerCase().includes('sdxl');
    const defaultWidth = isSDXL ? 1024 : 512;
    const defaultHeight = isSDXL ? 1024 : 512;

    // Simple ComfyUI workflow for image generation
    const workflow = {
      '1': {
        class_type: 'CheckpointLoaderSimple',
        inputs: {
          ckpt_name: checkpointName,
        },
      },
      '2': {
        class_type: 'CLIPTextEncode',
        inputs: {
          text: prompt,
          clip: ['1', 1],
        },
      },
      '3': {
        class_type: 'CLIPTextEncode',
        inputs: {
          text: settings.negativePrompt || '',
          clip: ['1', 1],
        },
      },
      '4': {
        class_type: 'KSampler',
        inputs: {
          seed: seed || settings.seed || Math.floor(Math.random() * 1000000),
          steps: settings.steps || 20,
          cfg: settings.cfgScale || 7,
          sampler_name: settings.sampler || 'euler',
          scheduler: settings.scheduler || 'normal',
          denoise: settings.denoisingStrength || 1,
          model: ['1', 0],
          positive: ['2', 0],
          negative: ['3', 0],
          latent_image: ['5', 0],
        },
      },
      '5': {
        class_type: 'EmptyLatentImage',
        inputs: {
          width: settings.width || defaultWidth,
          height: settings.height || defaultHeight,
          batch_size: count,
        },
      },
      '6': {
        class_type: 'VAEDecode',
        inputs: {
          samples: ['4', 0],
          vae: ['1', 2],
        },
      },
      '7': {
        class_type: 'SaveImage',
        inputs: {
          images: ['6', 0],
          filename_prefix: 'ComfyUI',
        },
      },
    };

    // Check if already aborted
    if (abortSignal?.aborted) {
      throw new ComfyUIAbortError('Request cancelled before workflow submission');
    }

    // Submit workflow to ComfyUI
    const response = await fetch(`${baseURL}/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        prompt: workflow,
        client_id: clientId,
      }),
      signal: abortSignal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new ComfyUIAPIError(response.status, response.statusText, errorText);
    }

    const result: ComfyUIResponse = await response.json();
    const promptId = result.prompt_id;

    // Poll for completion
    let imageUrls: string[] = [];
    let attempts = 0;
    const maxAttempts = 60; // 30 seconds with 500ms intervals

    while (attempts < maxAttempts) {
      // Check for abort before each polling attempt
      if (abortSignal?.aborted) {
        throw new ComfyUIAbortError('Request cancelled during polling');
      }

      try {
        const historyResponse = await fetch(`${baseURL}/history/${promptId}`, {
          headers: headers,
          signal: abortSignal,
        });
        if (historyResponse.ok) {
          const history = await historyResponse.json();
          if (history[promptId]?.outputs?.['7']?.images) {
            imageUrls = history[promptId].outputs['7'].images.map(
              (img: { filename: string; subfolder: string; type: string }) =>
                `${baseURL}/view?filename=${img.filename}&subfolder=${img.subfolder}&type=${img.type}`
            );
            break;
          }
        } else {
          // History request failed
        }
      } catch (error) {
        // Handle AbortError specifically
        if (error instanceof Error && error.name === 'AbortError') {
          throw new ComfyUIAbortError('Request cancelled during polling');
        }
        // Polling error occurred
      }

      // Wait before next attempt, but allow abort during wait
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, 500);
        abortSignal?.addEventListener(
          'abort',
          () => {
            clearTimeout(timeout);
            reject(new ComfyUIAbortError('Request cancelled during polling wait'));
          },
          { once: true }
        );
      });
      attempts++;
    }

    if (imageUrls.length === 0) {
      throw new ComfyUITimeoutError(maxAttempts, maxAttempts * 0.5);
    }

    // Check for abort before downloading images
    if (abortSignal?.aborted) {
      throw new ComfyUIAbortError('Request cancelled before image download');
    }

    // Download actual image data
    const imagePromises = imageUrls.map(async url => {
      const response = await fetch(url, {
        headers: headers,
        signal: abortSignal,
      });
      if (!response.ok) {
        throw new ComfyUINetworkError(
          `Failed to download image: ${response.status} ${response.statusText}`
        );
      }
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    });

    const images = await Promise.all(imagePromises);
    return { images };
  }
}

const defaultBaseURL = 'http://127.0.0.1:8188';

/**
 * Creates a ComfyUI provider with image generation support.
 *
 * @param options - Provider configuration options
 * @returns A ComfyUI provider instance implementing the ProviderV2 interface
 */
export function createComfyUIProvider(options: ComfyUIProviderSettings = {}): ComfyUIProvider {
  const baseURL = withoutTrailingSlash(options.baseURL ?? defaultBaseURL);
  const providerSettings = { ...options, baseURL: baseURL };

  const createImageModel = (modelId: ComfyUIImageModelId, settings?: ComfyUIImageSettings) =>
    createComfyUIImageModel(modelId, settings, providerSettings);

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

// Default ComfyUI provider instance
export const comfyUIProvider = createComfyUIProvider({
  baseURL: 'http://localhost:8188',
  clientId: 'comfyui',
});

export default comfyUIProvider;
