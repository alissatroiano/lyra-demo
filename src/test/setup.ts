import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// React Testing Library does not auto-clean when globals are enabled via a
// custom setup file, so unmount between tests to avoid cross-test DOM leakage.
afterEach(() => {
  cleanup();
});
