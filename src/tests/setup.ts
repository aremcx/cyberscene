/**
 * Test Setup
 * Configure test environment
 */

import { vi, beforeAll, afterAll } from 'vitest';

// Mock crypto for tests
if (!globalThis.crypto) {
  globalThis.crypto = {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    subtle: {
      digest: async (algorithm: string, data: ArrayBuffer) => {
        // Simple mock hash
        const arr = new Uint8Array(data);
        const sum = arr.reduce((acc, val) => acc + val, 0);
        const hash = new Uint8Array(32);
        for (let i = 0; i < 32; i++) {
          hash[i] = (sum + i) % 256;
        }
        return hash.buffer;
      },
      importKey: async () => ({}),
      deriveBits: async () => new ArrayBuffer(32),
    },
  } as any;
}

// Mock console to reduce noise
const originalConsole = { ...console };
beforeAll(() => {
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});
