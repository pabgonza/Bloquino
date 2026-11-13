# Tasks

## 1. Grupo

- [ ] 1.1 `frontend/src/bloquino/seleccion.ts`: store del grupo (`ids`), sumar o quitar, vaciar, todos; cuentas de mover (piezas, cables internos, sin mover dos veces lo asentado), girar en torno al centro del grupo (generalizar `giroProtoboard.ts`) y copiar con cables internos e ids nuevos.
- [ ] 1.2 Tests de las cuentas y del grupo (`bloquino-seleccion.test.ts`).

## 2. Lienzo

- [ ] 2.1 `SimulatorCanvas.tsx`: Shift + clic suma o quita (la placa también); clic sin tecla deja una sola; clic en fondo o cable vacía el grupo.
- [ ] 2.1b La placa en el grupo: se mueve con él; R, Supr y Ctrl+C la saltan.
- [ ] 2.2 Arrastrar una pieza del grupo mueve todas; un solo comando de deshacer.
- [ ] 2.3 Teclas con grupo: R, Supr, Ctrl+C, Ctrl+V y Ctrl+A, cada una en un solo comando de deshacer; con una pieza, igual que hoy.
- [ ] 2.4 Shift + arrastrar en el fondo: rectángulo (capa propia) que selecciona lo que queda entero dentro; sin tecla sigue moviendo la vista.
- [ ] 2.5 Contorno de selección en cada pieza del grupo.

## 3. Cierre

- [ ] 3.1 Recorrido `scripts/recorrido/grupo.js` con mouse real: los escenarios de la spec. Correr también `seleccion`, `s3` y `carga`.
- [ ] 3.2 Probar con una protoboard en el grupo (lo asentado va con ella, sin moverse dos veces).
- [ ] 3.3 `docs/bloquino-prueba-con-el-kit.md`: qué mirar a mano. Reconstruir la imagen de la sala.
