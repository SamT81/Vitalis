import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from '@/App';
import {
  ERROR_MESSAGES,
  loginSchema,
  MOCK_PASSWORD,
  mockAuthService,
  STORAGE_KEYS,
} from '@ribas/shared';
import type { Session } from '@ribas/shared';

function renderApp(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );
}

async function submitLogin(user: UserEvent, email: string, password: string) {
  const emailInput = screen.getByLabelText('Correo electrónico');
  const passwordInput = screen.getByLabelText('Contraseña');
  await user.clear(emailInput);
  await user.clear(passwordInput);
  if (email) await user.type(emailInput, email);
  if (password) await user.type(passwordInput, password);
  await user.click(screen.getByRole('button', { name: 'Ingresar' }));
}

const storedSession = () => localStorage.getItem(STORAGE_KEYS.SESSION);

function seedSession(expiresAt: string): void {
  const session: Session = {
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
  };
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

describe('validación del formulario de login', () => {
  it('exige correo y contraseña', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await submitLogin(user, '', '');

    expect(await screen.findByText('Ingresa tu correo electrónico.')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument();
    expect(storedSession()).toBeNull();
  });

  it('rechaza un correo inválido y una contraseña de menos de 8 caracteres', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await submitLogin(user, 'correo-invalido', 'corta');

    expect(await screen.findByText('Ingresa un correo electrónico válido.')).toBeInTheDocument();
    expect(screen.getByText('La contraseña debe tener al menos 8 caracteres.')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('aria-invalid', 'true');
  });

  it('el esquema Zod acepta credenciales con formato válido', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: '12345678' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'a@b', password: '12345678' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@b.co', password: '1234567' }).success).toBe(false);
  });

  it('permite mostrar y ocultar la contraseña', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    const input = screen.getByLabelText('Contraseña');
    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(input).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(input).toHaveAttribute('type', 'password');
  });
});

describe('inicio de sesión', () => {
  it('con credenciales correctas guarda la sesión y redirige a Mi cuenta', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await submitLogin(user, 'donante@gmail.com', MOCK_PASSWORD);

    expect(await screen.findByRole('heading', { name: 'Mi cuenta' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Camila Herrera Ruiz' })).toBeInTheDocument();
    expect(screen.getByText('donante@gmail.com')).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Roles' })).getByText('Donante')).toBeVisible();

    const session = JSON.parse(storedSession() ?? 'null') as Session;
    expect(session.token).toMatch(/^mock\./);
    expect(session.user.roles).toEqual(['donante']);
    expect(Date.parse(session.expiresAt)).toBeGreaterThan(Date.now());
  });

  it('con credenciales incorrectas muestra el error y no crea sesión', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await submitLogin(user, 'donante@gmail.com', 'ClaveErrada1!');

    expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_MESSAGES.INVALID_CREDENTIALS);
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(storedSession()).toBeNull();
  });

  it('bloquea la cuenta tras 5 intentos fallidos en un minuto', async () => {
    const email = 'personal@bancobogota.co';
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(
        mockAuthService.login({ email, password: 'ClaveErrada1!' }),
      ).rejects.toMatchObject({ status: 401, code: 'INVALID_CREDENTIALS' });
    }
    await expect(mockAuthService.login({ email, password: MOCK_PASSWORD })).rejects.toMatchObject({
      status: 429,
      code: 'ACCOUNT_LOCKED',
    });

    // Ni siquiera con la contraseña correcta se entra mientras dura el bloqueo.
    const user = userEvent.setup();
    renderApp('/login');
    await submitLogin(user, email, MOCK_PASSWORD);

    expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_MESSAGES.ACCOUNT_LOCKED);
    expect(storedSession()).toBeNull();
  });

  it('informa cuando la cuenta está deshabilitada', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await submitLogin(user, 'inactivo@bancobogota.co', MOCK_PASSWORD);

    expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_MESSAGES.USER_DISABLED);
    expect(storedSession()).toBeNull();
  });

  it('al cerrar sesión borra la sesión y vuelve a Login', async () => {
    const user = userEvent.setup();
    seedSession(new Date(Date.now() + 3_600_000).toISOString());
    renderApp('/cuenta');

    await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }));

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(storedSession()).toBeNull();
  });
});

describe('rutas protegidas', () => {
  it.each(['/cuenta', '/perfil'])('%s sin sesión redirige a Login', async (route) => {
    renderApp(route);

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument();
  });

  it('nunca inicia sesión de forma automática', () => {
    renderApp('/');

    expect(storedSession()).toBeNull();
    expect(screen.getAllByRole('link', { name: 'Iniciar sesión' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: 'Mi cuenta' })).toBeInTheDocument(); // enlace del pie
    expect(screen.queryByRole('button', { name: 'Salir' })).not.toBeInTheDocument();
  });

  it('una sesión vencida se descarta al abrir la app', async () => {
    seedSession(new Date(Date.now() - 1000).toISOString());
    renderApp('/cuenta');

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(storedSession()).toBeNull();
  });

  it('una sesión vigente se restaura al abrir la app', async () => {
    seedSession(new Date(Date.now() + 3_600_000).toISOString());
    renderApp('/cuenta');

    expect(await screen.findByRole('heading', { name: 'Natalia Rojas Marín' })).toBeInTheDocument();
    expect(screen.getByText('Banco de Sangre Bogotá')).toBeInTheDocument();
    expect(screen.getByText('Personal de banco de sangre')).toBeInTheDocument();
  });
});

describe('perfil de donante', () => {
  it('muestra "Sin registrar" en vez de null cuando faltan datos', async () => {
    seedSession(new Date(Date.now() + 3_600_000).toISOString());
    const { container } = renderApp('/perfil');

    expect(await screen.findByRole('heading', { name: /Hola, Natalia/ })).toBeInTheDocument();
    expect((await screen.findAllByText('Sin registrar')).length).toBeGreaterThanOrEqual(4);
    expect(container.textContent).not.toMatch(/null|undefined|NaN/);
    expect(screen.getByText('0 / 8 desbloqueadas')).toBeInTheDocument();
  });

  it('muestra el resumen y las medallas de la donante de prueba', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await submitLogin(user, 'donante@gmail.com', MOCK_PASSWORD);
    await user.click(await screen.findByRole('link', { name: 'Ver mi perfil de donante' }));

    expect(await screen.findByText('3 / 8 desbloqueadas')).toBeInTheDocument();
    expect(screen.getByText(/3\.150 pts/)).toBeInTheDocument();
    expect(screen.getByText('Bogotá D.C.')).toBeInTheDocument();
  });
});

describe('otras pantallas', () => {
  it('recuperar contraseña valida el correo y confirma el envío', async () => {
    const user = userEvent.setup();
    renderApp('/recuperar');

    await user.click(screen.getByRole('button', { name: 'Enviar instrucciones' }));
    expect(await screen.findByText('Ingresa tu correo electrónico.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Correo electrónico'), 'donante@gmail.com');
    await user.click(screen.getByRole('button', { name: 'Enviar instrucciones' }));
    expect(await screen.findByText('Revisa tu correo')).toBeInTheDocument();
  });

  it('"Registrarme como donante" lleva a la pantalla Próximamente', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await user.click(screen.getAllByRole('link', { name: 'Registrarme como donante' })[0]!);
    expect(await screen.findByText('Próximamente')).toBeInTheDocument();
  });
});
