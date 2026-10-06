# @ribas/shared

Código común de `frontend-web` y `frontend-mobile`. Es TypeScript puro (sin React ni APIs de
plataforma) y se consume como fuente: no tiene paso de build.

```ts
import { ROUTES, loginSchema, messageFor, createAuthService } from '@ribas/shared';
```

```
src/
  index.ts          API pública del paquete
  constants/        ROUTES + LOGIN_REASONS + API_ENDPOINTS, ROLES, STORAGE_KEYS,
                    ERROR_CODES + ERROR_MESSAGES
  api/              ApiError + messageFor, createHttpClient (Axios: timeout, Bearer, 401)
  auth/             tipos del contrato, esquemas Zod, sesión, AuthService (http y mock) y su factory
  profile/          DonorProfile (Zod), medallas y niveles, ProfileService (http y mock) y su factory
  content/home.ts   Textos de la pantalla de inicio
  lib/              format ("Sin registrar", fechas, iniciales), mock (retardo simulado)
  __tests__/        Pruebas unitarias (Vitest)
```

- **Service + Strategy:** `createAuthService({ useMock, http })` y
  `createProfileService({ useMock, http })` devuelven la implementación simulada o la real.
- Cada app aporta lo que depende de la plataforma: variables de entorno, almacenamiento de la
  sesión y navegación.
- Desde la raíz: `npm test -w @ribas/shared`, `npm run lint -w @ribas/shared` y
  `npm run typecheck -w @ribas/shared`.
- ESLint impide importar React o Expo aquí: lo que dependa de la plataforma va en cada app.
