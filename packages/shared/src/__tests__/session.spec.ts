import { describe, expect, it } from 'vitest';

import { isExpired, parseStoredSession, toSession } from '../auth/session';
import type { LoginResponse, Session } from '../auth/types';

const HOUR = 3_600_000;
const future = () => new Date(Date.now() + HOUR).toISOString();
const past = () => new Date(Date.now() - HOUR).toISOString();

const session = (expiresAt: string): Session => ({
  token: 'tok',
  expiresAt,
  user: {
    userId: 'u1',
    email: 'ana@ribas.co',
    name: 'Ana',
    roles: ['donante'],
    institutionId: null,
    institutionName: null,
  },
});

describe('parseStoredSession', () => {
  it('devuelve la sesión cuando es válida y está vigente', () => {
    const stored = session(future());
    expect(parseStoredSession(JSON.stringify(stored))).toEqual(stored);
  });

  it('devuelve null si no hay nada guardado', () => {
    expect(parseStoredSession(null)).toBeNull();
    expect(parseStoredSession(undefined)).toBeNull();
    expect(parseStoredSession('')).toBeNull();
  });

  it('devuelve null si la sesión ya venció', () => {
    expect(parseStoredSession(JSON.stringify(session(past())))).toBeNull();
  });

  it('devuelve null con JSON corrupto o con una forma inesperada', () => {
    expect(parseStoredSession('{no es json')).toBeNull();
    expect(parseStoredSession('"texto"')).toBeNull();
    expect(parseStoredSession(JSON.stringify({ token: '', expiresAt: future(), user: {} }))).toBe(
      null,
    );
    expect(parseStoredSession(JSON.stringify({ token: 'tok', expiresAt: future() }))).toBeNull();
  });
});

describe('isExpired', () => {
  it('compara contra la hora indicada y trata las fechas inválidas como vencidas', () => {
    expect(isExpired('2030-01-01T00:00:00Z', Date.parse('2029-12-31T23:59:59Z'))).toBe(false);
    expect(isExpired('2030-01-01T00:00:00Z', Date.parse('2030-01-01T00:00:00Z'))).toBe(true);
    expect(isExpired('no-es-fecha')).toBe(true);
  });
});

describe('toSession', () => {
  const response: LoginResponse = {
    valid: true,
    userId: 'u9',
    institutionId: 'inst-1',
    roles: ['personal_banco_sangre'],
    token: 'jwt',
    expiresAt: '2099-01-01T00:00:00Z',
  };

  it('deriva el nombre del correo cuando el contrato no lo trae', () => {
    expect(toSession(response, 'natalia.rojas@banco.co')).toEqual({
      token: 'jwt',
      expiresAt: '2099-01-01T00:00:00Z',
      user: {
        userId: 'u9',
        email: 'natalia.rojas@banco.co',
        name: 'Natalia Rojas',
        roles: ['personal_banco_sangre'],
        institutionId: 'inst-1',
        institutionName: null,
      },
    });
  });

  it('usa el nombre y la institución cuando otra fuente los aporta', () => {
    const { user } = toSession(response, 'x@y.co', { name: 'Óscar', institutionName: 'INVIMA' });
    expect(user.name).toBe('Óscar');
    expect(user.institutionName).toBe('INVIMA');
  });

  it('no comparte el arreglo de roles con la respuesta y normaliza la institución ausente', () => {
    const { user } = toSession({ ...response, institutionId: null }, 'x@y.co');
    expect(user.roles).not.toBe(response.roles);
    expect(user.institutionId).toBeNull();
  });
});
