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

### 7. Cómo salen los componentes de la paleta
`PaletaComponentes` aplica ajustes propios al crear el componente: la resistencia sale de 220 Ω y el botón girado 90°. El pulsador de Velxio tiene las patitas de un lado a 2 filas y el canal de la protoboard pide 3; girado, sus patitas quedan en las filas c y h, a caballo del canal, que es como lo dibuja el curso.

### 8. Fallos del simulador encontrados en el recorrido
Se corrigen en los archivos de Velxio con el cambio más chico posible, marcado con un comentario `Bloquino:`, y cada uno con su test:
- **Tiempo** (`AVRSimulator.ts`): el cuadro ejecutaba N instrucciones contándolas como N ciclos; ahora corre hasta completar los ciclos del cuadro.
- **Buzzer** (`ComplexParts.ts`): `tone()` conmuta el pin desde una interrupción, sin PWM. Cada flanco de subida lee la frecuencia del Timer2 y, si cambió, empieza una nota; un vigía corta la nota cuando el pin deja de conmutar. El audio se abre al conectar el buzzer. La señal puede venir de cualquiera de las dos patitas.
- **Botón al arrancar** (`NetlistBuilder.ts`, `connectDigitalInputsToMcu.ts`): el netlist deja una marca `pull:<placa>:<pin>` en `sourcedNets` por cada pin cuyo pull interno incluye; el conector descarta el resultado de un netlist anterior a que el programa activara el pull. Se usa `sourcedNets` porque ya viaja del netlist al conector; un campo propio habría tocado cinco archivos.
- **Servo** (`ComplexParts.ts`): margen de 100 µs alrededor de 544-2400 µs y recorte a 0-180°.

### 9. Componente nuevo sin tapar a otro
Los metadatos no traen el tamaño de un componente. `agregar` lo deja en la esquina, como antes, y dos cuadros después, ya dibujado, lo mide: si su caja toca la de otro componente o la de la placa, lo pasa al primer lugar libre del lienzo visible, de arriba abajo. La caja es la mayor entre la del elemento y las de sus dibujos internos (la de la perilla mide de menos).

### 10. Inspector para el alumno
`kit.ts` adapta los metadatos del kit al cargar la paleta (solo existe en la página de alumno): nombre en español y, editables, solo las propiedades de `bloquino.json → propiedades` (color del LED y del botón, ohmios de la resistencia), con sus opciones traducidas. El inspector de Velxio gana una línea: muestra `optionLabels` cuando la propiedad lo trae. La categoría, las pestañas y los valores internos se ocultan por CSS.

### 11. Revisión del circuito
`CircuitVerificationModal` pasa sus textos por i18n (`editor.verify.*`) con el inglés de respaldo. Cada código de problema tiene un texto en español en `codes.<código>`; con texto propio no se muestra el identificador del componente. La franja de error de la página deja fuera los registros `circuit-check`.

### 12. Placa única
La barra de edición de la placa se oculta por CSS y la página quita cualquier placa que aparezca de más (pegar con el teclado). Eliminar la placa con Supr sigue pidiendo confirmación.

### 13. Tiras con la protoboard girada
Los puntos se calculan desde el centro de la caja de la protoboard, con el zoom del lienzo y el ángulo de `properties.rotation`.

## Risks / Trade-offs

- **Clases de Velxio en el CSS propio** (`.dynamic-component-wrapper`, `.component-label`, `.pid-*`, `.canvas-world`): si Velxio las renombra, los ajustes dejan de aplicarse sin error. Mitigación: el recorrido de verificación los cubre.
- **`:has()`** exige navegadores de 2023 en adelante; los de la sala lo cumplen si están al día.
- **Arreglos dentro de archivos de Velxio**: al traer cambios de `upstream` pueden chocar. Mitigación: son pocos, están marcados con `Bloquino:` y cada uno tiene un test que falla si se pierde.
