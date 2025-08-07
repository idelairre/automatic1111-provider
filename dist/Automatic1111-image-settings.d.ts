export type Automatic1111ImageModelId = (string & {});
/**
Configuration settings for Automatic1111 image generation.
 */
export interface Automatic1111ImageSettings {
    /**
     * The negative prompt for the image generation
     */
    negative_prompt?: string;
    /**
     * The styles for the image generation
     */
    styles?: string[];
    /**
     * The number of steps for the image generation
     */
    steps?: number;
    /**
     * The CFG scale for the image generation
     */
    cfg_scale?: number;
    /**
     * The sampler name for the image generation
     */
    sampler_name?: string;
    /**
     * The denoising strength for the image generation
     */
    denoising_strength?: number;
    /**
     * Automatic1111 uses current model if model name is wrong, which can lead to unexpected results.
     * This option will check if the model exists and throw an error if it doesn't.
     */
    check_model_exists?: boolean;
}
