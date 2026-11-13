# Bloquino: cómo agregar una placa

Receta para sumar una placa a la página de alumno (hoy solo hay Arduino UNO).
Estado de cada placa candidata y etapas en
`../docs/investigacion/varias-placas.md` (carpeta del proyecto, fuera del
repo). Rutas relativas a `repo/`; las de código, a `frontend/src/` salvo que
digan otra cosa.

El proyecto ya admite varias placas, cada una con su programa (change
`varias-placas`), pero todas son UNO, y el UNO está escrito en varios lugares
(lista en el paso 0). El primer change de placas (`placa-nano`) agrega la
ficha a `bloquino/placas.ts` (hoy solo numera las placas) y los menús de
pines por placa; desde ahí,
agregar otra placa es llenar la ficha y seguir los pasos 4 a 11. Lo marcado
**(a crear)** todavía no existe.

## 0. Antes de empezar

- Abrir un change: `/opsx:propose placa-<nombre>` con la sesión en `repo/`.
  Una placa por change.
- Revisar los lugares que suponen el UNO (búsqueda rápida):
  `grep -rn "arduino-uno\|arduino:avr:uno\|UNO" frontend/src/bloquino frontend/src/blocks frontend/src/__tests__ scripts docker Dockerfile.bloquino`.
  Los conocidos: `bloquino/proyecto.ts` (`abrir`),
  `bloquino/PaletaComponentes.tsx` (la tarjeta que agrega la placa),
  `bloquino/PanelPrograma.tsx` (selector «1 (Arduino UNO)»),
  `bloquino/flash/*`, `blocks/catalogo/base.ts` (menús de
  pines), `blocks/catalogo/pantallas.ts` (pines por defecto),
  `blocks/generador/bloques.ts`, `i18n/locales/es/bloquino.json`,
  `__tests__/bloquino-ejemplos.test.ts`, `__tests__/helpers/bloques.ts`,
  `scripts/prueba-carga.mjs`, `scripts/puente-serie.ps1`.

## 1. La placa en Velxio

Si Velxio ya la tiene, no se toca nada de Velxio. Comprobar en:

- `types/board.ts`: el tipo en `BoardKind`, su nombre en `BOARD_KIND_LABELS`,
  su FQBN en `BOARD_KIND_FQBN` y su LED en `BOARD_ONBOARD_LEDS`.
- `utils/boardGeometry.ts` → `BOARD_SIZE`: tamaño en el lienzo.
- `components/simulator/BoardOnCanvas.tsx`: el `case` que la dibuja.
- `store/useSimulatorStore.ts` → `createSimulator`: qué simulador le toca
  (`AVRSimulator` en modo `uno` o `mega`, `Esp32Bridge` por QEMU, etc.).

Tienen tipo propio: `arduino-nano`, `arduino-mega`, `esp32` (y variantes),
entre otras. No lo tienen: Arduino Mini, Pro Mini.

Si no la tiene:

1. Dibujo: Web Component con `pinInfo` (regla 6a de `CLAUDE.md` de Velxio y
   paso 1 de `docs/bloquino-agregar-componente.md`) en
   `bloquino/placas/<Nombre>Element.ts` **(a crear)**. Los nombres de las
   patitas son los que usan los cables; copiar los del UNO (`2`…`13`,
   `A0`…`A5`, `5V`, `GND.1`) cuando la placa los tenga, así los ejemplos se
   mudan sin cambiar cables.
2. Registro sin tocar la unión `BoardKind`: `registerProBoards([...])` de
   `lib/proBoardRegistry.ts`, con `kind`, `label`, `fqbn`, `tag`, `size`,
   `description` (ver `ProBoardDef`). Con un FQBN `arduino:avr:*`,
   `createSimulator` le da el AVR solo (modo `mega` si el FQBN empieza con
   `arduino:avr:mega`, si no `uno`).
3. Importar el módulo en `bloquino/PaginaEditor.tsx`, junto a los
   componentes propios.

## 2. La ficha de Bloquino **(a crear en `placa-nano`)**

`bloquino/placas.ts`: una entrada por placa que el alumno puede usar.

```ts
{
  tipo: 'arduino-nano',            // BoardKind o kind registrado
  nombre: 'Arduino Nano',          // o clave en bloquino.json
  digitales: [2, 3, …, 13],        // sin 0 y 1 (puerto serie)
  pwm: [3, 5, 6, 9, 10, 11],
  analogicos: ['A0', …, 'A7'],
  soloAnalogicos: ['A6', 'A7'],    // no sirven para digitalRead ni botón
  interrupcion?: [...],            // pines válidos para el receptor IR
  carga: { protocolo: 'stk500v1', baudios: [115200, 57600], firma: [0x1e, 0x95, 0x0f], pagina: 128 },
}
```

Los datos salen de la hoja de la placa y de su `pins_arduino.h` (en el
contenedor: `docker exec velxio-spike find / -name pins_arduino.h -path "*<variante>*"`).

## 3. Elegir la placa en la página de alumno

- Paleta: la placa es una entrada más de `kit` en
  `i18n/locales/es/bloquino.json` (hoy `"arduino-uno": "Arduino UNO"`, primera
  de la lista) y su tarjeta usa la miniatura de los metadatos de Velxio.
  `agregar` (`bloquino/PaletaComponentes.tsx`) reconoce la placa por el id
  (`componente.id === 'arduino-uno'`): generalizarlo a las placas de la ficha
  y llamar a `addBoard` con su tipo.
- Selector del panel de programa (`bloquino/PanelPrograma.tsx`): hoy escribe
  «(Arduino UNO)» fijo; tomar el nombre de la ficha.
- Proyecto nuevo: sigue saliendo de `INITIAL_BOARD` de `useSimulatorStore.ts`
  (id `arduino-uno`). Si «Nuevo» tiene que preguntar la placa, cambiar el tipo
  con la API del store (`removeBoard` + `addBoard`), sin editar
  `INITIAL_BOARD`.
- `abrir` (`bloquino/proyecto.ts`) hoy rechaza cualquier placa que no sea
  UNO: aceptar los tipos de la ficha.
- Textos: `i18n/locales/es/bloquino.json` (nombre de la placa, mensajes de
  archivo, de carga y de «sin placas» que hoy dicen «Arduino UNO»).

## 4. Bloques y pines

- Menús: hoy `pin()`, `pinPwm()` y `pinAnalogico()` de
  `blocks/catalogo/base.ts` son listas fijas que se definen al importar el
  catálogo (`Blockly.defineBlocksWithJsonArray`). Con varias placas, el menú
  tiene que leer la placa activa: un `FieldDropdown` con función, o volver a
  definir los bloques y recargar el área al cambiar de placa (decidirlo en el
  `design.md` de `placa-nano`). Un proyecto abierto con un pin que la placa no
  tiene debe avisar, no romperse.
- Pines por defecto: `LCD_PINES`, `DISPLAY_SEGMENTOS`, `DISPLAY_DIGITOS` en
  `blocks/catalogo/pantallas.ts`, y los `fields: { PIN: '13' }` de las
  paletas (`luces.ts`, `avanzado.ts`). Revisar que existan en la placa.
- Código generado (`blocks/generador/bloques.ts`): lo que depende del chip.
  - Lectura analógica: `map(analogRead(...), 0, 1023, ...)` supone 10 bits
    (ESP32: 12 bits, 0–4095).
  - Servo: `#include <Servo.h>` no compila para ESP32 (`ESP32Servo`).
  - Control remoto: `initPCIInterruptForTinyReceiver()` necesita un pin con
    interrupción (en la Mega no lo son todos).
  - Botones con `INPUT_PULLUP` (ESP32: los GPIO 34–39 no tienen pull-up).
- Paquetes de bloques (`blocks/paquetes/*.json`): revisar que su librería
  compile para la placa.
- Tests: `__tests__/bloques-generador.test.ts` y los demás `bloques-*` que
  fijan código; los de compilación (`*.integration.test.ts`) usan
  `__tests__/helpers/bloques.ts`, que compila `arduino:avr:uno`: pasarle el
  FQBN y correrlos también con la placa nueva:
  `RUN_BLOQUES_COMPILE=1 npx vitest run src/__tests__/bloques-`.
- Textos de bloques nuevos: `i18n/locales/es/bloques.json`.

## 5. Compilación e imagen de la sala

- Comprobar el FQBN en el backend de desarrollo:
  `docker exec velxio-spike arduino-cli board details -b <fqbn>`.
- Core: `Dockerfile.bloquino` instala solo `arduino:avr@1.8.8` (sirve para
  UNO, Nano, Mega, Mini y Pro Mini). Otro core: agregar
  `arduino-cli core install <core>@<versión>` con versión fija, y su índice
  en `backend/board-indexes/` si su sitio falla a menudo (ver su README). La
  sala tiene que compilar sin internet (spec `despliegue/imagen-sala`).
- Calentar el core de la placa nueva en `Dockerfile.bloquino` (hoy compila
  `calentar.ino` solo con `arduino:avr:uno`): un `arduino-cli compile --fqbn`
  más por FQBN.
- Librerías del kit: `scripts/librerias-kit.txt`. Revisar `architectures` en
  su `library.properties`
  (`docker exec bloquino sh -c 'grep -h ^architectures $(arduino-cli config get directories.user)/libraries/*/library.properties'`).
  Una librería nueva para esa placa: una línea más y reconstruir.
- Carga del curso: `scripts/prueba-carga.mjs` compila `arduino:avr:uno`;
  medir también con el FQBN nuevo (la spec pide 15 compilaciones en menos de
  15 s).
- Si la placa se simula en el backend (ESP32): nginx
  (`docker/bloquino-nginx.conf`) solo deja pasar `/api/compile/`; hay que
  abrir `/api/simulation/` con WebSocket, y la imagen necesita las librerías
  de QEMU. Mejor una imagen aparte.
- Reconstruir: `.\scripts\sala.ps1 --build`.

## 6. Carga a la placa real

Código en `bloquino/flash/`:

- `cargar.ts`: orquesta (puerto, compilar, grabar, monitor serie). Lo propio
  de cada placa sale de la ficha: baudios, protocolo, firma. Si la placa
  entrega `binary_content` (ESP32) en vez de HEX, no pasar por
  `hexToUint8Array`.
- `serie.ts`: conexión Web Serial y `reiniciar` (pulso de DTR/RTS del UNO).
  Otra secuencia de reinicio va en la ficha o en el cliente del protocolo.
- Protocolo:
  - STK500v1 (UNO, Nano, Mini, Pro Mini): `stk500.ts`; hoy fija firma
    (`FIRMA_ATMEGA328P`) y página (`PAGINA = 128`): pasarlas como
    parámetros.
  - STK500v2 (Mega): cliente nuevo `stk500v2.ts` con la misma interfaz
    (`grabar(canal, programa, alAvanzar)`) y el mismo `Canal`.
  - ESP32: `esptool-js` (ya está en `package.json`); anotar en
    `docs/decisiones.md` que deja de ser «sin librerías».
- `FILTROS` de `cargar.ts`: fabricantes USB permitidos en el selector
  (Arduino, CH340, FTDI, CP210x). Agregar el de la placa si es otro.
- Mensajes de falla: `i18n/locales/es/bloquino.json` → `carga.fallas`
  (`otraPlaca` hoy dice UNO).
- Tests: `__tests__/bloquino-carga.test.ts` tiene un bootloader simulado con
  rarezas (`Rarezas`); agregar uno para el protocolo nuevo. Placa real sin
  navegador: `powershell -File scripts\puente-serie.ps1 COM7` (abre a 115200:
  agregarle el parámetro de baudios) y
  `$env:BLOQUINO_PUENTE = 4700; npx vitest run src/__tests__/bloquino-carga.test.ts`.
- Recorrido: `scripts/recorrido/carga.js` simula un puerto que habla
  STK500v1 con firma del 328P; agregar el protocolo y la firma nuevos.

## 7. Simulación de los componentes del kit

Con la placa en el lienzo, correr cada componente del kit. Puntos frágiles:

- Buzzer: marca `Bloquino: tone() conmuta el pin desde una interrupción del
  Timer2` en `simulation/parts/ComplexParts.ts`; cuenta el tiempo a 16 MHz.
- DHT11 (`bloquino/componentes/dht11.ts`), control remoto
  (`bloquino/componentes/control.ts`) y displays
  (`bloquino/componentes/display.ts`, marcas `Bloquino:` en
  `simulation/parts/ChipParts.ts`): hechos para los simuladores del
  navegador.
- ESP32: los sensores corren en el worker de Python
  (`backend/app/services/esp32_worker.py`, `esp32_dht22.py`, `esp32_ir.py`).
- Pines analógicos extra (A6/A7 de la Nano, A8–A15 de la Mega): probar el
  potenciómetro en ellos.

## 8. Ejemplos

- Un proyecto con la placa en `frontend/public/ejemplos/` (formato
  `.bloquino`), armado en la página y descargado, con cables ordenados.
- `__tests__/bloquino-ejemplos.test.ts` acepta varias placas por ejemplo, pero
  exige que todas sean `arduino-uno`: aceptar las de la ficha.
- Lista y capturas: `docs/bloquino-ejemplos.md` y `docs/ejemplos/`
  (`scripts/recorrido/ejemplos.js`).

## 9. Recorrido con mouse real (Playwright)

Ver `scripts/recorrido/README.md`.

- Guion nuevo `scripts/recorrido/placa-<nombre>.js`: Nuevo con la placa,
  armar con el mouse un circuito con LED, botón y potenciómetro, programar,
  simular, revisar los menús de pines y cargar (placa simulada por
  `carga.js`, o real si el navegador ya tiene el puerto autorizado).
- `lib.js` → `nuevo()` hoy no elige placa: agregarle el parámetro.
- Convertir y correr: `node scripts/recorrido/conv.mjs placa-<nombre>` y
  cargarlo desde el MCP de Playwright como dice el README. Correr también los
  guiones de siempre (`s2` … `s10`, `carga`, `seleccion`) para ver que el UNO
  sigue igual.

## 10. Specs (OpenSpec)

Deltas en `openspec/changes/placa-<nombre>/specs/`, con
`## MODIFIED Requirements` copiando el requisito entero:

- `interfaz/modo-alumno`: «Solo el kit del curso» (la placa ya no es solo el
  UNO) y «Varias placas, cada una con su programa».
- `interfaz/varias-placas`: el selector nombra el tipo de cada placa.
- `proyecto/archivo`: «Archivos que no se pueden abrir» y «Proyecto nuevo».
- Carga: requisito nuevo en `carga/web-serial-uno` para placas del mismo
  protocolo, o capacidad nueva (`carga/web-serial-mega`, `carga/esp32`).
- `despliegue/imagen-sala`: si cambia lo que trae la imagen o lo que sale a
  la red.
- Bloques: requisito de menús de pines según la placa (capacidad
  `bloques/editor` o una nueva `interfaz/placas`).

Validar con `openspec validate placa-<nombre>`, implementar con
`/opsx:apply placa-<nombre>` y archivar al terminar. Decisiones nuevas al
final de `../docs/decisiones.md`.

## 11. Cierre

- Tipos: `npx tsc --noEmit -p tsconfig.app.json 2>&1 | grep bloquino/`.
- Tests: `npx vitest run src/__tests__/bloquino-` y `bloques-`, más los de
  compilación con `RUN_BLOQUES_COMPILE=1`.
- Recorrido (paso 9) y carga real con la placa en la mano.
- Imagen: `.\scripts\sala.ps1 --build` y probar en `https://<IP>`.
- Si cambia cómo se arma o programa algo del kit (pines, 3,3 V, otra
  librería), llevarlo a las slides de `../Curso_Arduino`.
- `README.md` del proyecto: fila del change en la tabla.
