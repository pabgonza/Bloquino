# Design

## Context

Velxio guarda el sketch en un store Zustand (`useEditorStore`). Su botón Run recompila cuando el contenido cambió (`codeChangedSinceLastCompile`) y carga el `.hex` en `avr8js`. El prototipo escribe el C++ generado con `useEditorStore.getState().setCode(cpp)` y no necesita nada más para simular.

Blockly 13 se distribuye como UMD. Monaco deja un `define` AMD global, y con él presente Blockly se registra en ese cargador y no exporta nada. El prototipo lo resuelve importando Blockly entre `amdOff.ts` y `amdOn.ts`.

## Goals / Non-Goals

**Goals**
- Programas de un solo script que cubren las sesiones 2 a 9 del curso salvo temperatura (h5).
- C++ generado legible, equivalente al de las slides.
- Estructura del generador que h2 pueda extender a corrutinas sin reescribir los bloques.

**Non-Goals**
- Scripts paralelos, eventos de hardware (h2).
- Convertir C++ a bloques.
- Leer los pines desde el circuito dibujado: en el MVP los pines se eligen a mano en el bloque.

## Decisions

### 1. Un generador, dos formas de emitir
Cada bloque se define una sola vez. Su generador no escribe `delay()` directamente: llama a un ayudante del contexto de generación (`ctx.esperar(ms)`, `ctx.esperarHasta(cond)`). En este hito el contexto emite `delay(ms)` y `while (!(cond)) {}`; en h2 un segundo contexto emitirá la cesión de turno. Así el catálogo no se duplica.

### 2. Contexto de generación con contribuciones
El contexto acumula, sin repetidos y en orden de aparición:
- `includes` (`#include <Servo.h>`),
- `globales` (objetos y variables),
- `setup` (líneas de inicialización: `pinMode`, `attach`, `Serial.begin`),
- `tick` (código que debe correr en cada vuelta; vacío en este hito, lo usa h6),
- `funciones` (ayudantes como la lectura del HC-SR04).

Cada bloque declara sus contribuciones al generar. `pinMode` se deduce del uso: salida para LED, PWM y tono; `INPUT_PULLUP` para el bloque de botón; `INPUT` para `leer pin digital`.

### 3. Estructura del programa
- Un solo bloque `al iniciar`. Lo que cuelga de él antes de `por siempre` va a `setup()`; el cuerpo de `por siempre` va a `loop()`.
- Sin `por siempre`, todo va a `setup()` y `loop()` queda vacío.
- Bloques sueltos (sin sombrero) se ignoran y se muestran atenuados.
- Un segundo `al iniciar` no se puede crear en este hito (h2 lo habilita).

### 4. Los bloques son la fuente de verdad
El espacio de trabajo se serializa con `Blockly.serialization.workspaces.save` a un archivo `bloques.json` del grupo de archivos de la placa, marcado como "solo proyecto" (`utils/projectOnlyFiles.ts`) para que no entre a la compilación. `sketch.ino` se regenera en cada cambio. Con un proyecto de bloques, el editor Monaco queda de solo lectura.

### 5. Variables
Todas numéricas, declaradas como `float` globales con el nombre saneado (`mi variable` → `mi_variable`). Los contadores de `repetir` y `contar` son variables locales del bucle.

### 6. Textos de Blockly en español
`blockly/msg/es` se importa dentro de la guarda AMD. Los textos de los bloques propios viven en el sistema i18n existente (`frontend/src/i18n/locales/es/`), en un espacio de nombres `bloques`.

### 7. Pines
- Digitales: desplegable 2 a 13 (0 y 1 se reservan al puerto serie).
- PWM: desplegable 3, 5, 6, 9, 10, 11.
- Analógicos: A0 a A5.

## Risks / Trade-offs

- **Tono con duración**: `tone(pin, f, ms)` no bloquea; el generador clásico agrega `delay(ms)` para que el programa secuencial se comporte como espera un niño. En h2 pasa a ser una espera cooperativa.
- **HC-SR04**: `pulseIn` con tiempo límite de 25 ms (unos 4 m). Sin eco devuelve 0; el bloque devuelve 400 en ese caso para que "lejos" no parezca "pegado".
- **`float` para todo** gasta más memoria que `int`, pero evita explicar tipos. Con el tamaño de los programas del curso no es un problema en un UNO.

## Open Questions

- ¿El LED RGB del kit (KY-016) es de cátodo común? Se asume que sí (nivel alto = encendido). Confirmar con el módulo real.
