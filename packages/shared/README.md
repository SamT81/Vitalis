# @ribas/shared

Código común de `frontend-web` y `frontend-mobile`. Es TypeScript puro (sin React ni APIs de
plataforma) y se consume como fuente: no tiene paso de build.

```ts
import { ROUTES, loginSchema, messageFor, createAuthService } from '@ribas/shared';
```

```
src/
  index.ts          API pública del paquete
  constants/        ROUTES + API_ENDPOINTS, ROLES, STORAGE_KEYS, ERROR_CODES + ERROR_MESSAGES
  api/              ApiError + messageFor, createHttpClient (Axios: timeout, Bearer, 401)
  auth/             tipos del contrato, esquemas Zod, sesión, AuthService (http y mock) y su factory
  profile/          DonorProfile (Zod), medallas y niveles, ProfileService (http y mock) y su factory
  content/home.ts   Textos de la pantalla de inicio
  lib/              format ("Sin registrar", fechas, iniciales), mock (retardo simulado)
```

- **Service + Strategy:** `createAuthService({ useMock, http })` y
  `createProfileService({ useMock, http })` devuelven la implementación simulada o la real.
- Cada app aporta lo que depende de la plataforma: variables de entorno, almacenamiento de la
  sesión y navegación.
- Revisión de tipos: `npm run typecheck -w @ribas/shared` (desde la raíz).
