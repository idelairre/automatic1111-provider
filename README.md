# ComfyUI

[ComfyUI](https://github.com/comfyanonymous/ComfyUI) is a powerful and modular Stable Diffusion GUI and backend that provides a node-based interface for creating complex image generation workflows. The [ComfyUI provider](https://github.com/idelairre/comfyui-provider) for the AI SDK enables seamless integration with locally hosted ComfyUI instances while offering unique advantages:

- **Local Control**: Full control over your image generation with local Stable Diffusion models
- **No API Costs**: Generate unlimited images without per-request charges
- **Workflow Flexibility**: Create and use custom ComfyUI workflows
- **Privacy**: All generation happens locally on your hardware
- **Community Models**: Access to thousands of community-created models from Civitai and HuggingFace
- **Node-Based**: Leverage ComfyUI's powerful node system for complex generations

Learn more about ComfyUI's capabilities in the [ComfyUI Documentation](https://comfyanonymous.github.io/ComfyUI_examples/).

## Setup

You need to have ComfyUI running. Start your ComfyUI instance normally - the API server is enabled by default and runs on port 8188.

```bash
# Navigate to your ComfyUI directory
cd ComfyUI

# Run ComfyUI (API server starts automatically on port 8188)
python main.py
```

The ComfyUI provider is available in the `comfyui-provider` module. You can install it with:

```bash
# pnpm
pnpm add comfyui-provider

# npm
npm install comfyui-provider

# yarn
npm install comfyui-provider
```

## Provider Instance

To create a ComfyUI provider instance, use the `createComfyUIProvider` function:

```typescript
import { createComfyUIProvider } from 'comfyui-provider';

const comfyUI = createComfyUIProvider({
  baseURL: 'http://127.0.0.1:8188', // Your ComfyUI instance
});
```

Or use the pre-configured provider instance:

```typescript
import { comfyUIProvider } from 'comfyui-provider';
// or
import comfyUIProvider from 'comfyui-provider';
```

## Image Models

The ComfyUI provider supports image generation through the `image()` method:

```typescript
// Basic image generation
const imageModel = comfyUI.image('sdxl-base');

// With custom model
const realisticModel = comfyUI.image('realistic-vision-v4');
```

## Examples

### Basic Image Generation

```typescript
import { comfyUIProvider } from 'comfyui-provider';
import { experimental_generateImage as generateImage } from 'ai';

const { images } = await generateImage({
  model: comfyUIProvider.image('sdxl-base'),
  prompt: 'A beautiful sunset over mountains',
  size: '512x512',
});
```

### Advanced Configuration

```typescript
const { images } = await generateImage({
  model: comfyUIProvider.image('realistic-vision-v4'),
  prompt: 'Portrait of a wise old wizard with a long beard',
  n: 2,
  seed: 12345,
  providerOptions: {
    comfyui: {
      negativePrompt: 'blurry, ugly, deformed, low quality',
      steps: 40,
      cfgScale: 8.5,
      sampler: 'euler_ancestral',
      checkModelExists: true,
    },
  },
});
```

## Provider Options

The ComfyUI provider supports the following options for customizing image generation:

### Available Options

| Option              | Type       | Default     | Description                             |
| ------------------- | ---------- | ----------- | --------------------------------------- |
| `negativePrompt`    | `string`   | `undefined` | What you don't want in the image        |
| `seed`              | `number`   | `random`    | Random seed for reproducible results    |
| `steps`             | `number`   | `20`        | Number of inference steps               |
| `cfgScale`          | `number`   | `7`         | Classifier-free guidance scale          |
| `sampler`           | `string`   | `"euler"`   | Sampling method                         |
| `scheduler`         | `string`   | `"normal"`  | Scheduler type                          |
| `width`             | `number`   | `512/1024*` | Image width (\*1024 for SDXL models)    |
| `height`            | `number`   | `512/1024*` | Image height (\*1024 for SDXL models)   |
| `denoisingStrength` | `number`   | `1`         | Denoising strength (0.0-1.0)            |
| `styles`            | `string[]` | `undefined` | Predefined styles to apply              |
| `checkModelExists`  | `boolean`  | `false`     | Validate model exists before generation |

\*SDXL models automatically use optimized defaults for better quality.

## Model Management

The provider automatically detects available models from your ComfyUI instance. To use a model:

1. Place your `.safetensors` or `.ckpt` model files in the ComfyUI `models/checkpoints/` directory
2. Restart ComfyUI or refresh the models list in the web interface
3. Use the model name (without file extension) in the provider

Model IDs are automatically converted to checkpoint filenames (e.g., `"sdxl-base"` → `"sdxl_base.safetensors"`).

## Testing

The provider includes test applications to verify functionality:

### Node.js Test Apps

```bash
# Basic connection test (recommended first)
npm run test-simple

# Advanced test with Sgt. Motoko prompt
npm run test-app
```

### Test Results

The test apps will:
- ✅ Verify ComfyUI is running and accessible
- ✅ Test provider configuration and API integration
- ✅ Validate model availability and error handling
- ✅ Generate and save sample images
- ✅ Provide detailed troubleshooting guidance

**Expected behavior:** If ComfyUI is not running, you'll see connection errors. If models are missing, you'll see model validation errors. This is normal and proves the provider is working correctly!

### HTML Demo

Open `test-app.html` in a browser to see the API usage pattern (requires bundling for actual image generation).

## Additional Resources

- [ComfyUI Documentation](https://comfyanonymous.github.io/ComfyUI_examples/)
- [ComfyUI GitHub](https://github.com/comfyanonymous/ComfyUI)
- [Civitai Models](https://civitai.com/models)
- [HuggingFace Models](https://huggingface.co/models?other=comfyui)
- [Vercel AI SDK](https://ai-sdk.dev/)
