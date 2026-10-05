import { ApiError, ERROR_MESSAGES } from '@/api/errors';
import { env } from '@/config/env';
import type { AuthService } from './authService';
import { toSession } from './session';
import type { LoginResponse } from './types';

/**
 * Backend simulado: misma forma de respuesta que el contrato del DD.
 * Lógica portada de js/auth-service.js del sitio HTML.
 */
export const MOCK_PASSWORD = 'Ribas2026!';

const SESSION_HOURS = 8;
const LOCK_MAX_FAILS = 5;
const LOCK_WINDOW_MS = 60 * 1000;
const LOCK_DURATION_MS = 2 * 60 * 1000;

interface MockUser {
  email: string;
  userId: string;
  roles: string[];
  institutionId: string | null;
  name: string;
  institution: string | null;
  disabled?: boolean;
}

// prettier-ignore
export const MOCK_USERS: readonly MockUser[] = [
  { email: 'superadmin@vitalis.co',    userId: 'usr-mock-0001', roles: ['superusuario'],                institutionId: 'inst-uuid-vitalis',        name: 'Julián Torres Medina',   institution: 'Vitalis · RIBAS (Sistema)' },
  { email: 'admin.nacional@ribas.co',  userId: 'usr-mock-0002', roles: ['administrador_nacional'],      institutionId: 'inst-uuid-ribas-nacional', name: 'Andrea Castillo Vargas', institution: 'Coordinación Nacional RIBAS' },
  { email: 'admin@bancobogota.co',     userId: 'usr-mock-0003', roles: ['administrador_institucional'], institutionId: 'inst-uuid-bogota-01',      name: 'Ricardo Peña Londoño',   institution: 'Banco de Sangre Bogotá' },
  { email: 'personal@bancobogota.co',  userId: 'usr-mock-0004', roles: ['personal_banco_sangre'],       institutionId: 'inst-uuid-bogota-01',      name: 'Natalia Rojas Marín',    institution: 'Banco de Sangre Bogotá' },
  { email: 'logistica@bancobogota.co', userId: 'usr-mock-0005', roles: ['personal_logistica'],          institutionId: 'inst-uuid-bogota-01',      name: 'Óscar Beltrán Cruz',     institution: 'Banco de Sangre Bogotá' },
  { email: 'auditor@invima.gov.co',    userId: 'usr-mock-0006', roles: ['auditor_invima'],              institutionId: 'inst-uuid-invima',         name: 'Juan Pérez Gómez',       institution: 'INVIMA' },
  { email: 'donante@gmail.com',        userId: 'usr-mock-0007', roles: ['donante'],                     institutionId: null,                       name: 'Camila Herrera Ruiz',    institution: null },
  { email: 'inactivo@bancobogota.co',  userId: 'usr-mock-0008', roles: ['personal_banco_sangre'],       institutionId: 'inst-uuid-bogota-01',      name: 'Cuenta Deshabilitada',   institution: 'Banco de Sangre Bogotá', disabled: true },
];

/** Retardo simulado de red; las pruebas lo ponen en 0. */
export const mockConfig: { delayMs: number } = { delayMs: env.MOCK_DELAY_MS };

interface AttemptEntry {
  fails: number[];
  lockedUntil: number;
}
const attempts = new Map<string, AttemptEntry>();

/** Limpia el contador de intentos fallidos (para pruebas). */
export function resetMockAuth(): void {
  attempts.clear();
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function registerFailure(email: string, now: number): void {
  const entry = attempts.get(email) ?? { fails: [], lockedUntil: 0 };
  entry.fails = [...entry.fails.filter((time) => now - time < LOCK_WINDOW_MS), now];
  if (entry.fails.length >= LOCK_MAX_FAILS) {
    entry.lockedUntil = now + LOCK_DURATION_MS;
    entry.fails = [];
  }
  attempts.set(email, entry);
}

function mockToken(userId: string, expiresAt: string): string {
  const payload = JSON.stringify({ sub: userId, exp: Math.floor(Date.parse(expiresAt) / 1000) });
  return `mock.${typeof btoa === 'function' ? btoa(payload) : payload}.signature`;
}

export const mockAuthService: AuthService = {
  async login(credentials) {
    await delay(mockConfig.delayMs);
    const email = credentials.email.trim().toLowerCase();
    const now = Date.now();

    const entry = attempts.get(email);
    if (entry && entry.lockedUntil > now) {
      throw new ApiError(429, 'ACCOUNT_LOCKED', ERROR_MESSAGES.ACCOUNT_LOCKED);
    }

    const account = MOCK_USERS.find((user) => user.email === email);
    if (!account || credentials.password !== MOCK_PASSWORD) {
      registerFailure(email, now);
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'El correo o la contraseña son incorrectos');
    }
    if (account.disabled) throw new ApiError(403, 'USER_DISABLED', ERROR_MESSAGES.USER_DISABLED);

    attempts.delete(email);
    const expiresAt = new Date(now + SESSION_HOURS * 3600 * 1000).toISOString();
    const response: LoginResponse = {
      valid: true,
      userId: account.userId,
      institutionId: account.institutionId,
      roles: [...account.roles],
      token: mockToken(account.userId, expiresAt),
      expiresAt,
    };
    // Nombre e institución no vienen en el contrato de login: el mock los aporta aparte.
    return toSession(response, email, { name: account.name, institutionName: account.institution });
  },

  async logout() {},

  async forgotPassword() {
    await delay(mockConfig.delayMs);
  },
};
