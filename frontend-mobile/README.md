# Vitalis · RIBAS — App móvil

App móvil de la Red Interinstitucional de Bancos de Sangre (RIBAS) hecha con **Expo (React
Native) + Expo Router + TypeScript + NativeWind**. Tiene las mismas pantallas, textos y colores
que `frontend-web`.

Funciona sin backend (datos simulados) y se conecta al backend real cambiando solo variables
de entorno.

## Requisitos

- Node.js 20 o superior y npm.
- En el celular: la app **Expo Go** (Android o iOS), en la misma red Wi-Fi que el computador.

## Instalar

```bash
cd frontend-mobile
npm install
cp .env.example .env    # en Windows (PowerShell): Copy-Item .env.example .env
```

## Correr

```bash
npx expo start
```

Escanea el código QR de la terminal: en Android con Expo Go, en iOS con la cámara. Si el
celular no logra conectarse por la red local, usa `npx expo start --tunnel`.

| Comando                          | Qué hace                         |
| -------------------------------- | -------------------------------- |
| `npx expo start`                 | Servidor de desarrollo (Expo Go) |
| `npx expo start --web`           | La misma app en el navegador     |
| `npx tsc --noEmit`               | Revisión de tipos                |
| `npm run lint`                   | ESLint                           |
| `npm run format`                 | Prettier                         |
| `npx expo export --platform web` | Build web estático en `dist/`    |

## Pantallas

| Ruta         | Archivo                          | Pantalla                                     | Acceso    |
| ------------ | -------------------------------- | -------------------------------------------- | --------- |
| `/`          | `src/app/index.tsx`              | Inicio                                       | Pública   |
| `/login`     | `src/app/login.tsx`              | Iniciar sesión                               | Pública   |
| `/recuperar` | `src/app/recuperar.tsx`          | Recuperar contraseña (confirmación simulada) | Pública   |
| `/registro`  | `src/app/registro.tsx`           | Registro de donantes — "Próximamente"        | Pública   |
| `/cuenta`    | `src/app/(protected)/cuenta.tsx` | Mi cuenta                                    | Protegida |
| `/perfil`    | `src/app/(protected)/perfil.tsx` | Mi perfil de donante                         | Protegida |

`src/app/(protected)/_layout.tsx` es el guardián: sin sesión vigente **siempre** redirige a
Login. No existe ningún "modo dev" ni inicio de sesión automático.

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
contador vive en memoria: se reinicia al recargar la app.

## Estructura

Es la misma de `frontend-web`; solo cambian `app/` (Expo Router) y el almacenamiento de la sesión.

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
    AuthContext.tsx          useAuth(): user, token, isAuthenticated, isLoading, login, logout
    sessionStore.ts          Sesión cifrada con expo-secure-store
    session.ts, roles.ts     Utilidades de sesión y etiquetas de rol
  features/profile/          Perfil de donante, medallas y niveles
  components/ui/             Button, Input, Label, Card, Badge, Alert, Text
  components/                Screen, AuthCard, PasswordInput, Brand
  app/                       Rutas (Expo Router)
```

Los colores de marca están en `tailwind.config.js` como tokens `primary` (los mismos de
`frontend-web`). La tipografía es Inter, cargada con `@expo-google-fonts/inter`.

## Sesión y privacidad

- La sesión (`{ token, expiresAt, user }`) se guarda cifrada con **expo-secure-store**
  (Keystore en Android, Keychain en iOS) bajo la clave `ribas_session`.
- Al abrir la app se restaura; si `expiresAt` ya pasó, se elimina. También se cierra cuando
  vence con la app abierta o al volver del segundo plano.
- Nunca se escribe el token ni la contraseña en consola (Ley 1581 de 2012). ESLint lo refuerza
  con la regla `no-console`.
- `expo-secure-store` no existe en navegador: el build web (`expo export --platform web`) usa
  `localStorage` solo como respaldo para poder verificar la app.

## Cómo conectar con el backend

1. En `.env`:

   ```env
   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:8000   # URL del API Gateway (Kong), sin barra final
   EXPO_PUBLIC_USE_MOCK=false
   ```

   En un celular **no sirve `localhost`** (apunta al propio celular): usa la IP del computador
   en la red local o una URL pública del gateway. En el emulador de Android, `http://10.0.2.2:8000`.

2. Reinicia con `npx expo start --clear`.

No hay que tocar código. El contrato es el mismo de la web:

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

- **Peticiones protegidas:** llevan `Authorization: Bearer {token}`. Ante un `401` la app cierra
  la sesión y vuelve a Login.
- **CORS:** las apps nativas no lo usan; solo aplica al build web.
- **HTTP sin TLS:** Expo Go lo permite en desarrollo. Para un build de producción el gateway
  debe exponerse por HTTPS (Android e iOS bloquean HTTP plano por defecto).
- **Pendiente de definir con backend** (rutas propuestas, las mismas de la web):
  `POST /api/v1/auth/forgot-password` y `GET /api/v1/donors/{userId}`.
