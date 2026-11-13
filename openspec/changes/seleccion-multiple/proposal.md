# Proposal

## Why

En Bloquino el lienzo tiene seleccionado a lo más un componente: para mover,
girar o borrar un circuito armado hay que hacerlo pieza por pieza. Tinkercad
Circuits, la referencia del curso, deja juntar varias piezas y actuar sobre
todas a la vez. Pablo pidió emularlo.

Probado en Tinkercad Circuits el 2026-11-13 (un circuito de prueba con una
resistencia, un LED y un piezo), más la hoja oficial de atajos de Tinkercad:

| Acción | Tinkercad Circuits |
| --- | --- |
| Shift + clic en una pieza | La suma a la selección; sobre una ya seleccionada, la quita. Todas quedan con borde azul y la ficha muestra la última |
| Arrastrar una pieza seleccionada | Se mueven todas juntas |
| R | Gira todas juntas, en torno al centro del grupo |
| Ctrl+A | Selecciona todo, el Arduino incluido (y R lo gira con el resto) |
| Supr | Borra todo lo seleccionado; Ctrl+Z lo devuelve en un paso |
| Ctrl+C, Ctrl+V | Pega una copia del grupo un poco corrida, y la copia queda seleccionada |
| Arrastrar en el fondo | Mueve la vista (también con Shift o Ctrl): no hay rectángulo de selección a la vista |
| Ctrl+D | No hace nada en Circuits (sí en el editor 3D) |

## What Changes

- Selección de varias piezas en la página de alumno, como en Tinkercad:
  Shift + clic suma o quita, Ctrl+A selecciona todo, y mover, R, Supr, Ctrl+C
  y Ctrl+V actúan sobre el grupo. Cada acción se deshace en un solo paso.
- La placa entra en la selección como en Tinkercad (Shift + clic, Ctrl+A) y se
  mueve con el grupo. Lo único distinto: R, Supr y Ctrl+C la saltan, porque en
  Bloquino la placa no se gira, no se borra ni se copia (requisito «Una sola
  placa, fija»).
- Agregado que no viene de Tinkercad: Shift + arrastrar en el fondo dibuja un
  rectángulo y selecciona lo que queda dentro (arrastrar sin tecla sigue
  moviendo la vista, como en Tinkercad). Juntar un circuito entero con clics es
  lento para un niño.
- Los cables que unen dos piezas del grupo se mueven, giran, borran y copian
  con ellas; lo asentado en una protoboard del grupo va con ella.

## Capabilities

### Modified Capabilities
- `interfaz/modo-alumno`: la selección del lienzo admite varios componentes.

## Impact

- Módulo nuevo `frontend/src/bloquino/seleccion.ts` (el grupo y las cuentas de
  mover, girar y copiar) con sus tests.
- `SimulatorCanvas.tsx`: clic con Shift, arrastre del grupo, teclas,
  rectángulo y marcas de selección, con comentarios `Bloquino:`.
- Recorrido nuevo `scripts/recorrido/grupo.js`.
