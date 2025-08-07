# Automatic1111 Provider for Vercel AI SDK

A TypeScript provider for the [Vercel AI SDK](https://sdk.vercel.ai) that enables image generation using [AUTOMATIC1111](https://github.com/AUTOMATIC1111/stable-diffusion-webui) Stable Diffusion WebUI.

## Features

- 🎨 **Image Generation**: Generate images using Stable Diffusion models via AUTOMATIC1111's API
- 🎯 **Type Safety**: Full TypeScript support with proper type definitions
- 🚀 **Modern API**: Built on the latest Vercel AI SDK v2 specification
- 🔄 **Error Handling**: Comprehensive error handling with detailed error messages

## Installation

```bash
npm install automatic1111-provider
```

## Prerequisites

Before using this provider, you need to have AUTOMATIC1111 running with the API enabled:

1. **Install AUTOMATIC1111**: Follow the [official installation guide](https://github.com/AUTOMATIC1111/stable-diffusion-webui)
2. **Enable API**: Start AUTOMATIC1111 with the `--api` flag:
   ```bash
   # Windows
   ./webui.bat --api
   
   # Linux/Mac
   ./webui.sh --api
   ```
3. **Verify Setup**: Your AUTOMATIC1111 instance should be accessible at `http://127.0.0.1:7860` by default

## Quick Start

```typescript
import { experimental_generateImage as generateImage } from 'ai';
import { createAutomatic1111 } from 'automatic1111-provider';

// Create the provider instance
const automatic1111 = createAutomatic1111({
  baseURL: 'http://127.0.0.1:7860', // Your AUTOMATIC1111 instance
});

// Generate an image
const { images } = await generateImage({
  model: automatic1111.image('v1-5-pruned-emaonly'), // Your model name
  prompt: 'A beautiful sunset over mountains',
  n: 1,
  size: '512x512',
});

console.log('Generated image:', images[0]);
```

## Configuration

### Provider Settings

```typescript
import { createAutomatic1111 } from 'automatic1111-provider';

const automatic1111 = createAutomatic1111({
  baseURL: 'http://127.0.0.1:7860', // AUTOMATIC1111 API endpoint
});
```

### Provider Options

You can customize the image generation with AUTOMATIC1111-specific options:

```typescript
const { images } = await generateImage({
  model: automatic1111.image('your-model-name'),
  prompt: 'A cyberpunk cityscape at night',
  providerOptions: {
    automatic1111: {
      negative_prompt: 'blurry, low quality, distorted',
      steps: 30,
      cfg_scale: 7.5,
      sampler_name: 'euler a',
      denoising_strength: 0.7,
      styles: ['anime', 'high quality'],
      check_model_exists: true
    }
  }
});
```

#### Available Options

| Option | Type | Description |
|--------|------|-------------|
| `negative_prompt` | `string` | What you don't want in the image |
| `steps` | `number` | Number of sampling steps (default: 20) |
| `cfg_scale` | `number` | CFG (Classifier Free Guidance) scale (default: 7) |
| `sampler_name` | `string` | Sampling method (e.g., "Euler a", "DPM++ 2M Karras") |
| `denoising_strength` | `number` | Denoising strength for img2img (0.0-1.0) |
| `styles` | `string[]` | Apply predefined styles |
| `check_model_exists` | `boolean` | Automatic1111 uses current model if model name is wrong, which can lead to unexpected results. This option will check if the model exists and throw an error if it doesn't. |


## Usage Examples

### Basic Image Generation

```typescript
import { experimental_generateImage as generateImage } from 'ai';
import { automatic1111 } from 'automatic1111-provider';

const result = await generateImage({
  model: automatic1111.image('sd_xl_base_1.0'),
  prompt: 'A majestic dragon flying over a medieval castle',
  size: '1024x1024',
});
```

### Advanced Configuration

```typescript
const result = await generateImage({
  model: automatic1111.image('realistic-vision-v4'),
  prompt: 'Portrait of a wise old wizard with a long beard',
  n: 2, // Generate 2 images
  seed: 12345, // Fixed seed for reproducibility
  providerOptions: {
    automatic1111: {
      negative_prompt: 'blurry, ugly, deformed, low quality',
      steps: 40,
      cfg_scale: 8.5,
      sampler_name: 'DPM++ SDE Karras',
      styles: ['photorealistic', 'detailed'],
    }
  }
});
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure AUTOMATIC1111 is running with `--api` flag
   - Check if the `baseURL` is correct (default: `http://127.0.0.1:7860`)

2. **Model Not Found**
   - Verify the model name matches exactly what's in AUTOMATIC1111
   - Check that the model is properly loaded in the WebUI

3. **Out of Memory**
   - Reduce image size (e.g., from `1024x1024` to `512x512`)
   - Lower the number of steps
   - Use `--medvram` or `--lowvram` flags when starting AUTOMATIC1111

4. **Slow Generation**
   - Reduce the number of steps
   - Use faster samplers like "Euler a" or "DPM++ 2M"
   - Enable xFormers in AUTOMATIC1111 settings

### Performance Tips

- **GPU Memory**: AUTOMATIC1111 requires significant GPU memory. 8GB+ VRAM recommended
- **Batch Size**: Generate multiple images in a single call rather than multiple separate calls

## API Reference

### `createAutomatic1111(options?)`

Creates a new Automatic1111 provider instance.

#### Parameters

- `options.baseURL` (string?): API endpoint URL (default: `'http://127.0.0.1:7860'`)
- `options.headers` (object?): Custom HTTP headers
- `options.apiKey`  (string?): API key (Not needed)
#### Returns

An `Automatic1111Provider` instance with image generation capabilities.

### `automatic1111`

Pre-configured provider instance using default settings.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Related

- [Vercel AI SDK](https://sdk.vercel.ai) - The AI SDK this provider is built for
- [AUTOMATIC1111](https://github.com/AUTOMATIC1111/stable-diffusion-webui) - Stable Diffusion WebUI
- [Stable Diffusion](https://stability.ai/stable-diffusion) - The AI model powering image generation
