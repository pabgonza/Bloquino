# Proposal

## Why

La guía del día de clase (`docs/bloquino-dia-de-clase.md`) es texto para el profesor y no muestra lo que ve cada uno. Pablo pidió una guía en HTML, gráfica y corta, del flujo completo: preparar la clase, sumar a los alumnos y dictarla, vista por el profesor y por los alumnos.

Bloquino no tiene cuentas ni cursos (decisión del MVP): «crear la clase» es levantar la sala en el notebook y «sumar a los alumnos» es darles la dirección y preparar sus equipos para HTTPS. La guía lo dice así.

## What Changes

- `docs/guia-de-la-clase/index.html`: una página, sin internet, con un esquema de la sala y capturas reales en tres partes: preparar la clase (profesor), sumar a los alumnos (cada equipo) y dictar la clase (profesor y alumno, lado a lado).
- Capturas en `docs/guia-de-la-clase/img/`, hechas con Playwright sobre la imagen de la sala por el guion `scripts/recorrido/guia.js`, que las rehace.
- `docs/bloquino-dia-de-clase.md` enlaza la guía.

## Capabilities

### Modified Capabilities
- `despliegue/imagen-sala`: guía ilustrada de la clase.

## Impact

- Solo documentación y un guion de capturas; no cambia el código de la página.
