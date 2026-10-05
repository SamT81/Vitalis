import { formatDateTime, formatRemaining } from '@ribas/shared';
import { useEffect, useState } from 'react';
import { useSession } from './useSession';

const REFRESH_MS = 30_000;

/** Fecha de vencimiento de la sesión y tiempo restante, actualizado cada 30 s. */
export function useSessionCountdown() {
  const { expiresAt } = useSession();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  return {
    expiresLabel: formatDateTime(expiresAt),
    remainingLabel: formatRemaining(expiresAt, now),
  };
}
