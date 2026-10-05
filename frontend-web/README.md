# Vitalis · RIBAS — Frontend web

Aplicación web de la Red Interinstitucional de Bancos de Sangre (RIBAS): **React + Vite +
TypeScript + Tailwind CSS + shadcn/ui**. Funciona sin backend (datos simulados) y se conecta al
backend real cambiando solo variables de entorno.

## Instalar y correr

El repositorio usa **npm workspaces**: las dependencias se instalan una sola vez, desde la raíz.

```bash
# en la raíz del repositorio
npm install

cd frontend-web
cp .env.example .env    # en Windows (PowerShell): Copy-Item .env.example .env
npm run dev             # http://localhost:5173
```

| Comando (en `frontend-web`) | Qué hace                              |
| --------------------------- | ------------------------------------- |
| `npm run dev`               | Servidor de desarrollo                |
| `npm run build`             | Revisa tipos (`tsc`) y genera `dist/` |
| `npm test`                  | Pruebas con Vitest + Testing Library  |
| `npm run lint`              | ESLint                                |
| `npm run format`            | Prettier                              |

Requiere Node.js 20 o superior.

## Pantallas

| Ruta         | Pantalla                                                            | Acceso    |
| ------------ | ------------------------------------------------------------------- | --------- |
| `/`          | Inicio                                                              | Pública   |
| `/login`     | Iniciar sesión                                                      | Pública   |
| `/recuperar` | Recuperar contraseña (confirmación simulada)                        | Pública   |
| `/registro`  | Registro de donantes — "Próximamente"                               | Pública   |
| `/cuenta`    | Mi cuenta: nombre, correo, roles, institución, vencimiento          | Protegida |
| `/perfil`    | Mi perfil de donante: puntos, tipo de sangre, donaciones y medallas | Protegida |

Las rutas protegidas **siempre** redirigen a `/login` si no hay una sesión vigente. No existe
ningún "modo dev" ni inicio de sesión automático.

## Usuarios de prueba (modo simulado)

Contraseña de todos: `Ribas2026!`

| Correo                     | Rol del backend               | Notas                                        |
| -------------------------- | ----------------------------- | -------------------------------------------- |
| `superadmin@vitalis.co`    | `superusuario`                |                                              |
| `admin.nacional@ribas.co`  | `administrador_nacional`      |                                              |
| `admin@bancobogota.co`     | `administrador_institucional` |                                              |
| `personal@bancobogota.co`  | `personal_banco_sangre`       |                                              |
| `logistica@bancobogota.co` | `personal_logistica`          |                                              |
| `auditor@invima.gov.co`    | `auditor_invima`              |                                              |
| `donante@gmail.com`        | `donante`                     | Única cuenta con datos de perfil de donante  |
| `inactivo@bancobogota.co`  | —                             | Cuenta deshabilitada → error `USER_DISABLED` |

Cinco intentos fallidos en un minuto bloquean la cuenta dos minutos (`ACCOUNT_LOCKED`). El
contador vive en memoria: se reinicia al recargar la página.

## Estructura

```
src/
  main.tsx, App.tsx          Arranque y tabla de rutas
  config/env.ts              API_BASE_URL y USE_MOCK
  api/httpClient.ts          Instancia de Axios (timeout 10 s, Bearer, 401 → Login)
  lib/                       sessionStore (localStorage), utils (cn)
  components/
    ui/                      Button, Input, Label, Card, Badge, Alert, PasswordInput, FieldError
    layout/                  AppLayout, SiteHeader, SiteFooter, Brand, AuthCard
  features/
    auth/
      components/            AuthProvider, LoginForm, ForgotPasswordForm, AccountCard, ProtectedRoute
      hooks/                 useSession, useLogin, useForgotPassword, useLogout, useSessionCountdown
      services/authService.ts
      context.ts, types.ts, schemas.ts, index.ts
    profile/
      components/            DonorProfile, DonorIdentityCard, ProfileSummary, BadgeGallery
      hooks/                 useProfile, useBadges
      services/profileService.ts
      types.ts, index.ts
  pages/                     Una pantalla por archivo; solo arman la interfaz
  __tests__/                 Pruebas (*.spec.ts[x])
```

Reglas del código:

- Cada feature se importa **solo** por su `index.ts` (`@/features/auth`, `@/features/profile`).
  ESLint lo exige con `no-restricted-imports`.
- Los componentes no usan Axios: llaman a hooks, y los hooks a los servicios.
- `components/ui` no sabe nada de autenticación ni de la API.
- Tipos, esquemas Zod, mensajes de error, roles, rutas, servicios mock/http y utilidades de
  formato viven en [`packages/shared`](../packages/shared) (`@ribas/shared`), compartido con
  `frontend-mobile`.
- Los colores de marca están en `tailwind.config.js` como tokens `primary` (iguales en móvil).

## Sesión y privacidad

- La sesión se guarda en `localStorage` con la clave `ribas_session` (`{ token, expiresAt, user }`).
- Al abrir la app se restaura; si `expiresAt` ya pasó, se elimina. También se cierra sola en el
  momento en que vence.
- Nunca se escribe el token ni la contraseña en consola (Ley 1581 de 2012). ESLint lo refuerza
  con la regla `no-console`.

## Cómo conectar con el backend

1. En `frontend-web/.env`:

   ```env
   VITE_API_BASE_URL=http://localhost:8000   # URL del API Gateway (Kong), sin barra final
   VITE_USE_MOCK=false
   ```

2. Reinicia `npm run dev` (Vite lee las variables al arrancar).

No hay que tocar código. Lo que el backend debe cumplir:

**Login** — `POST {API_BASE_URL}/api/v1/auth/login`

```jsonc
// Petición
{ "email": "...", "password": "..." }

// 200
{ "valid": true, "userId": "...", "institutionId": "...", "roles": ["..."], "token": "...", "expiresAt": "ISO-8601" }

// Error (401, 403, 429…)
{ "code": "INVALID_CREDENTIALS", "message": "...", "timestamp": "..." }
```

| `code`                | HTTP | Mensaje que ve el usuario                                                  |
| --------------------- | ---- | -------------------------------------------------------------------------- |
| `INVALID_CREDENTIALS` | 401  | El correo o la contraseña son incorrectos.                                 |
| `ACCOUNT_LOCKED`      | 429  | Demasiados intentos. Intenta de nuevo en unos minutos.                     |
| `USER_DISABLED`       | 403  | Tu cuenta está deshabilitada. Contacta al administrador de tu institución. |
| (sin respuesta)       | —    | No hay conexión con el servidor.                                           |
| cualquier otro        | —    | Ocurrió un error inesperado. Intenta de nuevo.                             |

- **CORS:** permitir el origen del frontend (`http://localhost:5173` en desarrollo), los métodos
  `GET, POST, PUT, PATCH, OPTIONS` y las cabeceras `Authorization` y `Content-Type`.
- **Peticiones protegidas:** llevan `Authorization: Bearer {token}`. Si el backend responde `401`,
  el frontend cierra la sesión y manda a Login.
- **Pendiente de definir con backend** (el DD todavía no trae estos contratos; el frontend usa
  estas rutas propuestas):
  - `POST /api/v1/auth/forgot-password` con `{ "email": "..." }` → `2xx` sin revelar si el correo existe.
  - `GET /api/v1/donors/{userId}` → `{ "bloodType", "city", "donations", "points" }`. Los campos
    que falten se muestran como "Sin registrar".
  - El login no devuelve el nombre ni la institución: el nombre se deriva del correo y la
    institución se muestra como "Sin registrar" junto a su `institutionId`.
