# Design

## Context

Cómo simula Velxio el DHT22, que es el punto de partida:

- El protocolo de un hilo es un **modelo de línea** (`simulation/line/models/dht22.ts`) que la placa aloja en su propio reloj: escucha el pin, y cuando el programa baja la línea y la suelta, responde con la trama de 40 bits. Con ese modelo ya funciona la librería de Adafruit, que mide cada pulso contando iteraciones.
- La **parte** (`PartSimulationRegistry`, en `ProtocolParts.ts`) une el componente del lienzo con el modelo: resuelve a qué pin de la placa llega su patita de datos y reenvía los cambios del panel.
- `SINGLE_WIRE_SENSOR_MODELS` (`simulation/sensorModels.ts`) declara qué componentes son dueños de su línea, para que ninguna otra capa (la simulación eléctrica, por ejemplo) maneje ese pin.
- `sensorControlConfig.ts` define los sliders del panel que se abre al hacer clic en un sensor durante la simulación, y ofrece `registerSensorControls()` para agregarlos desde fuera.
- El sistema de cables lee `pinInfo` del elemento del DOM: el componente tiene que ser un Web Component.
- `components-metadata.json` es generado desde `scripts/component-overrides.json`, pero el generador necesita `tsx` y un clon de wokwi-elements, que no están en este entorno.

Decisiones abiertas de proposal.md: librería del curso y lectura cada 2 s, tomadas con su recomendación. Orden de patitas, confirmado por Pablo con el módulo del kit: S / + / −.

## Goals / Non-Goals

**Goals**
- Recorrer el camino completo de un componente nuevo con el mínimo de ediciones en archivos de Velxio, y dejarlo escrito como guía.
- Que el código generado sea el de las slides de la sesión 8.

**Non-Goals**
- LM35 y DHT22 en la paleta del alumno.
- Fallas del sensor real (lecturas NaN, decimales, temperaturas bajo cero).

## Decisions

### 1. Todo lo propio en `frontend/src/bloquino/componentes/`
- `Dht11Element.ts`: Web Component `bloquino-dht11` con el dibujo y `pinInfo`.
- `dht11.ts`: modelo de línea, controles del panel y parte de simulación.

`PaginaEditor.tsx` importa los dos, así existen en modo alumno y en modo profe. La única edición en un archivo de Velxio es la entrada `dht11` en `SINGLE_WIRE_SENSOR_MODELS` (6 líneas): ese registro es una constante sin función de alta.

Alternativa descartada: poner el modelo en `simulation/line/models/` y la parte en `ProtocolParts.ts`, que es la convención de Velxio. Mezcla código de Bloquino en carpetas que se actualizan desde upstream.

### 2. El modelo reutiliza la trama del DHT22
El DHT11 y el DHT22 comparten protocolo y tiempos; solo cambia el contenido de los 5 bytes. El modelo propio llama a `dht22Frame()` de Velxio con la trama del DHT11: humedad entera, 0, temperatura entera, 0 y suma. La lógica de "línea baja y luego suelta" es una copia de unas 20 líneas de la del DHT22, porque allá está dentro de un cierre que no se puede parametrizar sin editar el archivo.

### 3. Valores enteros y rangos del sensor real
Sliders de 0 a 50 °C y de 20 a 90 %, en pasos de 1, que es lo que entrega un DHT11. Parte en 25 °C y 50 %. Textos del panel en español, definidos junto al modelo.

### 4. Dibujo y patitas
SVG propio dentro del elemento: sensor azul con rejilla sobre placa negra, rótulos S, + y − y tres patitas. Convención de tamaño de los elementos de Wokwi: 96 px por pulgada, o sea 9,6 px por cada 0,1 pulgada; las patitas van a 9,6 px entre sí para calzar en columnas vecinas de la protoboard. Nombres de pines: `S`, `VCC` y `GND` (los dos últimos con su señal de alimentación, como en los elementos de Wokwi).

### 5. Metadatos sin el generador
La entrada del componente se agrega a `scripts/component-overrides.json` (`_customComponents`), que es la fuente, y la misma entrada se copia a mano al final de `components-metadata.json`, que es lo que el generador haría con ella. Sin miniatura: la paleta del alumno dibuja el propio elemento a escala.

### 6. Bloques y librería
`temperatura en °C (DHT11 en pin [p])` y `humedad en % (DHT11 en pin [p])` aportan al contexto de generación `#include <DHT.h>`, un global `DHT dht<p>(<p>, DHT11);` y `dht<p>.begin();` en `setup()`, y generan `dht<p>.readTemperature()` / `dht<p>.readHumidity()`.

No hace falta guardar la última lectura en el código generado: la librería ya lo hace (no vuelve a consultar el sensor antes de 2 s y devuelve la lectura anterior). Así el sketch queda igual al de las slides. Cada consulta real bloquea unos 25 ms (20 ms de señal de inicio más la trama); en un programa de varios scripts eso atrasa a los demás una vez cada 2 s, igual que una medición de distancia sin eco.

### 7. Librerías en el backend
`DHT sensor library` 1.4.7 y `Adafruit Unified Sensor` 1.1.15 se instalaron en el contenedor de desarrollo con `arduino-cli lib install`. Como `Servo`, se pierden si el contenedor se recrea: sigue abierta la pregunta de h1 sobre cómo llegan las librerías del kit a un backend desplegado.

### 8. Guía
`docs/bloquino-agregar-componente.md`: los pasos de este hito como receta, con los archivos que se tocan y cómo verificar cada uno.

## Risks / Trade-offs

- **Copia de la lógica del modelo DHT22**: si Velxio corrige esa lógica, la copia no se entera. Mitigación: es corta y el test de punta a punta (compilar con la librería real y leer el valor) la cubre.
- **`components-metadata.json` editado a mano**: quien regenere con el generador obtiene lo mismo, porque la entrada está en el archivo de overrides.
- **Dibujo no comparado con el módulo físico**: las medidas salen del tipo KY-015, no de medir el del kit.
