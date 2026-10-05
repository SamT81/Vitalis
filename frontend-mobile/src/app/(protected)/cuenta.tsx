import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Text } from '@/components/ui/Text';
import { AccountCard } from '@/features/auth';
import { colors } from '@/lib/theme';

export default function AccountScreen() {
  return (
    <Screen>
      <Text className="text-[15px] leading-6 text-slate-600">
        Datos de tu cuenta y de la sesión activa en la red RIBAS.
      </Text>

      <AccountCard />

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
