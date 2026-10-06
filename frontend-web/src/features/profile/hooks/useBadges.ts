import { BADGES, unlockedBadges } from '@ribas/shared';
import { useMemo, useState } from 'react';

import type { Badge, DonorProfile } from '../types';

/** Medallas del donante y la que está seleccionada en la galería. */
export function useBadges(profile: DonorProfile) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const unlocked = useMemo(() => unlockedBadges(profile), [profile]);

  // Por defecto se muestra la última medalla desbloqueada (o la primera del catálogo).
  const selected: Badge | undefined =
    BADGES.find((badge) => badge.id === selectedId) ?? unlocked[unlocked.length - 1] ?? BADGES[0];

  return {
    badges: BADGES,
    unlockedCount: unlocked.length,
    selected,
    isUnlocked: (badge: Badge) => unlocked.includes(badge),
    select: setSelectedId,
  };
}
