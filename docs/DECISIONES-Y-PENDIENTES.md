# Decisiones y pendientes del frontend

Lo que alguien podría cuestionar al revisar el frontend, con su razón, y lo que todavía falta
acordar. Las decisiones de arquitectura con trade-offs tienen además su ADR en
[`docs/adr/`](adr/README.md).

## 1. Decisiones técnicas justificadas

| Decisión                                     | Por qué                                                                                                                                                                                                                | Límite conocido / siguiente paso                                                                                                                                                           |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Token en `localStorage` en la web            | Es simple, funciona sin backend y basta para el piloto. El token nunca va en la URL ni se imprime en consola.                                                                                                          | Un script inyectado (XSS) podría leerlo. En producción: cookie `httpOnly`, `Secure`, `SameSite` + protección CSRF. El cambio queda aislado en `lib/sessionStore.ts` y `api/httpClient.ts`. |
| Token en `expo-secure-store` en móvil        | Lo guarda cifrado en el Keystore de Android o el Keychain de iOS.                                                                                                                                                      | En iOS puede sobrevivir a una reinstalación de la app.                                                                                                                                     |
| El bloqueo del modo simulado vive en memoria | El mock solo existe para desarrollar y demostrar el flujo; se reinicia al recargar.                                                                                                                                    | El bloqueo real (QA-26) lo aplica el backend y llega como `ACCOUNT_LOCKED` (429).                                                                                                          |
| Monorepo con npm workspaces                  | Web y móvil comparten contrato, validaciones, mensajes y servicios. Un solo `npm install`, una sola versión de React y un cambio de contrato en un solo commit. Ver [ADR-012](adr/ADR-012-monorepo-npm-workspaces.md). | La instalación se hace siempre desde la raíz.                                                                                                                                              |
| Existe un mock de los servicios              | El backend aún no está disponible. El mock responde con la misma forma que el contrato del DD, así que el front no cambia al conectar. Ver [ADR-013](adr/ADR-013-estrategia-mock-http.md).                             | Se apaga con `VITE_USE_MOCK=false` (web) o `EXPO_PUBLIC_USE_MOCK=false` (móvil) en el `.env`, sin tocar código.                                                                            |

## 2. Contratos pendientes con el backend (para llevar al DD)

El contrato completo que usa el frontend está en
[`docs/api/frontend-contract.openapi.yaml`](api/frontend-contract.openapi.yaml).

### 2.1 El login no devuelve el nombre ni la institución

`POST /api/v1/auth/login` responde `{ valid, userId, institutionId, roles, token, expiresAt }`.
La pantalla "Mi cuenta" necesita el nombre de la persona y el nombre de su institución.

- **Hoy (parche temporal en `toSession`, `packages/shared/src/auth/session.ts`):** el nombre se
  deriva del correo (`natalia.rojas@…` → "Natalia Rojas") y la institución se muestra como
  "Sin registrar" junto a su `institutionId`.
- **Duda abierta:** el DD muestra `institutionId` como texto. El frontend acepta también
  `null` (un donante no pertenece a una institución); falta confirmar qué envía el backend.
- **Propuesta para el DD:** agregar dos campos opcionales a la respuesta del login, o exponer
  `GET /api/v1/users/me`.

```json
{
  "valid": true,
  "userId": "…",
  "institutionId": "…",
  "roles": ["personal_banco_sangre"],
  "token": "…",
  "expiresAt": "2026-10-06T05:00:00Z",
  "name": "Natalia Rojas Marín",
  "institutionName": "Banco de Sangre Bogotá"
}
```

### 2.2 Recuperar contraseña (propuesta)

```
POST /api/v1/auth/forgot-password
Content-Type: application/json

{ "email": "persona@ejemplo.co" }
```

| Respuesta | Cuerpo                                                             | Cuándo                                                                           |
| --------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `204`     | (vacío)                                                            | Siempre que el correo tenga formato válido. No debe revelar si el correo existe. |
| `400`     | `{ "code": "VALIDATION_ERROR", "message": "…", "timestamp": "…" }` | Correo con formato inválido                                                      |
| `429`     | `{ "code": "ACCOUNT_LOCKED", "message": "…", "timestamp": "…" }`   | Demasiadas solicitudes                                                           |

No requiere `Authorization`.

### 2.3 Perfil de donante (propuesta)

```
GET /api/v1/donors/{userId}
Authorization: Bearer <token>
```

```json
{
  "bloodType": "O+",
  "city": "Bogotá D.C.",
  "donations": 6,
  "points": 3150
}
```

| Campo       | Tipo               | Notas                                            |
| ----------- | ------------------ | ------------------------------------------------ |
| `bloodType` | `string` o `null`  | `A+`, `A−`, `B+`, `B−`, `AB+`, `AB−`, `O+`, `O−` |
| `city`      | `string` o `null`  |                                                  |
| `donations` | `integer` o `null` | Mayor o igual a 0                                |
| `points`    | `integer` o `null` | Mayor o igual a 0                                |

Errores: `401` (token inválido o vencido), `403` (no es el dueño del perfil), `404` (no es
donante), siempre con `{ code, message, timestamp }`. Cualquier campo ausente o `null` se muestra
como "Sin registrar".

## 3. Pendientes del grupo

**Producto**

- Pantallas que siguen solo en `legacy-html/`: registro, campañas, gamificación, información,
  paneles (operativo, institucional, administración) y auditoría. Lista completa en
  [`legacy-html/README.md`](../legacy-html/README.md).
- Probar la app móvil en un celular real siguiendo
  [`frontend-mobile/PRUEBA-EN-CELULAR.md`](../frontend-mobile/PRUEBA-EN-CELULAR.md). Hasta ahora
  solo se verificó con pruebas automáticas y su build web.

**Proceso (decisiones que debe tomar el grupo)**

| Tema                                  | Situación                                                                                                                                                  | Opciones                                                                                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Nombre de la rama                     | El trabajo está en `front-react`; la convención es `feature/HU-nnn-descripcion`.                                                                           | Renombrarla con la HU de ClickUp que corresponda antes de abrir el PR, o abrir el PR tal cual y dejar constancia.                 |
| Tamaño del PR (límite de 400 líneas)  | La migración completa supera el límite por mucho.                                                                                                          | Pedir una excepción documentada por ser la carga inicial, o dividirlo en PR por capa (shared, web, móvil, docs/CI).               |
| Ramas `main` y `develop`              | El CI corre en los PR hacia `develop`.                                                                                                                     | Crear ambas ramas si faltan y protegerlas: PR obligatorio, 1 aprobación y CI en verde.                                            |
| Revisor de backend                    | El módulo maneja credenciales y tokens (código sensible).                                                                                                  | Sumar al PR un revisor del equipo de back además del revisor de front.                                                            |
| Ramas `Prueba-1`, `daza` y `prueba2`  | Son ramas de trabajo anteriores del prototipo HTML.                                                                                                        | Borrarlas tras integrar `front-react`, o archivarlas con un tag si se quiere conservar el historial.                              |
| `CODEOWNERS`                          | El archivo existe pero está sin usuarios.                                                                                                                  | Poner los usuarios de GitHub de quienes revisan front y back.                                                                     |
| Revisión del PR                       | Nadie distinto del autor ha revisado todavía este código.                                                                                                  | Asignar revisor y usar la plantilla de PR (checklist del DoD).                                                                    |
| Mensajes de commit en inglés          | El Tech Radar (8.2) pide mensajes de commit en inglés. Los commits de esta rama anteriores a la tercera pasada están en español.                           | Aceptarlo como excepción (reescribir el historial exigiría `push --force`) o hacer _squash_ al fusionar con un mensaje en inglés. |
| Tipos de commit `ci` y `build`        | El Tech Radar solo lista `feat, fix, docs, refactor, test, chore`. Esta rama usa además `ci:` y `build:`, que son parte del estándar Conventional Commits. | Agregar `ci` y `build` a la lista del Tech Radar, o usar `chore(ci)` / `chore(build)` en adelante.                                |
| Hooks de validación local             | El Tech Radar (8.2) pide hooks que bloqueen commits sin formato ni lint. El repositorio no los tiene: hoy lo verifica el CI.                               | Agregar `husky` + `lint-staged` en una HU aparte.                                                                                 |
| Ambiente de QA                        | El Tech Radar menciona Render/Vercel para `develop`; el despliegue previsto es Docker Swarm en las VMs. La imagen ya existe (`frontend-web/Dockerfile`).   | Definir dónde se despliega QA y automatizarlo desde `develop`.                                                                    |
| ADR-011 a ADR-015                     | Están en estado "Propuesta". ADR-015 cambia una regla del Tech Radar (kebab-case).                                                                         | Que el equipo de arquitectura los revise y los acepte o pida cambios.                                                             |
| Parche del nombre derivado del correo | El DoD no permite parches sin tarea.                                                                                                                       | Crear la tarea en ClickUp para cuando el backend defina `name` e `institutionName` (sección 2.1).                                 |
