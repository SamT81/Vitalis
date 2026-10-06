# Vitalis · RIBAS

Plataforma de la **Red Interinstitucional de Bancos de Sangre (RIBAS)**: conecta a los donantes
con los bancos de sangre y a los bancos entre sí. Este repositorio contiene el frontend web, la
app móvil y el código que comparten.

## Estructura del repositorio

```
Vitalis/
├── frontend-web/        React + Vite + TypeScript + Tailwind + shadcn/ui
├── frontend-mobile/     Expo + Expo Router + NativeWind
├── packages/shared/     Código común (@ribas/shared): tipos, esquemas, servicios, constantes
├── packages/shared-react/  Hooks de React comunes (@ribas/shared-react)
├── legacy-html/         Prototipo HTML original (solo referencia)
├── docs/                Arquitectura, convenciones e informes
├── .github/             CI, Dependabot, plantilla de PR y CODEOWNERS  Integración continua
├── docker-compose.yml   Web de producción en local con Docker
├── package.json         npm workspaces y comandos de la raíz
└── CLAUDE.md            Reglas del proyecto para trabajar con asistentes de IA
```

El framework, la estructura de carpetas y los patrones están definidos en
[`docs/ARQUITECTURA-FRONTEND.md`](docs/ARQUITECTURA-FRONTEND.md). Todo código nuevo sigue ese
documento.

## Requisitos

- Node.js 22.12 o superior (la versión recomendada está en `.nvmrc`: `nvm use`).
- npm 10 o superior.
- Para la app móvil: **Expo Go** en el celular, en la misma red Wi-Fi que el computador.

## Instalación

Las dependencias de las tres partes se instalan una sola vez, desde la raíz:

```bash
git clone https://github.com/SamT81/Vitalis.git
cd Vitalis
npm install
```

## Cómo correr

```bash
npm run web      # web en http://localhost:5173
npm run mobile   # Expo: escanea el código QR con Expo Go
```

Sin configurar nada, ambas apps funcionan en **modo simulado** (sin backend).

| Comando                | Qué hace                                            |
| ---------------------- | --------------------------------------------------- |
| `npm run lint`         | ESLint en web, móvil y los paquetes                 |
| `npm run format:check` | Prettier (`npm run format` corrige)                 |
| `npm run typecheck`    | Revisión de tipos en todas las partes               |
| `npm test`             | Pruebas: Vitest (web y paquetes) y Jest (móvil)     |
| `npm run build:web`    | Build de producción de la web                       |
| `npm run test:e2e`     | Pruebas E2E con Playwright (flujo de autenticación) |
| `npm run lint:api`     | Valida el contrato OpenAPI                          |
| `npm run test:html`    | Pruebas del prototipo en `legacy-html/`             |

## Con Docker

```bash
docker compose up --build   # http://localhost:5173 (nginx sirviendo el build de producción)
```

Por defecto usa el modo simulado. Para construir la imagen de QA contra el backend, las
variables se pasan al construir (quedan dentro del bundle):

```bash
docker build -f frontend-web/Dockerfile -t vitalis-web:qa \
  --build-arg VITE_USE_MOCK=false \
  --build-arg VITE_API_BASE_URL=https://<url-de-kong> .
```

El contexto de build es la raíz del repositorio. Más detalle en
[`frontend-web/README.md`](frontend-web/README.md#docker).

## Pantallas disponibles

Inicio, Iniciar sesión, Recuperar contraseña, Mi cuenta y Mi perfil de donante, en web y en
móvil. "Registrarme como donante" lleva a una pantalla "Próximamente". Mi cuenta y Mi perfil
exigen sesión: sin ella siempre redirigen a Iniciar sesión.

## Usuarios de prueba (modo simulado)

Contraseña de todos: `Ribas2026!`

| Correo                     | Rol                           | Notas                                        |
| -------------------------- | ----------------------------- | -------------------------------------------- |
| `donante@gmail.com`        | `donante`                     | Única cuenta con datos de perfil de donante  |
| `personal@bancobogota.co`  | `personal_banco_sangre`       |                                              |
| `logistica@bancobogota.co` | `personal_logistica`          |                                              |
| `admin@bancobogota.co`     | `administrador_institucional` |                                              |
| `admin.nacional@ribas.co`  | `administrador_nacional`      |                                              |
| `auditor@invima.gov.co`    | `auditor_invima`              |                                              |
| `superadmin@vitalis.co`    | `superusuario`                |                                              |
| `inactivo@bancobogota.co`  | —                             | Cuenta deshabilitada → error `USER_DISABLED` |

Cinco intentos fallidos en un minuto bloquean la cuenta dos minutos.

## Cómo conectar con el backend

No hay que cambiar código: solo el archivo `.env` de cada app (copia su `.env.example`).

| App   | Archivo                | Variables                                                               |
| ----- | ---------------------- | ----------------------------------------------------------------------- |
| Web   | `frontend-web/.env`    | `VITE_API_BASE_URL=<URL de Kong>` · `VITE_USE_MOCK=false`               |
| Móvil | `frontend-mobile/.env` | `EXPO_PUBLIC_API_BASE_URL=<URL de Kong>` · `EXPO_PUBLIC_USE_MOCK=false` |

El backend debe:

- Exponer `POST /api/v1/auth/login` con el contrato del DD: recibe `{ email, password }` y
  responde `{ valid, userId, institutionId, roles[], token, expiresAt }`.
- Responder los errores como `{ code, message, timestamp }`: `INVALID_CREDENTIALS` (401),
  `ACCOUNT_LOCKED` (429) y `USER_DISABLED` (403).
- Aceptar `Authorization: Bearer <token>` y responder 401 cuando el token venza.
- Permitir en CORS el origen de la web (`http://localhost:5173` en desarrollo) con las cabeceras
  `Authorization` y `Content-Type`.

En un celular la URL no puede ser `localhost`: usa la IP del computador en la red local. El
detalle está en el README de cada app.

## Más documentación

- [`docs/ARQUITECTURA-FRONTEND.md`](docs/ARQUITECTURA-FRONTEND.md) — stack, estructura, patrones
  y cómo agregar un módulo.
- [`docs/adr/`](docs/adr/README.md) — decisiones de arquitectura del frontend (ADR-011 a
  ADR-015).
- [`docs/api/frontend-contract.openapi.yaml`](docs/api/frontend-contract.openapi.yaml) —
  contrato OpenAPI que consume el frontend.
- [`docs/DECISIONES-Y-PENDIENTES.md`](docs/DECISIONES-Y-PENDIENTES.md) — decisiones
  justificadas, contratos pendientes con el backend y pendientes del grupo.
- [`docs/REVISION-FRONT.md`](docs/REVISION-FRONT.md) — informes de revisión y auditoría.
- [`CLAUDE.md`](CLAUDE.md) — reglas del proyecto.
- [`frontend-web/README.md`](frontend-web/README.md) ·
  [`frontend-mobile/README.md`](frontend-mobile/README.md) ·
  [`packages/shared/README.md`](packages/shared/README.md) ·
  [`packages/shared-react/README.md`](packages/shared-react/README.md)
- [`frontend-mobile/PRUEBA-EN-CELULAR.md`](frontend-mobile/PRUEBA-EN-CELULAR.md) — checklist
  para probar la app en un celular con Expo Go.
- [`legacy-html/README.md`](legacy-html/README.md) — prototipo original y pantallas pendientes
  de migrar.
