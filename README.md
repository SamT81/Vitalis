# Vitalis · RIBAS — Red Interinstitucional de Bancos de Sangre

Frontend **multipágina** de la plataforma RIBAS, con autenticación y roles simulados y una
capa de servicios API con datos *mock* de respaldo. HTML5 + CSS3/Bootstrap 5 + JavaScript
(ES6+), sin framework ni proceso de build. Cubre las tres capas del sistema (B2C, B2B y SaaS).

## Arquitectura modular

```
Vitalis/
│  CAPA 1 · Portal público y donante (B2C)
├── index.html            + css/home.css         # Bienvenida · Misión · Semáforo de la red (OA-10)
├── campanas.html         + css/campanas.css     # Campañas georreferenciadas, turnos, compartir
├── gamificacion.html     + css/gamificacion.css # Puntos, niveles/insignias, impacto (OA-03/04)
├── informacion.html      + css/informacion.css  # Requisitos, mitos y realidades, FAQ
├── login.html            + css/auth.css         # Inicio de sesión (3 cuentas demo)
├── registro.html         + css/auth.css         # Registro: datos mínimos (OA-01) + opcionales (OA-02)
├── perfil.html           + css/perfil.css       # Panel privado del donante (protegido)
│
│  CAPA 2 · Panel institucional (B2B)
├── panel-institucional.html + css/panel.css     # Inventario, disposición, intercambio + cadena
│                                                #   de frío, campañas y convocatorias
│  CAPA 3 · Administración / analítica / regulación (SaaS · INVIMA)
├── admin-dashboard.html     + css/admin.css     # Estructura y roles, predicción de escasez,
│                                                #   auditoría y exportación de informes
├── css/global.css        # Tokens, Navbar, Footer, botones y widgets compartidos (tablas, tabs…)
└── js/
    ├── auth-guard.js      # Guardián de sesión — se carga en el <head> de TODAS las páginas
    ├── api-service.js     # Controladores REST + datos mock: Donor/Campaign/Inventory/Transfer/Analytics
    ├── auth.js            # Sesión y roles simulados (localStorage) · window.Vitalis.auth
    ├── main.js            # Contenido e interactividad B2C (semáforo, campañas, perfil, info)
    ├── panel.js           # Lógica del panel institucional (B2B)
    └── admin.js           # Lógica de la consola de administración (SaaS)
```

Orden de carga por página: **`auth-guard.js`** (en el `<head>`) → **Bootstrap 5 (CDN)** →
**Lucide** → **`api-service.js`** → **`auth.js`** → **`main.js`** (+ `panel.js` / `admin.js`
donde aplica). Navbar y Footer son idénticos en todas las páginas y reaccionan a la sesión
y al rol.

### Modo desarrollo (`js/auth-guard.js`)

`DEV_MODE = true` (por defecto):
- **Ninguna página redirige a `login.html`** — se navega libremente por todo el sitio,
  incluidas `panel-institucional.html` y `admin-dashboard.html`.
- Si no hay sesión válida, se crea y activa automáticamente un usuario mock
  **`Dev SuperAdmin` con rol `SUPER_ADMIN`** en `localStorage` (ve todas las secciones).

Para activar el guardián real (redirección a login en páginas protegidas), cambia
`DEV_MODE = false` en `js/auth-guard.js`.

### Render inmediato de datos mock

Cada pantalla pinta primero los datos ficticios de forma **síncrona** (`Vitalis.api.MOCKS.*`)
y luego, si el backend REST responde, refresca. Ninguna petición fallida (404, red caída,
`file://`) deja elementos vacíos ni bloquea el HTML.

## Capa de servicios (`js/api-service.js`)

`window.Vitalis.api` — cada método hace `fetch('/api/v1/...')` y, si no hay backend,
responde con un *mock* (modo demostración). Devuelve `{ source: 'api'|'mock', data }`.

| Controlador | Endpoints base | Ejemplos |
|---|---|---|
| `DonorService`     | `/api/v1/donors/...`     | `getProfile`, `listBadges`, `updateProfile` |
| `CampaignService`  | `/api/v1/campaigns/...`  | `list`, `getSlots`, `enroll`, `createCampaign`, `sendConvocatoria` |
| `InventoryService` | `/api/v1/inventory/...`  | `getSemaforo`, `listUnits`, `registerDisposal` |
| `TransferService`  | `/api/v1/transfers/...`  | `listRequests`, `approve`, `dispatch` |
| `AnalyticsService` | `/api/v1/analytics/...`  | `demandVsAvailability`, `shortagePrediction`, `auditLog`, `banks`, `users`, `exportTraceability` |

## Autenticación, roles y `localStorage`

`vitalis_users` (cuentas) y `vitalis_session` (`{ userId, remember }`). Roles:
`donante` (B2C), `institucion` (B2B), `admin` (SaaS/regulador). El Navbar muestra los
enlaces *Panel institucional* / *Administración* según el rol (atributo `data-role`).
`perfil.html`, `panel-institucional.html` y `admin-dashboard.html` están protegidos
(redirigen a `login.html?next=...` sin sesión). El rol se refleja con `data-role` en `<html>`.

### 🔑 Cuentas de demostración (contraseña `demo1234` para todas)
| Correo | Rol | Entra a |
|---|---|---|
| `ana@vitalis.co`   | donante     | `perfil.html` (18 donaciones, medallas, historial con certificados) |
| `banco@vitalis.co` | institucion | `panel-institucional.html` |
| `admin@vitalis.co` | admin       | `admin-dashboard.html` |

Los 3 botones de la pantalla de login entran directamente con cada cuenta.

## Cobertura de alcances (resumen)

- **OA-01/02** registro con datos mínimos + opcionales · **OA-03/04** gamificación e impacto ·
  **OA-05/17** crear campañas y convocatorias segmentadas · **OA-06/08/09/10** inventario,
  estados y semáforo · **OA-11/12/13** (**LI-11**) bancos, categorías, usuarios y roles ·
  **OA-14/15/16** intercambio entre bancos y cadena de frío · **OA-18/20** (**LI-07**) filtro
  georreferenciado · **OA-19** agendamiento de turnos · **OA-22** compartir en canales
  externos · **OA-23** disposición de unidades no aptas · **OA-25/26** (**LI-10**) demanda vs.
  disponibilidad y predicción de escasez · **OA-27/28** auditoría y exportación de informes
  de trazabilidad (INVIMA).
- **LI-12**: el portal del donante nunca expone datos clínicos ni resultados de tamizaje.

## Cómo probar

```bash
python -m http.server 8000
```
Abre <http://localhost:8000>.

1. **index.html** → cambia la **región** del *Semáforo de la red* y observa los niveles.
2. **login.html** → *Banco de sangre* → **panel institucional**: filtra unidades, registra una
   disposición, aprueba una solicitud, despacha una transferencia con lecturas de temperatura,
   crea una campaña y envía una convocatoria.
3. **login.html** → *Administración* → **admin-dashboard**: cambia el rol de un usuario, revisa
   el gráfico de demanda vs. disponibilidad y la predicción de escasez, y pulsa
   **Informe (JSON)** / **Auditoría (CSV)** para descargar los informes.
4. **login.html** → *Donante* → inscríbete a una campaña eligiendo **turno**, compártela, y
   revísala luego en **perfil.html**.

## Dependencias (vía CDN, sin instalación)

| Librería | Uso |
|---|---|
| Bootstrap 5.3.3 | Grid, navbar/collapse, accordion, modal, utilidades |
| Lucide 0.460 | Iconos SVG |
| Google Fonts (Inter) | Tipografía |
