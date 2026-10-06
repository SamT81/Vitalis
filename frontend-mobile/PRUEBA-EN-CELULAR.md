# Prueba de la app en un celular (Expo Go, Windows)

Checklist para verificar la app móvil en un dispositivo real. Toma unos 10 minutos.

## 1. Preparación

- [ ] En el celular: instalar **Expo Go** (Play Store o App Store).
- [ ] Computador y celular conectados a **la misma red Wi-Fi** (no la red de invitados, que suele
      aislar los dispositivos).
- [ ] En la raíz del repositorio: `npm install`.
- [ ] En `frontend-mobile`: copiar `.env.example` como `.env`
      (`Copy-Item .env.example .env` en PowerShell). Para esta prueba se deja
      `EXPO_PUBLIC_USE_MOCK=true`.

## 2. Arrancar

```powershell
cd frontend-mobile
npx expo start
```

- [ ] Android: abrir Expo Go → "Scan QR code" y escanear el código de la terminal.
- [ ] iPhone: escanear el código con la app Cámara y abrir el enlace en Expo Go.

### Si el celular no conecta

1. **Firewall de Windows.** La primera vez que corre `npx expo start`, Windows pregunta si
   permite el acceso de Node.js: marcar **Redes privadas** y "Permitir acceso". Si se rechazó:
   Panel de control → Firewall de Windows Defender → "Permitir una aplicación a través de
   Firewall" → buscar **Node.js JavaScript Runtime** y marcar "Privada".
2. **Red marcada como pública.** Configuración → Red e Internet → Wi-Fi → propiedades de la
   red → "Perfil de red: Privada".
3. **Túnel.** Si sigue sin conectar (redes de universidad, VPN): `npx expo start --tunnel`. Es
   más lento pero no depende de la red local.
4. Reiniciar con caché limpia: `npx expo start --clear`.

## 3. Recorrido y qué debe verse

| #   | Paso                                                                                                    | Qué debe verse                                                                                                                | ✔   |
| --- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --- |
| 1   | Abrir la app                                                                                            | Pantalla de inicio con el logo de Vitalis y los botones "Iniciar sesión" y "Registrarme como donante"                         |     |
| 2   | Tocar "Registrarme como donante"                                                                        | Pantalla "Registro de donantes" con la etiqueta "Próximamente"                                                                |     |
| 3   | Volver y tocar "Iniciar sesión". Tocar "Ingresar" sin escribir nada                                     | "Ingresa tu correo electrónico." e "Ingresa tu contraseña." debajo de cada campo                                              |     |
| 4   | Escribir `hola` y `123` y tocar "Ingresar"                                                              | "Ingresa un correo electrónico válido." y "La contraseña debe tener al menos 8 caracteres."                                   |     |
| 5   | Tocar el ojo del campo de contraseña                                                                    | La contraseña se muestra y se vuelve a ocultar                                                                                |     |
| 6   | `donante@gmail.com` con la contraseña `ClaveErrada1!`                                                   | El botón muestra "Ingresando…" y luego aparece "El correo o la contraseña son incorrectos."                                   |     |
| 7   | Repetir el paso 6 cuatro veces más (5 fallos en menos de un minuto) e intentar de nuevo                 | "Demasiados intentos. Intenta de nuevo en unos minutos."                                                                      |     |
| 8   | Entrar con otra cuenta: `personal@bancobogota.co` / `Ribas2026!`                                        | Pantalla "Mi cuenta": Natalia Rojas Marín, rol "Personal de banco de sangre", Banco de Sangre Bogotá y la hora de vencimiento |     |
| 9   | Tocar la pestaña "Mi perfil"                                                                            | "Hola, Natalia 👋" y los cuatro datos del resumen en "Sin registrar". Nunca debe aparecer `null`                              |     |
| 10  | Cerrar la app por completo y volver a abrirla                                                           | La pantalla de inicio muestra "Ir a mi cuenta" en lugar de "Iniciar sesión": la sesión se restauró                            |     |
| 11  | En "Mi cuenta", tocar "Cerrar sesión"                                                                   | Vuelve a "Iniciar sesión"                                                                                                     |     |
| 12  | Entrar con `donante@gmail.com` / `Ribas2026!` (si sigue bloqueada, esperar 2 minutos o recargar la app) | En "Mi perfil": 3.150 pts, O+, 6 donaciones, 18 vidas y "3 / 8 desbloqueadas"; tocar una medalla cambia el detalle            |     |
| 13  | Intentar con `inactivo@bancobogota.co` / `Ribas2026!`                                                   | "Tu cuenta está deshabilitada. Contacta al administrador de tu institución."                                                  |     |

En todo el recorrido: los textos están en español, nada se sale de la pantalla hacia los lados y
el teclado no tapa el campo que se está escribiendo.

## 4. Probar contra el backend (cuando exista)

1. Ver la IP del computador: en PowerShell, `ipconfig` → "Adaptador de LAN inalámbrica Wi-Fi" →
   **Dirección IPv4** (por ejemplo `192.168.1.20`).
2. En `frontend-mobile/.env`:

   ```env
   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:8000
   EXPO_PUBLIC_USE_MOCK=false
   ```

   `localhost` no sirve: en el celular apunta al propio celular.

3. Permitir en el firewall de Windows el puerto de Kong (8000) para redes privadas.
4. Reiniciar con `npx expo start --clear` y repetir el recorrido con usuarios reales.

## 5. Registrar el resultado

Anotar fecha, modelo del celular, versión de Android/iOS y los pasos que fallaron (con captura).
Si todo pasa, marcar el pendiente "prueba en un celular real" en
[`docs/DECISIONES-Y-PENDIENTES.md`](../docs/DECISIONES-Y-PENDIENTES.md).
