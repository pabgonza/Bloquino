# Tasks

## 1. Textos

- [x] 1.1 Claves `editor.*` que faltaban en `es/common2.json` (23) y panel del receptor infrarrojo. «Ver en el osciloscopio» oculto en modo alumno.
  - Con mouse real: el menú del cable muestra «Agregar una unión aquí», los colores y «Eliminar cable»; el panel del receptor, «Dirección», «Código» y «Enviar».
  - La tarjeta de compilación no se alcanzó a ver en la prueba (compila en menos de un segundo): sus textos quedan traducidos sin comprobar en pantalla.

## 2. Teclado

- [x] 2.1 Las teclas del lienzo no actúan con el foco en el panel de programa; un clic en el lienzo recupera el foco.
  - Antes, con mouse real: Ctrl+Z en un bloque quitaba además el cable recién tendido, y Supr y la tecla 2 borraban y recoloreaban el cable seleccionado.
  - Después: solo cambia el bloque. Con clic en el cable, Supr lo borra y Ctrl+Z lo devuelve.
- [x] 2.2 Placa fija con el teclado y en su ficha.
  - Antes: R la giraba 90° y Supr preguntaba «¿Eliminar Arduino Uno?». Después: ninguna de las dos; su ficha no tiene botones y la de un LED conserva Rotar y Eliminar.

## 3. Bloques

- [x] 3.1 `fijar [v] en [n]` y `fijar pin [p] en`.
- [x] 3.2 Sombrero `cuando se suelta botón en pin [p]`: catálogo, generador, test del generador y test de integración (presionar enciende, soltar apaga, 20 ms de antirrebote).

## 4. Cierre

- [x] 4.1 Batería de tests, `scripts/recorrido` completo y reconstrucción de la imagen de la sala.
