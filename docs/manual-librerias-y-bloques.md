# Manual: librerías y bloques en Bloquino

Para el administrador (Pablo). Cuatro partes: probar hoy las canciones del
buzzer, agregar una librería de Arduino, agregar un bloque y agregar una
librería propia del curso. El ejemplo trabajado es BuzzerMusic (change
`openspec/changes/archive/2026-11-12-h6-libreria-buzzermusic/`).

Complementa a [bloquino-agregar-libreria.md](bloquino-agregar-libreria.md)
(referencia de campos del paquete JSON) y a
[bloquino-agregar-componente.md](bloquino-agregar-componente.md) (componentes
nuevos del lienzo). Rutas relativas a `repo/`; comandos en PowerShell.

Verificado el 2026-11-13 (ver al final qué se comprobó y qué no).

---

## A. Probar hoy las canciones del buzzer

**No hay que instalar nada.** BuzzerMusic 1.1.0 ya está en la imagen de la
sala (`bloquino:sala`) y en el backend de desarrollo (`velxio-spike`), y sus
bloques ya están en la paleta.

### Dónde están los bloques

Pestaña **Código** → categoría **Sonido** (color morado), al final, después de
«tocar nota» y «silenciar pin»:

| Bloque | Forma | Qué hace |
|---|---|---|
| `tocar canción [Mario Bros] en pin [8]` | instrucción | Toca la canción entera y después sigue con el bloque siguiente. |
| `empezar canción [Mario Bros] en pin [8]` | instrucción | La deja sonando de fondo y sigue de inmediato. |
| `detener canción en pin [8]` | instrucción | La corta. |
| `¿canción sonando en pin [8]?` | verdadero/falso | Para `si`, `repetir mientras`, `esperar hasta que`. |

Canciones del menú: Mario Bros, Marcha Imperial, Cumpleaños feliz, Himno de la
Alegría.

### Opción 1: abrir el ejemplo «rockola»

1. Con Docker Desktop abierto, el contenedor `bloquino` arranca solo. Abrir
   http://localhost (en otro equipo de la sala: `http://<IP del notebook>`).
2. Bajar el ejemplo: http://localhost/ejemplos/04-rockola.bloquino (o tomarlo
   de `frontend/public/ejemplos/04-rockola.bloquino`).
3. **Abrir** → elegir el archivo → aceptar «El proyecto que abras reemplazará
   al actual».
4. **Iniciar simulación**, con el audio del equipo encendido (el sonido lo
   hace el navegador).
5. Qué debe pasar: saluda con tres notas. Clic en el botón **verde** (pin 2):
   empieza el Himno de la Alegría de fondo y la luz «L» parpadea mientras
   suena. Botón **azul** (pin 3): si suena algo, lo corta; si no, toca
   Cumpleaños feliz entero.

El ejemplo usa los cuatro bloques de canciones.

### Opción 2: armarlo desde cero

1. **Nuevo**. Agregar **Buzzer** desde *Componentes* (a la protoboard o
   directo): la patita de señal al pin 8 y la otra a GND, como en la rockola.
2. **Código** → *Sonido* → arrastrar `tocar canción` bajo `al iniciar` (si no
   está, sacarlo de *Eventos*).
3. **Iniciar simulación**. Suena una vez.
4. Para música de fondo: `empezar canción` bajo `al iniciar` y, debajo, un
   `por siempre` que haga parpadear un LED. Para cortarla: un segundo programa
   `cuando se presiona botón en pin 2` → `detener canción en pin 8`.

### Placa real

**Cargar a la placa** manda el mismo programa al UNO (Web Serial: Chrome o
Edge, en http://localhost o en `https://<IP>`). Buzzer pasivo del kit: señal
al pin 8, la otra patita a GND. *No probado en esta revisión.*

### Qué C++ generan

Siempre agregan `#include <BuzzerMusic.h>` y un objeto por pin usado,
`BuzzerMusic musica8(8);`.

| Bloque | Programa simple (un solo `al iniciar`) | Varios programas (corrutinas) |
|---|---|---|
| tocar canción | `musica8.marioBros();` (la llamada de las slides) | `musica8.start(BuzzerMusic::MARIO_BROS);` + `ESPERAR_HASTA(!musica8.isPlaying());` |
| empezar canción | pasa el programa a corrutinas (ver abajo) | `musica8.start(BuzzerMusic::MARIO_BROS);` |
| detener canción | `musica8.stop();` | `musica8.stop();` |
| ¿canción sonando? | `musica8.isPlaying()` | `musica8.isPlaying()` |

En modo corrutinas, `loop()` empieza con `musica8.update();`, que avanza la
nota. Un `empezar canción` hace que el programa se genere con corrutinas aunque
tenga un solo `al iniciar`: con `delay()` la canción se cortaría. Programas de
referencia: `frontend/src/__tests__/fixtures/bloques/cancion.ino` (simple) y
`musica-de-fondo.ino` (de fondo + botón).

---

## B. Agregar una librería de Arduino

Sirve para cualquier librería que use el código generado (Servo, DHT,
LiquidCrystal, IRremote, BuzzerMusic…). Una sola lista alimenta los dos
backends: `scripts/librerias-kit.txt`.

### 1. Buscar nombre y versión exactos

```powershell
docker exec velxio-spike arduino-cli lib search "LiquidCrystal I2C"
```

Usar la misma librería y versión que las slides de `../Curso_Arduino`, para que
el código generado coincida con ellas.

### 2. Agregar una línea a `scripts/librerias-kit.txt`

```
Nombre@versión                                          (índice de Arduino)
Nombre@https://github.com/usuario/repo.git#<commit>     (fuera del índice)
```

- Versión siempre fija. En la forma de GitHub va el commit completo (40
  caracteres); se baja el `.tar.gz` de ese commit con `curl`, sin `git`.
- `Nombre` es la carpeta donde queda la librería: igual al nombre del
  `library.properties`.
- El archivo es LF (`.gitattributes`): no guardarlo con CRLF.

Lo instala `scripts/instalar-librerias.sh` (`arduino-cli lib install` o
descarga del commit). Se puede repetir sin problema.

### 3. Backend de desarrollo (`velxio-spike`, puerto 3080)

```powershell
docker cp scripts/librerias-kit.txt velxio-spike:/tmp/
docker cp scripts/instalar-librerias.sh velxio-spike:/tmp/
docker exec velxio-spike sh /tmp/instalar-librerias.sh
```

Termina con `arduino-cli lib list`. Si el contenedor se recrea, se pierde:
repetir.

### 4. Imagen de la sala (`bloquino:sala`)

Desde `repo/`:

```powershell
.\scripts\sala.ps1 --build
```

`Dockerfile.bloquino` copia la lista y corre el mismo script al construir.
Usar `sala.ps1` y no `docker compose … up --build` a secas (lo que dice
`bloquino-agregar-libreria.md`): `sala.ps1` pone la IP del día en el
certificado HTTPS.

### 5. Comprobar

```powershell
docker exec bloquino arduino-cli lib list
docker exec velxio-spike arduino-cli lib list
```

Con la librería instalada todavía no hay bloques: un sketch escrito a mano en
modo profe ya compila con ella. Los bloques son la parte C o la D.

---

## C. Agregar un bloque nuevo

Dos caminos:

- **Bloque de una librería, con solo menús y pin** (canciones, efectos,
  melodías): paquete JSON, sin tocar TypeScript. Ver parte D.
- **Cualquier otro** (entradas de número o texto, lógica propia, bloque sin
  librería): en el catálogo TypeScript. Esta parte.

Hacerlo como change propio de OpenSpec (paso 9) y en una sesión abierta en
`repo/`.

### 1. Definición y lugar en la paleta

Archivo de la categoría: `frontend/src/blocks/catalogo/<categoría>.ts`
(`eventos`, `control`, `luces`, `sonido`, `movimiento`, `sensores`,
`pantallas`, `serie`, `operadores`, `avanzado`; `variables.ts` es aparte).
Modelo, `sonido.ts`:

```ts
export default categoria(
  'sonido', '#CF63CF',
  { ab_tocar_nota: { args: [menu('NOTA', NOTAS), valor('S', 'Number'), pin()], ...INSTRUCCION } },
  [{ type: 'ab_tocar_nota', fields: { NOTA: '262', PIN: '8' }, inputs: { S: num(0.5) } }],
);
```

- Tercer argumento: definición. Piezas en `catalogo/base.ts`: formas
  `INSTRUCCION`, `NUMERO`, `LOGICO`, `TEXTO`; entradas `valor`, `cuerpo`,
  `SALTO`; campos `menu`, `pin` (2–13), `pinPwm`, `pinAnalogico`.
- Cuarto argumento: cómo aparece en la paleta, con valores por defecto
  (`num(…)`, `txt(…)` para las sombras).
- Tipo `ab_<nombre>`: queda guardado en los proyectos; no cambiarlo después.

### 2. Texto

`frontend/src/i18n/locales/es/bloques.json`, clave `AB_<TIPO EN MAYÚSCULAS>`,
con `%1`, `%2`… en el orden de `args`:

```json
"AB_TOCAR_NOTA": "tocar nota %1 por %2 segundos en pin %3",
```

La definición lo toma sola (`message0: %{BKY_AB_TOCAR_NOTA}`). Los textos de
la página van en `bloquino.json`, no aquí.

### 3. Categoría y color

- El color del bloque es el de su categoría (`categoria(id, color, …)`);
  `BlocksPanel.tsx` arma los estilos desde `CATEGORIAS`.
- **Categoría nueva**: archivo nuevo en `catalogo/`, agregarlo a
  `CATEGORIAS` en `catalogo/index.ts` (el orden es el de la paleta) y su
  nombre en `bloques.json` como `AB_CAT_<ID>`.

### 4. Generador C++ (clásico y programas paralelos)

`frontend/src/blocks/generador/bloques.ts`, una función por tipo:

```ts
G.ab_servo = (b) => {
  const p = campo(b, 'PIN');
  gen.ctx.includes.add('#include <Servo.h>');
  gen.ctx.globales.add(`Servo servo${p};`);
  gen.ctx.setup.add(`servo${p}.attach(${p});`);
  return `servo${p}.write(${valor(b, 'ANGULO')});\n`;
};
```

- **Instrucción**: devuelve el texto con `\n`. **Valor**: devuelve
  `[código, ORDEN.x]` (precedencia, para los paréntesis).
- **No** se escribe `#include`, `setup()` ni `delay()` dentro del código: se
  aporta al contexto (`generador/contexto.ts`). Los conjuntos no repiten: diez
  bloques del mismo sensor declaran un solo objeto.

| Contexto | Para qué |
|---|---|
| `gen.ctx.includes` | `#include <Librería.h>` (y la librería en la parte B) |
| `gen.ctx.globales` | Objetos y variables globales |
| `gen.ctx.setup` | `pinMode`, `begin`, `attach` (los `pinMode` van primero) |
| `gen.ctx.funciones` | Funciones auxiliares completas |
| `gen.ctx.tick` | Código de cada vuelta de `loop()`; pasa el programa a corrutinas |
| `gen.ctx.esperar(ms)` | `delay(ms)` en clásico, `ESPERAR(ms)` en corrutinas |
| `gen.ctx.esperarHasta(c)` | `while (!(c)) {}` o `ESPERAR_HASTA(c)` |
| `gen.ctx.contador(v)` / `vuelta()` | Contadores de bucles y cesión de turno |
| `gen.ctx.paralelo` | `true` si se genera con corrutinas (para variantes) |

**Programas paralelos**: no hay un generador aparte. La misma función sirve en
los dos modos si usa `esperar`/`esperarHasta` del contexto en lugar de
`delay()`/`while`. Solo hace falta código propio en
`generador/index.ts` para un **sombrero nuevo** (evento como «cuando se
presiona botón»), que además va en `catalogo/eventos.ts` (`SOMBREROS`). Si la
librería bloquea (DHT11: ~25 ms por lectura), anotarlo en la spec.

### 5. Ejemplo

Todo bloque de la paleta tiene que aparecer en algún proyecto de
`frontend/public/ejemplos/`, o falla `bloquino-ejemplos.test.ts` («entre todos
usan cada bloque de la paleta»).

- Sumarlo a uno de los doce: abrirlo en la página, agregar el bloque y
  **Descargar** con el mismo nombre. El test exige que el `sketch.ino`
  guardado sea exactamente el que generan sus bloques; si cambió el generador:
  abrir, panel Código, mover cualquier bloque y descargar de nuevo.
- Cables ordenados: sin cruces ni pasar sobre componentes.
- Un ejemplo 13 rompe «son doce, numerados»: actualizar el test, la tabla de
  `docs/bloquino-ejemplos.md` y `scripts/recorrido/ejemplos.js`.

### 6. Tests

Desde `repo/frontend`:

1. **Generador**: el código de cada variante, en modo simple y con varios
   programas. En `bloques-generador.test.ts` o un `bloques-<tema>.test.ts`
   propio (modelo: `bloques-paquetes.test.ts`).
2. **Programa de referencia**: `src/__tests__/fixtures/bloques/<nombre>.json`
   (bloques) y `<nombre>.ino` (esperado); agregar `<nombre>` a la lista de
   `bloques-referencia.test.ts`. `bloques-compile.integration.test.ts` los
   compila.
3. **Integración**: compila en el backend y corre en el AVR emulado (modelo:
   `bloques-buzzermusic.integration.test.ts`, `bloques-dht11.integration.test.ts`).

```powershell
npx vitest run src/__tests__/bloques-paquetes.test.ts
$env:RUN_BLOQUES_COMPILE = '1'; npx vitest run src/__tests__/bloques-
npx vitest run src/__tests__/bloquino-ejemplos.test.ts
```

Los integración usan el backend de 3080; otro con `BLOQUES_BACKEND_URL`. En
`npx vitest run` completo, 15 fallos en 10 archivos son del entorno Windows;
después restaurar `__snapshots__/examples-netlist-snapshot.test.ts.snap`.
Tipos: `npx tsc --noEmit -p tsconfig.app.json`, mirando solo los errores de
`blocks/` y `bloquino/` (el resto son viejos de Velxio).

### 7. Recorrido con mouse real (Playwright)

Con `npx vite` (5173) y `velxio-spike` (3080) arriba:

1. Guion nuevo `scripts/recorrido/<nombre>.js` (modelo: `canciones.js`: saca
   los bloques de la paleta, cambia un menú, simula y comprueba notas y LED con
   `espiarAudio`/`notasOidas`). Anotarlo en `scripts/recorrido/README.md`.
2. `node scripts/recorrido/conv.mjs <nombre>`.
3. En el MCP de Playwright, cargar `instalar` y después
   `page.__cargar('<nombre>')` (ver el README; definir el cargador en cada
   llamada si `page.__cargar` no sobrevive).
4. Correr también los guiones de siempre como regresión.

### 8. Cierre

- Reconstruir la imagen de la sala: `.\scripts\sala.ps1 --build` (la página va
  compilada dentro de la imagen: sin esto el bloque no aparece en
  http://localhost).
- Si cambia cómo se programa algo del kit, actualizar las slides de
  `../Curso_Arduino`.

### 9. OpenSpec como change propio

Sesión de Claude abierta en `repo/`:

1. `/opsx:propose` → `openspec/changes/<change>/` con `proposal.md`,
   `design.md`, `tasks.md` y `specs/bloques/<capacidad>/spec.md` (delta:
   requisitos y escenarios del bloque). Capacidades actuales en
   `openspec/specs/bloques/` (`buzzermusic`, `paquetes`, `catalogo-base`,
   `generador-clasico`, `generador-corrutinas`…).
2. `openspec validate <change> --strict`.
3. `/opsx:apply <change>`: implementa las tareas (pasos 1–8).
4. `/opsx:archive`: mueve el change a `archive/` y fusiona las specs.

---

## D. Agregar una librería propia del curso (como BuzzerMusic)

Lo que se hizo en h6, en orden.

### 1. La librería, en su propio repositorio

Clon local: `D:\Second_Brain\Personal\Proyectos\Arduino\BuzzerMusic`,
publicado en https://github.com/pabgonza/BuzzerMusic (GPL-3.0). Estructura de
librería de Arduino:

```
library.properties   name=BuzzerMusic, version=1.1.0, …
src/BuzzerMusic.h, BuzzerMusic.cpp, pitches.h
examples/TocaUnaCancion, examples/MusicaSinBloquear
keywords.txt, README.md, LICENSE
```

Dos API, porque Bloquino genera dos modos:

- **Bloqueante**, la de las slides: `musica.marioBros();`.
- **No bloqueante**, para programas paralelos: `start(BuzzerMusic::MARIO_BROS)`,
  `update()` en cada vuelta, `stop()`, `isPlaying()`.

Sin la no bloqueante, una canción frenaría a los demás programas.

### 2. Fijar el commit en la lista del kit

El repositorio no tiene etiquetas: se fija por commit.

```
BuzzerMusic@https://github.com/pabgonza/BuzzerMusic.git#7742b6c5ae98efbe638d852e875cbe742ccb5dd0
```

Después, parte B pasos 3 a 5 (velxio-spike y `sala.ps1 --build`).

### 3. Paquete de bloques

`frontend/src/blocks/paquetes/buzzermusic.json`. Se carga solo
(`paquetes/index.ts`, `import.meta.glob('./*.json')`): ni catálogo, ni
generador, ni `bloques.json`. Campos (detalle en `bloquino-agregar-libreria.md`):

```json
{
  "libreria": { "nombre": "BuzzerMusic", "version": "1.1.0",
                "origen": "https://github.com/pabgonza/BuzzerMusic.git",
                "commit": "7742b6c5ae98efbe638d852e875cbe742ccb5dd0" },
  "categoria": "sonido",
  "include": "#include <BuzzerMusic.h>",
  "global": "BuzzerMusic musica{PIN}({PIN});",
  "tick": "musica{PIN}.update();",
  "porDefecto": { "PIN": "8" },
  "menus": { "CANCION": [
    { "texto": "Mario Bros", "valor": "MARIO_BROS", "metodo": "marioBros" }, … ] },
  "bloques": [
    { "tipo": "ab_tocar_cancion", "texto": "tocar canción %1 en pin %2",
      "campos": ["CANCION", "PIN"],
      "codigo": "musica{PIN}.start(BuzzerMusic::{CANCION});",
      "tick": true, "esperarHasta": "!musica{PIN}.isPlaying()",
      "bloqueante": "musica{PIN}.{CANCION.metodo}();" },
    …
  ]
}
```

- `libreria` debe coincidir con la línea del kit: `bloques-paquetes.test.ts`
  comprueba que la lista contiene `nombre@origen#commit`.
- `categoria`: una que exista (los bloques van al final, con su color). Para
  una categoría nueva, parte C paso 3.
- `{PIN}` en `global`: un objeto por pin usado. `{CAMPO.dato}`: dato extra de
  la opción del menú (`{CANCION.metodo}` → `marioBros`).
- `bloqueante`: la variante del programa simple (la de las slides). `tick` +
  `esperarHasta`: la variante de corrutinas. Un bloque con `tick` y sin
  `bloqueante` (`empezar canción`) pasa el programa a corrutinas.
- `"forma": "logico"` para un bloque verdadero/falso.
- Límite: solo campos de menú y pin. Un hueco para un número o una forma
  propia exige ampliar `paquetes/index.ts` y `generador/bloques.ts`, o ir por
  el catálogo (parte C).

### 4. Lo demás, como cualquier bloque (parte C, pasos 5 a 9)

En h6 quedó así:

| Paso | BuzzerMusic |
|---|---|
| Tests del generador | `bloques-paquetes.test.ts` (13 tests: paleta, menú, simple, corrutinas, objeto por pin, commit en la lista) |
| Programas de referencia | `fixtures/bloques/cancion.{json,ino}`, `musica-de-fondo.{json,ino}` |
| Integración | `bloques-buzzermusic.integration.test.ts`: notas de Mario Bros a su tiempo, himno de fondo con LED, ceder el turno, detener con botón |
| Ejemplo | `frontend/public/ejemplos/04-rockola.bloquino` (los cuatro bloques) |
| Recorrido | `scripts/recorrido/canciones.js` |
| Specs | `openspec/specs/bloques/buzzermusic/spec.md` y `paquetes/spec.md` |
| Change | `openspec/changes/archive/2026-11-12-h6-libreria-buzzermusic/` |

### 5. Nueva versión de la librería

Commit nuevo en su repositorio → actualizar el commit (y la versión) en
`librerias-kit.txt` **y** en el `libreria` del paquete → reinstalar en
`velxio-spike` → `sala.ps1 --build`. No cambiar los `tipo` ni los `valor` de
los menús: los proyectos guardados los usan.

---

## Qué se verificó (2026-11-13)

- `arduino-cli lib list` en `bloquino` y en `velxio-spike`: BuzzerMusic 1.1.0,
  Servo 1.3.0, DHT sensor library 1.4.7, Adafruit Unified Sensor 1.1.15,
  LiquidCrystal 1.0.7, IRremote 4.7.1.
- En http://localhost (sala) y http://localhost:5173/editor?alumno
  (desarrollo), con Playwright: categorías Eventos … Avanzado; *Sonido* trae
  `tocar nota`, `silenciar`, `tocar canción`, `empezar canción`, `detener
  canción`, `¿canción sonando?`.
- En la sala: `04-rockola.bloquino` abierto con **Abrir**, compiló y la
  simulación arrancó.
- **No verificado**: el audio de la rockola en esta revisión (sí en h6, por las
  notas que el buzzer pide al navegador), la carga a la placa real, y los
  pasos de agregar una librería o bloque nuevos (descritos desde el código y
  el change h6, sin ejecutarlos).
