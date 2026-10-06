// @vitest-environment jsdom
import type { DonorProfile } from '@ribas/shared';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSessionContext, useBadges, useSessionCountdown } from '../index';

afterEach(() => {
  vi.useRealTimers();
});

describe('createSessionContext', () => {
  const { SessionContext, useSession } = createSessionContext<{ name: string }>();

  it('useSession devuelve el valor del proveedor', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <SessionContext.Provider value={{ name: 'Ana' }}>{children}</SessionContext.Provider>
    );
    expect(renderHook(() => useSession(), { wrapper }).result.current).toEqual({ name: 'Ana' });
  });

  it('useSession falla con un mensaje claro fuera del proveedor', () => {
    const silence = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useSession())).toThrow(/dentro de <AuthProvider>/);
    silence.mockRestore();
  });
});

describe('useSessionCountdown', () => {
  it('muestra el tiempo restante y lo actualiza cada 30 segundos', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'));
    const { result } = renderHook(() => useSessionCountdown('2026-01-01T11:30:00Z'));

    expect(result.current.remainingLabel).toBe('Quedan 1 h 30 min');
    expect(result.current.expiresLabel).not.toBe('Sin registrar');

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.remainingLabel).toBe('Quedan 1 h 29 min');
  });

  it('sin fecha de vencimiento no inventa datos', () => {
    const { result } = renderHook(() => useSessionCountdown(null));
    expect(result.current).toEqual({ expiresLabel: 'Sin registrar', remainingLabel: '' });
  });
});

describe('useBadges', () => {
  const profile = (donations: number | null): DonorProfile => ({
    bloodType: 'O+',
    city: null,
    donations,
    points: null,
  });

  it('sin donaciones no desbloquea nada y muestra la primera medalla', () => {
    const { result } = renderHook(() => useBadges(profile(null)));
    expect(result.current.unlockedCount).toBe(0);
    expect(result.current.selected?.id).toBe('B-01');
  });

  it('selecciona por defecto la última desbloqueada y permite elegir otra', () => {
    const { result } = renderHook(() => useBadges(profile(6)));
    expect(result.current.unlockedCount).toBe(3);
    expect(result.current.selected?.id).toBe('B-03');

    act(() => result.current.select('B-07'));
    expect(result.current.selected?.id).toBe('B-07');
    expect(result.current.isUnlocked(result.current.selected!)).toBe(false);
  });
});
