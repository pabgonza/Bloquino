# Design

## Context

- El lienzo de Velxio escucha el teclado en `window` con dos manejadores (componentes y placa; cables) que solo se abstienen si el destino es un campo de texto. La página de alumno tiene el suyo para Ctrl+Z y Ctrl+Y.
- Blockly maneja sus teclas en su propio elemento, antes de que el evento llegue a `window`. Al borrar un bloque con Supr, el elemento que tenía el foco ya no está en el documento cuando el evento sube.
- Un clic en el lienzo (SVG) no mueve el foco del navegador: después de usar los bloques, el foco seguía en el panel de programa.
- El texto de cada bloque sale de `i18n/locales/es/bloques.json`; el tipo del bloque (`variables_set`, `ab_pin_digital`) no cambia.

## Decisions

### 1. Las teclas son del panel que tiene el foco
Los tres manejadores miran el camino del evento (`composedPath()`) y no actúan si pasa por `.bq-programa`. Se usa el camino y no `target.closest()` porque el bloque borrado ya no tiene ancestros. En `SimulatorCanvas.tsx` son dos líneas iguales, marcadas `Bloquino:`.

La página de alumno quita el foco del elemento activo al presionar el mouse sobre el lienzo (`onPointerDownCapture`), para que el teclado vuelva al circuito.

### 2. Placa fija
En el manejador de teclado del lienzo, la placa seleccionada no cuenta si la página es la de alumno (`document.querySelector('.bq-pagina')`, el mismo criterio que usa `alumno.css`). La ficha de la placa (la que muestra un elemento con `board-kind`) oculta sus botones de acción por CSS.

### 3. Sombrero al soltar
`ab_cuando_suelta` comparte el armado del de presionar: espera el nivel bajo, 20 ms, y el nivel alto, 20 ms; la diferencia es que el cuerpo corre después de la segunda espera y no entre las dos. Un mismo pin puede tener los dos sombreros: cada programa lleva su propio estado.

Son dos eventos, no tres: «presionar y soltar» es lo mismo que «soltar», porque no se puede soltar sin haber presionado.

### 4. Verbo «fijar»
`fijar [v] en [n]`, parecido al «fijar … a» de Scratch en español latino y pareja del `cambiar [v] por [n]` que ya existe. Se aplica también a `fijar pin [p] en`, que tenía el mismo verbo y la misma forma.

### 5. Textos
Las 23 claves `editor.*` que faltaban en `es/common2.json` (menú del cable, tarjeta de compilación, selector de componentes). Las 51 de la herramienta de imagen a código de Velxio quedan en inglés: no es parte del curso. El panel del receptor infrarrojo se traduce en `sensorControlConfig.ts`, como ya se hizo con el del sensor de distancia.

## Risks / Trade-offs

- Un componente no se borra con clic y Supr (ya era así antes de este cambio): se borra desde su ficha. Queda anotado, sin tocar.
- Los tres toques en `SimulatorCanvas.tsx` hay que revisarlos al traer cambios de Velxio.
