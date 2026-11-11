# Bloquino: cómo agregar un componente

Receta sacada del primer componente propio, el módulo DHT11 (hito h5). Sirve
para un sensor u otro componente que Velxio no trae. Todo lo propio vive en
`frontend/src/bloquino/componentes/`; en archivos de Velxio solo se agregan
entradas a sus registros.

## 1. El dibujo: un Web Component con `pinInfo`

Archivo de ejemplo: `frontend/src/bloquino/componentes/Dht11Element.ts`.

- Tiene que ser un elemento del DOM (`class X extends HTMLElement`), no un
  componente de React: el sistema de cables lee `elemento.pinInfo` para saber
  dónde termina cada cable. Sin `pinInfo`, los cables se pegan a la esquina.
- `pinInfo` es una lista de `{ name, x, y, number, signals }`, con `x` e `y` en
  píxeles CSS desde la esquina superior izquierda del elemento, en la **punta**
  de cada patita. Las patitas de alimentación llevan
  `signals: [{ type: 'power', signal: 'VCC' | 'GND' }]`.
- Tamaño: 96 px por pulgada, o sea **9,6 px por cada 0,1 pulgada**, igual que
  los elementos de Wokwi. Las patitas que van a la protoboard se separan
  9,6 px (o un múltiplo).
- El dibujo es un SVG dentro del shadow DOM. Rotula las patitas como el
  componente real.
- Los valores que cambian durante la simulación (temperatura, distancia) son
  propiedades del elemento con el mismo nombre que usará el panel de sliders.
- Registro: `customElements.define('bloquino-<nombre>', Clase)`, protegido con
  `customElements.get` para que una recarga en caliente no falle.

## 2. Los metadatos

El lienzo y la paleta conocen los componentes por
`frontend/public/components-metadata.json`, que es **generado**. La fuente de
los componentes propios es `scripts/component-overrides.json`, arreglo
`_customComponents`:

```json
{
  "id": "dht11",
  "tagName": "bloquino-dht11",
  "name": "DHT11",
  "category": "sensors",
  "thumbnail": "",
  "properties": [],
  "defaultValues": {},
  "pinCount": 3,
  "tags": ["dht11", "temperatura", "humedad"]
}
```

Después se regenera con `npm run generate:metadata` desde `frontend/`. Ese
script necesita `tsx` y un clon de wokwi-elements en `third-party/`; si no
están, se copia la misma entrada al final de `components` en
`components-metadata.json`, que es exactamente lo que haría el generador.

Sin `thumbnail`, la paleta del alumno dibuja el propio elemento a escala.

## 3. La paleta del alumno

Agregar el `id` con su nombre en español en
`frontend/src/i18n/locales/es/bloquino.json` → `kit`. El orden de esa lista es
el orden de la paleta. Actualizar la lista esperada en
`frontend/src/__tests__/bloquino-interfaz.test.ts`.

## 4. La simulación

Archivo de ejemplo: `frontend/src/bloquino/componentes/dht11.ts`. Depende de
qué hace el componente:

- **Salida simple** (un LED, un zumbador): la parte escucha el pin y cambia una
  propiedad del elemento. Ver `simulation/parts/BasicParts.ts`.
- **Entrada simple** (un botón, un interruptor): la parte escribe el nivel del
  pin con `simulator.setPinState`.
- **Sensor con protocolo de tiempos** (DHT11, HC-SR04, receptor infrarrojo):
  tres piezas.
  1. Un **modelo de línea** (`registerLineModel('<tipo>', …)`): recibe los
     cambios del pin y devuelve la respuesta como una lista de flancos con su
     instante en ciclos de CPU. Corre en el reloj de la placa, por eso
     funciona con librerías que miden pulsos.
  2. Una **parte** (`PartSimulationRegistry.register('<id>', …)`): con
     `getPin('<patita>')` averigua a qué pin de la placa llega la patita de
     datos (siguiendo cables y protoboard) y pide la línea con `requestLine`.
     Si la patita no está cableada, no hace nada.
  3. Una entrada en `SINGLE_WIRE_SENSOR_MODELS`
     (`frontend/src/simulation/sensorModels.ts`): declara que el componente es
     dueño de ese pin, para que la simulación eléctrica no lo maneje a la vez.
     Es la única edición en un archivo de Velxio.
- **Sliders durante la simulación**: `registerSensorControls({ <id>: … })` con
  título, etiquetas en español, rango, paso y valor inicial. La parte recibe
  los cambios con `registerSensorUpdate`. El panel se abre al hacer clic en el
  componente mientras la simulación corre.

Los dos archivos del componente se importan en
`frontend/src/bloquino/PaginaEditor.tsx`, para que existan en modo alumno y en
modo profe.

## 5. Los bloques

- Definición: `frontend/src/blocks/catalogo/<categoría>.ts` (el bloque y su
  lugar en la paleta de bloques).
- Texto: `frontend/src/i18n/locales/es/bloques.json`, clave `AB_<NOMBRE>`.
- Código: `frontend/src/blocks/generador/bloques.ts`. Un bloque no escribe
  `#include` ni `setup()`: aporta al contexto (`gen.ctx.includes`,
  `gen.ctx.globales`, `gen.ctx.setup`) y devuelve solo su línea o su
  expresión. Los conjuntos no repiten, así que diez bloques del mismo sensor
  declaran un solo objeto.
- Si el bloque espera o tarda, usar `gen.ctx.esperar` en vez de `delay()`, para
  que funcione con varios scripts a la vez. Si la librería bloquea (el DHT11
  bloquea unos 25 ms por lectura), dejarlo anotado en la spec.

## 6. La librería de Arduino

Si el código generado usa una librería, tiene que estar instalada en el
backend que compila:

```
docker exec velxio-spike arduino-cli lib install "DHT sensor library" "Adafruit Unified Sensor"
```

Se pierde si el contenedor se recrea. Usar la misma librería que las slides del
curso, para que el código generado coincida con ellas.

## 7. Verificar

1. **Generador**: test en `bloques-generador.test.ts` y un programa de
   referencia en `__tests__/fixtures/bloques/` (JSON de bloques y `.ino`
   esperado).
2. **De punta a punta**: como `bloques-dht11.integration.test.ts`. Genera el
   programa desde bloques, lo compila en el backend, carga el `.hex` en
   `AVRSimulator`, conecta el modelo con `sim.lineHub().attach(…)`, avanza con
   `sim.step()` y lee el monitor serie con `sim.onSerialData`. Corre con
   `RUN_BLOQUES_COMPILE=1 npx vitest run src/__tests__/bloques-`.
3. **En el navegador**: agregar el componente desde la paleta, comprobar que
   los cables terminan en la punta de las patitas (no en la esquina), simular
   un programa hecho con bloques y mover los sliders.
