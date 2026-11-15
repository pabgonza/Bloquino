# Tasks

## 1. Bloque

- [x] 1.1 `catalogo/luces.ts`, `generador/bloques.ts` e `i18n/es/bloques.json`: desplegable `COMUN` (cátodo primero, para los programas guardados) y `255 - valor` con ánodo; el bloque de la paleta con `COMUN: 'anodo'`. Verifica: `npx vitest run src/__tests__/bloques-generador.test.ts` (rojo de cátodo, rojo de ánodo, sin el campo).

## 2. Simulador y paleta

- [x] 2.1 `simulation/parts/ComplexParts.ts`, LED RGB: con `common: 'anode'` cada color prende en bajo y con PWM a `255 - valor`. Verifica: `npx vitest run src/__tests__/simulation-parts.test.ts`.
- [x] 2.2 `bloquino/PaletaComponentes.tsx` y `i18n/es/bloquino.json`: el LED RGB sale de ánodo común y su ficha muestra `Tipo`. Verifica: test de la paleta o del kit.

## 3. Cierre

- [x] 3.1 Programa compilado con el bloque de ánodo en un LED de ánodo común: en el simulador se ve el color pedido (recorrido o prueba en el navegador).
- [x] 3.2 `npx vitest run src/__tests__/bloquino- src/__tests__/bloques-`, tipos, recorridos `s9` y `ejemplos` 08 y 14.
- [x] 3.3 `docs/bloquino-prueba-con-el-kit.md`, `docs/bloquino-ejemplos.md` y decisión al final de `../docs/decisiones.md`.
