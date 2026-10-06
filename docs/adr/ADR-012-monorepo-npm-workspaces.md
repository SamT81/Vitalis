# ADR-012: Monorepo con npm workspaces y paquete `@ribas/shared`

| Campo         | Valor                             |
| ------------- | --------------------------------- |
| Estado        | Propuesta                         |
| Fecha         | 2026-10-06                        |
| Participantes | Equipo de arquitectura de Vitalis |

## Contexto

La web y la app móvil usan el mismo contrato de backend, las mismas validaciones, los mismos
mensajes de error y los mismos datos simulados. En la primera versión ese código estaba copiado
en las dos apps y ya había empezado a divergir (por ejemplo, un texto distinto en cada una).

## Decisión

Mantener un solo repositorio con **npm workspaces**: `frontend-web`, `frontend-mobile` y los
paquetes `packages/shared` (`@ribas/shared`, TypeScript sin React) y `packages/shared-react`
(`@ribas/shared-react`, hooks). Los paquetes se consumen como código fuente, sin paso de build.

## Opciones consideradas

| Opción                               | Ventajas                                                                                              | Desventajas                                                                                               |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Monorepo con npm workspaces**      | Sin herramientas nuevas (ya viene con npm); un `npm install`; un cambio de contrato en un solo commit | Hay que cuidar que exista una sola versión de React; la instalación siempre es desde la raíz              |
| Repositorios separados + paquete npm | Cada app evoluciona por su cuenta                                                                     | Publicar y versionar un paquete privado para un equipo pequeño; los cambios de contrato cruzan tres repos |
| Código duplicado en cada app         | Lo más simple de arrancar                                                                             | Las copias divergen; cada corrección se hace dos veces y es fácil olvidar una                             |
| Nx o Turborepo                       | Caché de tareas y grafo de dependencias                                                               | Otra herramienta que aprender y configurar; innecesaria con tres paquetes                                 |

## Justificación

npm workspaces resuelve el problema real (no duplicar el contrato) con cero herramientas
adicionales. Nx y Turborepo aportan velocidad que este proyecto todavía no necesita: todo el CI
tarda pocos minutos. Si el número de paquetes crece, se pueden adoptar encima sin rehacer la
estructura.

## Consecuencias

**Positivas**

- Tipos, esquemas Zod, constantes y servicios existen una sola vez.
- ESLint impide que `@ribas/shared` importe React o Expo, así que sigue sirviendo a las dos apps.
- Una sola configuración de Prettier y una base de ESLint en la raíz.

**Negativas / riesgos asumidos**

- `npm install` instala también las dependencias de Expo aunque solo se trabaje en la web.
- Metro y Jest deben resolver paquetes fuera de la carpeta de la app; funciona hoy, pero hay que
  verificarlo al subir de SDK.
- La imagen Docker de la web necesita la raíz del repositorio como contexto de build.

**Impacto en el equipo**

- Los comandos se corren desde la raíz (`npm run web`, `npm test`).
- Antes de escribir código hay que decidir dónde va: `shared`, `shared-react` o la app.
