import '@testing-library/jest-dom/vitest';

import { mockSettings, resetMockAuth } from '@ribas/shared';
import { beforeEach } from 'vitest';

beforeEach(() => {
  localStorage.clear();
  resetMockAuth();
  mockSettings.delayMs = 0;
});
