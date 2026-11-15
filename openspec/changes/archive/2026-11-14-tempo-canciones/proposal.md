# Proposal

## Why

Pablo quiere que los alumnos toquen las canciones de BuzzerMusic más rápido o
más lento. La librería ya lo permite (`start(canción, tempo)` y
`marioBros(tempo)`, en pulsos por minuto; sin tempo usa el de la partitura),
pero los bloques no lo exponen.

## What Changes

- `tocar canción` y `empezar canción` suman un menú de velocidad: muy lenta,
  lenta, normal, rápida y muy rápida (×0,5, ×0,75, ×1, ×1,25 y ×1,5 del tempo
  de la partitura). Quedan `tocar canción [canción] a velocidad [v] en pin [p]`.
- Con velocidad normal el código no cambia (`musica8.marioBros();`, como en
  las slides); con otra, lleva el tempo calculado
  (`musica8.marioBros(250);`, `musica8.start(BuzzerMusic::MARIO_BROS, 250);`).
- Formato de paquetes: `{A.x*B.y}` multiplica datos de las opciones elegidas
  (redondeado); si falta un dato queda vacío, y un argumento vacío al final de
  una llamada se quita. `porDefecto` vale también para los programas guardados
  sin ese campo, que cargan a velocidad normal.
- El ejemplo de la rockola usa una canción a otra velocidad.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `bloques/buzzermusic`: «Bloques de canciones» suma el menú de velocidad;
  requisito nuevo «Velocidad de la canción».
- `bloques/paquetes`: «Plantillas con los campos del bloque» suma el producto
  de datos y el argumento vacío.

## Impact

- `frontend/src/blocks/paquetes/buzzermusic.json`, `paquetes/index.ts`,
  `docs/bloquino-agregar-libreria.md`.
- Tests de paquetes y fixtures; `frontend/public/ejemplos/04-rockola.bloquino`;
  recorrido `canciones`.
- Slides del curso (`Curso_Arduino`): los bloques de canciones se ven con el
  menú nuevo.
