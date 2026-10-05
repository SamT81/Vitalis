import { firstName } from '@ribas/shared';
import { ActivityIndicator } from 'react-native';
import { Alert } from '@/components/ui/Alert';
import { Text } from '@/components/ui/Text';
import { useSession } from '@/features/auth';
import { colors } from '@/lib/theme';
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
    <>
      <Text accessibilityRole="header" weight="semibold" className="text-[26px] leading-8">
        Hola, {firstName(user.name)} 👋
      </Text>
      <Text className="mt-1.5 text-[15px] leading-6 text-slate-600">
        Este es tu perfil de donante. Aquí sigues tus puntos, tus donaciones y tus medallas.
      </Text>

      {isLoading ? (
        <ActivityIndicator
          className="mt-4"
          color={colors.primary}
          accessibilityLabel="Cargando tu perfil"
        />
      ) : null}

      {error ? (
        <Alert
          variant="destructive"
          icon="alert-circle"
          message={`No pudimos cargar tu perfil de donante. ${error}`}
          className="mt-4"
        />
      ) : null}

      <DonorIdentityCard name={user.name} profile={profile} />
      <ProfileSummary profile={profile} />
      <BadgeGallery profile={profile} />
    </>
  );
}
