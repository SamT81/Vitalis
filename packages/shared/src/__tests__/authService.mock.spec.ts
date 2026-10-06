import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MOCK_PASSWORD, mockAuthService, resetMockAuth } from '../auth/authService.mock';
import { mockSettings } from '../lib/mock';

const EMAIL = 'personal@bancobogota.co';
const WRONG_PASSWORD = 'ClaveErrada1!';

const failOnce = () => mockAuthService.login({ email: EMAIL, password: WRONG_PASSWORD });

beforeEach(() => {
  resetMockAuth();
  mockSettings.delayMs = 0;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('mockAuthService.login', () => {
  it('responde con la forma del contrato y una sesión de 8 horas', async () => {
    const before = Date.now();
    const session = await mockAuthService.login({ email: EMAIL, password: MOCK_PASSWORD });

    expect(session.token).toMatch(/^mock\./);
    expect(session.user).toMatchObject({
      userId: 'usr-mock-0004',
      email: EMAIL,
      roles: ['personal_banco_sangre'],
      institutionId: 'inst-uuid-bogota-01',
    });
    const hours = (Date.parse(session.expiresAt) - before) / 3_600_000;
    expect(hours).toBeGreaterThan(7.99);
    expect(hours).toBeLessThan(8.01);
  });

  it('no distingue mayúsculas ni espacios en el correo', async () => {
    const session = await mockAuthService.login({
      email: '  Personal@BancoBogota.co ',
      password: MOCK_PASSWORD,
    });
    expect(session.user.email).toBe(EMAIL);
  });

  it('rechaza credenciales incorrectas con 401 INVALID_CREDENTIALS', async () => {
    await expect(failOnce()).rejects.toMatchObject({ status: 401, code: 'INVALID_CREDENTIALS' });
    await expect(
      mockAuthService.login({ email: 'nadie@ejemplo.co', password: MOCK_PASSWORD }),
    ).rejects.toMatchObject({ status: 401, code: 'INVALID_CREDENTIALS' });
  });

  it('rechaza la cuenta inactiva con 403 USER_DISABLED', async () => {
    await expect(
      mockAuthService.login({ email: 'inactivo@bancobogota.co', password: MOCK_PASSWORD }),
    ).rejects.toMatchObject({ status: 403, code: 'USER_DISABLED' });
  });

  it('bloquea con 429 ACCOUNT_LOCKED tras 5 fallos en un minuto, incluso con la clave correcta', async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(failOnce()).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    }
    await expect(
      mockAuthService.login({ email: EMAIL, password: MOCK_PASSWORD }),
    ).rejects.toMatchObject({ status: 429, code: 'ACCOUNT_LOCKED' });
  });

  it('el bloqueo es por cuenta y se levanta a los dos minutos', async () => {
    vi.useFakeTimers({ toFake: ['Date'] }); // solo el reloj: el mock espera con setTimeout real
    for (let attempt = 0; attempt < 5; attempt += 1) await failOnce().catch(() => undefined);

    // Otra cuenta no queda bloqueada.
    await expect(
      mockAuthService.login({ email: 'donante@gmail.com', password: MOCK_PASSWORD }),
    ).resolves.toBeDefined();

    vi.advanceTimersByTime(2 * 60 * 1000 + 1);
    await expect(
      mockAuthService.login({ email: EMAIL, password: MOCK_PASSWORD }),
    ).resolves.toBeDefined();
  });

  it('cuatro fallos repartidos en más de un minuto no bloquean', async () => {
    vi.useFakeTimers({ toFake: ['Date'] }); // solo el reloj: el mock espera con setTimeout real
    for (let attempt = 0; attempt < 4; attempt += 1) await failOnce().catch(() => undefined);
    vi.advanceTimersByTime(61 * 1000);
    await failOnce().catch(() => undefined);

    await expect(
      mockAuthService.login({ email: EMAIL, password: MOCK_PASSWORD }),
    ).resolves.toBeDefined();
  });
});
