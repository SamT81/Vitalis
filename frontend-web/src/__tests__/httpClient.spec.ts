import { AxiosError } from 'axios';
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createHttpAuthService,
  createProfileService,
  ERROR_MESSAGES,
  messageFor,
} from '@ribas/shared';
import { http, setUnauthorizedHandler } from '@/api/httpClient';
import { saveSession } from '@/lib/sessionStore';

const httpAuthService = createHttpAuthService(http);

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

function seedSession(): void {
  saveSession({
    token: 'tok-123',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    user: {
      userId: 'u1',
      email: 'a@b.co',
      name: 'A',
      roles: [],
      institutionId: null,
      institutionName: null,
    },
  });
}

afterEach(() => {
  setUnauthorizedHandler(null);
  http.defaults.adapter = undefined;
});

describe('httpClient', () => {
  it('agrega Authorization: Bearer cuando hay sesión', async () => {
    seedSession();
    let header: unknown;
    http.defaults.adapter = reply(200, {}, (config) => {
      header = config.headers.get('Authorization');
    });

    await http.get('/api/v1/donors/u1');
    expect(header).toBe('Bearer tok-123');
  });

  it('ante un 401 autenticado avisa para cerrar sesión', async () => {
    seedSession();
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    http.defaults.adapter = reply(401, {
      code: 'TOKEN_EXPIRED',
      message: 'x',
      timestamp: 't',
    });

    await expect(http.get('/api/v1/donors/u1')).rejects.toMatchObject({
      status: 401,
      code: 'TOKEN_EXPIRED',
    });
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('un 401 del login (sin token) no cierra sesión y se traduce al español', async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    http.defaults.adapter = reply(401, {
      code: 'INVALID_CREDENTIALS',
      message: 'bad',
      timestamp: '2026-01-01T00:00:00Z',
    });

    const error: unknown = await httpAuthService
      .login({ email: 'a@b.co', password: '12345678' })
      .catch((cause: unknown) => cause);

    expect(onUnauthorized).not.toHaveBeenCalled();
    expect(messageFor(error)).toBe(ERROR_MESSAGES.INVALID_CREDENTIALS);
  });

  it('convierte la respuesta del contrato en una sesión', async () => {
    let body: unknown;
    http.defaults.adapter = reply(
      200,
      {
        valid: true,
        userId: 'u9',
        institutionId: 'i1',
        roles: ['donante'],
        token: 'jwt',
        expiresAt: '2099-01-01T00:00:00Z',
      },
      (config) => {
        body = JSON.parse(String(config.data));
      },
    );

    const session = await httpAuthService.login({
      email: 'ana.gomez@ribas.co',
      password: '12345678',
    });

    expect(body).toEqual({ email: 'ana.gomez@ribas.co', password: '12345678' });
    expect(session).toMatchObject({
      token: 'jwt',
      expiresAt: '2099-01-01T00:00:00Z',
      user: {
        userId: 'u9',
        name: 'Ana Gomez',
        roles: ['donante'],
        institutionId: 'i1',
        institutionName: null,
      },
    });
  });

  it('normaliza la caída de red y los códigos desconocidos', async () => {
    http.defaults.adapter = async (config) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config);
    };
    const networkError: unknown = await http.get('/x').catch((cause: unknown) => cause);
    expect(networkError).toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
    expect(messageFor(networkError)).toBe(ERROR_MESSAGES.NETWORK_ERROR);

    http.defaults.adapter = reply(500, '<html>');
    const serverError: unknown = await http.get('/x').catch((cause: unknown) => cause);
    expect(serverError).toMatchObject({ status: 500, code: 'UNKNOWN_ERROR' });
    expect(messageFor(serverError)).toBe(ERROR_MESSAGES.GENERIC);
  });
});

describe('perfil de donante contra el backend', () => {
  const profileService = createProfileService({ useMock: false, http });

  it('deja en null los datos ausentes o inválidos', async () => {
    http.defaults.adapter = reply(200, { bloodType: ' ', donations: 'muchas', points: 10 });

    await expect(profileService.getProfile('u1')).resolves.toEqual({
      bloodType: null,
      city: null,
      donations: null,
      points: 10,
    });
  });

  it('devuelve un perfil vacío si la respuesta no es un objeto', async () => {
    http.defaults.adapter = reply(200, null);

    await expect(profileService.getProfile('u1')).resolves.toEqual({
      bloodType: null,
      city: null,
      donations: null,
      points: null,
    });
  });
});
