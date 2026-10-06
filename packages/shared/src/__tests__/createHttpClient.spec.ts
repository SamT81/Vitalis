import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios';
import { describe, expect, it, vi } from 'vitest';

import { createHttpClient } from '../api/createHttpClient';

const reply =
  (
    status: number,
    data: unknown,
    seen?: (config: InternalAxiosRequestConfig) => void,
  ): AxiosAdapter =>
  async (config) => {
    seen?.(config);
    const response: AxiosResponse = { data, status, statusText: '', headers: {}, config };
    if (status >= 200 && status < 300) return response;
    throw new AxiosError('fallo', 'ERR_BAD_REQUEST', config, null, response);
  };

function client(token: string | null) {
  return createHttpClient({
    baseURL: 'http://kong.test',
    timeoutMs: 10_000,
    getToken: async () => token,
  });
}

describe('createHttpClient', () => {
  it('usa la URL base y el timeout indicados', () => {
    const { http } = client(null);
    expect(http.defaults.baseURL).toBe('http://kong.test');
    expect(http.defaults.timeout).toBe(10_000);
  });

  it('agrega Authorization: Bearer cuando hay token', async () => {
    const { http } = client('tok-123');
    let header: unknown;
    http.defaults.adapter = reply(200, {}, (config) => {
      header = config.headers.get('Authorization');
    });

    await http.get('/api/v1/donors/u1');
    expect(header).toBe('Bearer tok-123');
  });

  it('no agrega la cabecera cuando no hay sesión', async () => {
    const { http } = client(null);
    let hasHeader = true;
    http.defaults.adapter = reply(200, {}, (config) => {
      hasHeader = config.headers.has('Authorization');
    });

    await http.get('/api/v1/algo');
    expect(hasHeader).toBe(false);
  });

  it('ante un 401 con token llama al handler y rechaza con el error del contrato', async () => {
    const { http, setUnauthorizedHandler } = client('tok-123');
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    http.defaults.adapter = reply(401, {
      code: 'TOKEN_EXPIRED',
      message: 'vencido',
      timestamp: '2026-01-01T00:00:00Z',
    });

    await expect(http.get('/api/v1/donors/u1')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      code: 'TOKEN_EXPIRED',
      timestamp: '2026-01-01T00:00:00Z',
    });
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('un 401 sin token (credenciales incorrectas) no llama al handler', async () => {
    const { http, setUnauthorizedHandler } = client(null);
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    http.defaults.adapter = reply(401, { code: 'INVALID_CREDENTIALS' });

    await expect(http.post('/api/v1/auth/login', {})).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
    });
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('sin respuesta del servidor rechaza con NETWORK_ERROR y status 0', async () => {
    const { http } = client(null);
    http.defaults.adapter = async (config) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config);
    };

    await expect(http.get('/x')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
  });

  it('un cuerpo de error que no es JSON del contrato queda como UNKNOWN_ERROR', async () => {
    const { http } = client(null);
    http.defaults.adapter = reply(500, '<html>Bad Gateway</html>');

    await expect(http.get('/x')).rejects.toMatchObject({ status: 500, code: 'UNKNOWN_ERROR' });
  });
});
