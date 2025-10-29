import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createComfyUIProvider,
  comfyUIProvider,
  type ComfyUIProviderSettings
} from '../src/index.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('ComfyUI Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createComfyUIProvider', () => {
    it('should create a provider with default settings', () => {
      const provider = createComfyUIProvider();

      expect(provider).toBeDefined();
      expect(typeof provider.image).toBe('function');
      expect(typeof provider.imageModel).toBe('function');
      expect(typeof provider.languageModel).toBe('function');
      expect(typeof provider.textEmbeddingModel).toBe('function');
    });

    it('should create a provider with custom settings', () => {
      const settings: ComfyUIProviderSettings = {
        baseURL: 'http://custom-host:9090',
        clientId: 'test-client',
        apiKey: 'test-key',
        headers: {
          'X-Custom': 'value',
        },
      };

      const provider = createComfyUIProvider(settings);

      expect(provider).toBeDefined();

      // Test that image method works
      const model = provider.image('sdxl-base');
      expect(model).toBeDefined();
      expect(model.modelId).toBe('sdxl-base');
    });

    it('should create a provider with partial settings', () => {
      const settings: Partial<ComfyUIProviderSettings> = {
        baseURL: 'http://custom-host:9090',
      };

      const provider = createComfyUIProvider(settings);
      expect(provider).toBeDefined();
    });
  });

  describe('comfyUIProvider (default instance)', () => {
    it('should be a valid provider instance', () => {
      expect(comfyUIProvider).toBeDefined();
      expect(typeof comfyUIProvider.image).toBe('function');
      expect(typeof comfyUIProvider.imageModel).toBe('function');
    });

    it('should create models with the default provider', () => {
      const model = comfyUIProvider.image('sd15');
      expect(model).toBeDefined();
      expect(model.modelId).toBe('sd15');
    });
  });

  describe('Provider interface compliance', () => {
    it('should implement ProviderV2 interface', () => {
      const provider = createComfyUIProvider();

      // Should have image methods
      expect(provider.image).toBeDefined();
      expect(provider.imageModel).toBeDefined();

      // Should have placeholder methods that throw
      expect(() => provider.languageModel('test')).toThrow();
      expect(() => provider.textEmbeddingModel('test')).toThrow();
    });

    it('should throw error for unsupported model types', () => {
      const provider = createComfyUIProvider();

      expect(() => provider.languageModel('gpt-4')).toThrow('No such languageModel: languageModel');
      expect(() => provider.textEmbeddingModel('text-embedding-ada-002')).toThrow('No such textEmbeddingModel: textEmbeddingModel');
    });
  });
});
