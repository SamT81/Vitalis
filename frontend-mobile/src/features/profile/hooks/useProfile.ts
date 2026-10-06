import { EMPTY_PROFILE, messageFor } from '@ribas/shared';
import { useEffect, useState } from 'react';

import { profileService } from '../services/profileService';
import type { DonorProfile } from '../types';

/** Carga el perfil de donante. Mientras llega (o si falla) el perfil queda vacío. */
export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<DonorProfile>(EMPTY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    let active = true;
    profileService
      .getProfile(userId)
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch((cause: unknown) => {
        if (active) setError(messageFor(cause));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  return { profile, isLoading, error };
}
