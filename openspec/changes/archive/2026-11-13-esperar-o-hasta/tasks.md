# Tasks

## 1. Bloque y generación

- [x] 1.1 Bloque `ab_esperar_o_hasta` en Control (debajo de `esperar hasta que`, con 1 segundo de sombra) y su texto en `bloques.json`. Verifica: test de la paleta de Control.
- [x] 1.2 Generador: `for` con `millis()` en modo clásico; macro `ESPERAR_O_HASTA` en `ctx.globales` solo si se usa, en corrutinas; sin condición vale `false`. Verifica: tests en `bloques-control.test.ts` (o uno propio) con el código esperado de los dos modos, y que un sketch de corrutinas sin el bloque no cambia (`bloques-referencia`).
- [x] 1.3 Compilación y AVR emulado: clásico (LED encendido, `esperar 5 o hasta que botón`, LED apagado: se apaga al apretar y a los 5 s sin apretar) y corrutinas (el latido de Pablo: la alarma empieza en menos de 1 s). Verifica: `RUN_BLOQUES_COMPILE=1 npx vitest run src/__tests__/bloques-esperar`.

## 2. Ejemplo, recorrido y cierre

- [x] 2.1 Ejemplo `15-latido.bloquino` a partir del proyecto de Pablo (LED, botón y buzzer; bloques propios `latido` y `alarma` con `esperar … o hasta que`), armado en la página; fila en `docs/bloquino-ejemplos.md` y captura con `scripts/recorrido/ejemplos.js`, que aprieta el botón y mide cuánto tarda la alarma. Verifica: `npx vitest run src/__tests__/bloquino-ejemplos.test.ts` y el recorrido.
- [x] 2.2 Cierre: tipos (`npx tsc … | grep bloquino/`), `npx vitest run src/__tests__/bloquino- src/__tests__/bloques-`, recorridos `bloques` y `mis-bloques`, ítem en `docs/bloquino-prueba-con-el-kit.md`, decisión al final de `../docs/decisiones.md` y `.\scripts\sala.ps1 --build`.

## Workflow follow-up

- Archivar con `node <memoria>/sync-specs.mjs . esperar-o-hasta` y `openspec validate --specs --strict`.
