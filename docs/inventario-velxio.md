# Inventario de lo heredado de Velxio

Fase 1 de `openspec/changes/inventario-velxio`. Medido el 2026-11-16 sobre `bloques`. No se borró nada.

**Clase propuesta**: *Usa* (Bloquino lo usa hoy), *Futuro* (no se usa, pero sirve para algo que se quiere hacer) o *Sale* (sin uso previsto). La columna **Destino** es de Pablo: se completa y con eso se planifica la fase 2.

**Regla de la fase 2** (decisión del 2026-11-16): lo «Sale» se borra solo como archivos o carpetas enteras. En los archivos grandes de Velxio solo se quitan los imports que apuntan a lo borrado; las ramas de placas se quedan.

## Resumen

- **Repo**: 116,9 MB versionados. **Página compilada**: 95,2 MB (sin mapas de fuentes; `frontend/dist` marca 99 MB por los bloques del disco).
- **El peso de la página casi no es código**: el JS son ~7 MB. El resto son archivos de `frontend/public/` que Vite copia tal cual (ngspice 27 MB, miniaturas 20 MB, firmwares 13 MB) y el editor Monaco (17 MB).
- **El código de Velxio está muy enredado**: casi todo entra a la página por `useSimulatorStore.ts`, `SimulatorCanvas.tsx`, `BoardOnCanvas.tsx` y `ComponentPickerModal.tsx`. Con la regla de la fase 2, del código TypeScript se puede sacar poco sin tocar esos archivos. Lo que sale barato son los archivos sueltos: `public/`, la extensión de VS Code, docs, tests, rutas y servicios del backend, CI e idiomas.
- **Bloquino depende de piezas que parecían ajenas**: `simulation/spice/start.ts` (arranca la simulación), `simulation/spice/NetlistBuilder.ts` (aviso de display sin resistencias) y `lib/proHardwareSerial.ts` (monitor serie de la placa real).
- **El backend de la sala ya está cerrado**: nginx da 404 a todo `/api/` salvo `/api/compile/`, y uvicorn escucha en `127.0.0.1`. Quitar rutas es orden, no seguridad. Además, por eso lo que necesita otras rutas (ESP32, chips propios) no funciona en la sala.

| # | Grupo | Repo MB | Página MB | Clase propuesta | Destino |
|---|---|---:|---:|---|---|
| 1 | Bloquino propio | 3,5 | 0,3 | Usa | |
| 2 | Núcleo de Velxio que se usa | 6,0 | 2,5 | Usa | |
| 3 | Monaco (editor de código) | 0 (se copia al instalar) | 17,3 | Usa, recortable | |
| 4 | Simulación eléctrica (ngspice, instrumentos) | 27,9 | 26,8 | Futuro | |
| 5 | Componentes analógicos y de potencia | 0,1 | ~0 | Futuro | |
| 6 | Lógica digital | 0,1 | ~0 | Futuro | |
| 7 | Arduino Nano y Mega | (dentro del núcleo) | (dentro del núcleo) | Futuro | |
| 8 | ESP32 y MicroPython | 17,4 | 15,5 | Sale (o Futuro) | |
| 9 | RP2040 (Raspberry Pi Pico) | 2,0 | 0,5 | Sale | |
| 10 | Raspberry Pi | 4,2 | 4,0 | Sale | |
| 11 | STM32, ATtiny y otras placas | 0,2 | 0,1 | Sale | |
| 12 | Chips propios, ROMs y buses | 4,4 | 0,4 | Sale en parte | |
| 13 | Galería y ejemplos de Velxio | 19,9 | 19,6 | Sale | |
| 14 | Herramientas y páginas sueltas | 0,1 | ~0 | Sale | |
| 15 | Overlay comercial | 0,1 | ~0 | Sale en parte | |
| 16 | Extensión de VS Code | 17,2 | 0 | Sale | |
| 17 | Otros idiomas (8) | 1,5 | dentro del JS | Sale | |
| 18 | Marketing y SEO | 7,6 | 4,4 | Sale en parte | |
| 19 | CI de GitHub | 0,1 | 0 | Sale | |
| 20 | Docs y tests de Velxio | 4,7 | 0 | Siguen a su grupo | |
| 21 | Backend sin uso | (en ESP32, chips y núcleo) | 0 | Sale | |
| 22 | Raíz y Docker de Velxio | ~0,1 | 0 | Sale en parte | |
| — | Librerías npm y código sin fuente | — | 3,8 | — | |

Los MB salen de `git ls-files` (repo) y de una compilación con mapas de fuentes (página): los archivos de `public/` por su carpeta y el JS por el archivo fuente que lo generó. Un archivo que podría ir en dos grupos cuenta en el primero de esta lista.

## Prueba en la página (modo profe, servidor de desarrollo)

Ejemplos de Velxio abiertos en `/example/<id>`, con el backend `velxio-spike`. Capturas en [inventario-velxio/](inventario-velxio/).

| Pieza | Resultado | Captura |
|---|---|---|
| Batería 9 V, amperímetro, voltímetro | Funciona: 15,18 mA y 7,136 V con 470 Ω, cuadra con la ley de Ohm | [bateria-voltimetro-amperimetro.jpg](inventario-velxio/bateria-voltimetro-amperimetro.jpg) |
| Generador de señales, diodos, condensador, 7805 | Funciona: el voltímetro marca 5,000 V después del regulador | [generador-rectificador-7805.jpg](inventario-velxio/generador-rectificador-7805.jpg) |
| Fuente de poder, transistores, LDR | Funciona: el LED se enciende. Su dibujo es igual al del generador de señales, lo que confunde | [fuente-transistores.jpg](inventario-velxio/fuente-transistores.jpg) |
| Amplificador de emisor común | Resuelve (5 nodos), sin instrumento para leerlo | [amplificador-emisor-comun.jpg](inventario-velxio/amplificador-emisor-comun.jpg) |
| Osciloscopio | Funciona, pero es un **analizador lógico de pines de la placa** (canal «13» de la Mega), no mide nodos del circuito analógico | [osciloscopio-mega.jpg](inventario-velxio/osciloscopio-mega.jpg) |
| Arduino Nano | Funciona: compila y simula, el monitor serie muestra ON/OFF | [nano.jpg](inventario-velxio/nano.jpg) |
| Arduino Mega | Funciona: compila y simula | [mega.jpg](inventario-velxio/mega.jpg) |
| ESP32 DevKit | **No funciona**: compila (138 s), pero la simulación necesita QEMU por WebSocket en `localhost:8001`, que no existe con `velxio-spike` ni pasa por el nginx de la sala | [esp32.jpg](inventario-velxio/esp32.jpg) |
| Baterías AA y de botón | Sin probar (mismo camino que la de 9 V) | — |

## Grupos

### 1. Bloquino propio — Usa
`frontend/src/blocks/`, `frontend/src/bloquino/`, `public/ejemplos/`, `public/blockly-media/`, textos `es/bloques.json` y `es/bloquino.json`, `openspec/`, `scripts/recorrido/`, `sala.ps1`, `puente-serie.ps1`, `librerias-kit.txt`, `instalar-librerias.sh`, `prueba-carga.mjs`, `Dockerfile.bloquino`, `docker-compose.bloquino.yml`, `docker/bloquino-*`, `docs/bloquino-*`, `docs/guia-de-la-clase/`, `docs/ejemplos/`, `docs/manual-*`.

### 2. Núcleo de Velxio que se usa — Usa
Editor de circuitos y simulador AVR: `useSimulatorStore.ts`, `useEditorStore.ts`, `SimulatorCanvas.tsx`, `BoardOnCanvas.tsx`, `EditorToolbar.tsx`, `CodeEditor.tsx`, `SerialMonitor.tsx` (usa `@xterm/xterm`), `simulation/AVRSimulator.ts`, `PinManager.ts`, `simulation/parts/`, `simulation/buses/` (I2C y SPI de la LCD y otros), `wokwi-elements`, `avr8js`, `public/boards/` (UNO, Nano, Mega), `public/component-svgs/`, `components-metadata.json`, `scripts/generate-component-metadata.ts`, `generate-component-svgs.cjs` y `component-overrides.json`. Backend: `routes/compile.py`, `services/arduino_cli.py`, `build_queue.py`, `board-indexes/`.

Dentro de los grupos 4 y 15 hay archivos que Bloquino usa y se quedan aunque el grupo salga: `simulation/spice/start.ts`, `simulation/spice/NetlistBuilder.ts` y `lib/proHardwareSerial.ts`.

### 3. Monaco — Usa, recortable
El editor de la pestaña Código, en la página de alumno y en modo profe. `scripts/copy-monaco.mjs` copia `monaco-editor/min/vs` entero a `public/monaco/` al instalar (17,3 MB en la página). Bloquino solo resalta C++. Copiar solo el núcleo y el lenguaje `cpp` bajaría varios MB sin cambiar nada visible. No es borrar Velxio: sería un change propio.

### 4. Simulación eléctrica — Futuro
`simulation/spice/` (38 archivos alcanzables), `public/wasm/ngspice-interactive/` (24 MB de WASM, se carga solo al activar el modo eléctrico), `components/components-instruments/` (voltímetro, amperímetro), `components/analog-ui/`, `useElectricalStore.ts`, `test/test_circuit/`, `docs/wiki/circuit-emulation.md`.

- **Funciona** (ver la prueba): batería, fuente, generador de señales, voltímetro y amperímetro.
- **Lo usan** `useSimulatorStore.ts`, `SimulatorCanvas.tsx`, `EditorToolbar.tsx`, `PinManager.ts`, `parts/BasicParts.ts`, `verify/` y otros 12 archivos del núcleo. No se puede sacar sin tocarlos.
- **Para el alumno faltaría**: las piezas en la paleta del kit, nombres en español, instrumentos más grandes y legibles, y un dibujo distinto para la fuente.
- **Ojo con el tamaño**: los 24 MB del WASM van en la página y en el paquete de h10 aunque nadie los use. Opción para la fase 2 o para h10: dejar el WASM fuera del paquete y cargarlo solo si se activa el modo eléctrico.

### 5. Componentes analógicos y de potencia — Futuro
`velxio-components/TransistorElements`, `OpAmpElements`, `PowerElements` (fuente, baterías, generador), `DiodeElements`, `RelayElements`, `MotorDriverElements`, más sus `parts/`. En metadatos: 31 analógicos (transistores, MOSFET, reguladores 78xx y LM317, amplificadores operacionales, diodos, optoacopladores, baterías, fuente, generador). Pesan casi nada. Simulan con el grupo 4. Lo importan `main.tsx` y `simulation/parts/index.ts`.

### 6. Lógica digital — Futuro
`LogicGateElements`, `LogicICElements`, `FlipFlopElements`, `IC74HC595` y `parts/LogicGateParts.ts`. 25 componentes (compuertas, flip-flops, 74HC00 a 74HC86). Pesan casi nada. Lo importan `main.tsx` y `parts/index.ts`. Útil para un curso de electrónica digital; el 74HC595 sirve con Arduino (más salidas).

### 7. Arduino Nano y Mega — Futuro
Están dentro del núcleo (mismo simulador AVR, mismo core `arduino:avr` que ya tiene la imagen de la sala). Funcionan en modo profe. Para el alumno faltaría lo que pide `docs/manual-agregar-placa.md`: paleta, pines en los bloques y las pruebas. Son los changes `placa-nano` y `placa-mega` ya nombrados en `varias-placas`.

### 8. ESP32 y MicroPython — Sale (o Futuro)
Simuladores y puentes (`Esp32Bridge*`, `Esp32C3Simulator`, `Esp32MicroPythonLoader`, `MicroPythonLoader`), `public/firmware/` (13 MB de firmwares MicroPython y Badger), WASM `littlefs` y `ruff` (formateador de Python), `prebuilt/qemu`, `Dockerfile.espidf-toolchain`, `src/desktop/*QemuPrompt*`, backend `simulation.py` (WebSocket a QEMU), `iot_gateway.py`, `micropython_libs.py`, `flash.py` y 8 servicios `esp32_*`, `espidf_compiler.py` y `esp_qemu_manager.py`; dependencias `esptool`, `wasmtime` y `zstandard` del backend; `test/esp32_cam/`; docs `ESP32_*`, `BOOT_IMAGES`, `BUILD-QEMU`, `MICROPYTHON_IMPLEMENTATION`.

- **Hoy no funciona en Bloquino**: compila, pero simular necesita QEMU, que no está en `velxio-spike` ni en la sala. Ponerlo a andar es un proyecto en sí (QEMU en la imagen, ~minutos por compilación, abrir `/api/simulation`).
- **Lo usan** `useSimulatorStore.ts`, `SimulatorCanvas.tsx`, `BoardOnCanvas.tsx`, `ComponentPickerModal.tsx`, `SerialMonitor.tsx`, `LibraryManagerModal.tsx` y `parts/CustomChipPart.ts`: el código TS no sale sin tocarlos. Sale barato lo de `public/firmware/`, el backend, `prebuilt/` y el Dockerfile.
- Si algún día se quiere un curso con WiFi, el camino sería un ESP32 real (carga por Web Serial), no la simulación con QEMU.

### 9. RP2040 — Sale
`RP2040Simulator.ts`, `rp2040-bootrom.ts`, `rp2040js`, firmware `.uf2`, fixtures de tests. Lo importan `useSimulatorStore.ts`, `BoardOnCanvas.tsx`, `ComponentPickerModal.tsx` y `parts/ComplexParts.ts`.

### 10. Raspberry Pi — Sale
`components/raspberry-pi/` (terminal), `PiBridgeShim.ts`, `RaspberryPi3Bridge.ts`, imágenes de placas en `src/assets/` y `public/boards/` (4 MB en la página), docs `RASPBERRYPI3_EMULATION`. Lo importan `useSimulatorStore.ts`, `BoardOnCanvas.tsx`, `SerialMonitor.tsx`, `ComponentPickerModal.tsx` y `main.tsx`.

### 11. STM32, ATtiny y otras placas — Sale
`Stm32Bridge.ts`, `Attiny85Element`, `onlineOnlyBoards.ts`, `proBoardRegistry.ts`, `franzininho`, backend `stm32_worker.py`. Están en los tipos de placa (`types/board.ts`, `boardOptions.ts`) y en 13 archivos del núcleo: lo que sale es poco.

### 12. Chips propios, ROMs y buses — Sale en parte
Chips definidos por el usuario en C compilados a WASM (`components/customChips/` 74 archivos, `simulation/customChips/`, `public/bus-chips/`), ROMs para CPUs retro (Intel 8080, Z80: `examples-retro-intel.ts`, `examples-jsemu-chips.ts`, `scripts/*-rom.s`, `*-rom.txt`, `larson-z80.s`, `test-z80.s`, `asm8080.py`, `make-z80-cpu.py`) y backend `compile_chip.py`, `compile_rom.py`, `chip_compile.py`, `rom_compile.py`, `wasm_chip_*`, `c_compile.py`, `asm*.py`.

- En la sala no funciona: `/api/compile-chip` y `/api/compile-rom` están cerrados.
- **Ojo**: `simulation/buses/` quedó en este grupo por nombre, pero es núcleo (lo usan `AVRSimulator.ts`, `I2CBusManager.ts` y las piezas I2C y SPI). Se queda.
- Lo de chips lo importan `AVRSimulator.ts`, `Interconnect.ts`, `useSimulatorStore.ts`, `SimulatorCanvas.tsx`, `EditorToolbar.tsx` y 8 archivos de `parts/`: el código TS sale con dificultad. Salen barato el backend, los ejemplos retro y los `.s`.

### 13. Galería y ejemplos de Velxio — Sale
`data/examples*.ts` (14 archivos, 1,5 MB de fuente), `data/example-wire-routes.ts`, `data/starters.ts`, `public/examples-thumbs/` (20 MB), páginas `ExamplesPage`, `ExampleDetailPage`, `ExampleEditorPage`, `ExampleLoaderPage`, `components/examples/`, `docs/examples/`, `scripts/generate-example-screenshots.md`, `scripts/visual-led-test.mjs` (prueba visual de ejemplos por CDP). Lo importan `App.tsx` (rutas), `main.tsx`, `NewProjectDialog.tsx`, `PartInspectorDialog.tsx`, `loadExample.ts` y utilidades de búsqueda.

- Es el que más baja la página (~20 MB) con menos cortes.
- **Antes de borrar**: los ejemplos analógicos (`examples-analog*.ts`) son la única demostración de los grupos 4 y 5. Si esos quedan como «Futuro», guardar dos o tres como `.bloquino` en Bloquino.

### 14. Herramientas y páginas sueltas — Sale
`ImageToCodePage` (imagen a arreglo para pantallas OLED), `ProjectByIdPage`, `src/desktop/` (aplicación de escritorio de Velxio: bienvenida, avisos de actualización, menú), `routes/news.py` (novedades de velxio.dev; en desarrollo da 500), `docs/desktop-app.md`. Lo importan `App.tsx`, `main.tsx`, `SimulatorCanvas.tsx`, `FlashModal.tsx` y `flashRequest.ts`.

### 15. Overlay comercial — Sale en parte
`__pro_stub__/`, `lib/proRoutes.ts`, `proSession.ts`, `proSaveAction.ts`, `proBoardGate.ts`, `core/hooks.py`, `COMMERCIAL_LICENSE.md`, `funding.json`, `docs/analytics.md`. `services/metricsService.ts` manda `/api/metrics/run` en cada simulación (telemetría de velxio.dev; responde 404). Llamadas a `/api/pro` y `/api/projects`, que tampoco existen. **Se queda** `lib/proHardwareSerial.ts`, que usa la carga a la placa de Bloquino. Lo importan 12 archivos del núcleo.

### 16. Extensión de VS Code — Sale
`vscode-extension/` (17,2 MB, incluye un `.vsix` compilado). Nadie la importa.

### 17. Otros idiomas — Sale
`src/i18n/locales/` de, en, fr, it, ja, pt-br, ru y zh-cn (1,5 MB). Solo los importa `i18n/index.ts`. Decisión abierta: dejar `en`.

### 18. Marketing y SEO — Sale en parte
`public/marketing/`, `image.png`, `image.webp`, `estacion-meteorologica-esp32.gif`, `og-image.*`, `llms.txt`, `sitemap.xml`, `robots.txt`, `docs/partners/`, `docs/img/`, `scripts/generate-og-image.mjs`, `generate-sitemap.ts`. **Revisar antes**: favicons e íconos (`favicon*`, `android-chrome-*`, `manifest.webmanifest`, `scripts/generate-favicons.mjs`), que son la identidad de h3.

### 19. CI de GitHub — Sale
`.github/` (11 workflows, deshabilitados en el repo), `scripts/pr-risk-scan.sh`.

### 20. Docs y tests de Velxio — Siguen a su grupo
`docs/wiki/`, `docs/*.md` de Velxio, `CHANGELOG.md`, `test/` (pruebas de Python y del circuito), `backend/tests/`, `pytest.ini`, `make-test.js` y los tests de `frontend/src/__tests__/` de cada grupo (fixtures de RP2040, `board-buses/`). Cada uno sale con el grupo que prueba. El `README.md` y el `CLAUDE.md` del repo son de Velxio: reescribirlos para Bloquino.

### 21. Backend sin uso — Sale
Rutas de `backend/app/main.py`:

| Ruta | La llama la página | En la sala | Grupo |
|---|---|---|---|
| `/api/compile` | Sí | Abierta | Núcleo (Usa) |
| `/api/compile-chip` | Solo chips propios | Cerrada | 12 |
| `/api/compile-rom` | Solo chips propios | Cerrada | 12 |
| `/api/libraries` | Gestor de librerías (modo profe) | Cerrada | Sale: las librerías van por `librerias-kit.txt` |
| `/api/micropython-libs` | Solo MicroPython | Cerrada | 8 |
| `/api/intellisense` | No | Cerrada | Sale |
| `/api/flash` | Solo el botón de carga de Velxio, en modo profe (Bloquino carga por Web Serial) | Cerrada | 8 |
| `/api/simulation` | Solo ESP32 (WebSocket) | Cerrada | 8 |
| `/api/gateway` | Solo ESP32 | Cerrada | 8 |
| `/api/news` | Sí (novedades de Velxio) | Cerrada | 14 |

Además: `backend/app/mcp/` (servidor MCP de Velxio), `database/`, `models/`, `schemas/` y `utils/` vacíos. La dependencia `mcp` del backend sale con `mcp/`.

### 22. Raíz y Docker de Velxio — Sale en parte
`Dockerfile.standalone`, `docker-compose.yml`, `docker/entrypoint.sh`, `docker/nginx.conf` (la imagen de Velxio), `.vite/` (caché de Vite versionada por error en Velxio; Vite la reescribe al arrancar desde la raíz), `.gitmodules` (cuatro submódulos de `third-party/` que no están descargados), `prebuilt/`. **Se quedan**: `LICENSE` (AGPLv3), `package.json` de la raíz (lo usa el generador de metadatos), `.gitignore`, `.gitattributes`, `.dockerignore` y `.markdownlint.json`.

## Qué falta decidir (además de la columna Destino)

1. **Simulación eléctrica en la página**: dejarla como hoy (24 MB en cada paquete de h10) o cargarla solo cuando se activa.
2. **ESP32**: «Sale» (QEMU es un proyecto aparte) o «Futuro» solo como placa real.
3. **Ejemplos analógicos**: guardarlos como `.bloquino` antes de borrar la galería.
4. **Idiomas**: solo `es`, o `es` y `en`.
5. **Monaco recortado**: change aparte (no es borrar Velxio).
