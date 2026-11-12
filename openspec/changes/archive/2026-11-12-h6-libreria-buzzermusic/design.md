# Design

## Context

- **BuzzerMusic 1.1.0** (`github.com/pabgonza/BuzzerMusic`, GPL-3.0): `BuzzerMusic musica(8);`, cuatro canciones bloqueantes (`marioBros()`, `imperialMarch()`, `happyBirthday()`, `odeToJoy()`) y la versión no bloqueante `start(BuzzerMusic::MARIO_BROS)`, `update()`, `stop()`, `isPlaying()`. Toca con `tone(pin, nota, duración)`, que el buzzer del simulador ya reproduce (h5b). El repositorio no tiene etiquetas: la versión se fija por commit.
- **Generador**: cada bloque aporta al contexto (`includes`, `globales`, `setup`, `tick`) y devuelve su línea. `tick` ya se emite al principio de `loop()` pero ningún bloque lo usaba. El modo (clásico o corrutinas) se elige mirando los sombreros.
- **Catálogo**: los bloques propios se declaran en TypeScript por categoría y su texto sale de `i18n/locales/es/bloques.json`.
- **Backend**: las librerías del kit están instaladas a mano en el contenedor `velxio-spike`.

Decisiones abiertas de proposal.md: la 1 (modo clásico) confirmada por Pablo; la 2, 3 y 4 tomadas con su recomendación.

## Goals / Non-Goals

**Goals**
- Que `tocar canción` en un programa simple genere lo mismo que las slides.
- Que sumar la próxima librería sea agregar un archivo de datos e instalarla, sin tocar el generador.

**Non-Goals**
- Interfaz para armar bloques o subir librerías; componentes de simulación dentro del paquete.
- Bloques con entradas de valor (tempo, melodías propias): el formato solo cubre campos de menú.

## Decisions

### 1. Un paquete es un JSON en `frontend/src/blocks/paquetes/`
El cargador (`paquetes/index.ts`) lee todos los `.json` de la carpeta con `import.meta.glob` y define sus bloques en Blockly. El catálogo los agrega al final de la paleta de su categoría y el generador registra una función por bloque. Agregar una librería = agregar un archivo.

```json
{
  "libreria": { "nombre": "BuzzerMusic", "version": "1.1.0", "origen": "…git", "commit": "…" },
  "categoria": "sonido",
  "include": "#include <BuzzerMusic.h>",
  "global": "BuzzerMusic musica{PIN}({PIN});",
  "tick": "musica{PIN}.update();",
  "porDefecto": { "PIN": "8" },
  "menus": { "CANCION": [{ "texto": "Mario Bros", "valor": "MARIO_BROS", "metodo": "marioBros" }] },
  "bloques": [{ "tipo": "…", "texto": "tocar canción %1 en pin %2", "campos": ["CANCION", "PIN"], "codigo": "…" }]
}
```

- `campos`: en el orden de los `%n` del texto. `PIN` es el menú de pines del catálogo; cualquier otro nombre es un menú de `menus`.
- Plantillas: `{CAMPO}` es el valor elegido y `{CAMPO.dato}` un dato extra de esa opción del menú (el nombre del método bloqueante de la canción).
- Cada bloque aporta el `include` y el `global` del paquete. Como los conjuntos del contexto no repiten, hay un objeto por pin usado (decisión abierta 4).
- Por bloque: `forma: "logico"` para un bloque de valor; `tick: true` si necesita el `tick` del paquete; `esperarHasta` para esperar una condición después de su código; `bloqueante` para la variante de un programa simple.

El texto del bloque va en el paquete y no en `bloques.json`: el paquete se entiende solo y la plataforma es solo en español.

Alternativa descartada: declarar los bloques en TypeScript como los del catálogo. Es lo que el hito quiere evitar para las librerías que vienen.

### 2. Los cuatro bloques llevan el pin
`detener canción en pin [p]` y `¿canción sonando en pin [p]?` nombran el pin, igual que `silenciar pin [p]`: con un objeto por pin, un bloque sin pin tendría que recorrer todos los objetos y dejaría de ser una plantilla.

### 3. Modo clásico: la llamada de las slides
En un programa simple, `tocar canción` genera `musica8.marioBros();` y no pide `tick`. Con corrutinas genera `musica8.start(BuzzerMusic::MARIO_BROS);` y espera con `ESPERAR_HASTA(!musica8.isPlaying());`, con `musica8.update();` al principio de `loop()`: la canción suena completa y los demás scripts siguen.

### 4. Un bloque con `tick` pasa el programa a corrutinas
`empezar canción` necesita que `update()` corra seguido; con `delay()` la música se cortaría. Por eso un programa que usa un bloque con `tick` se genera con corrutinas aunque tenga un solo script. Implementación: `generar()` arma el sketch clásico y, si algún bloque pidió `tick`, lo arma de nuevo con corrutinas. El contexto gana `paralelo` para que el bloque elija su variante.

Alternativa descartada: recorrer los bloques antes de generar para saber el modo. Duplica la regla de qué bloques cuentan (habilitados, bajo un sombrero).

### 5. Librería instalada desde su repositorio, con el commit fijado
`scripts/instalar-librerias.sh` instala en el backend las librerías del kit con su versión: `Servo`, `DHT sensor library` y `Adafruit Unified Sensor` con `arduino-cli lib install`, y BuzzerMusic con `git clone` + `checkout` del commit dentro de la carpeta de librerías de `arduino-cli`. Se corre con `docker exec -i velxio-spike sh < scripts/instalar-librerias.sh`; h9 lo usará al construir la imagen.

Alternativa descartada: `arduino-cli lib install --git-url`, que exige activar `enable_unsafe_install` en la configuración del contenedor. Copiar la librería dentro del repo: duplica código que tiene su propio repositorio.

### 6. Guía
`docs/bloquino-agregar-libreria.md`: el formato del paquete y los pasos para sumar una librería.

## Risks / Trade-offs

- Un script que retiene el turno (lectura del DHT11, distancia sin eco: unos 25 ms) atrasa la nota siguiente ese tiempo. Aceptado: es imperceptible en una canción.
- `tocar canción` y `tocar nota` en el mismo pin y a la vez se pisan (un solo `tone()` por placa en el UNO). Es el comportamiento del hardware.
- El formato no cubre entradas de valor. Se ampliará con la primera librería que las necesite (h8).
