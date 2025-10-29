import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { createComfyUIProvider } from '../src/index.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('ComfyUI Image Model', () => {
  let mockFetch: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = vi.mocked(fetch);
  });

  describe('Model creation', () => {
    it('should create image models with different IDs', () => {
      const provider = createComfyUIProvider();

      const model1 = provider.image('sdxl-base');
      const model2 = provider.image('sd15');

      expect(model1.modelId).toBe('sdxl-base');
      expect(model2.modelId).toBe('sd15');
      expect(model1.provider).toBe('comfyui');
      expect(model2.provider).toBe('comfyui');
    });

    it('should create image models with settings', () => {
      const provider = createComfyUIProvider();

      const model = provider.imageModel('sdxl-base', {
        negativePrompt: 'blurry',
        steps: 30,
      });

      expect(model.modelId).toBe('sdxl-base');
    });
  });

  describe('doGenerate method', () => {
    it('should handle basic image generation flow', async () => {
      const provider = createComfyUIProvider();

      // Mock the workflow submission
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ prompt_id: 'test-prompt-id' }),
        } as any)
      );

      // Mock the polling - return images immediately
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            'test-prompt-id': {
              outputs: {
                '7': {
                  images: [{
                    filename: 'test-image.png',
                    subfolder: '',
                    type: 'output',
                  }],
                },
              },
            },
          }),
        } as any)
      );

      // Mock the image download
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)), // Mock image data
        } as any)
      );

      const model = provider.image('sdxl-base');

      const result = await model.doGenerate({
        prompt: 'A beautiful sunset',
        n: 1,
        size: '512x512',
        aspectRatio: undefined,
        seed: undefined,
        providerOptions: {},
        headers: {},
        abortSignal: undefined,
      });

      expect(result.images).toHaveLength(1);
      expect(result.warnings).toEqual([]);
      expect(result.response).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(3); // submit, poll, download
    });

    it('should handle size parsing correctly', async () => {
      const provider = createComfyUIProvider();

      // Mock successful workflow
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ prompt_id: 'test-id' }),
        } as any)
      );

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            'test-id': {
              outputs: {
                '7': {
                  images: [{
                    filename: 'test.png',
                    subfolder: '',
                    type: 'output',
                  }],
                },
              },
            },
          }),
        } as any)
      );

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
        } as any)
      );

      const model = provider.image('sdxl-base');

      const result = await model.doGenerate({
        prompt: 'Test',
        n: 1,
        size: '1024x768',
        aspectRatio: undefined,
        seed: undefined,
        providerOptions: {},
        headers: {},
        abortSignal: undefined,
      });

      // The workflow should have been submitted (first call)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/prompt'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"width":1024,"height":768'),
        })
      );

      expect(result.images).toHaveLength(1);
    });

    it('should handle provider options correctly', async () => {
      const provider = createComfyUIProvider();

      // Mock successful workflow
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ prompt_id: 'test-id' }),
        } as any)
      );

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            'test-id': {
              outputs: {
                '7': {
                  images: [{
                    filename: 'test.png',
                    subfolder: '',
                    type: 'output',
                  }],
                },
              },
            },
          }),
        } as any)
      );

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
        } as any)
      );

      const model = provider.image('sdxl-base');

      const result = await model.doGenerate({
        prompt: 'Test prompt',
        n: 1,
        size: undefined,
        aspectRatio: undefined,
        seed: undefined,
        providerOptions: {
          comfyui: {
            negativePrompt: 'blurry, ugly',
            steps: 25,
            cfgScale: 8.5,
            denoisingStrength: 0.9,
          },
        },
        headers: {},
        abortSignal: undefined,
      });

      // Check that provider options were included in the workflow
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/prompt'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"text":"Test prompt"'),
        })
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/prompt'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"text":"blurry, ugly"'), // negative prompt
        })
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/prompt'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"steps":25'),
        })
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/prompt'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"cfg":8.5'),
        })
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/prompt'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"denoise":0.9'),
        })
      );

      expect(result.images).toHaveLength(1);
    });

    it('should handle aspect ratio warnings', async () => {
      const provider = createComfyUIProvider();

      // Mock successful workflow
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ prompt_id: 'test-id' }),
        } as any)
      );

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            'test-id': {
              outputs: {
                '7': {
                  images: [{
                    filename: 'test.png',
                    subfolder: '',
                    type: 'output',
                  }],
                },
              },
            },
          }),
        } as any)
      );

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
        } as any)
      );

      const model = provider.image('sdxl-base');

      const result = await model.doGenerate({
        prompt: 'Test',
        n: 1,
        size: undefined,
        aspectRatio: '16:9', // This should trigger a warning
        seed: undefined,
        providerOptions: {},
        headers: {},
        abortSignal: undefined,
      });

      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toEqual({
        type: 'unsupported-setting',
        setting: 'aspectRatio',
        details: 'This model does not support the `aspectRatio` option. Use `size` instead.',
      });
      expect(result.images).toHaveLength(1);
    });

    it('should handle model validation', async () => {
      const provider = createComfyUIProvider();

      // Mock checkpoint exists check
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['sdxl_base.safetensors']),
        } as any)
      );

      // Mock workflow submission
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ prompt_id: 'test-id' }),
        } as any)
      );

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            'test-id': {
              outputs: {
                '7': {
                  images: [{
                    filename: 'test.png',
                    subfolder: '',
                    type: 'output',
                  }],
                },
              },
            },
          }),
        } as any)
      );

      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
        } as any)
      );

      const model = provider.image('sdxl-base');

      const result = await model.doGenerate({
        prompt: 'Test',
        n: 1,
        size: undefined,
        aspectRatio: undefined,
        seed: undefined,
        providerOptions: {
          comfyui: {
            checkModelExists: true,
          },
        },
        headers: {},
        abortSignal: undefined,
      });

      // Should have called checkpoints endpoint for validation
      expect(mockFetch).toHaveBeenCalledWith('http://127.0.0.1:8188/models/checkpoints');
      expect(result.images).toHaveLength(1);
    });

    it('should throw error for invalid models when validation is enabled', async () => {
      const provider = createComfyUIProvider();

      // Mock checkpoint doesn't exist
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['other-model.safetensors']),
        } as any)
      );

      const model = provider.image('nonexistent-model');

      await expect(model.doGenerate({
        prompt: 'Test',
        n: 1,
        size: undefined,
        aspectRatio: undefined,
        seed: undefined,
        providerOptions: {
          comfyui: {
            checkModelExists: true,
          },
        },
        headers: {},
        abortSignal: undefined,
      })).rejects.toThrow('Model "nonexistent-model" not found in ComfyUI');
    });

    it('should handle abort signals', async () => {
      const provider = createComfyUIProvider();

      // Mock workflow submission
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ prompt_id: 'test-id' }),
        } as any)
      );

      // Mock polling that takes time
      mockFetch.mockImplementationOnce(() => new Promise(() => { })); // Never resolves

      const model = provider.image('sdxl-base');
      const controller = new AbortController();

      // Abort immediately
      controller.abort();

      await expect(model.doGenerate({
        prompt: 'Test',
        n: 1,
        size: undefined,
        aspectRatio: undefined,
        seed: undefined,
        providerOptions: {},
        headers: {},
        abortSignal: controller.signal,
      })).rejects.toThrow('Image generation was aborted');
    });
  });
});
