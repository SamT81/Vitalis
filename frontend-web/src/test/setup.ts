import '@testing-library/jest-dom/vitest';
import { beforeEach } from 'vitest';
import { mockConfig, resetMockAuth } from '@/features/auth/authService.mock';
import { mockProfileConfig } from '@/features/profile/profileService';

beforeEach(() => {
  localStorage.clear();
  resetMockAuth();
  mockConfig.delayMs = 0;
  mockProfileConfig.delayMs = 0;
});
