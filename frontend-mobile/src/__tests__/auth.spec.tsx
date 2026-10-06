import { mockSettings, resetMockAuth, STORAGE_KEYS } from '@ribas/shared';
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import type { ReactNode } from 'react';
import { Text } from 'react-native';

import ProtectedLayout from '@/app/(protected)/_layout';
import { AuthProvider, LoginForm } from '@/features/auth';

// La navegación se sustituye por marcadores de texto: aquí se prueba la lógica, no Expo Router.
jest.mock('expo-router', () => {
  const { Text: MockText } = jest.requireActual('react-native');
  function Tabs() {
    return <MockText>protected-tabs</MockText>;
  }
  Tabs.Screen = function Screen() {
    return null;
  };
  function Redirect({ href }: { href: string }) {
    return <MockText>{'redirect:' + href}</MockText>;
  }
  return {
    Link: ({ children }: { children: ReactNode }) => children,
    Redirect,
    Tabs,
    router: { replace: jest.fn(), navigate: jest.fn() },
  };
});

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const secureStore = jest.mocked(SecureStore);

const storedSession = (expiresAt: string) =>
  JSON.stringify({
    token: 'mock.token.signature',
    expiresAt,
    user: {
      userId: 'usr-mock-0004',
      email: 'personal@bancobogota.co',
      name: 'Natalia Rojas Marín',
      roles: ['personal_banco_sangre'],
      institutionId: 'inst-uuid-bogota-01',
      institutionName: 'Banco de Sangre Bogotá',
    },
  });

const HOUR = 3_600_000;

beforeEach(() => {
  resetMockAuth();
  mockSettings.delayMs = 0;
  secureStore.getItemAsync.mockResolvedValue(null);
  secureStore.setItemAsync.mockResolvedValue();
  secureStore.deleteItemAsync.mockResolvedValue();
});

async function renderLogin() {
  await render(
    <AuthProvider>
      <LoginForm />
    </AuthProvider>,
  );
}

async function submit(email: string, password: string) {
  if (email) await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), email);
  if (password) await fireEvent.changeText(screen.getByLabelText('Contraseña'), password);
  await fireEvent.press(screen.getByRole('button', { name: 'Ingresar' }));
}

describe('validación del login', () => {
  it('exige correo y contraseña', async () => {
    await renderLogin();
    await submit('', '');

    expect(await screen.findByText('Ingresa tu correo electrónico.')).toBeTruthy();
    expect(screen.getByText('Ingresa tu contraseña.')).toBeTruthy();
    expect(secureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it('rechaza un correo inválido y una contraseña de menos de 8 caracteres', async () => {
    await renderLogin();
    await submit('correo-invalido', 'corta');

    expect(await screen.findByText('Ingresa un correo electrónico válido.')).toBeTruthy();
    expect(screen.getByText('La contraseña debe tener al menos 8 caracteres.')).toBeTruthy();
    expect(secureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it('muestra el error del servidor en español y no guarda sesión', async () => {
    await renderLogin();
    await submit('donante@gmail.com', 'ClaveErrada1!');

    expect(await screen.findByText('El correo o la contraseña son incorrectos.')).toBeTruthy();
    expect(secureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it('con credenciales correctas guarda la sesión cifrada en expo-secure-store', async () => {
    await renderLogin();
    await submit('donante@gmail.com', 'Ribas2026!');

    await screen.findByRole('button', { name: 'Ingresar' });
    expect(secureStore.setItemAsync).toHaveBeenCalledTimes(1);
    const [key, value] = secureStore.setItemAsync.mock.calls[0] ?? [];
    expect(key).toBe(STORAGE_KEYS.SESSION);
    expect(JSON.parse(String(value))).toMatchObject({ user: { email: 'donante@gmail.com' } });
  });
});

describe('guardián de las pantallas protegidas', () => {
  const renderGuard = () =>
    render(
      <AuthProvider>
        <ProtectedLayout />
        <Text>fin</Text>
      </AuthProvider>,
    );

  it('sin sesión redirige a Login', async () => {
    await renderGuard();

    expect(await screen.findByText('redirect:/login')).toBeTruthy();
    expect(screen.queryByText('protected-tabs')).toBeNull();
  });

  it('con una sesión vencida la borra y redirige a Login', async () => {
    secureStore.getItemAsync.mockResolvedValue(
      storedSession(new Date(Date.now() - HOUR).toISOString()),
    );
    await renderGuard();

    expect(await screen.findByText('redirect:/login')).toBeTruthy();
    expect(secureStore.deleteItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.SESSION);
  });

  it('con una sesión vigente muestra las pantallas protegidas', async () => {
    secureStore.getItemAsync.mockResolvedValue(
      storedSession(new Date(Date.now() + HOUR).toISOString()),
    );
    await renderGuard();

    expect(await screen.findByText('protected-tabs')).toBeTruthy();
    expect(screen.queryByText('redirect:/login')).toBeNull();
  });
});
