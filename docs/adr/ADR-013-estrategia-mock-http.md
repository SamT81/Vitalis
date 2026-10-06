# ADR-013: Estrategia mock/http con factory para no depender del backend

| Campo         | Valor                             |
| ------------- | --------------------------------- |
| Estado        | Propuesta                         |
| Fecha         | 2026-10-06                        |
| Participantes | Equipo de arquitectura de Vitalis |

## Contexto

El backend (Servicio de Identidad y Acceso detrás de Kong) todavía no está disponible, pero el
contrato de login ya está definido en el DD. El frontend debe poder desarrollarse, probarse y
demostrarse ahora, y conectarse después sin reescribir nada.

## Decisión

Cada servicio se define con una **interfaz** (`AuthService`, `ProfileService`) y dos
implementaciones: `http` (Axios contra el API Gateway) y `mock` (en memoria, con la misma forma
de respuesta del contrato). Una **factory** elige cuál usar según la variable de entorno
`USE_MOCK`. Los componentes solo conocen la interfaz.

## Opciones consideradas

| Opción                              | Ventajas                                                                              | Desventajas                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Interfaz + mock/http + factory**  | Funciona igual en web, móvil y pruebas; sin procesos extra; se apaga con una variable | El mock es código que hay que mantener alineado con el contrato                                      |
| MSW (Mock Service Worker)           | Intercepta peticiones reales: también prueba el cliente HTTP                          | El service worker no existe en React Native; habría dos mecanismos distintos para web y móvil        |
| json-server u otro backend falso    | Es un servidor HTTP real                                                              | Otro proceso que levantar; no modela el bloqueo por intentos ni los códigos de error sin programarlo |
| Esperar a que el backend esté listo | Cero código simulado                                                                  | Bloquea al equipo de frontend durante semanas y no hay nada que mostrar                              |

## Justificación

Es la única opción que sirve sin cambios en la web, en la app móvil y en las pruebas
automáticas. El mock reproduce las reglas que importan para la interfaz: credenciales
incorrectas, cuenta deshabilitada y bloqueo tras 5 intentos en un minuto.

## Consecuencias

**Positivas**

- Conectar el backend es cambiar el `.env` (`USE_MOCK=false` y la URL de Kong).
- Las pruebas no dependen de la red.
- El contrato queda escrito en un solo lugar (`packages/shared`) y en
  [`docs/api/frontend-contract.openapi.yaml`](../api/frontend-contract.openapi.yaml).

**Negativas / riesgos asumidos**

- Si el backend cambia el contrato y nadie actualiza el mock, el front "funciona" contra algo que
  ya no existe. Se mitiga con el OpenAPI versionado y las pruebas del cliente HTTP.
- El bloqueo del mock vive en memoria; el real es responsabilidad del backend.
- Las credenciales de prueba están en el código del mock: son datos sintéticos, nunca reales.

**Impacto en el equipo**

- Cada endpoint nuevo exige escribir las dos implementaciones.
- El equipo de backend puede validar su servicio contra el mismo OpenAPI que usa el frontend.
