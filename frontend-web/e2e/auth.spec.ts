import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { ERROR_MESSAGES, MOCK_PASSWORD, ROUTES, STORAGE_KEYS } from '@ribas/shared';

const DONOR = 'donante@gmail.com';
const STAFF = 'personal@bancobogota.co';
const WRONG_PASSWORD = 'ClaveErrada1!';
const LOCK_AFTER_FAILS = 5;

async function login(page: Page, email: string, password: string) {
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
}

const storedSession = (page: Page) =>
  page.evaluate((key) => localStorage.getItem(key), STORAGE_KEYS.SESSION);

/** Falla la prueba si la app escribe errores o advertencias en la consola. */
function trackConsole(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') problems.push(message.text());
  });
  page.on('pageerror', (error) => problems.push(error.message));
  return problems;
}

test.describe('inicio de sesión', () => {
  test('con credenciales incorrectas muestra el error en español y no crea sesión', async ({
    page,
  }) => {
    await page.goto(ROUTES.LOGIN);
    await login(page, DONOR, WRONG_PASSWORD);

    await expect(page.getByRole('alert')).toHaveText(ERROR_MESSAGES.INVALID_CREDENTIALS);
    await expect(page).toHaveURL(ROUTES.LOGIN);
    expect(await storedSession(page)).toBeNull();
  });

  test('bloquea la cuenta al quinto intento fallido, incluso con la contraseña correcta', async ({
    page,
  }) => {
    await page.goto(ROUTES.LOGIN);
    for (let attempt = 1; attempt <= LOCK_AFTER_FAILS; attempt += 1) {
      await login(page, STAFF, WRONG_PASSWORD);
      await expect(page.getByRole('alert')).toHaveText(ERROR_MESSAGES.INVALID_CREDENTIALS);
      await expect(page.getByRole('button', { name: 'Ingresar' })).toBeEnabled();
    }

    await login(page, STAFF, MOCK_PASSWORD);

    await expect(page.getByRole('alert')).toHaveText(ERROR_MESSAGES.ACCOUNT_LOCKED);
    expect(await storedSession(page)).toBeNull();
  });

  test('con credenciales correctas entra a Mi cuenta y guarda la sesión', async ({ page }) => {
    const consoleProblems = trackConsole(page);
    await page.goto(ROUTES.HOME);
    await page.getByRole('main').getByRole('link', { name: 'Iniciar sesión' }).click();
    await login(page, DONOR, MOCK_PASSWORD);

    await expect(page).toHaveURL(ROUTES.ACCOUNT);
    await expect(page.getByRole('heading', { name: 'Mi cuenta' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Camila Herrera Ruiz' })).toBeVisible();
    expect(await storedSession(page)).toContain('"token"');
    expect(consoleProblems).toEqual([]);
  });
});

test.describe('con sesión iniciada', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.LOGIN);
    await login(page, STAFF, MOCK_PASSWORD);
    await expect(page).toHaveURL(ROUTES.ACCOUNT);
  });

  test('Mi cuenta y Mi perfil no muestran null ni undefined', async ({ page }) => {
    const main = page.getByRole('main');
    await expect(main).toContainText('Natalia Rojas Marín');
    await expect(main).toContainText(STAFF);
    await expect(main).toContainText('Personal de banco de sangre');
    await expect(main).toContainText('Banco de Sangre Bogotá');
    await expect(main).not.toContainText(/\b(null|undefined|NaN)\b/);

    await page.getByRole('link', { name: 'Ver mi perfil de donante' }).click();
    await expect(page).toHaveURL(ROUTES.PROFILE);
    await expect(page.getByRole('heading', { name: /Hola, Natalia/ })).toBeVisible();
    await expect(page.getByText('0 / 8 desbloqueadas')).toBeVisible();
    // Esta cuenta no tiene datos de donante: todo debe decir "Sin registrar".
    await expect(main.getByText('Sin registrar')).toHaveCount(6);
    await expect(main).not.toContainText(/\b(null|undefined|NaN)\b/);
  });

  test('la sesión se restaura al recargar la página', async ({ page }) => {
    await page.reload();
    await expect(page).toHaveURL(ROUTES.ACCOUNT);
    await expect(page.getByRole('heading', { name: 'Natalia Rojas Marín' })).toBeVisible();
  });

  test('cerrar sesión borra la sesión y vuelve a Login', async ({ page }) => {
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    await expect(page).toHaveURL(ROUTES.LOGIN);
    await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
    expect(await storedSession(page)).toBeNull();
  });
});

test.describe('rutas protegidas', () => {
  for (const route of [ROUTES.ACCOUNT, ROUTES.PROFILE]) {
    test(`${route} sin sesión redirige a Login`, async ({ page }) => {
      await page.goto(route);

      await expect(page).toHaveURL(ROUTES.LOGIN);
      await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible();
    });
  }
});

test.describe('vista móvil de 360 px', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  const hasHorizontalScroll = (page: Page) =>
    page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

  test('ninguna pantalla tiene scroll horizontal', async ({ page }) => {
    for (const route of [ROUTES.HOME, ROUTES.LOGIN, ROUTES.FORGOT_PASSWORD, ROUTES.REGISTER]) {
      await page.goto(route);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await hasHorizontalScroll(page), `scroll horizontal en ${route}`).toBe(false);
    }

    await page.goto(ROUTES.LOGIN);
    await login(page, DONOR, MOCK_PASSWORD);
    await expect(page).toHaveURL(ROUTES.ACCOUNT);
    expect(await hasHorizontalScroll(page), 'scroll horizontal en Mi cuenta').toBe(false);

    await page.getByRole('link', { name: 'Ver mi perfil de donante' }).click();
    await expect(page.getByText('3 / 8 desbloqueadas')).toBeVisible();
    expect(await hasHorizontalScroll(page), 'scroll horizontal en Mi perfil').toBe(false);
  });
});
