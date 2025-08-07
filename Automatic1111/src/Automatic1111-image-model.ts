import {
  ImageModelV2,
  ImageModelV2CallWarning,
  InvalidResponseDataError,
} from '@ai-sdk/provider';
import {
  FetchFunction,
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
  fetch?: FetchFunction;
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

    const { negative_prompt, styles, steps, cfg_scale, sampler_name, denoising_strength, ...providerRequestOptions } =
      providerOptions.automatic1111 ?? {};

    const currentDate = this.config._internal?.currentDate?.() ?? new Date();
    const fullHeaders = combineHeaders(this.config.headers(), headers);
    const availableModels = await fetch(this.getAutomatic1111ModelsUrl());
    const availableModelsJson = await availableModels.json();
    const model = availableModelsJson.find((model: any) => model.model_name === this.modelId);
    if (!model) {
      throw new Error(`Model ${this.modelId} not found`);
    }

    const modelId = model.model_name;

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
      fetch: this.config.fetch,
      failedResponseHandler: this.createAutomatic1111ErrorHandler(),
      successfulResponseHandler: createJsonResponseHandler(
        Automatic1111GenerationResponseSchema,
      ),
    });

    if (generationResponse === null || generationResponse === undefined || generationResponse.images === null || generationResponse.images === undefined) {
      throw new InvalidResponseDataError({
        data: generationResponse,
        message: 'Invalid response data',
      });
    }
    const images = generationResponse.images.map(image => this.base64ToUint8Array(image));

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

  private createAutomatic1111ErrorHandler() {
    return createJsonErrorResponseHandler({
      errorSchema: Automatic1111ErrorSchema,
      errorToMessage: (error: Automatic1111ErrorData) =>
        error.detail[0].msg ?? 'Unknown error',
    });
  }

  private getAutomatic1111GenerationsUrl() {
    return `${this.config.baseURL}/sdapi/v1/txt2img/`;
  }

  private getAutomatic1111ModelsUrl() {
    return `${this.config.baseURL}/sdapi/v1/sd-models/`;
  }

  private base64ToUint8Array(base64String: string): Uint8Array {
    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Convert base64 to binary string
    const binaryString = atob(base64Data);
    
    // Convert binary string to Uint8Array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes;
  }
}

const Automatic1111GenerationResponseSchema = z.object({
  images: z.array(z.string()),
});

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

export type Automatic1111ErrorData = z.infer<typeof Automatic1111ErrorSchema>;
