import { router } from 'expo-router';
import { View } from 'react-native';
import { AuthCard } from '@/components/AuthCard';
import { Screen } from '@/components/Screen';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function ComingSoonScreen() {
  return (
    <Screen centered>
      <AuthCard
        icon="user-plus"
        title="Registro de donantes"
        description="Estamos preparando el registro para que puedas unirte a la red RIBAS en menos de dos minutos."
      >
        <View className="items-center">
          <Badge pill label="Próximamente" className="self-center" />
          <Text className="mt-4 text-center text-sm leading-6 text-slate-600">
            Muy pronto podrás crear tu cuenta de donante desde aquí. Si ya tienes una cuenta, inicia
            sesión para ver tus datos.
          </Text>
        </View>
        <View className="mt-6 gap-3">
          <Button
            size="lg"
            title="Iniciar sesión"
            icon="log-in"
            onPress={() => router.replace('/login')}
          />
          <Button
            size="lg"
            variant="outline"
            title="Volver al inicio"
            icon="arrow-left"
            onPress={() => router.dismissTo('/')}
          />
        </View>
      </AuthCard>
    </Screen>
  );
}
