# Proposal

## Why

El bloque `color del LED RGB` y el simulador suponen un LED de cátodo común:
nivel alto = color encendido. El LED RGB del kit de Pablo es de ánodo común
(2026-11-15): la patita común va a 5 V y cada color se enciende en bajo. Con el
bloque de hoy, en la mesa los colores salen invertidos (pide rojo y prende
celeste).

## What Changes

- El bloque suma un desplegable con el tipo: `color del LED RGB [ánodo común]
  (pines 9 10 11) a [color]`. Con ánodo común genera `255 - valor` en cada
  `analogWrite`, para que el color elegido sea el que se ve.
- El bloque de la paleta sale con `ánodo común`, como el LED del kit. Un
  programa guardado sin el campo sigue siendo de cátodo común.
- El LED RGB del lienzo suma la propiedad `Tipo` (`Cátodo común`, `Ánodo
  común`) en su ficha; el de la paleta sale de ánodo común. Con ánodo común el
  simulador lo prende en bajo. Una pieza guardada sin la propiedad sigue de
  cátodo común.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `bloques/catalogo-base`: «Bloques de luces», el bloque RGB con el tipo.
- `interfaz/modo-alumno`: «Solo el kit del curso», ficha y salida del LED RGB.
- `simulacion/kit`: requisito nuevo «LED RGB de ánodo o cátodo común».

## Impact

- `frontend/src/blocks/catalogo/luces.ts`, `generador/bloques.ts`,
  `i18n/locales/es/bloques.json`.
- `frontend/src/bloquino/PaletaComponentes.tsx`, `i18n/locales/es/bloquino.json`.
- `frontend/src/simulation/parts/ComplexParts.ts` (Velxio): unas líneas con el
  comentario `Bloquino:`.
- Los ejemplos 08 y 14 y la sesión 9 del curso siguen de cátodo común (patita
  común a GND): pasarlos al LED del kit queda fuera de este change.
