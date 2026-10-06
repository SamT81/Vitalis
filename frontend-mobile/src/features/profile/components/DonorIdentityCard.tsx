import { Feather } from '@expo/vector-icons';
import { donorLevel, initials, orNotRegistered } from '@ribas/shared';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors } from '@/lib/theme';

import type { DonorProfile } from '../types';

interface DonorIdentityCardProps {
  name: string;
  profile: DonorProfile;
}

export function DonorIdentityCard({ name, profile }: DonorIdentityCardProps) {
  const city = orNotRegistered(profile.city);
  const bloodType = orNotRegistered(profile.bloodType);

  return (
    <Card className="mt-5">
      <View className="flex-row flex-wrap items-center gap-4">
        <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-primary-100 bg-primary-50">
          <Text weight="bold" className="text-xl text-primary-700">
            {initials(name)}
          </Text>
        </View>
        <View className="flex-1">
          <Text weight="semibold" className="text-lg leading-6">
            {name}
          </Text>
          <Text className="text-xs text-slate-600">{donorLevel(profile)} · Vitalis RIBAS</Text>
          <View className="mt-1.5 flex-row items-center gap-1">
            <Feather name="map-pin" size={12} color={colors.slate600} />
            <Text accessibilityLabel={`Ciudad: ${city}`} className="text-xs text-slate-600">
              {city}
            </Text>
          </View>
        </View>
        <View
          accessible
          accessibilityLabel={`Tipo de sangre: ${bloodType}`}
          className="flex-row items-center gap-1.5 rounded-full border border-primary-100 bg-primary-50 px-3 py-1"
        >
          <Feather name="droplet" size={13} color={colors.primaryDark} />
          <Text weight="bold" className="text-sm text-primary-700">
            {bloodType}
          </Text>
        </View>
      </View>
    </Card>
  );
}
