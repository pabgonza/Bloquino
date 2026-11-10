# Proposal

## Why

El curso usa **BuzzerMusic**, una librería propia del profesor, para que un buzzer toque canciones completas (Mario Bros, Marcha Imperial, Cumpleaños feliz, Himno de la Alegría). Tinkercad no admite librerías propias. Esta es la primera librería externa que se integra con bloques, y debe dejar establecido el mecanismo con el que el administrador sumará las siguientes.

BuzzerMusic ya trae un modo no bloqueante (`start()`, `update()`, `stop()`, `isPlaying()`), justo lo que necesitan los scripts paralelos de h2: la música suena mientras el resto del programa sigue.

## What Changes

- **Librería instalada en el backend** de compilación (`arduino-cli`), como parte de la imagen o de un paso de instalación reproducible. Sin interfaz: la instala el administrador.
- **Bloques** en Sonido:
  - `tocar canción [Mario Bros ▾] en pin [ ]` (espera a que termine),
  - `empezar canción [ ▾] en pin [ ]` (sigue de inmediato),
  - `detener canción`,
  - `¿canción sonando?`.
- **Tick automático**: los bloques declaran `musica.update()` como código de tick; el generador lo llama en cada vuelta sin que el alumno lo vea.
- **Paquete de bloques declarativo**: los bloques de BuzzerMusic se definen en un archivo de datos (texto del bloque, entradas, `#include`, objeto global, inicialización, tick, código generado), no en TypeScript suelto. Es el formato que usarán las librerías futuras.

Fuera de este hito: interfaz para armar bloques o subir librerías (fase 2), componentes de simulación propios dentro del paquete, instalación de paquetes por terceros.

## Capabilities

### New Capabilities
- `bloques/paquetes`: formato declarativo de un paquete de bloques asociado a una librería Arduino y cómo se carga en el catálogo.
- `bloques/buzzermusic`: los bloques de canciones y su comportamiento en modo clásico y en modo corrutinas.

### Modified Capabilities
- `bloques/catalogo-base`: la categoría Sonido gana los bloques de canciones.

## Impact

- Backend: `Dockerfile.standalone` o script de arranque instala BuzzerMusic (GPL-3.0, compatible con AGPLv3) desde su repositorio.
- `frontend/src/blocks/paquetes/`: cargador de paquetes y el paquete `buzzermusic`.
- Tests: golden tests del C++ generado; test de integración que compila un sketch con la librería; prueba en el simulador de que el buzzer suena y un LED parpadea a la vez.

## Decisiones abiertas (para design.md)

1. **Modo clásico**: con un solo script, `tocar canción` puede generar la llamada bloqueante (`musica.marioBros();`), que es lo que muestran las slides, y `empezar canción` exigir el modo corrutinas. Confirmar.
2. **Dónde vive la librería**: copia dentro del repo de Bloquino (submódulo o carpeta) frente a instalación desde GitHub al construir la imagen. Recomendación: instalación con versión fijada.
3. **Alcance del formato de paquete**: empezar con lo que BuzzerMusic necesita y nada más; no diseñar para casos que aún no existen.
4. **Un buzzer o varios**: el objeto global se crea por pin usado.
