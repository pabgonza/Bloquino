# Proposal

> Perfil: solo la propuesta. Primero se hace el inventario (fase 1); specs, diseño y tareas de la limpieza (fase 2) se escriben con el inventario cerrado.

## Why

Bloquino es un fork de Velxio congelado en `8a254109`, y del original se usa una parte chica: la placa UNO, los 17 componentes del kit, el simulador AVR, el editor de circuitos y una ruta del backend (compilar). El resto viaja en el repo, en la página compilada y en la imagen de la sala:

- **Peso**: la página compilada pesa 99 MB, y h10 la empaqueta entera en cada actualización.
- **Ruido**: cada búsqueda, test o lectura del código arrastra ESP32, Raspberry Pi, STM32, MicroPython, QEMU, la extensión de VS Code y el overlay comercial de velxio.dev.
- **Fallos ajenos**: 15 fallos de `vitest` en Windows y errores de tipos de Velxio que hay que filtrar a mano.

Pero no todo lo que hoy no se usa sobra. Velxio trae piezas que pueden servir para un curso avanzado o para el modo profe: fuente de poder, baterías, generador de señales, voltímetro y amperímetro, osciloscopio, transistores y reguladores (con la simulación eléctrica ngspice), y otras placas (Nano, Mega, ESP32). Antes de borrar hay que decidir, pieza por pieza, qué se queda, qué se guarda para después y qué sale.

Esto revisa la decisión vigente «lo no-UNO se oculta, no se borra». Se tomó para traer cambios de upstream con pocos conflictos. Con el fork ya muy apartado y los cambios de upstream traídos «a mano solo si valen la pena», ese motivo pesa menos. Si se borra, va una decisión nueva en `docs/decisiones.md`.

## What Changes

### Fase 1: inventario (sin borrar nada)

`docs/inventario-velxio.md` con una fila por pieza: qué es, cuánto pesa (repo y página compilada), de qué depende, quién la usa hoy y una clase:

- **Usa**: Bloquino la usa hoy.
- **Futuro**: no se usa, pero sirve para algo que se quiere hacer (curso avanzado, modo profe, otra placa). Se anota para qué y qué faltaría.
- **Sale**: no tiene uso previsto.

Candidatos ya vistos, para clasificar con el código delante:

| Grupo | Piezas | Tamaño versionado | Clase probable |
|---|---|---|---|
| Simulación eléctrica | `ngspice` WASM (24 MB), `simulation/spice`, voltímetro, amperímetro, `Oscilloscope.tsx` | ~27 MB | Futuro |
| Componentes analógicos | `power-supply`, `battery-9v`, `battery-aa`, pila de botón, `signal-generator`, transistores, MOSFET, reguladores 78xx/LM317, amplificadores operacionales, diodos | metadatos | Futuro |
| Lógica digital | compuertas, flip-flops, 74HC | metadatos | Futuro (curso avanzado) o Sale |
| Otras placas AVR | `arduino-nano`, `arduino-mega` | poco | Futuro (cambios `placa-nano`, `placa-mega`) |
| ESP32 y MicroPython | placas ESP32 (C3, S3, CAM…), `firmware/` (12 MB), QEMU (`prebuilt/qemu`, `simulation.py`), `Dockerfile.espidf-toolchain`, `iot_gateway.py`, `micropython_libs.py` | ~15 MB + backend | Futuro (`placa-esp32`) o Sale |
| RP2040, STM32, Raspberry Pi, ATtiny85 | simuladores, placas, imágenes | ~2 MB | Sale (salvo que se quiera la Pico) |
| Galería y ejemplos de Velxio | `data/examples*.ts`, `examples-thumbs/` (18 MB), páginas `Examples*` | ~19 MB | Sale |
| Páginas sueltas | `ImageToCodePage` (pantallas OLED), `ProjectByIdPage` | poco | Futuro u Sale |
| Overlay comercial | `proRoutes`, `proSession`, `proSaveAction`, `hooks.py`, `news.py` | poco | Sale |
| Extensión VS Code | `vscode-extension/` | 17 MB | Sale |
| Idiomas | 8 idiomas además de `es` | 1,5 MB | Sale (o queda `en`) |
| Backend | `compile_chip.py`, `compile_rom.py`, `flash.py`, `intellisense.py`, `libraries.py` | poco | Ver uno por uno |
| CI y marketing | `.github/workflows` (deshabilitados), `marketing/`, `og-image`, `funding.json`, `docs/wiki`, `docs/partners` | ~5 MB | Sale |
| Tests de Velxio | `test/`, fixtures de RP2040 y buses | ~5 MB | Siguen a lo que sale |

Para cada grupo del tipo «Futuro» se anota además si hoy funciona en Bloquino (por ejemplo, si el voltímetro mide un circuito del kit) y qué pide para entrar a la paleta.

### Fase 2: limpieza (con el inventario aprobado)

- Borrar lo «Sale» por grupos, un commit por grupo, con los tests y la imagen de la sala verdes después de cada uno.
- Lo «Futuro» queda, oculto como hoy, con una línea en el inventario que dice qué change lo activaría.
- Medir antes y después: tamaño del repo, de la página compilada, de la imagen de la sala y del paquete de h10; tiempo de `vitest` y de `sala.ps1 --build`.
- Actualizar el `CLAUDE.md` de `repo/`, que es de Velxio: reemplazarlo por uno de Bloquino o reducirlo a lo que queda.

Fuera: activar piezas «Futuro» (cada una es su change: `placa-nano`, `placa-mega`, `placa-esp32`, `instrumentos`, `fuentes-y-baterias`…).

## Cuándo empezar

La fase 1 puede ir en cualquier momento: solo lee y escribe un documento. La fase 2 conviene antes de h10, porque cada MB que sale de la página baja el instalador y el paquete de actualización. Si h10 va primero, su paquete se achica en la siguiente actualización.

## Capabilities

### New Capabilities
- (ninguna)

### Modified Capabilities
- (se ven en la fase 2; la limpieza no debería cambiar lo que el alumno o el profe ven, salvo lo que hoy aparece solo en modo profe)

## Impact

- Fase 1: un documento nuevo, sin código.
- Fase 2: borra archivos de Velxio en `frontend/`, `backend/`, `test/`, `docs/` y la raíz; toca archivos grandes de Velxio (`SimulatorCanvas.tsx`, `useSimulatorStore.ts`) para quitar ramas de placas, siempre con comentario `Bloquino:`.
- Traer cambios de upstream se vuelve más difícil en lo borrado (aceptado si se toma la decisión nueva).
- Licencia: AGPLv3 sigue; `LICENSE` y el aviso de fork se quedan.

## Decisiones abiertas

1. **Borrar o seguir ocultando**: borrar lo «Sale» (más liviano y claro) frente a solo ocultarlo mejor (sin conflictos con upstream). Recomendación: borrar, con decisión nueva en `docs/decisiones.md`.
2. **Simulación eléctrica**: es lo más pesado (27 MB) y también lo que habilita fuentes, baterías, multímetro y osciloscopio. Guardarla entera, o sacarla de la página y cargarla solo en modo profe.
3. **ESP32**: «Futuro» (un curso con WiFi) o «Sale» (QEMU y su toolchain son grandes de mantener).
4. **`COMMERCIAL_LICENSE.md`**: es la licencia comercial de Velxio, que no aplica a Bloquino; quitarla o dejarla como referencia.
5. **Idiomas**: solo `es`, o `es` y `en`.
6. **Orden frente a h10**: fase 2 antes o después de h10.
