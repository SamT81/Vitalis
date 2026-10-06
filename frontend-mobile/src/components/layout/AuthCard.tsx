import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import type { IconName } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors } from '@/lib/theme';

interface AuthCardProps {
  icon: IconName;
  title: string;
  description: string;
  children: ReactNode;
}

/** Tarjeta de las pantallas de acceso (login, recuperar, próximamente). */
export function AuthCard({ icon, title, description, children }: AuthCardProps) {
  return (
    <View className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
      <View className="mb-6 items-center">
        <View className="mb-3.5 h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Feather name={icon} size={20} color={colors.white} />
        </View>
        <Text accessibilityRole="header" weight="semibold" className="text-center text-xl">
          {title}
        </Text>
        <Text className="mt-1.5 text-center text-sm leading-5 text-slate-600">{description}</Text>
      </View>
      {children}
    </View>
  );
}
