# ADR-015: Convención de nombres del frontend — PascalCase para componentes

| Campo         | Valor                             |
| ------------- | --------------------------------- |
| Estado        | Propuesta                         |
| Fecha         | 2026-10-06                        |
| Participantes | Equipo de arquitectura de Vitalis |

## Contexto

El Tech Radar V2 (sección 8.2, lineamientos de nomenclatura) pide **kebab-case** para los
archivos de componentes de la interfaz, con el ejemplo `donor-list.component.ts`. Esa regla viene
de la convención de Angular. El equipo decidió después usar React, cuya convención es distinta, y
el código actual del frontend usa PascalCase.

## Decisión

En el frontend (web y móvil) los archivos se nombran según la convención de React:

| Tipo de archivo              | Convención                | Ejemplo                       |
| ---------------------------- | ------------------------- | ----------------------------- |
| Componentes                  | `PascalCase.tsx`          | `LoginForm.tsx`               |
| Hooks                        | `useX.ts` (camelCase)     | `useLogin.ts`                 |
| Servicios                    | `xService.ts` (camelCase) | `authService.ts`              |
| Utilidades, tipos y esquemas | camelCase                 | `sessionStore.ts`, `types.ts` |
| Rutas de Expo Router         | minúsculas (son la URL)   | `recuperar.tsx`               |

Este ADR **reemplaza, solo para el frontend en React**, la regla de kebab-case del Tech Radar. El
resto de lineamientos se mantiene: camelCase para variables y funciones, identificadores en
inglés y ramas `feature/HU-nnn-descripcion`.

## Opciones consideradas

| Opción                                                            | Ventajas                                                                                     | Desventajas                                                                             |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **PascalCase (convención de React)**                              | El archivo se llama igual que el componente que exporta; es la convención de React y de Expo | Se aparta del texto actual del Tech Radar                                               |
| kebab-case como dice el Tech Radar                                | Cumple el documento tal cual                                                                 | Va contra la costumbre de React; el sufijo `.component.ts` no existe en este ecosistema |
| kebab-case solo en `components/ui` (como genera el CLI de shadcn) | Coincide con lo que produce `npx shadcn add`                                                 | Dos convenciones en el mismo proyecto: más difícil de recordar y de revisar             |

## Justificación

La regla del Tech Radar se escribió pensando en Angular y quedó desactualizada cuando el equipo
eligió React. Forzar kebab-case haría el proyecto extraño para cualquiera que conozca React y
obligaría a renombrar los componentes que se agreguen con herramientas del ecosistema. Una sola
convención es más fácil de cumplir que una mixta.

## Consecuencias

**Positivas**

- Nombre de archivo = nombre del componente: se encuentra con una sola búsqueda.
- El proyecto se ve como cualquier proyecto de React.

**Negativas / riesgos asumidos**

- Hasta que este ADR se acepte, el frontend incumple formalmente la sección 8.2 del Tech Radar.
- Los componentes agregados con `npx shadcn add` llegan en minúsculas y hay que renombrarlos.
- En Windows y macOS un cambio solo de mayúsculas debe hacerse con `git mv`.

**Impacto en el equipo**

- El equipo de arquitectura debe aprobar el cambio y actualizar la sección 8.2 del Tech Radar
  para que distinga el frontend en React.
- Los revisores de PR aplican esta tabla.
