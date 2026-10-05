import type { LoginResponse, Session } from './types';

export function isExpired(expiresAt: string, now: number = Date.now()): boolean {
  const expiry = Date.parse(expiresAt);
  return !(expiry > now);
}

/** "natalia.rojas@banco.co" → "Natalia Rojas" (el contrato de login no trae el nombre). */
export function nameFromEmail(email: string): string {
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
