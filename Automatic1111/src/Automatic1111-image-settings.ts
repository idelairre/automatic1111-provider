export type Automatic1111ImageModelId = (string & {});

/**
Configuration settings for Automatic1111 image generation.
 */
export interface Automatic1111ImageSettings {
  negative_prompt?: string;
  styles?: string[];
  steps?: number;
  cfg_scale?: number;
  sampler_name?: string;
  denoising_strength?: number;

/*
  // seed?: number;
  subseed?: number;
  subseed_strength?: number;
  seed_resize_from_h?: number;
  seed_resize_from_w?: number;
  scheduler?: string;
  batch_size?: number;
  // n_iter?: number;

  // width?: number;
  // height?: number;
  restore_faces?: boolean;
  tiling?: boolean;
  do_not_save_samples?: boolean;
  do_not_save_grid?: boolean;
  eta?: number;
  s_min_uncond?: number;
  s_churn?: number;
  s_tmax?: number;
  s_tmin?: number;
  s_noise?: number;
  override_settings?: Record<string, unknown>;
  override_settings_restore_afterwards?: boolean;
  refiner_checkpoint?: string;
  refiner_switch_at?: number;
  disable_extra_networks?: boolean;
  firstpass_image?: string;
  comments?: Record<string, unknown>;
  enable_hr?: boolean;
  firstphase_width?: number;
  firstphase_height?: number;
  hr_scale?: number;
  hr_upscaler?: string;
  hr_second_pass_steps?: number;
  hr_resize_x?: number;
  hr_resize_y?: number;
  hr_checkpoint_name?: string;
  hr_sampler_name?: string;
  hr_scheduler?: string;
  hr_prompt?: string;
  hr_negative_prompt?: string;
  force_task_id?: string;
  sampler_index?: string;
  script_name?: string;
  script_args?: unknown[];
  send_images?: boolean;
  save_images?: boolean;
  alwayson_scripts?: Record<string, unknown>;
  infotext?: string;
*/

}
