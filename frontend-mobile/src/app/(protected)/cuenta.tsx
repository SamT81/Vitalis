import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { IconName } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/features/auth/AuthContext';
import { roleLabel } from '@/features/auth/roles';
import {
  formatDateTime,
  formatRemaining,
  initials,
  NOT_REGISTERED,
  orNotRegistered,
} from '@/lib/format';
import { colors } from '@/lib/theme';

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

export default function AccountScreen() {
  const { user, expiresAt, logout } = useAuth();
  const [now, setNow] = useState(() => Date.now());

  // Refresca el tiempo restante de la sesión.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  if (!user) return null;

  return (
    <Screen>
      <Text className="text-[15px] leading-6 text-slate-600">
        Datos de tu cuenta y de la sesión activa en la red RIBAS.
      </Text>

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
          <Text className="text-[15px]">{formatDateTime(expiresAt)}</Text>
          <Text className="mt-0.5 text-xs text-slate-600">{formatRemaining(expiresAt, now)}</Text>
        </Row>

        <View className="gap-2.5 pt-5">
          <Button
            variant="outline"
            title="Ver mi perfil de donante"
            icon="user"
            onPress={() => router.navigate('/perfil')}
          />
          <Button title="Cerrar sesión" icon="log-out" onPress={() => void logout()} />
        </View>
      </Card>

      <View className="mt-4 flex-row items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <Feather name="lock" size={14} color={colors.slate600} style={{ marginTop: 2 }} />
        <Text className="flex-1 text-xs leading-5 text-slate-600">
          Tu sesión se guarda cifrada en este dispositivo y se cierra automáticamente al vencer.
          Tratamos tus datos personales conforme a la Ley 1581 de 2012.
        </Text>
      </View>
    </Screen>
  );
}
