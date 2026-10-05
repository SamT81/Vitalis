import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { messageFor } from '@/api/errors';
import { Screen } from '@/components/Screen';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { IconName } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/features/auth/AuthContext';
import { BADGES, badgeUnlocked, heroLevel } from '@/features/profile/badges';
import { profileService } from '@/features/profile/profileService';
import { EMPTY_PROFILE } from '@/features/profile/types';
import type { DonorProfile } from '@/features/profile/types';
import { firstName, formatNumber, initials, orNotRegistered } from '@/lib/format';
import { colors } from '@/lib/theme';
import { cn } from '@/lib/utils';

interface TileProps {
  icon: IconName;
  label: string;
  value: string;
  tone: string;
  accent: string;
  iconColor: string;
}

function StatTile({ icon, label, value, tone, accent, iconColor }: TileProps) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      className={cn(
        'min-w-[46%] flex-1 flex-row gap-3 rounded-2xl border border-slate-100 p-4',
        tone,
      )}
    >
      <Feather name={icon} size={20} color={iconColor} style={{ marginTop: 2 }} />
      <View className="flex-1">
        <Text className="mb-1 text-xs text-slate-600">{label}</Text>
        <Text weight="bold" className={cn('text-[17px] leading-6', accent)}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const userId = user?.userId;
  const [profile, setProfile] = useState<DonorProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  if (!user) return null;

  const donations = profile.donations ?? 0;
  const unlocked = BADGES.filter((badge) => badgeUnlocked(badge, donations, profile.bloodType));
  const selected =
    BADGES.find((badge) => badge.id === selectedId) ?? unlocked[unlocked.length - 1] ?? BADGES[0];
  const selectedUnlocked = selected ? unlocked.includes(selected) : false;

  return (
    <Screen>
      <Text accessibilityRole="header" weight="semibold" className="text-[26px] leading-8">
        Hola, {firstName(user.name)} 👋
      </Text>
      <Text className="mt-1.5 text-[15px] leading-6 text-slate-600">
        Este es tu perfil de donante. Aquí sigues tus puntos, tus donaciones y tus medallas.
      </Text>

      {loading ? (
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

      <Card className="mt-5">
        <View className="flex-row flex-wrap items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-primary-100 bg-primary-50">
            <Text weight="bold" className="text-xl text-primary-700">
              {initials(user.name)}
            </Text>
          </View>
          <View className="flex-1">
            <Text weight="semibold" className="text-lg leading-6">
              {user.name}
            </Text>
            <Text className="text-xs text-slate-600">
              {profile.donations === null ? 'Donante' : heroLevel(donations)} · Vitalis RIBAS
            </Text>
            <View className="mt-1.5 flex-row items-center gap-1">
              <Feather name="map-pin" size={12} color={colors.slate600} />
              <Text
                accessibilityLabel={`Ciudad: ${orNotRegistered(profile.city)}`}
                className="text-xs text-slate-600"
              >
                {orNotRegistered(profile.city)}
              </Text>
            </View>
          </View>
          <View
            accessible
            accessibilityLabel={`Tipo de sangre: ${orNotRegistered(profile.bloodType)}`}
            className="flex-row items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-3 py-1"
          >
            <Feather name="droplet" size={13} color={colors.primaryDark} />
            <Text weight="bold" className="text-sm text-primary-700">
              {orNotRegistered(profile.bloodType)}
            </Text>
          </View>
        </View>
      </Card>

      <Text accessibilityRole="header" weight="semibold" className="mb-3 mt-7 text-[17px]">
        Mi resumen
      </Text>
      <View className="flex-row flex-wrap gap-3">
        <StatTile
          icon="zap"
          label="Puntos acumulados"
          value={orNotRegistered(profile.points, (value) => `${formatNumber(Number(value))} pts`)}
          tone="bg-sky-50"
          accent="text-sky-700"
          iconColor={colors.sky700}
        />
        <StatTile
          icon="droplet"
          label="Tipo de sangre"
          value={orNotRegistered(profile.bloodType)}
          tone="bg-primary-50"
          accent="text-primary-700"
          iconColor={colors.primaryDark}
        />
        <StatTile
          icon="heart"
          label="Donaciones realizadas"
          value={orNotRegistered(profile.donations)}
          tone="bg-primary-50"
          accent="text-primary-700"
          iconColor={colors.primaryDark}
        />
        <StatTile
          icon="activity"
          label="Vidas salvadas (est.)"
          value={orNotRegistered(profile.donations, (value) => String(Number(value) * 3))}
          tone="bg-emerald-50"
          accent="text-emerald-700"
          iconColor={colors.emerald700}
        />
      </View>

      <View className="mb-3 mt-7 flex-row flex-wrap items-center justify-between gap-2">
        <Text accessibilityRole="header" weight="semibold" className="text-[17px]">
          Mis medallas y logros
        </Text>
        <Text className="text-sm text-slate-600">
          {unlocked.length} / {BADGES.length} desbloqueadas
        </Text>
      </View>
      <Card>
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {BADGES.map((badge) => {
            const isUnlocked = unlocked.includes(badge);
            const isSelected = badge.id === selected?.id;
            return (
              <Pressable
                key={badge.id}
                onPress={() => setSelectedId(badge.id)}
                accessibilityRole="button"
                accessibilityLabel={`${badge.name}: ${isUnlocked ? 'desbloqueada' : 'por desbloquear'}`}
                accessibilityState={{ selected: isSelected }}
                className={cn(
                  'aspect-square w-[22%] items-center justify-center rounded-2xl border',
                  isSelected ? 'border-primary-300 bg-primary-50' : 'border-slate-200 bg-slate-50',
                )}
              >
                <Text className={cn('text-2xl', !isUnlocked && 'opacity-30')}>{badge.icon}</Text>
              </Pressable>
            );
          })}
        </View>

        {selected ? (
          <View className="mt-5 flex-row items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <View
              className={cn(
                'h-11 w-11 items-center justify-center rounded-xl',
                selectedUnlocked ? 'bg-primary-50' : 'bg-slate-100',
              )}
            >
              <Text className={cn('text-xl', !selectedUnlocked && 'opacity-40')}>
                {selected.icon}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row flex-wrap items-center gap-2">
                <Text weight="semibold" className="text-sm">
                  {selected.name}
                </Text>
                <Badge
                  pill
                  variant={selectedUnlocked ? 'success' : 'muted'}
                  label={selectedUnlocked ? 'Desbloqueada' : 'Por desbloquear'}
                  className="px-2.5 py-0.5"
                />
              </View>
              <Text className="mt-1.5 text-xs leading-5 text-slate-600">
                <Text weight="medium" className="text-xs text-slate-700">
                  Criterio:
                </Text>{' '}
                {selected.criteria}
              </Text>
              <Text className="mt-1 text-xs leading-5 text-slate-600">
                <Text weight="medium" className="text-xs text-slate-700">
                  Beneficio:
                </Text>{' '}
                {selected.benefit}
              </Text>
            </View>
          </View>
        ) : null}
      </Card>
    </Screen>
  );
}
