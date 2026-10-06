# Architecture Decision Records (ADR) del frontend

Cada decisión de arquitectura con trade-offs se registra en un ADR **antes de implementarse**
(política de documentación del Tech Radar V2). Los ADR-001 a ADR-010 son del equipo de
arquitectura y viven fuera de este repositorio, junto al SAD; aquí están los que nacieron con el
frontend.

| ADR                                                  | Decisión                                                                  | Estado    |
| ---------------------------------------------------- | ------------------------------------------------------------------------- | --------- |
| [ADR-011](ADR-011-app-movil-react-native-expo.md)    | App móvil con React Native + Expo                                         | Propuesta |
| [ADR-012](ADR-012-monorepo-npm-workspaces.md)        | Monorepo con npm workspaces y paquete `@ribas/shared`                     | Propuesta |
| [ADR-013](ADR-013-estrategia-mock-http.md)           | Estrategia mock/http con factory para no depender del backend             | Propuesta |
| [ADR-014](ADR-014-arquitectura-por-features.md)      | Arquitectura por features con hooks, servicios y Context solo para sesión | Propuesta |
| [ADR-015](ADR-015-convencion-de-nombres-frontend.md) | PascalCase para componentes (reemplaza kebab-case en el frontend)         | Propuesta |

Todos están en estado **Propuesta**: los redactó el equipo de frontend y falta que el equipo de
arquitectura los revise y los pase a "Aceptada".

## Cómo agregar un ADR

1. Copia el último ADR y usa el siguiente número: `ADR-0NN-titulo-corto.md`.
2. Mantén las secciones de la plantilla: tabla de estado, Contexto, Decisión, Opciones
   consideradas (al menos 3), Justificación y Consecuencias.
3. Agrégalo a la tabla de arriba y abre el PR **antes** de implementar la decisión.
