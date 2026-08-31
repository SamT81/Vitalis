# Vitalis · RIBAS — Red Interinstitucional de Bancos de Sangre

Sitio web **multipágina con autenticación simulada** para **Vitalis**, la plataforma de
la Red Interinstitucional de Bancos de Sangre (RIBAS). HTML5 + CSS3/Bootstrap 5 +
JavaScript (ES6+), sin framework ni proceso de build.

## Arquitectura modular

```
Vitalis/
├── index.html          + css/home.css          # Bienvenida + misión institucional
├── login.html          + css/auth.css          # Inicio de sesión
├── registro.html       + css/auth.css          # Registro de donantes
├── perfil.html         + css/perfil.css        # Panel privado del donante (protegido)
├── campanas.html       + css/campanas.css      # Campañas + inscripción dinámica
├── gamificacion.html   + css/gamificacion.css  # Explicación de puntos, niveles e impacto
├── informacion.html    + css/informacion.css   # Requisitos, mitos y realidades, FAQ
├── css/global.css      # Variables de color, Navbar, Footer, botones, widgets compartidos
├── js/
│   ├── auth.js          # Sesión simulada (localStorage): registro, login, logout, guardas
│   └── main.js          # Contenido e interactividad de cada pantalla
└── assets/
    ├── image-Photoroom.png  # Logo de Vitalis (Navbar y Footer)
    ├── logo-vitalis.png     # Logo usado solo en el certificado de donación (modal de perfil)
    └── favicon.svg
```

Cada página carga: **Bootstrap 5 (CDN)** → **`global.css`** → **su CSS de pantalla**, y
al final **`auth.js`** → **`main.js`**. El **Navbar** y el **Footer** son idénticos en
todas las páginas (definidos en `global.css`) y el Navbar cambia según haya sesión activa.

## Sistema de autenticación (simulado con `localStorage`)

`js/auth.js` expone `window.Vitalis.auth` y guarda el estado en el navegador:

| Clave | Contenido |
|---|---|
| `vitalis_users` | Donantes registrados (incluye una cuenta de demostración) |
| `vitalis_session` | `{ userId, remember }` del donante con sesión activa |

El estado de gamificación (puntos, donaciones, inscripciones, historial) vive dentro del
registro de cada donante en `vitalis_users`.

- **Registro** (`registro.html`): nombre, correo, contraseña, documento, tipo de sangre,
  ciudad. Al crear la cuenta se inicia sesión y se entra al perfil.
- **Inicio de sesión** (`login.html`): correo + contraseña, casilla *"Recordarme"*, y botón
  para entrar con la **cuenta de demostración**.
- **Navbar reactivo**: sin sesión muestra *Iniciar sesión / Registrarme*; con sesión muestra
  el nombre del donante, el enlace *Mi perfil* y *Salir*. (Se controla con `data-auth` en
  `<html>`, fijado por un script en línea del `<head>` para evitar parpadeo.)
- **`perfil.html` está protegido**: si no hay sesión válida, redirige a
  `login.html?next=perfil.html` antes de pintar la página.

### 🔑 Cuenta de demostración
```
correo:      ana@vitalis.co
contraseña:  demo1234
```
Trae 18 donaciones, medallas desbloqueadas, 1 campaña inscrita e historial con certificados.

## Panel del donante (`perfil.html`)

- **Mi resumen:** puntos acumulados, tipo de sangre, donaciones realizadas y estimación de
  vidas salvadas.
- **Mis medallas y logros:** galería con estado desbloqueada / por desbloquear según tus
  donaciones, con panel de detalle.
- **Mis campañas suscritas:** lista con estado *Confirmada* y próxima fecha; se puede cancelar.
- **Historial de donaciones:** tabla con fecha, lugar, componente, estado y **certificado**
  (modal imprimible).

## Inscripción a campañas (`campanas.html`)

El botón *"Inscribirme a esta campaña"*:
- Si **no** hay sesión → redirige a `login.html?next=campanas.html`.
- Si hay sesión → inscribe/cancela, actualiza la barra de progreso de la meta y añade la
  campaña a `perfil.html`.

## Cómo probar

```bash
python -m http.server 8000
```
Abre <http://localhost:8000>. (También sirve abrir `index.html` directo o usar Live Server.)

### Recorrido sugerido
1. **index.html** → navega por el menú; revisa la **Misión**.
2. **registro.html** → crea una cuenta nueva → entras a **perfil.html** (verás el panel vacío).
3. **campanas.html** → inscríbete en una campaña (sube el % de la meta) → vuelve a **perfil.html**
   y verás la campaña en *"Mis campañas suscritas"*.
4. Pulsa **Salir**. Entra de nuevo con **login.html** → botón *"Entrar con la cuenta de
   demostración"* → panel completo con medallas, historial y certificados.
5. Abre `perfil.html` sin sesión (en una ventana de incógnito) → te redirige a `login.html`.

## Dependencias (vía CDN, sin instalación)

| Librería | Uso |
|---|---|
| Bootstrap 5.3.3 | Grid, navbar/collapse, accordion, modal, utilidades |
| Lucide 0.460 | Iconos SVG |
| Google Fonts (Inter) | Tipografía |
