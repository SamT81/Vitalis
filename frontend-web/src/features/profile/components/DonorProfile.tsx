import { firstName } from '@ribas/shared';
import { CircleAlert } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/Alert';
import { useSession } from '@/features/auth';

import { useProfile } from '../hooks/useProfile';
import { BadgeGallery } from './BadgeGallery';
import { DonorIdentityCard } from './DonorIdentityCard';
import { ProfileSummary } from './ProfileSummary';

/** Perfil de donante del usuario en sesión: identidad, resumen y medallas. */
export function DonorProfile() {
  const { user } = useSession();
  const { profile, isLoading, error } = useProfile(user?.userId);

  if (!user) return null;

  return (
    <div aria-busy={isLoading}>
      <header className="pb-2 pt-10">
        <h1 className="text-[clamp(1.6rem,3.5vw,2.1rem)] text-slate-900">
          Hola, {firstName(user.name)} 👋
        </h1>
        <p className="mt-1.5 text-[0.95rem] text-slate-600">
          Este es tu perfil de donante. Aquí sigues tus puntos, tus donaciones y tus medallas.
        </p>
      </header>

      {error && (
        <Alert variant="destructive" className="mt-5">
          <CircleAlert aria-hidden />
          <AlertDescription>No pudimos cargar tu perfil de donante. {error}</AlertDescription>
        </Alert>
      )}

      <DonorIdentityCard name={user.name} profile={profile} />
      <ProfileSummary profile={profile} />
      <BadgeGallery profile={profile} />
    </div>
  );
}
