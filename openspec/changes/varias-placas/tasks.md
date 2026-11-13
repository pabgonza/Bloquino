# Tasks

> Deseable, etapa posterior. Empezar después de archivar `seleccion-multiple`.

## 1. Placas en el lienzo

- [x] 1.1 `PaginaAlumno.tsx`: dejar de quitar la segunda placa.
- [x] 1.2 Copiar y borrar la placa en la página de alumno: quitar los bloqueos de `SimulatorCanvas.tsx` (marca `Bloquino:` de la placa) y de `alumno.css`; confirmación en español al borrar (Supr, barra, ficha) con los textos en `bloquino.json`.
- [x] 1.3 Ctrl+Z de borrar una placa devuelve la placa, su grupo de archivos y sus cables (revisar el comando de Velxio; si no guarda el programa, uno propio).
- [x] 1.4 Numeración «Placa N» sin repetir (menor número libre) al agregar, pegar y abrir; visible en la placa y en el selector.
- [x] 1.5 Paleta: tarjeta «Arduino UNO» que agrega una placa con el programa inicial, sin encimarse (como las demás piezas).
- [x] 1.6 `seleccion.ts`: Supr y Ctrl+C/Ctrl+V del grupo incluyen placas (con su programa y los cables entre piezas copiadas, también de placa a placa); confirmación si hay placas; fotos de deshacer con el grupo de archivos.

## 2. Programa, simulación y carga

- [x] 2.1 `PanelPrograma.tsx`: selector «N (Arduino UNO)» con dos o más placas; elegir cambia la placa activa (`setActiveBoardId`) y la marca en el lienzo; clic en una placa la elige.
- [x] 2.2 Sin placas: aviso en el panel, en Iniciar simulación y en Cargar a la placa.
- [x] 2.3 Iniciar simulación compila y arranca todas las placas; Detener las detiene todas (revisar `EditorToolbar.handleRun` de Velxio).
- [x] 2.4 Monitor serie de la placa elegida.
- [x] 2.5 `flash/cargar.ts`: carga de la placa elegida, «Placa N» en el avance, puerto recordado por placa.
- [x] 2.6 `proyecto.ts` (`abrir`): una o más placas UNO, o ninguna; rechaza si alguna no es UNO.

## 3. Pruebas y cierre

- [x] 3.1 Tests: proyecto con dos placas (ida y vuelta del archivo), numeración, selección con placas, carga por placa (placa simulada).
- [x] 3.2 Ejemplo de dos placas en `frontend/public/ejemplos/` (una le avisa a otra por un pin) y actualizar `bloquino-ejemplos.test.ts`.
- [x] 3.3 Recorrido `scripts/recorrido/placas.js` con mouse real: los escenarios de las specs.
- [x] 3.4 Medir la simulación con dos y tres placas con la CPU frenada (como en `docs/bloquino-prueba-con-el-kit.md`).
- [x] 3.5 Guía de la clase y `docs/bloquino-prueba-con-el-kit.md` si cambian; reconstruir la imagen de la sala.
