# Revisión del frontend — rama `front-react`

Fecha: 2026-10-05 · Respaldo previo: tag local `backup-antes-refactor` (commit `2f0e774`).

**Resultado:** las dos apps cumplen R1–R11, quedaron organizadas por feature con un paquete
compartido y todas las verificaciones pasan. Lo único que no se pudo probar es la app móvil en un
celular físico con Expo Go (se verificó con tipos, lint, bundle y su build web).

## 1. Checklist R1–R11

| #   | Requisito                | Web | Móvil | Qué se verificó o corrigió                                                                                                                                                                                         |
| --- | ------------------------ | :-: | :---: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | Hecho en React según ADR | ✅  |  ✅   | Web: React 19 + Vite + Tailwind 3 + shadcn/ui. Móvil: Expo SDK 57 + NativeWind. Sin Bootstrap, Material UI ni Ant Design; el único CSS son las directivas de Tailwind.                                             |
| R2  | Existe en web y móvil    | ✅  |  ✅   | Web: `npm run build`. Móvil: `npx tsc --noEmit` y `npx expo export --platform web`. También desde un clon limpio con `npm ci`.                                                                                     |
| R3  | Pantalla de inicio       | ✅  |  ✅   | Botones "Iniciar sesión" y "Registrarme como donante" (este lleva a "Próximamente").                                                                                                                               |
| R4  | Login completo           | ✅  |  ✅   | Zod (correo válido, mínimo 8), mostrar/ocultar, estado de carga, errores en español, "¿Olvidaste tu contraseña?". **Corregido:** en Edge aparecían dos iconos de ojo (el nativo y el propio); se ocultó el nativo. |
| R5  | Autenticación            | ✅  |  ✅   | Web `localStorage` `ribas_session`; móvil `expo-secure-store`. Se restaura al abrir, se descarta si venció y se cierra sola al vencer. "Cerrar sesión" probado.                                                    |
| R6  | Perfil / Mi cuenta       | ✅  |  ✅   | Nombre, correo, rol(es), institución y vencimiento. Datos ausentes → "Sin registrar". El recorrido comprueba que no aparezca `null`, `undefined` ni `NaN` en pantalla.                                             |
| R7  | Rutas protegidas         | ✅  |  ✅   | `/cuenta` y `/perfil` sin sesión redirigen a Login. No hay modo dev ni auto-login (hay una prueba que lo afirma).                                                                                                  |
| R8  | Listo para el back       | ✅  |  ✅   | Solo `.env`: `USE_MOCK=false` + URL de Kong. Bearer automático y 401 → cierre de sesión, cubiertos por pruebas del cliente HTTP.                                                                                   |
| R9  | Contrato del DD intacto  | ✅  |  ✅   | Request/response de login sin cambios; `INVALID_CREDENTIALS` 401, `ACCOUNT_LOCKED` 429, `USER_DISABLED` 403, red y genérico.                                                                                       |
| R10 | Seguridad                | ✅  |  ✅   | Bloqueo tras 5 fallos en 1 minuto (probado). Ningún `console.*` en el código; ESLint `no-console` en ambas apps.                                                                                                   |
| R11 | Diseño                   | ✅  |  ✅   | Paleta y logo de Vitalis, tokens `primary` idénticos. Sin scroll horizontal a 360 px y 1280 px (medido en navegador). Labels, foco visible y textos con contraste AA.                                              |

No se encontró ningún requisito incumplido; la única corrección funcional fue la de R4.

## 2. Archivos borrados

**Sin uso (confirmado con `knip`, `depcheck` y búsqueda):**

- `frontend-web/src/assets/image-Photoroom.png`
- `frontend-mobile/assets/image-Photoroom.png`
- `frontend-mobile/assets/favicon.svg`
- Dependencia `axios` de `frontend-mobile` (ahora solo la usa `@ribas/shared`); en web pasó a
  `devDependencies` porque solo la usan las pruebas.
- Exports sin uso: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`,
  `buttonVariants`, `badgeVariants` y `MOCK_DELAY_MS` de `env`.

**Duplicados que pasaron a `packages/shared`** (existían iguales en las dos apps):

- `src/api/errors.ts`
- `src/features/auth/`: `authService.ts`, `authService.http.ts`, `authService.mock.ts`,
  `roles.ts`, `session.ts`, y los `types.ts` / `schemas.ts` originales
- `src/features/profile/`: `badges.ts`, `profileService.ts`, y el `types.ts` original
- `src/lib/format.ts`

**Reemplazados por la instalación única desde la raíz:**

- `frontend-web/package-lock.json` y `frontend-mobile/package-lock.json` (ahora hay un solo
  `package-lock.json` en la raíz).

Además se movieron o renombraron 30 archivos (ver sección 4).

`depcheck` marca como "sin uso" `tailwindcss`, `postcss`, `autoprefixer`,
`prettier-plugin-tailwindcss` y `react-native-worklets`. Son falsos positivos: los cargan los
archivos de configuración (y `react-native-worklets` lo exige Reanimated 4), así que se quedan.

## 3. Sitio HTML viejo: qué sobraría (no se borró ni se modificó nada)

Ningún archivo del sitio está huérfano: todos los `css/`, `js/` y `assets/` siguen referenciados
por alguna página. Lo que el grupo puede decidir retirar es lo que ya tiene reemplazo en React:

| Archivos                                                                       | Reemplazo                                                                     |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `login.html`, `recuperar.html`, `cuenta.html`, `css/auth.css`, `js/auth-ui.js` | Login, Recuperar y Mi cuenta en ambas apps                                    |
| `index.html`, `css/home.css`                                                   | Inicio (sin el semáforo de la red)                                            |
| `perfil.html`, `css/perfil.css`                                                | Mi perfil (sin campañas suscritas ni historial)                               |
| `js/env.js`, `js/http-client.js`, `js/auth-service.js`, `tests/auth.test.mjs`  | `config/env.ts`, `api/httpClient.ts`, `@ribas/shared` y las pruebas de Vitest |
| `js/auth-guard.js` (contiene el `DEV_MODE` que inicia sesión solo)             | `ProtectedRoute` / `(protected)/_layout.tsx`                                  |

Siguen siendo la única versión de su pantalla y **no sobran todavía**: `registro.html`,
`campanas.html`, `gamificacion.html`, `informacion.html`, `operativo.html`,
`panel-institucional.html`, `admin-*.html`, `auditoria.html` con sus `css/` y `js/`, además de
`css/global.css`, `js/main.js`, `js/auth.js`, `js/api-service.js` y `assets/`.

## 4. Árbol nuevo

```
package.json               workspaces: packages/*, frontend-web, frontend-mobile
package-lock.json          único lockfile
.gitignore
REVISION-FRONT.md

packages/shared/src/
  index.ts                 API pública (@ribas/shared)
  constants/               routes.ts (ROUTES, API_ENDPOINTS) · roles.ts (ROLES)
                           storageKeys.ts (STORAGE_KEYS) · errorMessages.ts (ERROR_CODES, ERROR_MESSAGES)
  api/                     ApiError.ts · createHttpClient.ts
  auth/                    types.ts · schemas.ts · session.ts
                           authService.http.ts · authService.mock.ts · createAuthService.ts
  profile/                 types.ts · schemas.ts · badges.ts
                           profileService.http.ts · profileService.mock.ts · createProfileService.ts
  content/home.ts
  lib/                     format.ts · mock.ts

frontend-web/src/
  main.tsx · App.tsx · index.css
  config/env.ts
  api/httpClient.ts
  lib/                     sessionStore.ts · utils.ts
  components/ui/           Button · Input · Label · Card · Badge · Alert · PasswordInput · FieldError
  components/layout/       AppLayout · SiteHeader · SiteFooter · Brand · AuthCard
  features/auth/
    components/            AuthProvider · LoginForm · ForgotPasswordForm · AccountCard · ProtectedRoute
    hooks/                 useSession · useLogin · useForgotPassword · useLogout · useSessionCountdown
    services/authService.ts
    context.ts · types.ts · schemas.ts · index.ts
  features/profile/
    components/            DonorProfile · DonorIdentityCard · ProfileSummary · BadgeGallery
    hooks/                 useProfile · useBadges
    services/profileService.ts
    types.ts · index.ts
  pages/                   HomePage · LoginPage · ForgotPasswordPage · ComingSoonPage · AccountPage · ProfilePage
  __tests__/               setup.ts · auth.spec.tsx · httpClient.spec.ts

frontend-mobile/src/
  app/                     _layout · index · login · recuperar · registro
    (protected)/           _layout (guardián) · cuenta · perfil
  config/env.ts
  api/httpClient.ts
  lib/                     sessionStore.ts · theme.ts · utils.ts
  components/ui/           Text · Button · Input · Label · Card · Badge · Alert · PasswordInput · FieldError
  components/layout/       Screen · AuthCard · Brand
  features/auth/           components (AuthProvider · LoginForm · ForgotPasswordForm · AccountCard)
                           hooks (useSession · useLogin · useForgotPassword · useSessionCountdown)
                           services/authService.ts · context.ts · types.ts · schemas.ts · index.ts
  features/profile/        components (DonorProfile · DonorIdentityCard · ProfileSummary · BadgeGallery)
                           hooks (useProfile · useBadges) · services/profileService.ts · types.ts · index.ts
```

## 5. Patrones aplicados

1. **Feature-based:** `src/features/auth` y `src/features/profile` en ambas apps; fuera solo queda lo compartido (`components/ui`, `components/layout`, `lib`, `config`, `api/httpClient`).
2. **Barrel exports:** cada feature expone su `index.ts`; ESLint (`no-restricted-imports` sobre `@/features/*/*`) impide importar archivos internos.
3. **Service + Strategy:** interfaces `AuthService` / `ProfileService` con implementaciones `http` y `mock`; las factories `createAuthService` y `createProfileService` eligen según `USE_MOCK`. Ningún componente importa Axios.
4. **Custom hooks:** `useLogin`, `useForgotPassword`, `useProfile`, `useSession` (más `useLogout`, `useSessionCountdown`, `useBadges`). Las páginas solo arman la interfaz.
5. **Context + Provider:** un único contexto, el de sesión (`features/auth/context.ts` + `AuthProvider`).
6. **UI "tonta":** `components/ui` no importa nada de auth ni de la API.
7. **Constantes centralizadas:** `ROUTES`, `ROLES`, `STORAGE_KEYS` y `ERROR_MESSAGES`, un archivo cada una en `packages/shared/src/constants/`.
8. **Código compartido:** `packages/shared` (`@ribas/shared`) con npm workspaces. Metro lo resolvió al primer intento; no hubo que revertir.
9. **Alias `@/`** en ambas apps.
10. **Nombres:** `PascalCase.tsx` para componentes (se renombraron los de `components/ui`), `useX.ts` para hooks, `xService.ts` para servicios. Identificadores en inglés, textos de la interfaz en español.

## 6. Decisiones tomadas en autonomía

| Decisión                                                                                                | Por qué                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useAuth()` pasó a llamarse `useSession()`                                                              | Es el nombre que pide esta revisión; dejar los dos habría sido duplicar.                                                                                                                       |
| React de la web fijado en 19.2.3 (antes 19.3.0)                                                         | Con workspaces debe haber una sola copia de React y Expo SDK 57 exige 19.2.3. Sigue siendo React 18+.                                                                                          |
| La instalación ahora es `npm install` en la raíz                                                        | Consecuencia de los workspaces. Los README lo explican.                                                                                                                                        |
| `features/profile` no tiene `schemas.ts` propio                                                         | El esquema Zod del perfil vive en `@ribas/shared`; el archivo en cada app solo lo reexportaba y nada lo usaba.                                                                                 |
| Los hooks quedaron en cada app, no en `shared`                                                          | Dependen de React Hook Form, de la navegación y del servicio de cada app. `shared` se mantuvo sin React. `useSession`, `useProfile`, `useBadges` y `useSessionCountdown` son iguales en ambas. |
| `sessionStore` está en `src/lib`, no dentro de `features/auth`                                          | Lo usan `api/httpClient` y la feature; dentro de la feature habría creado una dependencia circular.                                                                                            |
| `AuthCard` está en `components/layout`                                                                  | Es una tarjeta de presentación que también usa la pantalla "Próximamente".                                                                                                                     |
| Comentarios en español, identificadores en inglés                                                       | Interpreté "código en inglés" como nombres de variables, funciones y archivos. Las rutas (`/cuenta`, `recuperar.tsx`) son URLs visibles y no cambiaron.                                        |
| Las pruebas se movieron a `src/__tests__/*.spec.ts[x]`                                                  | Con el nombre anterior, `node --test` en la raíz (pruebas del sitio HTML) intentaba ejecutarlas.                                                                                               |
| El texto de un beneficio de Inicio se unificó ("inscríbete al instante")                                | Web decía "en un clic" y móvil "en un toque"; ahora el texto es compartido.                                                                                                                    |
| Se añadió una nota al inicio del `README.md` raíz y se crearon `package.json` y `.gitignore` en la raíz | Necesarios para los workspaces. No se tocó ningún `.html`, `css/`, `js/`, `tests/` ni `assets/` del sitio viejo.                                                                               |
| Push de `front-react` a `origin`                                                                        | Pedido explícitamente en esta revisión (antes la instrucción era no hacer push).                                                                                                               |

## 7. Pruebas y verificación

| Verificación                              | Resultado                   |
| ----------------------------------------- | --------------------------- |
| Web · `npm run lint`                      | ✅ sin errores ni avisos    |
| Web · `npm test`                          | ✅ 25 pruebas en 2 archivos |
| Web · `npm run build`                     | ✅                          |
| Móvil · `npm run lint`                    | ✅ sin errores ni avisos    |
| Móvil · `npx tsc --noEmit`                | ✅                          |
| Móvil · `npx expo export --platform web`  | ✅                          |
| `@ribas/shared` · `tsc --noEmit`          | ✅                          |
| Sitio HTML · `npm run test:html`          | ✅ 13 pruebas (sin cambios) |
| Clon limpio + `npm ci` + todo lo anterior | ✅                          |

Las pruebas web cubren: validación del formulario, login exitoso, credenciales incorrectas,
bloqueo, usuario deshabilitado, redirección de ruta protegida, cierre de sesión, sesión vencida,
restauración de sesión, "Sin registrar", Bearer, 401 y normalización de errores.

**Recorrido en navegador** (web con `npm run dev`, a 360 px y 1280 px; servidor detenido al
terminar): inicio → login con contraseña errada (muestra "El correo o la contraseña son
incorrectos.") → login correcto → Mi cuenta → Mi perfil → recarga (la sesión se restaura) →
cerrar sesión → `/cuenta` y `/perfil` sin sesión llevan a Login. Sin scroll horizontal en ningún
paso. El mismo recorrido pasó sobre el build web de la app móvil a 360 px.

**No verificado:** la app móvil en un dispositivo real con Expo Go.

## 8. Mensaje para el grupo

> Ya está el front en React en la rama **`front-react`**.
>
> **Instalar (una vez, en la raíz):** `git checkout front-react && npm install`
> **Web:** `cd frontend-web && npm run dev` → http://localhost:5173
> **Móvil:** `cd frontend-mobile && npx expo start` y escanear el QR con Expo Go.
>
> **Usuarios de prueba** (contraseña `Ribas2026!`): `donante@gmail.com`,
> `personal@bancobogota.co`, `admin@bancobogota.co`, `auditor@invima.gov.co`,
> `superadmin@vitalis.co`. `inactivo@bancobogota.co` sirve para ver la cuenta deshabilitada.
>
> **Para conectar el back** no hay que tocar código, solo el `.env` de cada app
> (`USE_MOCK=false` y la URL de Kong). El back necesita: `POST /api/v1/auth/login` con el contrato
> del DD; errores como `{ code, message, timestamp }` (`INVALID_CREDENTIALS` 401,
> `ACCOUNT_LOCKED` 429, `USER_DISABLED` 403); CORS para `http://localhost:5173` con las cabeceras
> `Authorization` y `Content-Type`; y aceptar `Authorization: Bearer <token>`. Falta definir
> `POST /api/v1/auth/forgot-password` y `GET /api/v1/donors/{userId}`. Detalle en
> `REVISION-FRONT.md` y en el README de cada app.
