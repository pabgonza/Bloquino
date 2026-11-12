# Agregar una librería con bloques

Cómo sumar a Bloquino los bloques de una librería de Arduino. Lo hace el
administrador; no hay interfaz. El ejemplo es BuzzerMusic (h6):
`frontend/src/blocks/paquetes/buzzermusic.json`.

## 1. Instalar la librería en el backend

Agregar una línea a `scripts/librerias-kit.txt`, con su versión fija:
`Nombre@versión` si está en el índice de Arduino, o
`Nombre@https://github.com/usuario/repo.git#commit` si vive en un repositorio
propio.

- **Imagen de la sala**: reconstruirla
  (`docker compose -f docker-compose.bloquino.yml up -d --build`; ver
  [bloquino-dia-de-clase.md](bloquino-dia-de-clase.md)).
- **Contenedor de desarrollo** (`velxio-spike`): correr el script que lee la
  lista. Se puede repetir sin problema, y hay que repetirlo si el contenedor
  se recrea.

  ```
  docker cp scripts/librerias-kit.txt velxio-spike:/tmp/
  docker cp scripts/instalar-librerias.sh velxio-spike:/tmp/
  docker exec velxio-spike sh /tmp/instalar-librerias.sh
  ```

## 2. Escribir el paquete

Un archivo JSON en `frontend/src/blocks/paquetes/`. Se carga solo: no hay que
registrarlo en otro lado.

| Campo | Qué es |
| --- | --- |
| `libreria` | `nombre`, `version`, `origen` y `commit`: lo mismo que dice la lista de librerías. |
| `categoria` | Categoría de la paleta donde aparecen los bloques (`sonido`, `luces`, `sensores`…). Van al final, con su color. |
| `include` | Línea `#include` de la librería. |
| `global` | Declaración del objeto. Con `{PIN}` en el nombre queda un objeto por pin usado. |
| `tick` | Código que debe correr en cada vuelta de `loop()`, para los bloques con `"tick": true`. |
| `porDefecto` | Valor de cada campo cuando el bloque está en la paleta. |
| `menus` | Menús propios: lista de opciones con `texto` (lo que lee el alumno), `valor` y los datos extra que se quieran. |
| `bloques` | Los bloques (abajo). |

Cada bloque:

| Campo | Qué es |
| --- | --- |
| `tipo` | Identificador único, con prefijo `ab_`. Queda guardado en los proyectos: no cambiarlo después. |
| `texto` | Lo que dice el bloque, con `%1`, `%2`… donde va cada campo. |
| `campos` | Los campos, en el orden de los `%n`. `PIN` es el menú de pines; otro nombre es un menú de `menus`. |
| `forma` | `"logico"` para un bloque de verdadero/falso. Sin esto es una instrucción. |
| `codigo` | Código que genera. |
| `tick` | `true` si el bloque necesita el `tick` del paquete. |
| `esperarHasta` | Condición que el bloque espera después de su código, sin frenar a los otros programas. |
| `bloqueante` | Código para un programa simple (un solo `al iniciar`), en lugar de `codigo`, `tick` y `esperarHasta`. |

En el código, `{CAMPO}` se reemplaza por lo elegido en ese campo y
`{CAMPO.dato}` por un dato extra de la opción elegida
(`musica{PIN}.{CANCION.metodo}();` → `musica8.marioBros();`).

Un bloque con `tick` hace que el programa se genere con corrutinas aunque
tenga un solo `al iniciar`: con `delay()` su trabajo de fondo se detendría.

El formato cubre campos de menú. Si una librería necesita un hueco para un
número o un bloque con forma propia, hay que ampliar el cargador
(`paquetes/index.ts`) y el generador (`generador/bloques.ts`).

## 3. Verificar

1. **Generador**: test con el código esperado de cada bloque, en modo simple y
   con varios programas (modelo: `bloques-paquetes.test.ts`), y un programa de
   referencia en `__tests__/fixtures/bloques/`.
2. **Compilación y comportamiento**: test de integración que compila con la
   librería y corre en el AVR emulado (modelo:
   `bloques-buzzermusic.integration.test.ts`), con `RUN_BLOQUES_COMPILE=1`.
3. **En el navegador**, con mouse real: sacar los bloques de la paleta, simular
   y comprobar el resultado (modelo: `scripts/recorrido/canciones.js`).
