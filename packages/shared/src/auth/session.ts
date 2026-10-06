import type { LoginResponse, Session } from './types';

export function isExpired(expiresAt: string, now: number = Date.now()): boolean {
  const expiry = Date.parse(expiresAt);
  return !(expiry > now);
}

function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false;
  // Dato externo sin tipo: se inspecciona campo por campo antes de confiar en él.
  const candidate = value as Partial<Session>;
  return (
    typeof candidate.token === 'string' &&
    candidate.token.length > 0 &&
    typeof candidate.expiresAt === 'string' &&
    typeof candidate.user === 'object' &&
    candidate.user !== null &&
    typeof candidate.user.email === 'string' &&
    Array.isArray(candidate.user.roles)
  );
}

/** Texto guardado → sesión vigente, o null si falta, está corrupta o ya venció. */
export function parseStoredSession(raw: string | null | undefined): Session | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // JSON corrupto: se trata como si no hubiera sesión
    return null;
  }
  return isSession(parsed) && !isExpired(parsed.expiresAt) ? parsed : null;
}

/** "natalia.rojas@banco.co" → "Natalia Rojas" (el contrato de login no trae el nombre). */
function nameFromEmail(email: string): string {
  return (email.split('@')[0] ?? '')
    .split(/[._-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface ProfileHint {
  name?: string;
  institutionName?: string | null;
}

export function toSession(response: LoginResponse, email: string, hint: ProfileHint = {}): Session {
  return {
    token: response.token,
    expiresAt: response.expiresAt,
    user: {
      userId: response.userId,
      email,
      name: hint.name || nameFromEmail(email) || email,
      roles: [...response.roles],
      institutionId: response.institutionId ?? null,
      institutionName: hint.institutionName || null,
    },
  };
}
