# Tasks

Entorno: backend en el contenedor Docker del puerto 3080; frontend con `npx vite` desde `frontend/` (http://localhost:5173/editor). Tests: `npx vitest run <archivo>` desde `frontend/`.

## 1. Estructura del módulo de bloques

- [x] 1.1 Separar el prototipo `frontend/src/blocks/BlocksPanel.tsx` en: `blockly.ts` (importa Blockly y `blockly/msg/es` entre `amdOff` y `amdOn` y lo reexporta), `catalogo/` (definiciones por categoría), `generador/` (contexto y generadores) y `BlocksPanel.tsx` (solo interfaz). Verificar que el parpadeo del prototipo sigue funcionando en el simulador.
- [x] 1.2 Implementar el contexto de generación (`includes`, `globales`, `setup`, `tick`, `funciones`, `esperar`, `esperarHasta`) con su variante clásica. Test vitest: dos bloques que piden el mismo `pinMode` producen una sola línea.
- [x] 1.3 Implementar el armado del sketch (`setup` / `loop`, sin `por siempre`, programa vacío, comentario de origen). Tests vitest con los tres escenarios de `specs/bloques/generador-clasico`.

## 2. Catálogo

- [x] 2.1 Control: `por siempre`, `esperar`, `repetir`, `repetir mientras`, `contar`, `si`, `si / si no`, `esperar hasta que`, `cronómetro`, `reiniciar cronómetro`. Test vitest por bloque contra el código esperado.
- [x] 2.2 Luces: LED encender / apagar, brillo en %, color RGB con selector de color. Tests vitest de los escenarios de brillo y color.
- [x] 2.3 Sonido y movimiento: `tocar nota`, `silenciar`, `mover servo`. Tests vitest: nota con duración y contribuciones del servo.
- [x] 2.4 Sensores: botón, perilla, distancia (función auxiliar con `pulseIn` y tiempo límite de 25 ms). Tests vitest del código generado.
- [x] 2.5 Operadores y variables: aritmética, comparación, lógica, azar, `asignar al rango`, `restringir`, variables con nombre saneado. Test vitest: variable `mi cuenta`.
- [x] 2.6 Avanzado: bloques de pin, `decir`, `comentario`. Tests vitest de los tres escenarios.
- [x] 2.7 Paleta por categorías con nombre y color, en el orden de la spec. Verificar en el navegador que cada categoría muestra sus bloques.

## 3. Integración con el editor

- [x] 3.1 Volcar el sketch al agregar la placa aunque el panel de bloques ya esté abierto (suscripción al grupo de archivos activo). Verificar en el navegador: abrir Bloques, agregar el UNO, la vista Código muestra el sketch generado.
- [x] 3.2 Guardar el espacio de trabajo en `bloques.json` del grupo de la placa, excluido de la compilación, y restaurarlo al cargar. Test vitest: exportar a `.vlx` e importar conserva los bloques. Verificar que `bloques.json` no llega a `POST /api/compile/start`.
- [x] 3.3 Vista Código de solo lectura cuando el proyecto tiene `bloques.json`. Verificar en el navegador.
- [x] 3.4 Bloques sin sombrero atenuados y fuera del código. Test vitest y verificación visual.
- [x] 3.5 Textos de bloques y categorías en `frontend/src/i18n/locales/es/` (espacio `bloques`); menús de Blockly en español. Verificar el menú contextual en el navegador.

## 4. Programas de referencia

- [x] 4.1 Crear en `frontend/src/__tests__/fixtures/bloques/` los programas de referencia como JSON de bloques: parpadeo, semáforo, botón + LED, sirena, barrido de servo, perilla + servo, alarma de distancia, mezcla RGB. Test vitest que genera cada uno y compara con su `.ino` esperado.
- [x] 4.2 Test de integración (opcional por variable de entorno, como `RUN_LIBRARY_TESTS`) que compila cada sketch de referencia contra el backend. Verificar que los ocho compilan.
  - Los ocho compilan (`RUN_BLOQUES_COMPILE=1`, 2026-11-10). `Servo` no viene con el core AVR de `arduino-cli`: hubo que instalarla en el contenedor (`arduino-cli lib install Servo`, 1.3.0); sin ella `barrido-servo` y `perilla-servo` fallan con `Servo.h: No such file or directory`. Queda abierto cómo se instalan las librerías del kit en un backend desplegado (ver design.md).
- [x] 4.3 Probar a mano en el simulador, con su circuito armado: parpadeo, botón + LED, perilla + servo y alarma de distancia. Anotar en este archivo cualquier diferencia entre lo simulado y lo esperado.
  - Parpadeo (LED en pin 13): el pin cambia cada 1,000 s de tiempo simulado. Sin diferencias.
  - Botón + LED (botón entre pin 2 y GND, LED en 13): apagado suelto, encendido al presionar, apagado al soltar. Sin diferencias.
  - Alarma de distancia (HC-SR04 disparo 7 / eco 6, buzzer en 8): a 10 y 15 cm el pin 13 queda en alto y el pin 8 oscila a 440 Hz; a 50 cm el LED se apaga y no hay tono. Sin diferencias. El caso "sin eco → 400" no se pudo provocar en el simulador; queda cubierto solo por el test del código generado.
  - Perilla + servo (potenciómetro en A0, servo en 9): perilla en 0 / 256 / 512 / 1023 deja el servo en 0° / 45° / 90° / 180°. Sin diferencias.

## 5. Cierre

- [x] 5.1 `npx vitest run` completo: los tests existentes de Velxio siguen pasando.
  - 6064 pasan y 15 fallan, en 10 archivos (artefactos WASM "built from source", cargador de ngspice, ventanas de tiempo de `circuit-simulation-service`). Los mismos 15 fallan en el commit base `9d439bd4` sin estos cambios: son del entorno Windows, no de este hito.
- [x] 5.2 Confirmar con el módulo KY-016 real si el LED RGB es de cátodo común y ajustar el bloque de color si no.
  - Confirmado por hoja de datos, no con el módulo físico: Joy-it (COM-KY016RGBLED) indica cátodo común, con el pin compartido a GND. El bloque de color queda como está (nivel alto = encendido). Un clon de ánodo común se vería con los colores invertidos.
