import { ImageModelV2 } from '@ai-sdk/provider';
import { z } from 'zod';
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
declare const automatic1111ErrorSchema: z.ZodObject<{
    detail: z.ZodArray<z.ZodObject<{
        loc: z.ZodArray<z.ZodObject<{
            where: z.ZodString;
            index: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            where: string;
            index: number;
        }, {
            where: string;
            index: number;
        }>, "many">;
        msg: z.ZodString;
        type: z.ZodString;
        ctx: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            msg: z.ZodString;
            doc: z.ZodString;
            pos: z.ZodNumber;
            lineno: z.ZodNumber;
            colno: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            msg: string;
            doc: string;
            pos: number;
            lineno: number;
            colno: number;
        }, {
            msg: string;
            doc: string;
            pos: number;
            lineno: number;
            colno: number;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        loc: {
            where: string;
            index: number;
        }[];
        msg: string;
        ctx?: {
            msg: string;
            doc: string;
            pos: number;
            lineno: number;
            colno: number;
        } | null | undefined;
    }, {
        type: string;
        loc: {
            where: string;
            index: number;
        }[];
        msg: string;
        ctx?: {
            msg: string;
            doc: string;
            pos: number;
            lineno: number;
            colno: number;
        } | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    detail: {
        type: string;
        loc: {
            where: string;
            index: number;
        }[];
        msg: string;
        ctx?: {
            msg: string;
            doc: string;
            pos: number;
            lineno: number;
            colno: number;
        } | null | undefined;
    }[];
}, {
    detail: {
        type: string;
        loc: {
            where: string;
            index: number;
        }[];
        msg: string;
        ctx?: {
            msg: string;
            doc: string;
            pos: number;
            lineno: number;
            colno: number;
        } | null | undefined;
    }[];
}>;
export type Automatic1111ErrorData = z.infer<typeof automatic1111ErrorSchema>;
export {};
