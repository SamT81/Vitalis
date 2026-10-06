import '../../global.css';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider } from '@/features/auth';
import { colors, fonts } from '@/lib/theme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) void SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.white },
          headerTintColor: colors.slate900,
          headerTitleStyle: { fontFamily: fonts.semibold, fontSize: 16 },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.slate50 },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }} />
        <Stack.Screen name="recuperar" options={{ title: 'Recuperar contraseña' }} />
        <Stack.Screen name="registro" options={{ title: 'Registro de donantes' }} />
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
