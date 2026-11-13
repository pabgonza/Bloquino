# Tasks

## 1. Grupo

- [x] 1.1 `frontend/src/bloquino/seleccion.ts`: store del grupo (`ids`, placa incluida), sumar o quitar, vaciar, todo; mover (piezas, placa, cables internos, sin mover dos veces lo asentado), girar en torno al centro del grupo con la placa (`giroProtoboard.ts` generalizado: `girarEnTorno`, `girarPunto`), borrar y copiar/pegar sin la placa, rectángulo, y deshacer en un paso con fotos.
- [x] 1.2 `bloquino-seleccion.test.ts` (8 tests). Encontró ids repetidos al pegar dos veces en el mismo milisegundo: el sello lleva un contador.

## 2. Lienzo

- [x] 2.1 `SimulatorCanvas.tsx`: Shift + mouse en la captura del lienzo (clic suma o quita la pieza o la placa de debajo; arrastre, rectángulo); clic sin tecla deja una sola; clic en fondo o cable vacía el grupo.
- [x] 2.1b La placa: se mueve y gira con el grupo; sola se gira con R, su barra y su ficha; Supr y Ctrl+C la saltan.
- [x] 2.2 Arrastrar una pieza del grupo mueve todas (una pieza asentada en una protoboard del grupo arrastra la protoboard); al soltar, el grupo calza como la pieza arrastrada; un solo comando de deshacer.
- [x] 2.3 Teclas con grupo: R, Supr, Ctrl+C, Ctrl+V y Ctrl+A, cada una en un comando; con una pieza, igual que antes.
- [x] 2.4 Rectángulo de Shift + arrastrar (capa `.bq-rectangulo`), también empezando sobre la protoboard.
- [x] 2.5 Contorno de las piezas y de la placa del grupo (`.bq-en-grupo`, `.bq-placa-en-grupo`).

## 3. Cierre

- [x] 3.1 Recorrido `scripts/recorrido/grupo.js` con mouse real sobre el semáforo: Shift suma y quita; mover el grupo y deshacer; Ctrl+A y arrastrar la protoboard (12 asientos, 0,6 px); R con todo (la placa gira, 12 asientos) y dos Ctrl+Z vuelven al inicio; rectángulo sobre la protoboard con los tres LED, sin mover la vista; copiar y pegar (3 piezas nuevas, seleccionadas); Supr y Ctrl+Z; Ctrl+A y Supr deja la placa; la placa sola gira con R y Supr no pregunta por eliminarla. `seleccion`, `s3` y `carga` sin cambios.
- [x] 3.2 Protoboard en el grupo: lo asentado va con ella al mover y al girar, sin moverse dos veces.
- [x] 3.3 `docs/bloquino-prueba-con-el-kit.md`: qué mirar a mano. Imagen de la sala reconstruida: en `http://localhost` la barra de la placa muestra solo «Rotar (R)», Ctrl+A marca las 8 piezas y la placa, y R gira la placa con el grupo.
