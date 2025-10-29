// Global test setup for Vitest
import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// Extend global types
declare global {
  var testUtils: {
    createMockResponse: (data: any, options?: { ok?: boolean; status?: number }) => any;
    createMockFetch: (responses: any[]) => any;
  };
}

// Mock fetch globally for all tests
global.fetch = vi.fn();

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Add any global test utilities here
global.testUtils = {
  createMockResponse: (data: any, options: { ok?: boolean; status?: number } = {}) => {
    const { ok = true, status = 200 } = options;
    return {
      ok,
      status,
      json: () => Promise.resolve(data),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
    } as any;
  },

  createMockFetch: (responses: any[]) => {
    let callCount = 0;
    return vi.fn(() => {
      const response = responses[callCount % responses.length];
      callCount++;
      return Promise.resolve(response);
    });
  },
};
