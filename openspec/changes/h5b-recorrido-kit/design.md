# Design

## Context

Lo que se observó al usar la página de alumno con mouse real (Playwright) y al revisar la protoboard de Tinkercad:

- Velxio asienta un componente en la protoboard al soltarlo: sus patitas saltan a los agujeros y cada asiento queda como un cable invisible (`bb`) de la patita al agujero. `breadboardGroupKey()` dice qué agujeros están unidos.
- Los cuadros de pin (`[data-pin-overlay]`, con el nombre del pin en `title`) solo existen en el DOM mientras el mouse está sobre su componente; los de la protoboard no existen cuando el mouse está sobre otro componente.
- El recuadro de cada componente (`.dynamic-component-wrapper`) recibía el mouse en toda su caja, incluido su margen y el nombre de abajo.
- Velxio encuadra el circuito cuando el lienzo se monta o cuando la cantidad de componentes salta en más de dos.
- El inspector de componentes se dibuja fuera de la página (portal a `body`).

## Goals / Non-Goals

**Goals**
- Corregir lo que impide armar un circuito en la protoboard, con CSS y módulos propios.
- Dejar el recorrido de las 10 sesiones como lista de verificación repetible.

**Non-Goals**
- Cables rectos y de color elegido como en Tinkercad: el trazado en ángulos rectos de Velxio sirve.
- Traducir el editor de Velxio que solo ve el profe.

## Decisions

### 1. Tira conectada: capa propia
`bloquino/tiras.ts` escucha `mouseover` en el lienzo. Si el mouse está sobre un cuadro de pin, averigua el agujero (el propio, o el del cable `bb` de esa patita), toma de `pinInfo` de la protoboard todos los agujeros con la misma clave de `breadboardGroupKey()` y dibuja sobre ellos anillos verdes y una franja, en una capa sin eventos de mouse dentro del lienzo. Se borra al salir, al presionar y al hacer zoom.

Alternativa descartada: pintar los cuadros de pin de Velxio. No existen en el DOM cuando el mouse está sobre la patita de otro componente, que es justo uno de los dos casos.

Límite conocido: una protoboard rotada no se resalta bien (las posiciones se calculan sin rotación).

### 2. Solo el dibujo recibe el mouse
CSS de la página de alumno: el recuadro del componente no recibe eventos y su contenedor del dibujo sí. Los clics sobre el dibujo siguen llegando a los manejadores del recuadro, porque los eventos suben por el DOM.

### 3. Sin nombre bajo el componente
Se oculta en la página de alumno, como en Tinkercad: viene en inglés de los metadatos y tapa agujeros. La paleta ya muestra el nombre en español.

### 4. Dónde cae un componente nuevo
La paleta calcula la esquina visible del lienzo a partir de la transformación de `.canvas-world` (paneo y zoom) y usa `pickDropSlot` desde ahí, igual que el selector de Velxio.

### 5. Encuadre al cargar
`PaginaAlumno` monta el lienzo cuando el proyecto guardado ya se restauró, y lo vuelve a montar (con `key`) al abrir un archivo. Así se aprovecha el encuadre que Velxio hace al montar, sin tocar `SimulatorCanvas`.

### 6. Textos
- Aviso de cableado: `WireModeBanner` pasa su botón por `t()` (clave `editor.canvas.touch.cancel`).
- Panel del sensor de distancia: las dos cadenas de `hc-sr04` en `sensorControlConfig.ts` quedan en español; ese registro no pasa por i18n y Bloquino solo se usa en español.
- Inspector: se ocultan por CSS los proyectos de ejemplo, la marca y el enlace de compra (`body:has(.bq-pagina)`, porque el inspector está fuera de la página).

## Risks / Trade-offs

- **Clases de Velxio en el CSS propio** (`.dynamic-component-wrapper`, `.component-label`, `.pid-*`, `.canvas-world`): si Velxio las renombra, los ajustes dejan de aplicarse sin error. Mitigación: el recorrido de verificación los cubre.
- **`:has()`** exige navegadores de 2023 en adelante; los de la sala lo cumplen si están al día.
