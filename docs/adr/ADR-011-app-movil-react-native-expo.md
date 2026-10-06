# ADR-011: App móvil con React Native + Expo

| Campo         | Valor                             |
| ------------- | --------------------------------- |
| Estado        | Propuesta                         |
| Fecha         | 2026-10-06                        |
| Participantes | Equipo de arquitectura de Vitalis |

## Contexto

RIBAS necesita que los donantes usen la plataforma desde el celular. El equipo ya decidió React
para la web y tiene pocas personas en frontend, sin experiencia previa en desarrollo nativo. La
app móvil debe compartir el contrato, las validaciones y los mensajes con la web.

## Decisión

Construir la app móvil con **React Native usando Expo** (Expo Router para la navegación y
NativeWind para los estilos), dentro del mismo repositorio que la web.

## Opciones consideradas

| Opción                       | Ventajas                                                                                                                  | Desventajas                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **React Native + Expo**      | Mismo lenguaje y librerías que la web; se prueba en el celular con Expo Go sin Android Studio; comparte código con la web | Depende del ciclo de versiones de Expo; algunas librerías nativas exigen un build propio       |
| Flutter                      | Buen rendimiento y una sola base para Android e iOS                                                                       | Otro lenguaje (Dart): el equipo tendría que aprenderlo y no se comparte nada con la web        |
| PWA (la web instalable)      | Cero código adicional; se despliega igual que la web                                                                      | Sin almacenamiento seguro del token, notificaciones limitadas en iOS, experiencia menos nativa |
| Kotlin nativo (solo Android) | Máximo rendimiento y acceso completo al dispositivo                                                                       | Solo Android, lenguaje nuevo para el equipo y nada compartido con la web                       |

## Justificación

Es la única opción que reutiliza lo que el equipo ya sabe (React y TypeScript) y lo que ya está
escrito (`@ribas/shared`). Expo Go permite probar en un celular real en minutos, lo que importa
en un proyecto de curso sin infraestructura de builds. `expo-secure-store` resuelve el
almacenamiento cifrado del token, que una PWA no ofrece.

## Consecuencias

**Positivas**

- Una sola forma de trabajar para web y móvil: mismos tipos, esquemas, servicios y mensajes.
- Los tokens de color de Tailwind son idénticos en ambas apps gracias a NativeWind.

**Negativas / riesgos asumidos**

- Cada actualización del SDK de Expo puede traer cambios incompatibles: se actualiza una versión
  a la vez y con el CI en verde.
- NativeWind 4 obliga a mantener Tailwind en la versión 3 en las dos apps.
- React debe ser exactamente la misma versión en web y móvil (se fija con `overrides`).

**Impacto en el equipo**

- No hay que aprender un lenguaje nuevo, pero sí las diferencias entre HTML y los componentes de
  React Native.
- Para publicar en tiendas hará falta aprender EAS Build; no es necesario para el piloto.
