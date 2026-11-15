# Proposal

## Why

En Bloquino el servo salta al ángulo pedido en cuanto llega el pulso: de 0° a
90° sin pasar por el medio. En Tinkercad no: gira a velocidad constante. Pablo
pidió (2026-11-14) revisar Tinkercad y dejar el mismo comportamiento.

Medido en Tinkercad (microservo en el pin 9, `write(0)`, `write(180)`,
`write(90)`, `write(100)`, leyendo el giro del brazo cuadro a cuadro): avanza
15° cada 0,1 s, sin aceleración ni frenado, y tarda 1,1 s de 0° a 180°. Un
cambio chico (90° a 100°) lo hace en un paso. El tiempo de simulación iba a la
par del reloj.

## What Changes

- El servo gira hacia el ángulo pedido a velocidad constante, 160° por segundo
  de tiempo de la placa (de 0° a 180° en 1,1 s), en vez de saltar.
- Si el programa pide otro ángulo antes de que llegue, cambia de rumbo desde
  donde va.
- En pantalla se mueve más fino que en Tinkercad: un paso de 3° por cada pulso
  (cada 20 ms), no de 15° cada 0,1 s.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `simulacion/kit`: «Servo de extremo a extremo» suma el giro a velocidad
  constante.

## Impact

- `frontend/src/simulation/parts/ComplexParts.ts` (Velxio), solo el camino del
  AVR: unas líneas con el comentario `Bloquino:`.
- Un programa que no le da tiempo al servo (`mover a 180°`, `esperar 0,5`,
  `mover a 0°`) ya no llega al extremo, igual que en Tinkercad.
- Los recorridos que leen el ángulo deben esperar a que llegue.
