<!-- Título del PR en Conventional Commits, por ejemplo: feat(web): add campaigns list -->

## Historia de usuario

HU-nnn — <!-- enlace a la tarea en ClickUp -->

## Qué cambia

<!-- 2 o 3 líneas: qué hace este PR y por qué. -->

## Cómo probar

1.
2.

## Checklist del Definition of Done

- [ ] La rama se llama `feature/HU-nnn-descripcion` y el PR no supera ~400 líneas modificadas
      (o se justifica la excepción abajo).
- [ ] El CI está en verde (lint, formato, tipos, pruebas, build, E2E y OpenAPI).
- [ ] Lo revisó y aprobó al menos una persona distinta del autor.
- [ ] Si toca datos sensibles (donantes, tamizaje, credenciales o tokens), lo revisó además
      alguien de backend.
- [ ] Incluye pruebas de la lógica nueva (unitarias y, si es un flujo crítico, E2E con
      Playwright).
- [ ] Se cumplen los criterios de aceptación de la HU en ClickUp.
- [ ] Documentación al día: `docs/api/frontend-contract.openapi.yaml` si cambió el contrato y
      un ADR en `docs/adr/` si hubo una decisión de arquitectura.
- [ ] Sin deuda técnica: no quedan `TODO` ni parches; si algo se pospone, hay tarea en el
      backlog (enlace abajo).
- [ ] No hay datos reales de personas ni secretos en el código, las pruebas o las capturas.

## Capturas

<!-- Antes y después, en escritorio y en 360 px si cambia la interfaz. -->

## Notas para quien revisa

<!-- Excepciones, deuda técnica registrada, decisiones que conviene mirar con cuidado. -->
