---
title: ComfyUI Provider
description: ComfyUI Provider for the Vercel AI SDK
---

# ComfyUI Provider

[ComfyUI](https://github.com/comfyanonymous/ComfyUI) is a powerful and modular Stable Diffusion GUI and backend that provides a node-based interface for creating complex image generation workflows. The ComfyUI Provider for the Vercel AI SDK enables seamless integration with locally hosted ComfyUI instances while offering unique advantages:

- **Local Control**: Full control over your image generation with local Stable Diffusion models
- **No API Costs**: Generate unlimited images without per-request charges
- **Workflow Flexibility**: Create and use custom ComfyUI workflows
- **Privacy**: All generation happens locally on your hardware
- **Community Models**: Access to thousands of community-created models from Civitai and HuggingFace
- **Node-Based**: Leverage ComfyUI's powerful node system for complex generations

Learn more about ComfyUI's capabilities in the [ComfyUI Documentation](https://comfyanonymous.github.io/ComfyUI_examples/).

## Setup

You need to have ComfyUI running with the API server enabled. Start ComfyUI normally - the API server is enabled by default and runs on port 8188.

The ComfyUI provider is available in the `comfyui-provider` module. You can install it with:

```bash
# pnpm
pnpm add comfyui-provider

# npm
npm install comfyui-provider
```

## Provider Instance

To create a ComfyUI provider instance, use the `createComfyUIProvider` function:

```typescript
import { createComfyUIProvider } from "comfyui-provider";

const comfyUI = createComfyUIProvider({
  baseURL: "http://127.0.0.1:8188", // Your ComfyUI instance
  clientId: "comfyui", // Optional: unique client ID
  apiKey: "your-api-key", // Optional: for authenticated requests
  headers: {
    "X-Custom-Header": "value", // Custom headers for all requests
  },
});
```

## Image Models

The ComfyUI provider supports image generation through the `image()` method. Model IDs should follow this naming convention:

- **Lowercase with dashes**: Use dashes instead of spaces or underscores
- **No file extensions**: Omit `.safetensors`, `.ckpt` extensions
- **Examples**: `"sdxl-base"`, `"realistic-vision-v4"`, `"anything-v4"`

```typescript
// Using model IDs (following naming convention)
const sdxlModel = comfyUI.image("sdxl-base");
const realisticModel = comfyUI.image("realistic-vision-v4");
const anythingModel = comfyUI.image("anything-v4");

// Using direct checkpoint filenames (also supported)
const customModel = comfyUI.image("my-custom-model.safetensors");
```

The provider automatically converts model IDs to checkpoint filenames:

- `"sdxl-base"` → `"sdxl_base.safetensors"`
- `"realistic-vision-v4"` → `"realistic_vision_v4.safetensors"`

**Note:** SDXL models automatically use higher resolution defaults (1024x1024) and more steps (25) for optimal quality.

### Finding Available Models

To see what checkpoint files are available in your ComfyUI installation, you can:

1. Check the ComfyUI web interface Models section
2. Look in your ComfyUI `models/checkpoints/` directory
3. Use the ComfyUI API endpoint `GET /models/checkpoints` to list available models
4. Specify direct filenames with the `.safetensors` or `.ckpt` extension

If a model you specify isn't found, ComfyUI will return an error listing all available checkpoints.

## Model Validation & Discovery

The ComfyUI provider includes utilities for model validation and discovery:

```typescript
import { checkpointExists } from "comfyui-provider";

// Check if a specific model exists
const exists = await checkpointExists(
  "http://127.0.0.1:8188",
  "sdxl_base.safetensors"
);
console.log("Model exists:", exists);
```

Use `checkModelExists: true` in provider options to validate models before generation and get helpful error messages.

## Examples

### Basic Image Generation

```typescript
import { comfyUIProvider } from "comfyui-provider";
import { experimental_generateImage as generateImage } from "ai";

const { images } = await generateImage({
  model: comfyUIProvider.image("sdxl-base"),
  prompt: "A beautiful sunset over mountains",
  size: "512x512",
});
```

### Aborting Image Generation

The provider supports request cancellation through AbortSignal:

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

try {
  const { images } = await generateImage({
    model: comfyUIProvider.image("sdxl-base"),
    prompt: "A beautiful sunset over mountains",
    abortSignal: controller.signal, // Supports cancellation
  });
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Image generation was cancelled");
  }
}
```

### Advanced Configuration

```typescript
const { images } = await generateImage({
  model: comfyUI.image("realistic-vision-v4"),
  prompt: "Portrait of a wise old wizard with a long beard",
  n: 1,
  seed: 12345,
  providerOptions: {
    comfyui: {
      negativePrompt: "blurry, ugly, deformed, low quality",
      steps: 40,
      cfgScale: 8.5,
      sampler: "euler_ancestral",
      denoisingStrength: 0.8,
      checkModelExists: true,
    },
  },
});
```

**Note:** All image generation parameters are configured through the `providerOptions.comfyui` object, similar to other AI SDK providers.

## Provider Options

The ComfyUI provider supports the following configuration options:

### Provider Configuration

| Option     | Type                     | Default                   | Description                            |
| ---------- | ------------------------ | ------------------------- | -------------------------------------- |
| `baseURL`  | `string`                 | `'http://127.0.0.1:8188'` | ComfyUI server URL                     |
| `clientId` | `string`                 | `'comfyui'`               | Unique client ID for tracking requests |
| `apiKey`   | `string`                 | `undefined`               | API key (adds Bearer auth header)      |
| `headers`  | `Record<string, string>` | `undefined`               | Custom headers for requests            |

**Note:** Provider headers are combined with request-level headers using the AI SDK's `combineHeaders` utility. Provider headers take precedence over request headers for duplicate keys.

### Image Settings

The ComfyUI provider supports comprehensive image generation parameters:

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

## Workflow Management

The ComfyUI provider uses predefined workflows to control image generation. Each workflow can be customized with different models, samplers, and parameters.

### Creating Workflows

1. Design your workflow in the ComfyUI web interface
2. Save the workflow as JSON
3. The provider uses a built-in default workflow that includes:
   - Model loading (CheckpointLoaderSimple)
   - Text encoding (CLIPTextEncode for positive/negative prompts)
   - Sampling (KSampler)
   - Image decoding (VAEDecode)
   - Saving (SaveImage)

### Custom Workflows

You can extend the provider to support custom workflows by modifying the `generateImages` method in the `ComfyUIImageModel` class.

## Development

### Installation

```bash
npm install
```

### Building

```bash
npm run build
```

### Testing

The project uses **Vitest** for comprehensive testing with full coverage reporting.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with UI (if Vitest UI is available)
npm run test:ui
```

#### Test Structure

- **Unit Tests**: Individual function and method testing
- **Integration Tests**: Full workflow testing with mocked HTTP calls
- **Coverage**: 87%+ overall coverage with detailed HTML reports
- **Mock Setup**: Comprehensive mocking of fetch API for isolated testing

#### Test Categories

- **Provider Creation**: Testing provider instantiation and configuration
- **Model Resolution**: Testing checkpoint filename conversion
- **Image Generation**: Testing the complete doGenerate workflow
- **Error Handling**: Testing API errors, timeouts, and validation
- **Header Support**: Testing custom header merging and authentication
- **Abort Signals**: Testing request cancellation support

## Additional Resources

- [ComfyUI Documentation](https://comfyanonymous.github.io/ComfyUI_examples/)
- [ComfyUI GitHub](https://github.com/comfyanonymous/ComfyUI)
- [ComfyUI Workflows](https://comfyworkflows.com/)
- [Civitai Models](https://civitai.com/models)
- [HuggingFace Models](https://huggingface.co/models)
- [Vercel AI SDK](https://ai-sdk.dev/)
