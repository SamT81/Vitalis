import { Feather } from '@expo/vector-icons';
import { initials, NOT_REGISTERED, orNotRegistered, roleLabel, ROUTES } from '@ribas/shared';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import type { IconName } from '@/components/ui/Button';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { colors } from '@/lib/theme';

import { useSession } from '../hooks/useSession';
import { useSessionCountdown } from '../hooks/useSessionCountdown';

function Row({ icon, label, children }: { icon: IconName; label: string; children: ReactNode }) {
  return (
    <View className="border-b border-slate-100 py-4">
      <View className="mb-1.5 flex-row items-center gap-2">
        <Feather name={icon} size={15} color={colors.slate600} />
        <Text weight="semibold" className="text-sm text-slate-600">
          {label}
        </Text>
      </View>
      {children}
    </View>
  );
}

/** Datos de la cuenta y de la sesión activa, con el botón "Cerrar sesión". */
export function AccountCard() {
  const { user, logout } = useSession();
  const { expiresLabel, remainingLabel } = useSessionCountdown();

  if (!user) return null;

  return (
    <Card className="mt-4">
      <View className="flex-row items-center gap-4 border-b border-slate-200 pb-5">
        <View className="h-14 w-14 items-center justify-center rounded-full border border-primary-100 bg-primary-50">
          <Text weight="bold" className="text-primary-700">
            {initials(user.name)}
          </Text>
        </View>
        <View className="flex-1">
          <Text accessibilityRole="header" weight="bold" className="text-lg">
            {orNotRegistered(user.name)}
          </Text>
          <Text className="text-sm text-slate-600">{orNotRegistered(user.email)}</Text>
        </View>
      </View>

      <Row icon="shield" label="Rol(es)">
        {user.roles.length > 0 ? (
          <View className="flex-row flex-wrap gap-1.5">
            {user.roles.map((role) => (
              <Badge key={role} label={roleLabel(role)} />
            ))}
          </View>
        ) : (
          <Text className="text-[15px]">{NOT_REGISTERED}</Text>
        )}
      </Row>

      <Row icon="briefcase" label="Institución">
        <Text className="text-[15px]">{orNotRegistered(user.institutionName)}</Text>
        <Text className="mt-0.5 text-xs text-slate-600">
          ID: {orNotRegistered(user.institutionId)}
        </Text>
      </Row>

      <Row icon="clock" label="La sesión expira">
        <Text className="text-[15px]">{expiresLabel}</Text>
        <Text className="mt-0.5 text-xs text-slate-600">{remainingLabel}</Text>
      </Row>

      <View className="gap-2.5 pt-5">
        <Button
          variant="outline"
          title="Ver mi perfil de donante"
          icon="user"
          onPress={() => router.navigate(ROUTES.PROFILE)}
        />
        {/* Al cerrar sesión, el guardián de (protected) redirige a Login. */}
        <Button title="Cerrar sesión" icon="log-out" onPress={() => void logout()} />
      </View>
    </Card>
  );
}
