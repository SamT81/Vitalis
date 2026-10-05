# Vitalis · RIBAS — Frontend web

Aplicación web de la Red Interinstitucional de Bancos de Sangre (RIBAS), migrada del sitio
HTML + Bootstrap a **React + Vite + TypeScript + Tailwind CSS + shadcn/ui**.

Funciona sin backend (datos simulados) y se conecta al backend real cambiando solo variables
de entorno.

## Requisitos

- Node.js 20 o superior y npm.

## Instalar

```bash
cd frontend-web
npm install
cp .env.example .env    # en Windows (PowerShell): Copy-Item .env.example .env
```

## Correr

```bash
npm run dev             # http://localhost:5173
```

| Comando           | Qué hace                              |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Servidor de desarrollo                |
| `npm run build`   | Revisa tipos (`tsc`) y genera `dist/` |
| `npm run preview` | Sirve el build de producción          |
| `npm test`        | Pruebas con Vitest + Testing Library  |
| `npm run lint`    | ESLint                                |
| `npm run format`  | Prettier                              |

## Pantallas

| Ruta         | Pantalla                                                                | Acceso    |
| ------------ | ----------------------------------------------------------------------- | --------- |
| `/`          | Inicio (landing)                                                        | Pública   |
| `/login`     | Iniciar sesión                                                          | Pública   |
| `/recuperar` | Recuperar contraseña (confirmación simulada)                            | Pública   |
| `/registro`  | Registro de donantes — "Próximamente"                                   | Pública   |
| `/cuenta`    | Mi cuenta: nombre, correo, roles, institución, vencimiento de la sesión | Protegida |
| `/perfil`    | Mi perfil de donante: puntos, tipo de sangre, donaciones, medallas      | Protegida |

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
  config/env.ts              API_BASE_URL y USE_MOCK
  api/
    httpClient.ts            Axios: timeout 10 s, Bearer, 401 → cierra sesión y va a Login
    errors.ts                ApiError y el mapa único code → mensaje en español
  features/auth/
    types.ts, schemas.ts     Contrato y validación (Zod)
    authService.ts           Interfaz { login, logout, forgotPassword }
    authService.http.ts      Backend real
    authService.mock.ts      Backend simulado (usuarios, bloqueo, usuario inactivo)
    index.ts                 Elige mock o http según USE_MOCK
    AuthContext.tsx          useAuth(): user, token, isAuthenticated, login, logout
    sessionStore.ts          Sesión en localStorage (clave ribas_session)
    session.ts, roles.ts     Utilidades de sesión y etiquetas de rol
  features/profile/          Perfil de donante, medallas y niveles
  components/ui/             shadcn/ui: Button, Input, Label, Card, Badge, Alert
  components/                Layout, ProtectedRoute, AuthCard, PasswordInput
  pages/                     Una pantalla por archivo
  test/                      Pruebas
```

Los colores de marca están en `tailwind.config.js` como tokens `primary` (los mismos que usa
`frontend-mobile`).

## Sesión y privacidad

- La sesión se guarda en `localStorage` con la clave `ribas_session`
  (`{ token, expiresAt, user }`).
- Al abrir la app se restaura; si `expiresAt` ya pasó, se elimina. También se cierra sola en
  el momento en que vence.
- Nunca se escribe el token ni la contraseña en consola (Ley 1581 de 2012). ESLint lo refuerza
  con la regla `no-console`.

## Cómo conectar con el backend

1. En `.env`:

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

**CORS** — permitir el origen del frontend (`http://localhost:5173` en desarrollo), los métodos
`GET, POST, PUT, PATCH, OPTIONS` y las cabeceras `Authorization` y `Content-Type`.

**Peticiones protegidas** — llevan `Authorization: Bearer {token}`. Si el backend responde
`401`, el frontend cierra la sesión y manda a Login.

**Pendiente de definir con backend** (el DD todavía no trae estos contratos; el frontend usa
estas rutas propuestas):

- `POST /api/v1/auth/forgot-password` con `{ "email": "..." }` → `2xx` sin revelar si el correo existe.
- `GET /api/v1/donors/{userId}` → `{ "bloodType", "city", "donations", "points" }`. Los campos
  que falten se muestran como "Sin registrar".
- El login no devuelve el nombre ni la institución: el nombre se deriva del correo y la
  institución se muestra como "Sin registrar" junto a su `institutionId`.
