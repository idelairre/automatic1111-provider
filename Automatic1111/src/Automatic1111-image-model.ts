import {
  ImageModelV2,
  ImageModelV2CallWarning,
  InvalidResponseDataError,
  NoSuchModelError,
} from '@ai-sdk/provider';
import {
  combineHeaders,
  createJsonResponseHandler,
  createJsonErrorResponseHandler,
  postJsonToApi,
} from '@ai-sdk/provider-utils';
import { z } from 'zod/v4';

interface Automatic1111ImageModelConfig {
  provider: string;
  baseURL: string;
  headers: () => Record<string, string>;
  _internal?: {
    currentDate?: () => Date;
  };
}

export class Automatic1111ImageModel implements ImageModelV2 {
  readonly specificationVersion = 'v2';
  readonly maxImagesPerCall = 1;

  get provider(): string {
    return this.config.provider;
  }

  constructor(
    readonly modelId: string,
    private readonly config: Automatic1111ImageModelConfig,
  ) {}

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
        details:
          'This model does not support the `aspectRatio` option. Use `size` instead.',
      });
    }
    // Extract the provider options
    const { negative_prompt, styles, steps, cfg_scale, sampler_name, denoising_strength, check_model_exists, ...providerRequestOptions } =
      providerOptions.automatic1111 ?? {};

    // Get the current date for timestamp
    const currentDate = this.config._internal?.currentDate?.() ?? new Date();
    // Combine the headers
    const fullHeaders = combineHeaders(this.config.headers(), headers);
    // Check if the model exists
    if (check_model_exists) {
      // Get the available models to check (automatic1111 uses default model if not specified, so we need to check if the model is available)
      const availableModels = await fetch(this.getAutomatic1111ModelsUrl());
      const availableModelsJson = await availableModels.json();
      const model = Automatic1111ModelListSchema.parse(availableModelsJson).find((model) => model.model_name === this.modelId);
      if (!model) {
        throw new NoSuchModelError({
          errorName: 'NoSuchModelError',
          modelId: this.modelId,
          modelType: 'imageModel',
          message: `Model ${this.modelId} not found`,
        });
      }
    }

    const modelId = this.modelId;

    // Send the request to the API
    const { value: generationResponse, responseHeaders } = await postJsonToApi({
      url: this.getAutomatic1111GenerationsUrl(),
      headers: fullHeaders,
      body: {
        prompt,
        negative_prompt,
        styles,
        seed,
        sampler_name,
        n_iter: n,
        steps,
        cfg_scale,
        denoising_strength,
        width: size?.split('x')[0] ?? 512,
        height: size?.split('x')[1] ?? 512,
        override_settings: {
          sd_model_checkpoint: modelId,
        },
        ...providerRequestOptions,
      },
      abortSignal,
      failedResponseHandler: this.createAutomatic1111ErrorHandler(),
      successfulResponseHandler: createJsonResponseHandler(
        Automatic1111GenerationResponseSchema,
      ),
    });

    // Check if the response is valid
    if (generationResponse === null || generationResponse === undefined || generationResponse.images === null || generationResponse.images === undefined) {
      throw new InvalidResponseDataError({
        data: generationResponse,
        message: 'Invalid response data',
      });
    }
    // Convert the images to Uint8Array
    const images = generationResponse.images.map(image => this.base64ToUint8Array(image));

    // Return the images
    return {
      images,
      warnings,
      response: {
        modelId: modelId,
        timestamp: currentDate,
        headers: responseHeaders,
      },
    };
  }

  // Create the error handler for the API
  private createAutomatic1111ErrorHandler() {
    return createJsonErrorResponseHandler({
      errorSchema: Automatic1111ErrorSchema,
      errorToMessage: (error: Automatic1111ErrorData) =>
        error.detail[0].msg ?? 'Unknown error',
    });
  }

  // Get the URL for the generations API
  private getAutomatic1111GenerationsUrl() {
    return `${this.config.baseURL}/sdapi/v1/txt2img/`;
  }

  // Get the URL for the models API
  private getAutomatic1111ModelsUrl() {
    return `${this.config.baseURL}/sdapi/v1/sd-models/`;
  }

  // Convert a base64 string to a Uint8Array
  private base64ToUint8Array(base64String: string): Uint8Array {
    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Convert base64 to binary string
    const binaryString = Buffer.from(base64Data, 'base64').toString('binary');
    
    // Convert binary string to Uint8Array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
  }
}

// Schema for the response from the API
const Automatic1111GenerationResponseSchema = z.object({
  images: z.array(z.string()),
});

// Schema for the error response from the API
const Automatic1111ErrorSchema = z.object({
  detail: z.array(
    z.object({
      loc: z.array(z.object({
        where: z.string(),
        index: z.number(),
      })),
      msg: z.string(),
      type: z.string(),
      ctx: z
        .object({
          msg: z.string(),
          doc: z.string(),
          pos: z.number(),
          lineno: z.number(),
          colno: z.number(),
        })
        .nullish(),
    }),
  ),
});

const Automatic1111ModelListSchema = z.array(z.object({
  title: z.string(),
  model_name: z.string(),
  hash: z.string(),
  sha256: z.string(),
  filename: z.string(),
  config: z.string().nullish(),
}));

export type Automatic1111ErrorData = z.infer<typeof Automatic1111ErrorSchema>;
