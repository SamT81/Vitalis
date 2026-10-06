# Reglas del proyecto — Vitalis · RIBAS (frontend)

Este repositorio ya tiene framework, estructura y convenciones definidos. **Todo trabajo parte de
esa estructura: no se crean proyectos, carpetas raíz ni arquitecturas nuevas.** Antes de escribir
código, lee [`docs/ARQUITECTURA-FRONTEND.md`](docs/ARQUITECTURA-FRONTEND.md).

## Stack (fijo)

- **Web** (`frontend-web`): React + Vite + TypeScript, Tailwind CSS 3, shadcn/ui, React Router,
  React Hook Form + Zod, Axios, Vitest + Testing Library.
- **Móvil** (`frontend-mobile`): Expo + Expo Router + TypeScript, NativeWind, React Hook Form +
  Zod, `expo-secure-store`, Jest (`jest-expo`).
- **Común** (`packages/shared`, se importa como `@ribas/shared`): TypeScript puro, sin React.

No se agregan frameworks ni librerías de interfaz (Bootstrap, Material UI, Ant Design, otro
gestor de estado, etc.) sin un ADR aprobado por el grupo. Tailwind se queda en la versión 3
(NativeWind 4 la exige) y React debe ser la misma versión en web y móvil.

## Dónde va cada cosa

| Qué                                                     | Dónde                                                    |
| ------------------------------------------------------- | -------------------------------------------------------- |
| Tipos del contrato, esquemas Zod, constantes, servicios | `packages/shared/src/<modulo>/` + `src/index.ts`         |
| Un módulo de negocio (componentes, hooks, servicio)     | `src/features/<modulo>/` en cada app                     |
| Pantallas                                               | web: `src/pages/` + ruta en `App.tsx`; móvil: `src/app/` |
| Componentes genéricos de interfaz                       | `src/components/ui/`                                     |
| Cabecera, pie y contenedores                            | `src/components/layout/`                                 |
| Variables de entorno                                    | `src/config/env.ts` y `.env.example`                     |
| Pruebas                                                 | `src/__tests__/*.spec.ts[x]` de cada parte               |
| Documentación e informes                                | `docs/`                                                  |

**Todo módulo nuevo va en `features/<modulo>` siguiendo `docs/ARQUITECTURA-FRONTEND.md`**
(sección "Cómo agregar un módulo nuevo").

## Comandos (desde la raíz)

```bash
npm install            # instala las tres partes (npm workspaces)
npm run web            # web en http://localhost:5173
npm run mobile         # Expo; escanear el QR con Expo Go
npm run lint           # ESLint en web, móvil y shared
npm run format:check   # Prettier (npm run format para corregir)
npm run typecheck      # tsc --noEmit en las tres partes
npm test               # Vitest (web y shared) y Jest (móvil)
npm run build:web      # build de producción de la web
npm run test:html      # pruebas del prototipo en legacy-html/
```

Antes de dar una tarea por terminada deben pasar `lint`, `format:check`, `typecheck` y `test`.

## Reglas de código

- TypeScript estricto. Sin `any`, sin `@ts-ignore` y sin `eslint-disable`.
- Sin `console.*`: nunca se imprime el token ni la contraseña (Ley 1581 de 2012).
- Identificadores y nombres de archivo en inglés; **textos de la interfaz en español**.
- Componentes en `PascalCase.tsx`, hooks en `useX.ts`, servicios en `xService.ts`.
- Una feature se importa solo por su `index.ts`; dentro de una app se usa el alias `@/`.
- Los componentes no usan Axios: llaman a hooks, y los hooks a los servicios.
- `components/ui` no conoce la sesión ni la API.
- Sin strings repetidos: rutas, roles, claves de almacenamiento y mensajes de error salen de
  `@ribas/shared` (`ROUTES`, `ROLES`, `STORAGE_KEYS`, `ERROR_MESSAGES`).
- Un dato ausente se muestra como "Sin registrar" (`orNotRegistered`), nunca `null`.
- Las rutas protegidas siempre exigen sesión. No se agrega ningún "modo dev" que inicie sesión
  solo.
- Lo que es igual en web y móvil y no depende de React va en `packages/shared`.

## Lo que no se toca

- **El contrato del backend definido en el DD**: `POST /api/v1/auth/login`, la forma de su
  respuesta y los códigos `INVALID_CREDENTIALS` (401), `ACCOUNT_LOCKED` (429) y `USER_DISABLED`
  (403).
- **`legacy-html/`**: es el prototipo original, solo de referencia. Se consulta para migrar una
  pantalla a React; no se le agregan funciones.
- Las ramas `main` y `develop` no reciben commits directos: se trabaja en `feature/*` y se
  integra por pull request aprobado por un compañero distinto del autor.

## Commits

Conventional Commits, pequeños y por tipo de cambio: `feat(web): ...`, `fix(mobile): ...`,
`refactor(auth): ...`, `test(shared): ...`, `docs: ...`, `chore: ...`, `ci: ...`.
