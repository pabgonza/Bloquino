# Tasks

Entorno: backend en el contenedor Docker del puerto 3080; frontend con `npx vite` desde `frontend/`. Tests: `npx vitest run <archivo>` desde `frontend/`; los que compilan contra el backend corren con `RUN_BLOQUES_COMPILE=1`.

## 1. Generador de corrutinas

- [x] 1.1 Extender el contexto de generación con `contador`, `vuelta` y `locales`, y agregar el contexto de corrutinas (`ESPERAR`, `ESPERAR_HASTA`, `CEDER`, contadores estáticos). Verificar que los tests de h1 (`bloques-generador`, `bloques-referencia`) siguen pasando sin cambiar ningún `.ino` esperado.
- [x] 1.2 Selección del modo y armado de corrutinas: macros del planificador, una función `programaN()` por script en orden de posición, `loop()` con tick y llamadas, primera línea con la marca de avanzado. Tests vitest: dos `al iniciar` generan corrutinas sin `delay()` ni `#include`; un solo `al iniciar` con bloques sueltos sigue clásico.
- [x] 1.3 Cesión al final de cada vuelta de `por siempre` y `repetir mientras`, y script que termina. Tests vitest del código generado para cada caso.
- [x] 1.4 Contadores de `repetir` y `contar` estáticos por script. Test vitest: `repetir` con esperas declara `static int vez;` y el `for` no declara la variable.

## 2. Catálogo y editor

- [x] 2.1 Sombrero `cuando se presiona botón en pin [p]` en Eventos, con texto en `i18n/locales/es/bloques.json` y su armado con antirrebote. Test vitest: genera `pinMode(p, INPUT_PULLUP);`, las dos esperas de 20 ms y el `while (true)` que lo repite.
- [x] 2.2 Permitir varios sombreros con tope de 8 en total. Verificar en el navegador: se pueden poner dos `al iniciar`, y con 8 sombreros los de la paleta quedan deshabilitados.
- [x] 2.3 `tocar nota` cooperativo en corrutinas. Test vitest: `tone(8, 440, 500);` seguido de `ESPERAR(500);`.

## 3. Comportamiento

- [x] 3.1 Programas de referencia en `frontend/src/__tests__/fixtures/bloques/`: `dos-parpadeos`, `parpadeo-boton` y `ocho-scripts`, como JSON de bloques con su `.ino` esperado. El test de referencia de h1 los genera y compara.
- [x] 3.2 Test de comportamiento (con `RUN_BLOQUES_COMPILE=1`) que compila contra el backend y corre el `.hex` en `helpers/avrTestHarness.ts`: dos parpadeos a su ritmo; parpadeo + botón con 5 pulsaciones → 5 cambios; rebote de 5 ms → una ejecución; pulsación durante un script largo → se ignora; `repetir 3 veces` con esperas enciende 3 veces.
  - `bloques-corrutinas.integration.test.ts`: 11 casos en verde (además: mantener presionado, `por siempre` sin esperas, script que termina, `tocar nota`, distancia sin eco, memoria).
- [x] 3.3 Medir RAM y flash de `ocho-scripts` con la salida del compilador y anotarlas en design.md (decisión 7). Verificar que las variables globales usan menos de 1024 bytes.
  - 57 bytes de RAM (2 %) y 2558 bytes de flash (7 %).
- [x] 3.4 Probar en el simulador del navegador, con su circuito: parpadeo + botón. Anotar aquí cualquier diferencia entre lo simulado y lo esperado.
  - Botón entre pin 2 y GND, LED en 13 y LED en 12: el pin 13 cambia cada 499 a 501 ms de tiempo simulado mientras 4 pulsaciones de 80 ms conmutan el pin 12 cuatro veces. Sin diferencias.

## 4. Cierre

- [x] 4.1 `npx vitest run` completo: sin fallos nuevos respecto de los 15 del entorno Windows anotados en h1.
  - 6083 pasan y 14 fallan, todos en los mismos 10 archivos de h1 (una prueba de tiempos de `circuit-simulation-service` pasó esta vez).
