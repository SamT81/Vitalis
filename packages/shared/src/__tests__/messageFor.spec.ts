import { describe, expect, it } from 'vitest';

import { ApiError, messageFor } from '../api/ApiError';
import { ERROR_MESSAGES } from '../constants/errorMessages';

describe('messageFor', () => {
  it.each([
    ['INVALID_CREDENTIALS', 401, ERROR_MESSAGES.INVALID_CREDENTIALS],
    ['ACCOUNT_LOCKED', 429, ERROR_MESSAGES.ACCOUNT_LOCKED],
    ['USER_DISABLED', 403, ERROR_MESSAGES.USER_DISABLED],
    ['NETWORK_ERROR', 0, ERROR_MESSAGES.NETWORK_ERROR],
  ])('traduce %s al español', (code, status, expected) => {
    expect(messageFor(new ApiError(status, code, 'mensaje del backend'))).toBe(expected);
  });

  it('usa el mensaje genérico para códigos desconocidos y errores que no son de la API', () => {
    expect(messageFor(new ApiError(500, 'ALGO_NUEVO'))).toBe(ERROR_MESSAGES.GENERIC);
    expect(messageFor(new Error('boom'))).toBe(ERROR_MESSAGES.GENERIC);
    expect(messageFor(undefined)).toBe(ERROR_MESSAGES.GENERIC);
  });

  it('nunca expone el mensaje crudo del backend ni la clave GENERIC como código', () => {
    expect(messageFor(new ApiError(500, 'GENERIC', 'stack trace interno'))).toBe(
      ERROR_MESSAGES.GENERIC,
    );
  });
});

describe('ApiError', () => {
  it('conserva status, code y timestamp del contrato', () => {
    const error = new ApiError(401, 'INVALID_CREDENTIALS', 'x', '2026-01-01T00:00:00Z');
    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
      timestamp: '2026-01-01T00:00:00Z',
    });
  });
});
