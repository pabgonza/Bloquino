# Proposal

## Why

Al revisar la interfaz después de h9 aparecieron fallos y pedidos de Pablo que no pertenecen a un hito:

- Textos en inglés que ve el alumno: el menú de clic derecho de un cable, la tarjeta de progreso de la compilación y el panel del receptor infrarrojo.
- El teclado del lienzo actuaba con el foco en los bloques: Ctrl+Z deshacía además el último cambio del circuito, y Supr o una tecla de color afectaban al cable seleccionado.
- La placa, que la spec quiere fija, se podía girar con R y eliminar con Supr o desde su ficha.
- «definir [variable] en» se entiende como crear la variable. Pablo eligió «fijar».
- Faltaba el evento del botón al soltarlo.

## What Changes

- Traducción de las claves del editor que faltaban en español y del panel del receptor infrarrojo. «Ver en el osciloscopio» no se muestra en modo alumno, que no tiene osciloscopio.
- Las teclas del lienzo (Supr, R, colores de cable, copiar y pegar, deshacer) no actúan cuando el foco está en el panel de programa, y un clic en el lienzo le devuelve el foco.
- En la página de alumno la placa no responde a R, Supr ni Ctrl+C, y su ficha no ofrece acciones.
- `fijar [v] en [n]` para variables de número y de texto, y `fijar pin [p] en` en Avanzado.
- Sombrero `cuando se suelta botón en pin [p]`, con el mismo antirrebote del de presionar.

## Capabilities

### Modified Capabilities
- `bloques/eventos-hardware`: sombrero al soltar.
- `bloques/catalogo-base` y `bloques/texto`: verbo «fijar».
- `interfaz/modo-alumno`: placa fija también con teclado y ficha; teclado según el foco.
- `interfaz/identidad`: menús y avisos del lienzo en español.

## Impact

- `frontend/src/i18n/locales/es/common2.json` y `bloques.json`; `simulation/sensorControlConfig.ts`.
- `components/simulator/SimulatorCanvas.tsx` (tres toques marcados `Bloquino:`), `bloquino/PaginaAlumno.tsx`, `bloquino/alumno.css`.
- `blocks/catalogo/eventos.ts`, `blocks/generador/index.ts`.
- Los proyectos guardados no cambian: los tipos de bloque son los mismos; solo cambia el texto.
