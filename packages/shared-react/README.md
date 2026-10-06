# @ribas/shared-react

Hooks de React que son idénticos en `frontend-web` y `frontend-mobile`. Solo depende de `react`
(como `peerDependency`) y de `@ribas/shared`: nada de DOM, React Native ni navegación. Se consume
como fuente, sin paso de build.

| Export                           | Qué hace                                                      |
| -------------------------------- | ------------------------------------------------------------- |
| `createSessionContext<T>()`      | Crea el contexto de sesión y su hook `useSession`             |
| `useSessionCountdown(expiresAt)` | Fecha de vencimiento y tiempo restante, actualizado cada 30 s |
| `useBadges(profile)`             | Medallas desbloqueadas y la seleccionada en la galería        |

Cada app llama a `createSessionContext` en `features/auth/context.ts` con su propio tipo de
valor y lo provee con su `AuthProvider`.

Lo que **no** va aquí: hooks que usen React Hook Form de forma distinta en cada plataforma
(`useLogin`, `useForgotPassword`), la navegación o el almacenamiento de la sesión.

Desde la raíz: `npm test -w @ribas/shared-react`, `npm run lint -w @ribas/shared-react`.
