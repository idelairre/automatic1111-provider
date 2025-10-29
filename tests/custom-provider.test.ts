import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  resolveModelCheckpoint,
  createModelSchema,
  checkpointExists,
} from '../src/index.js';

// Mock fetch for checkpointExists tests
global.fetch = vi.fn();

describe('Custom Provider Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('resolveModelCheckpoint', () => {
    it('should return checkpoint filename as-is if it ends with .safetensors', () => {
      const result = resolveModelCheckpoint('model.safetensors');
      expect(result).toBe('model.safetensors');
    });

    it('should return checkpoint filename as-is if it ends with .ckpt', () => {
      const result = resolveModelCheckpoint('model.ckpt');
      expect(result).toBe('model.ckpt');
    });

    it('should convert dashes to underscores and add .safetensors extension', () => {
      const result = resolveModelCheckpoint('sdxl-base');
      expect(result).toBe('sdxl_base.safetensors');
    });

    it('should handle model IDs with existing underscores', () => {
      const result = resolveModelCheckpoint('realistic_vision_v4');
      expect(result).toBe('realistic_vision_v4.safetensors');
    });

    it('should handle simple model names', () => {
      const result = resolveModelCheckpoint('sd15');
      expect(result).toBe('sd15.safetensors');
    });
  });

  describe('createModelSchema', () => {
    it('should create schema for SDXL model', () => {
      const schema = createModelSchema('sdxl_base.safetensors');

      expect(schema).toEqual({
        id: 'sdxl_base.safetensors',
        name: 'sdxl_base',
        checkpoint: 'sdxl_base.safetensors',
        description: 'Model: sdxl_base.safetensors',
      });
    });

    it('should create schema for SD 1.5 model', () => {
      const schema = createModelSchema('v1-5-pruned.ckpt');

      expect(schema).toEqual({
        id: 'v1-5-pruned.ckpt',
        name: 'v1-5-pruned',
        checkpoint: 'v1-5-pruned.ckpt',
        description: 'Model: v1-5-pruned.ckpt',
      });
    });
  });

  describe('checkpointExists', () => {
    it('should return true when checkpoint exists', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(['model1.safetensors', 'model2.ckpt']),
      } as any);

      const result = await checkpointExists('http://localhost:8188', 'model1.safetensors');
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8188/models/checkpoints');
    });

    it('should return false when checkpoint does not exist', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(['model1.safetensors', 'model2.ckpt']),
      } as any);

      const result = await checkpointExists('http://localhost:8188', 'nonexistent.safetensors');
      expect(result).toBe(false);
    });

    it('should return false when fetch fails', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await checkpointExists('http://localhost:8188', 'model.safetensors');
      expect(result).toBe(false);
    });

    it('should return false when response is not ok', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as any);

      const result = await checkpointExists('http://localhost:8188', 'model.safetensors');
      expect(result).toBe(false);
    });
  });

});
