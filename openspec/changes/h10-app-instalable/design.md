# Design

## Context

- **Página**: el modo alumno solo le pide al backend `POST /api/compile/start` y `GET /api/compile/status/<id>` (`frontend/src/services/compilation.ts`), en el mismo origen. Compilada pesa 99 MB (medido en la imagen de la sala): 27 de `wasm/`, 21 de `examples-thumbs/`, 16 de `monaco/`, 13 de `firmware/` y 13 de `assets/`. Buena parte es de Velxio y el alumno no la usa.
- **Backend para el UNO** (`backend/app/services/arduino_cli.py`): escribe los archivos en una carpeta `sketch/`, renombra el primer `.ino` a `sketch.ino`, corre `arduino-cli compile --fqbn arduino:avr:uno --output-dir build sketch` y devuelve `build/sketch.ino.hex`.
- **Compilador en la imagen**: `arduino-cli` 1.5.1 y core `arduino:avr` 1.8.8 (`ARG` de `Dockerfile.bloquino`), 330 MB con sus herramientas; librerías de `scripts/librerias-kit.txt`, 5 MB.
- **Carga** (`frontend/src/bloquino/flash/cargar.ts`): `navigator.serial.getPorts()` y `requestPort({ filters })`; exige contexto seguro.
- **Proyecto** (`frontend/src/bloquino/proyecto.ts`): guardado automático en `localStorage`, atado al origen de la página. Abrir es `abrir(File)`; guardar es una descarga.
- **Modo** (`frontend/src/bloquino/modo.ts`): `?profe` y `?alumno` en la URL, recordado en `localStorage`.

Decisiones abiertas de proposal.md, todas con su recomendación: Electron (1), servicio pequeño (2), Web Serial (3), sin firmar (4), driver como paso opcional (5), instalación por usuario (6), paquete a mano (7).

## Goals / Non-Goals

**Goals**
- La página no sabe que corre dentro de la aplicación, salvo en tres puntos: abrir un archivo que llega de Windows, el motivo de una carga sin puerto y mostrar la versión del instalador.
- El servicio de compilación se prueba sin Electron, con los mismos tests de integración que la imagen de la sala.
- Corregir un bug de la página no obliga a reinstalar.

**Non-Goals**
- Recortar de la página lo que el alumno no usa (bajaría el paquete de actualización; se decide con el tamaño medido).
- Caché de resultados de compilación y cola con cupos: hay un solo usuario.
- Gestor de librerías en modo profe: igual que en la sala, se agregan en la lista y se reconstruye.
- Cambiar la imagen de la sala, más allá de recibir la versión.

## Decisions

### 1. Electron, en una carpeta propia `app/`
`app/package.json` aparte, con `electron` y `electron-builder` como dependencias de desarrollo en versiones fijas; `frontend/package.json` no cambia. Tauri queda descartado: obliga a instalar Rust y a comprobar Web Serial en WebView2, cuando todo Bloquino está probado en Chrome.

Piezas de `app/`:
- `servicio.mjs`: Node sin dependencias (`http`, `child_process`, `fs`). Sirve la página y compila. No importa nada de Electron.
- `principal.mjs`: ventana, menú, instancia única, permisos de puerto serie, archivo que llega de Windows, actualización de la página.
- `puente.cjs` (preload): lo poco que la página necesita del proceso principal.

### 2. Origen fijo `http://127.0.0.1:<puerto>`
`servicio.mjs` escucha solo en `127.0.0.1`, en un puerto fijo poco usado, y la ventana carga esa dirección.
- El guardado automático vive en `localStorage`, que depende del origen: un puerto que cambia perdería el proyecto.
- `127.0.0.1` es contexto seguro: Web Serial funciona sin certificado.
- Es lo mismo que ya se prueba (`http://localhost`), y deja correr contra el servicio los tests de integración (`BLOQUES_BACKEND_URL`) y el recorrido desde Chrome, sin Electron.

Alternativas: un protocolo propio (`bloquino://`) evita el puerto, pero cambia cómo se sirven `wasm`, workers y rutas, y no se prueba sin Electron; `file://` no es contexto seguro y rompe las rutas de la página.

Rutas que no existen como archivo devuelven `index.html` (la página usa rutas del navegador). `index.html` va con `no-cache`.

El servicio responde solo a pedidos cuyo `Host` y `Origin` son los suyos: una página web abierta en el navegador del mismo equipo no puede usarlo.

### 3. Compilación: el contrato mínimo de las dos rutas
- `POST /api/compile/start` con `{ files, board_fqbn }` → `{ job_id }`. Solo `arduino:avr:uno`; nombres de archivo que salgan de la carpeta se rechazan.
- `GET /api/compile/status/<id>` → `{ state, stdout, result, error }`, con `result = { success, hex_content, stdout, stderr, error }`. Los campos de cola (`stage`, `progress`…) se omiten: la página ya tiene valores por defecto para un backend que no los manda.
- Una compilación a la vez; las demás esperan en orden.
- Carpeta temporal por trabajo, borrada al terminar. El resto de `/api/` responde 404.

Los mensajes de error salen de `arduino-cli` tal cual. Lo que el backend de Velxio agrega encima (`annotate_build_stderr`, `error_kind`) se replica solo si la comparación de la tarea 2.3 muestra una diferencia que el alumno ve.

### 4. `arduino-cli` portátil dentro del instalador
`app/preparar-compilador.mjs` arma `app/compilador/` en el equipo que publica: descarga `arduino-cli` para Windows, instala el core y las librerías de `scripts/librerias-kit.txt` (las de GitHub, bajando el `.zip` del commit). Las versiones de `arduino-cli` y del core se leen de los `ARG` de `Dockerfile.bloquino`: una sola fuente.

En el equipo del alumno, el servicio llama a `arduino-cli.exe` con las carpetas por variables de entorno: `ARDUINO_DIRECTORIES_DATA` y `ARDUINO_DIRECTORIES_USER` dentro de la instalación; descargas y caché de compilación en `%LOCALAPPDATA%\Bloquino\`. Sin índices de otras placas: no hay nada que pedir a internet.

El core compilado no viaja en el instalador (su caché depende de rutas del equipo). En el primer arranque la aplicación compila un sketch vacío en segundo plano, para que la primera simulación del alumno no lo espere.

### 5. Puerto serie
Electron no trae selector de puertos. En `principal.mjs`:
- Permisos de serie concedidos solo al origen de la aplicación.
- `select-serial-port`: se filtra por los fabricantes que pide la página. Un puerto: se elige solo. Varios: lista en español con el nombre de cada puerto. Ninguno o cancelado: se rechaza.
- La página distingue «ninguna placa» de «no elegiste» preguntando al puente el motivo del último rechazo; `cargar.ts` suma la falla `sinPlaca` a las que ya tiene. Fuera de la aplicación no cambia nada.

### 6. Archivos `.bloquino`
- `electron-builder` registra la extensión (`fileAssociations`).
- La ruta llega por los argumentos del proceso, o por `second-instance` si Bloquino ya está abierto (instancia única: también cubre «una sola ventana»).
- `principal.mjs` lee el archivo y se lo pasa a la página por el puente; `PaginaAlumno.tsx` arma un `File` y llama a `abrir`, por el mismo camino y con los mismos avisos que el botón Abrir. Si la página aún no cargó, el archivo espera.
- Guardar: la descarga de la página abre el diálogo «Guardar como» de Electron; no hay código nuevo.

### 7. Menú
Barra de menú oculta, visible con Alt, en español: Modo profe / Modo alumno (navegan a `/editor?profe` y `/editor?alumno`), Actualizar desde archivo…, Instalar driver de la placa, Acerca de (versión de la página y del instalador), Salir. Los enlaces externos (Código fuente) abren en el navegador del equipo; la ventana no navega fuera de su origen.

### 8. Página actualizable
- **Paquete**: `bloquino-pagina-<versión>.asar`, el `dist/` de la página en el formato de archivo único que Electron lee sin descomprimir. Adentro, `bloquino-version.json`: `{ version, commit, fecha, baseMinima, archivos: { ruta: sha256 } }`.
- **Dónde vive**: el instalador trae su página en `resources/pagina.asar`; las actualizaciones se copian a `%LOCALAPPDATA%\Bloquino\pagina\`. Al arrancar se usa la de fecha más nueva entre las dos; así, reinstalar con una página más nueva gana sola, y una actualización vieja se descarta.
- **Actualizar desde archivo**: copia a un nombre temporal, comprueba cada `sha256` y `baseMinima`, renombra y reinicia la aplicación. Si algo falla, borra el temporal y avisa; la página anterior no se toca. La rutina recibe la ruta del paquete y no sabe de dónde vino: `h11-actualizacion-automatica` la reutiliza para lo descargado.
- **El proyecto sobrevive** porque el origen no cambia (decisión 2).
- **Por qué `.asar` y no `.zip`**: Node no lee zip sin dependencias, y descomprimir 99 MB en miles de archivos hace lenta y frágil la actualización. `servicio.mjs` recibe una función de lectura: dentro de Electron lee del `.asar`; en los tests, de `frontend/dist`.

Tamaño: el paquete lleva la página entera, decenas de MB (la tarea 5.1 lo mide). No son los «pocos MB» que se estimaron antes de medir.

### 9. Base del instalador
`app/base.json`: `{ "base": 1, "huella": "<sha256>" }`. La huella se calcula sobre `scripts/librerias-kit.txt`, las versiones de `arduino-cli` y del core, y la lista de funciones del puente. Un test la recalcula: si cambió y `base` no subió, falla y dice qué hacer. Cada paquete de página declara como `baseMinima` la base de su commit; la aplicación rechaza el paquete si es mayor que la suya.

Alternativa descartada: comparar versiones a ojo. Olvidarse una vez dejaría notebooks con una página que pide una librería que no tienen, y el error aparecería recién al compilar.

### 10. Versión única
- Identificador: fecha del commit y hash corto, `2026.11.15 (1b779d2)`. Sale de git, no se escribe a mano.
- La página lo recibe al compilarse (`define` de Vite desde `BLOQUINO_VERSION`; sin la variable, «desarrollo») y lo muestra junto al enlace Código fuente. `vite.config.ts` es de Velxio: el cambio lleva `Bloquino:`.
- `Dockerfile.bloquino` lo recibe como argumento de construcción; `sala.ps1` se lo pasa.

### 11. Publicación: `scripts/publicar.ps1`
Con el árbol limpio (si no, se niega): calcula la versión, construye la imagen de la sala (`sala.ps1 --build`), compila la página, arma el paquete `.asar`, prepara el compilador si falta y construye el instalador. Deja instalador y paquete en `app/salida/` y muestra la versión y los tamaños. Mensajes sin tildes, como los otros `.ps1`.

### 12. Instalador
`electron-builder` con NSIS, por usuario (`perMachine: false`), sin firma. `extraResources`: `compilador/`, `pagina.asar` y el instalador del driver. Paso opcional al final, desmarcado por defecto: «Instalar el driver de la placa (pide permisos de administrador)», que lanza el instalador del CH340 con elevación; el mismo instalador se lanza desde el menú.

### 13. Verificación
- **Servicio solo** (`node app/servicio.mjs`, con `arduino-cli` de Windows): tests propios con `node --test` (rutas, rechazos, `Host`/`Origin`) y los tests de integración de bloques con `BLOQUES_BACKEND_URL`.
- **Mismo resultado que la sala**: un guion manda los programas de los ejemplos y uno con error a la sala y al servicio, y compara `success` y los mensajes; anota si el `.hex` coincide.
- **Aplicación**: guion con `playwright-core` (el del MCP, sin instalar nada) manejando Electron: simular, cerrar y reabrir, abrir un `.bloquino` por argumento, actualizar desde archivo (paquete bueno, dañado y de base mayor), modo profe.
- **Carga**: como la aplicación elige el puerto, el guion carga a la placa real sin intervención cuando hay una conectada.
- **Rutas con tilde y espacio**: el servicio con sus carpetas bajo `…\José Pérez\`, sin crear usuarios de Windows.
- **Instalador**: lo corre Pablo (instalar, doble clic en un `.bloquino`, driver, desinstalar).

## Risks / Trade-offs

- [Puerto fijo ocupado por otro programa] → la aplicación lo dice al abrir y no arranca a medias; puerto alto y poco usado. No se cambia de puerto: perdería el proyecto guardado.
- [`avr-gcc` con tildes en la ruta: la instalación por usuario queda bajo `C:\Users\<nombre>\`] → se prueba primero (tarea 2.4); si falla, llamar al compilador por rutas cortas 8.3 o instalar en `C:\Bloquino`.
- [Antivirus o SmartScreen frenan un instalador sin firmar con un compilador adentro] → guía con el aviso; probar en un notebook del colegio antes de repartir.
- [Compilar en Windows es más lento que en la sala: cada llamada lanza varios procesos] → se mide (tarea 2.5); si pasa de unos segundos, conservar la carpeta de compilación entre trabajos.
- [Paquete de actualización de decenas de MB] → cabe en un pendrive; recortar la página queda como mejora.
- [Detalles de Electron sin comprobar: si `select-serial-port` ya llega filtrado, si la descarga abre «Guardar como», si `arduino-cli` escribe en su carpeta de datos] → cada uno es una comprobación explícita en las tareas.
- [Redistribuir el instalador del driver CH340] → revisar su licencia; si no se puede, la guía enlaza al fabricante y el paso del instalador desaparece.
- [Dos compilaciones de la página por publicación, una en Docker y otra para la aplicación] → mismo commit y misma versión; `publicar.ps1` se niega con el árbol sucio.
- [Subir de versión Electron cambia el motor] → versión fija; al subirla, correr el guion de la aplicación.

## Open Questions

- ¿Los notebooks del colegio tienen Windows 10 u 11, y de 64 bits? Electron actual pide Windows 10 o superior; se confirma antes de repartir, no cambia el diseño.
