# ADR-014: Arquitectura del frontend por features con hooks, servicios y Context solo para la sesión

| Campo         | Valor                             |
| ------------- | --------------------------------- |
| Estado        | Propuesta                         |
| Fecha         | 2026-10-06                        |
| Participantes | Equipo de arquitectura de Vitalis |

## Contexto

El frontend va a crecer con los módulos del prototipo que faltan por migrar (campañas,
gamificación, paneles, auditoría). Varias personas trabajarán en paralelo y hace falta una
estructura que diga dónde va cada cosa y evite que la lógica termine dentro de las pantallas.

## Decisión

Organizar el código **por módulo de negocio** en `src/features/<modulo>/` con `components/`,
`hooks/`, `services/` y un `index.ts` que es su única puerta de entrada. La lógica vive en
**hooks**, el acceso a datos en **servicios** y las páginas solo arman la interfaz. El único
estado global es la **sesión**, con Context (`AuthProvider` + `useSession`).

## Opciones consideradas

| Opción                                            | Ventajas                                                                                  | Desventajas                                                                         |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Por features + hooks + Context para la sesión** | Cada módulo es autocontenido; se puede trabajar en paralelo sin tocar los mismos archivos | Hay que decidir qué es compartido y qué pertenece a una feature                     |
| Por tipo de archivo (`components/`, `hooks/`, …)  | Es lo que generan muchos tutoriales; fácil al principio                                   | Un cambio en un módulo toca cuatro carpetas; con muchos módulos todo queda mezclado |
| Redux Toolkit para todo el estado                 | Estado predecible, herramientas de depuración                                             | Mucho código repetitivo para un estado global que hoy es solo la sesión             |
| Zustand                                           | Más liviano que Redux                                                                     | Otra dependencia para resolver algo que Context ya cubre                            |

## Justificación

El estado compartido real es pequeño: quién inició sesión y hasta cuándo. Context lo cubre sin
librerías adicionales. Agrupar por feature coincide con cómo se reparte el trabajo (una historia
de usuario suele tocar un módulo) y con los módulos del backend.

## Consecuencias

**Positivas**

- Agregar un módulo es repetir una receta
  ([`ARQUITECTURA-FRONTEND.md`, sección 5](../ARQUITECTURA-FRONTEND.md)).
- ESLint hace cumplir las fronteras: una feature solo se importa por su `index.ts`.
- Los hooks se prueban sin montar pantallas completas.

**Negativas / riesgos asumidos**

- Si aparece estado global complejo (carrito de turnos, notificaciones en tiempo real), Context
  puede quedarse corto. En ese caso se abre un ADR nuevo para evaluar una librería de estado o de
  caché de datos.
- No hay caché de peticiones: cada pantalla vuelve a pedir sus datos.

**Impacto en el equipo**

- Todo código nuevo se ubica en una feature existente o crea una nueva; no se agregan carpetas
  por tipo de archivo en `src/`.
- Las revisiones de código verifican que las páginas no tengan lógica ni llamadas HTTP.
