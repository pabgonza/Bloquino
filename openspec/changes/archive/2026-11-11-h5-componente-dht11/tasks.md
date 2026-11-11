# Tasks

Entorno: backend en el contenedor Docker del puerto 3080; frontend con `npx vite` desde `frontend/`. Tests: `npx vitest run <archivo>` desde `frontend/`; los que compilan, con `RUN_BLOQUES_COMPILE=1`.

## 1. Simulación

- [x] 1.1 Instalar `DHT sensor library` y `Adafruit Unified Sensor` en el contenedor (con permiso de Pablo).
  - Instaladas: DHT sensor library 1.4.7 y Adafruit Unified Sensor 1.1.15.
- [x] 1.2 `bloquino/componentes/dht11.ts`: modelo de línea con la trama del DHT11, controles del panel (0–50 °C, 20–90 %) y parte de simulación. Entrada `dht11` en `SINGLE_WIRE_SENSOR_MODELS`. Test vitest: trama, parte con y sin cable de datos, controles y dueño de la línea.
- [x] 1.3 Test de punta a punta con la librería real: lectura inicial, cambio de valor a los 2 s, parpadeo paralelo y alarma de fiebre.
  - 23 °C / 61 % configurados se leen como `23.00` y `61.00`; con un parpadeo paralelo de 0,1 s, ningún periodo pasa de 130 ms y a lo más 3 en 5 s se atrasan.

## 2. Componente

- [x] 2.1 `bloquino/componentes/Dht11Element.ts`: Web Component con el dibujo del módulo y `pinInfo` (S, VCC, GND a 9,6 px). Importado desde `PaginaEditor`.
- [x] 2.2 Metadatos en `scripts/component-overrides.json` y la misma entrada en `components-metadata.json`; `dht11` en el kit de la paleta. Actualizar el test de la paleta.
  - El generador no se pudo correr (falta `tsx` y el clon de wokwi-elements): la entrada se copió a mano, igual a como la inyecta el generador.
- [x] 2.3 Verificar en el navegador: agregar desde la paleta, cablear al pin 2, simular y mover los valores.
  - Verificado a 1366 × 768: aparece como "Temperatura y humedad", los cables terminan en la punta de las patitas, el programa de bloques lee 25.00 / 50.00 y, tras cambiar el sensor, 31.00 / 77.00.
  - El panel se abre con un clic real sobre el módulo durante la simulación, con título DHT11 y sliders Temperatura y Humedad en español.
  - Los cables se crearon por código, no arrastrando con el mouse. Los valores se cambiaron por el mismo canal que usa el panel; no se arrastró el slider.
  - El panel del navegador estaba oculto y no avanzaba la simulación sola: se avanzó paso a paso desde la consola, con el simulador real de la página.
  - No se probó sobre la protoboard ni se comparó el dibujo con el módulo físico.
  - Con el panel de programa abierto, el componente recién agregado queda tapado por el panel (ya pasaba con el LED inicial).

## 3. Bloques

- [x] 3.1 Bloques `temperatura en °C` y `humedad en %` en Sensores, con su generador (include, objeto global por pin, `begin()` y lecturas). Test del generador y programa de referencia `alarma-fiebre`.
  - El `.ino` de referencia compila en el backend junto a los demás.

## 4. Guía y cierre

- [x] 4.1 `docs/bloquino-agregar-componente.md`.
- [x] 4.2 `openspec validate h5-componente-dht11 --strict` y tests de bloques e interfaz en verde.
