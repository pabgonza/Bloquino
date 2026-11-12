# Design

## Context

- Un proyecto guardado es el JSON de «Descargar»: placa, componentes con su posición, cables con sus esquinas, `sketch.ino` y `bloques.json`.
- Velxio traza cada cable nuevo esquivando componentes, pero los cruces entre cables le cuestan poco y aparecen en cuanto el circuito crece.
- Los pines digitales están en el borde de arriba de la placa; 5V, tierra y las entradas analógicas, en el de abajo.

## Decisions

### 1. Doce ejemplos, uno por tema
Parpadeo, semáforo, botones, rockola, perilla mágica, barrera, estación del tiempo, lámpara de colores, control y dígito, marcador, reflejos y bloques de pin. Programas cortos, que sirven de documentación. La tabla completa está en `docs/bloquino-ejemplos.md`.

### 2. Carriles
Los componentes van arriba de la placa, en la protoboard o sueltos. Cada cable a un pin de arriba baja recto, corre por un carril horizontal propio entre la protoboard y la placa y baja al pin. El orden de los componentes de izquierda a derecha es el de sus pines, y los pines se eligen para eso: así el reparto de carriles siempre tiene solución sin cruces. Los cables a 5V y a las entradas analógicas bajan por un costado de la placa y entran por debajo, anidados.

Las esquinas se fijaron al armar cada circuito (los cables se tienden con el mouse y después se ordenan); quedan guardadas en el archivo. El armado es de una sola vez: no queda un generador de ejemplos en el repositorio.

### 3. Lo que no calza con la regla
- **Pantalla LCD**: RW va a tierra y está entre RS y E. Un cruce, declarado en el test.
- **LCD, receptor infrarrojo y displays** no asientan en la protoboard: van sueltos. La protoboard chica queda como punto común de tierra en el ejemplo 09.
- **LED RGB**: sus tres resistencias cruzan el canal de la protoboard y el cátodo común baja por un puente entre ellas.
- **Botón con resistencia externa** (ejemplo 12): la de 10 kΩ va del riel − de arriba a la columna del botón, y un puente une los dos rieles −.

### 4. Cómo se cuidan
- `bloquino-ejemplos.test.ts`: abre cada archivo, regenera el sketch desde `bloques.json` y lo compara con el que trae; cuenta cruces y cables montados con la misma geometría que dibuja la página (`getRenderedPoints`); exige que cada bloque de la paleta y cada componente del kit aparezca en algún ejemplo. Con el backend, compila los doce.
- `scripts/recorrido/ejemplos.js`: abre cada uno con «Abrir», simula e interactúa. El monitor serie se lee y se escribe por el store, porque con el panel de programa abierto el lienzo queda angosto para apretar botones.

## Risks / Trade-offs

- Un cambio en el generador deja viejos los sketches guardados: el test lo avisa y hay que volver a descargarlos.
- Los pines de varios ejemplos no son los que el bloque trae por defecto; cada programa lleva su bloque `preparar` o sus pines elegidos.
