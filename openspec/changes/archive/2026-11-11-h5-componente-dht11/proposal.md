# Proposal

## Why

La sesión 8 del curso mide temperatura y humedad con el **DHT11 en módulo** que trae el kit. Velxio simula el DHT22 pero no el DHT11, y no hay bloques para ninguno. Además, este es el primer componente que Bloquino agrega por su cuenta: sirve para recorrer y documentar el camino completo de un componente nuevo (dibujo, pines, simulación, bloque y librería), que después se repetirá con hardware propio.

## What Changes

- **Componente DHT11** en la paleta: módulo de 3 pines (señal, VCC, GND) con el aspecto del módulo del kit, cableable en el lienzo.
- **Simulación**: responde al protocolo de un hilo del DHT11 con la temperatura y la humedad que el alumno ajusta en el componente durante la simulación.
- **Bloques** en Sensores: `temperatura en °C (DHT11 en pin [ ])` y `humedad en % (DHT11 en pin [ ])`.
- **Librería Arduino** para leer el sensor, instalada en el backend, declarada por los bloques como contribución (`#include`, objeto global, inicialización).
- **Guía "cómo agregar un componente"** en `docs/` del repo, escrita a partir de lo aprendido.

Fuera de este hito: LM35 analógico (también viene en el kit; candidato posterior), DHT22 en la paleta del alumno.

## Capabilities

### New Capabilities
- `componentes/dht11`: representación, pines y simulación del módulo DHT11.
- `bloques/temperatura-humedad`: bloques de lectura de temperatura y humedad.

### Modified Capabilities
- `bloques/catalogo-base`: la categoría Sensores gana los dos bloques nuevos.

## Impact

- Web Component nuevo con getter `pinInfo` (requisito del sistema de cables de Velxio), por ejemplo en `frontend/src/velxio-elements/` o una carpeta propia de Bloquino.
- Metadatos en `scripts/component-overrides.json` → `_customComponents`, y regenerar `components-metadata.json` con `npm run generate:metadata`.
- Lógica de simulación registrada con `PartSimulationRegistry.register('dht11', …)`, reutilizando la del DHT22 (`frontend/src/simulation/parts/ProtocolParts.ts`, registro `dht22`) con la codificación de datos del DHT11.
- Backend: instalar la librería del sensor en la imagen o en el volumen de librerías de `arduino-cli`.
- Tests: test de la parte con el harness AVR (un sketch que lee el sensor recibe los valores configurados) y golden tests de los bloques.

## Decisiones abiertas (para design.md)

1. **Librería**: `DHT sensor library` de Adafruit (la que usa el curso, requiere `Adafruit Unified Sensor`) frente a una más liviana. Recomendación: la del curso, para que el código generado coincida con las slides.
2. **Lectura lenta**: el DHT11 admite una lectura cada 1 a 2 segundos y cada lectura bloquea unos 25 ms. El bloque debe guardar la última lectura y renovarla como máximo cada 2 segundos, para no frenar los scripts paralelos de h2.
3. **Orden de pines del módulo**: confirmar con el módulo real del kit (señal a la izquierda o a la derecha) antes de dibujarlo.
4. **Dibujo**: SVG propio. Definir la convención de tamaño (píxeles por 0,1 pulgada) que usan los elementos de Wokwi para que calce con la protoboard.
