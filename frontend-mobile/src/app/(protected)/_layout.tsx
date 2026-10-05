import { Feather } from '@expo/vector-icons';
import { ROUTES } from '@ribas/shared';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSession } from '@/features/auth';
import { colors, fonts } from '@/lib/theme';

/**
 * Guardián de las pantallas protegidas: sin sesión vigente siempre se va a Login.
 * No hay excepción ni "modo dev".
 */
export default function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color={colors.primary} accessibilityLabel="Cargando" />
      </View>
    );
  }

  if (!isAuthenticated) return <Redirect href={ROUTES.LOGIN} />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTitleStyle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.slate900 },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.slate600,
        tabBarLabelStyle: { fontFamily: fonts.medium },
        sceneStyle: { backgroundColor: colors.slate50 },
      }}
    >
      <Tabs.Screen
        name="cuenta"
        options={{
          title: 'Mi cuenta',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Mi perfil',
          tabBarIcon: ({ color, size }) => <Feather name="heart" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
