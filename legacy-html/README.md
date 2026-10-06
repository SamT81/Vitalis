# legacy-html — Prototipo HTML original

**Solo referencia.** Este es el primer prototipo de Vitalis, hecho con HTML, Bootstrap y
JavaScript sin framework. El proyecto actual está en `frontend-web/`, `frontend-mobile/` y
`packages/shared/` (ver el [README de la raíz](../README.md)).

No se le agregan funciones: se consulta para migrar sus pantallas a React.

## Pantallas pendientes de migrar a React

| Pantalla                         | Archivos                                                                  |
| -------------------------------- | ------------------------------------------------------------------------- |
| Registro de donantes             | `registro.html`                                                           |
| Campañas                         | `campanas.html`, `css/campanas.css`                                       |
| Gamificación                     | `gamificacion.html`, `css/gamificacion.css`                               |
| Información                      | `informacion.html`, `css/informacion.css`                                 |
| Panel operativo                  | `operativo.html`, `js/operativo.js`                                       |
| Panel institucional              | `panel-institucional.html`, `admin-institucional.html`                    |
| Administración general           | `admin-general.html`, `admin-dashboard.html`                              |
| Auditoría INVIMA                 | `auditoria.html`, `js/auditoria.js`                                       |
| Semáforo de la red (en Inicio)   | sección de `index.html`                                                   |
| Campañas suscritas e historial   | secciones de `perfil.html`                                                |

Ya migradas: inicio, iniciar sesión, recuperar contraseña, mi cuenta y el resumen de mi perfil.

## Cómo verlo

```bash
cd legacy-html
python -m http.server 8000   # http://localhost:8000
```

Sus pruebas se corren desde la raíz con `npm run test:html`.

El modo desarrollo que iniciaba sesión de forma automática quedó **desactivado**
(`DEV_MODE_DEFAULT = false` en `js/auth-guard.js`): las páginas protegidas exigen sesión.

La documentación original del prototipo está en
[`DOCUMENTACION-ORIGINAL.md`](DOCUMENTACION-ORIGINAL.md).
