import { Feather } from '@expo/vector-icons';
import { formatNumber, LIVES_PER_DONATION, orNotRegistered } from '@ribas/shared';
import { View } from 'react-native';

import type { IconName } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors } from '@/lib/theme';
import { cn } from '@/lib/utils';

import type { DonorProfile } from '../types';

interface StatTileProps {
  icon: IconName;
  label: string;
  value: string;
  tone: string;
  accent: string;
  iconColor: string;
}

function StatTile({ icon, label, value, tone, accent, iconColor }: StatTileProps) {
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

/** Resumen: puntos, tipo de sangre, donaciones y vidas salvadas estimadas. */
export function ProfileSummary({ profile }: { profile: DonorProfile }) {
  return (
    <>
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
          value={orNotRegistered(profile.donations, (value) =>
            String(Number(value) * LIVES_PER_DONATION),
          )}
          tone="bg-emerald-50"
          accent="text-emerald-700"
          iconColor={colors.emerald700}
        />
      </View>
    </>
  );
}
