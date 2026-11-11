# Proposal

## Why

En Arduino, hacer parpadear un LED y atender un botón al mismo tiempo es difícil: mientras el programa está en `delay()`, el botón no se lee. Resolverlo a mano exige `millis()` y máquinas de estado, fuera del alcance de un niño de 9 a 12 años. Scratch lo resuelve con varios scripts que corren a la vez; ninguna de las herramientas revisadas (Tinkercad, mBlock, PictoBlox) lo ofrece sobre un UNO. Es el diferencial de Bloquino.

## What Changes

- **Varios scripts**: se permiten varios bloques sombrero en el área de trabajo y todos corren a la vez.
- **Evento de hardware**: `cuando se presiona botón en pin [ ]` (con antirrebote), además de `al iniciar`.
- **Generador de corrutinas**: cada script se compila a una corrutina cooperativa sin pila propia. `esperar` y `esperar hasta que` ceden el turno en vez de bloquear; un `por siempre` sin esperas cede al final de cada vuelta. Tope de 8 scripts.
- **Dos modos de generación**: con un solo script `al iniciar` se mantiene el C++ clásico de h1 (`setup` / `loop` / `delay`); con más de un script, o con un evento de hardware, se genera C++ con corrutinas, visible en la vista Código y marcado como "avanzado".
- **Comunicación entre scripts** por variables compartidas (las variables de h1 ya son globales).
- **Tick de librerías**: el planificador llama en cada vuelta el código de "tick" que declaren los bloques (lo usa h6 para la música).

Fuera de este hito: mensajes `enviar` / `al recibir`, "Mis bloques", prioridades entre scripts.

## Capabilities

### New Capabilities
- `bloques/scripts-paralelos`: varios scripts con sombrero que avanzan de forma intercalada, y las reglas de cesión de turno.
- `bloques/eventos-hardware`: sombrero `cuando se presiona botón en pin [ ]`.
- `bloques/generador-corrutinas`: traducción de un programa de varios scripts a C++ con un planificador cooperativo.

### Modified Capabilities
- `bloques/generador-clasico`: se define cuándo aplica (un solo script `al iniciar`) y cuándo cede el paso al generador de corrutinas.
- `bloques/catalogo-base`: `tocar nota` y `distancia en cm` pasan a ser cooperativos en modo corrutinas.

## Impact

- `frontend/src/blocks/generador/`: segundo contexto de generación y un pequeño runtime en C++ que se emite dentro del sketch (sin dependencia de librerías externas).
- `frontend/src/blocks/catalogo/`: sombrero de botón.
- Tests nuevos: golden tests del C++ de corrutinas y pruebas de comportamiento con el harness AVR existente (`frontend/src/__tests__/helpers/avrTestHarness.ts`): LED que parpadea mientras un botón conmuta otro LED sin perder pulsaciones.
- No toca backend ni simulador.

## Decisiones abiertas (para design.md)

1. **Forma de la corrutina**: macros propias al estilo protothreads (`switch` + etiqueta por punto de espera, unas 30 líneas) frente a una librería (AceRoutine). Recomendación: macros propias, emitidas en el sketch, para que el código visible sea autocontenido.
2. **Variables locales**: una corrutina sin pila no conserva variables locales entre cesiones; los contadores de `repetir` y `contar` deben ser estáticos por script.
3. **Evento reentrante**: si el botón se presiona mientras su script aún corre, ¿se ignora o se reinicia el script (como Scratch)? Recomendación: ignorar.
4. **Bloques que tardan**: `pulseIn` del HC-SR04 bloquea hasta 25 ms; aceptable. `tocar nota por n segundos` pasa a `tone()` + espera cooperativa.
5. **Memoria**: medir RAM y flash de un programa de 8 scripts en un UNO (2 KB de RAM) y fijar el tope real.
