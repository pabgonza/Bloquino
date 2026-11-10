# Proposal

## Why

Los niños del curso programan hoy con los bloques de Tinkercad, que trabajan a nivel de pin ("definir pin 13 en ALTA"), no admiten librerías propias y no cargan a la placa. Bloquino necesita su propio editor de bloques, con palabras de niño y un bloque por componente del kit, que genere el mismo Arduino C++ que se enseña en las slides del curso.

El prototipo (`frontend/src/blocks/BlocksPanel.tsx`) ya demuestra el enganche: cuatro bloques generan `setup()`/`loop()`, el botón Run de Velxio compila y el LED parpadea en el simulador. Este hito lo convierte en el editor real para programas de **un solo script**.

## What Changes

- **Editor de bloques** con paleta por categorías (punto de color + nombre, como Tinkercad), en español, con renderer Zelos (aspecto Scratch).
- **Catálogo base** de bloques:
  - Eventos: `al iniciar`.
  - Control: `por siempre`, `esperar [ ] segundos`, `repetir [ ] veces`, `repetir mientras < >`, `contar [i] de [ ] a [ ]`, `si`, `si / si no`, `esperar hasta que < >`, `cronómetro`, `reiniciar cronómetro`.
  - Luces: `encender / apagar LED en pin [ ]`, `brillo del LED en pin [ ] a [ ] %`, `color del LED RGB (pines [ ][ ][ ]) a [color]`.
  - Sonido: `tocar nota [ ] por [ ] segundos en pin [ ]`, `silenciar pin [ ]`.
  - Movimiento: `mover servo en pin [ ] a [ ]°`.
  - Sensores: `¿botón en pin [ ] presionado?`, `perilla en pin [A0]` (0 a 100), `distancia en cm (disparo [ ] eco [ ])`.
  - Operadores y variables: aritmética, comparación, y / o / no, número al azar, `asignar al rango`, `restringir`, variables numéricas (crear, definir, cambiar).
  - Avanzado: `definir pin [ ] en [ALTA/BAJA]`, `definir pin [ ] en [0-255]`, `leer pin digital [ ]`, `leer pin analógico [ ]`, `decir [ ]` (monitor serie), comentario.
- **Generador clásico**: el programa de bloques produce `setup()` / `loop()` con `delay()`, `pinMode` automáticos, `#include` y objetos globales según los bloques usados. El código resultante debe leerse como el de las slides del curso.
- **Los bloques son la fuente de verdad**: se guardan como JSON dentro del proyecto y `sketch.ino` se regenera desde ellos. La pestaña Código es de solo lectura mientras el proyecto sea de bloques.
- **Contrato de contribuciones por bloque**: cada bloque declara qué `#include`, variables globales, líneas de `setup()` y código de "tick" necesita. Es la base del futuro sistema de paquetes (h6).

Fuera de este hito: scripts paralelos y el evento de botón (h2), temperatura y humedad (h5), canciones (h6), LCD / 7 segmentos / infrarrojo / lectura del puerto serie (h8), cambio de distribución de pantalla (h3), "Mis bloques" y listas (fuera del MVP).

## Capabilities

### New Capabilities
- `bloques/editor`: editor visual de bloques integrado en la página del editor, con paleta por categorías, textos en español y persistencia dentro del proyecto.
- `bloques/generador-clasico`: traducción de un programa de un solo script a Arduino C++ con `setup()`, `loop()` y `delay()`.
- `bloques/catalogo-base`: los bloques de Eventos, Control, Luces, Sonido, Movimiento, Sensores, Operadores y variables, y Avanzado, con el código que genera cada uno.

### Modified Capabilities
(ninguna: no hay specs previas)

## Impact

- Código nuevo en `frontend/src/blocks/` (definiciones de bloques, generador, paleta, panel). Se reemplaza el prototipo `BlocksPanel.tsx`.
- `frontend/src/pages/EditorPage.tsx`: se conservan las pestañas Bloques / Código del prototipo (unas 30 líneas).
- `frontend/src/utils/vlxFile.ts` o `projectOnlyFiles.ts`: el JSON de bloques viaja como archivo del proyecto excluido de la compilación.
- Dependencia: `blockly` 13.x (ya instalada). Librería Arduino `Servo` en el backend (viene con el core AVR).
- Tests nuevos en `frontend/src/__tests__/` (vitest): generador con programas de referencia.
- No toca el backend ni el simulador.
