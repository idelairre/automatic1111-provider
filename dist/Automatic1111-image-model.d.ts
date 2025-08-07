import { ImageModelV2 } from '@ai-sdk/provider';
import { z } from 'zod/v4';
interface Automatic1111ImageModelConfig {
    provider: string;
    baseURL: string;
    headers: () => Record<string, string>;
    _internal?: {
        currentDate?: () => Date;
    };
}
export declare class Automatic1111ImageModel implements ImageModelV2 {
    readonly modelId: string;
    private readonly config;
    readonly specificationVersion = "v2";
    readonly maxImagesPerCall = 1;
    get provider(): string;
    constructor(modelId: string, config: Automatic1111ImageModelConfig);
    doGenerate({ prompt, n, size, aspectRatio, seed, providerOptions, headers, abortSignal, }: Parameters<ImageModelV2['doGenerate']>[0]): Promise<Awaited<ReturnType<ImageModelV2['doGenerate']>>>;
    private createAutomatic1111ErrorHandler;
    private getAutomatic1111GenerationsUrl;
    private getAutomatic1111ModelsUrl;
    private base64ToUint8Array;
}
declare const Automatic1111ErrorSchema: z.ZodObject<{
    detail: z.ZodArray<z.ZodObject<{
        loc: z.ZodArray<z.ZodObject<{
            where: z.ZodString;
            index: z.ZodNumber;
        }, z.core.$strip>>;
        msg: z.ZodString;
        type: z.ZodString;
        ctx: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            msg: z.ZodString;
            doc: z.ZodString;
            pos: z.ZodNumber;
            lineno: z.ZodNumber;
            colno: z.ZodNumber;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const Automatic1111ModelListSchema: z.ZodArray<z.ZodObject<{
    title: z.ZodString;
    model_name: z.ZodString;
    hash: z.ZodString;
    sha256: z.ZodString;
    filename: z.ZodString;
    config: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>>;
export type Automatic1111ErrorData = z.infer<typeof Automatic1111ErrorSchema>;
export {};
