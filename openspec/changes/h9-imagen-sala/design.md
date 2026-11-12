# Design

## Context

- **Hoy**: el backend de desarrollo es el contenedor `velxio-spike` (imagen de Velxio, 5,3 GB) con las librerías del kit instaladas a mano por `scripts/instalar-librerias.sh`; la página corre aparte con `npx vite`.
- **`Dockerfile.standalone` de Velxio**: cuatro etapas (QEMU, ESP-IDF, página, final). La final instala nginx, `arduino-cli`, WASI-SDK y copia ESP-IDF; los cores se instalan en el primer arranque, dentro de un volumen.
- **Backend**: al importarse, `ArduinoCLIService` registra en la configuración de `arduino-cli` los índices de RP2040, ESP32 y ATTiny y corre `core update-index` (pide internet). Si un índice registrado falta en disco, `arduino-cli` no compila nada (issue 254 de Velxio).
- **Compilación**: `/api/compile/start` y `/api/compile/status/<id>`; cola con 3 compilaciones livianas a la vez; caché de resultados por contenido.
- **Página**: el modo alumno solo llama a esos dos servicios. `/` redirige a `/editor`. Fuentes y Monaco van dentro; Blockly, en cambio, pedía sus íconos y sonidos a `static.blockly.com` (decisión 9).
- **Referencia de carga** en `velxio-spike`, este notebook (16 hilos): 1 compilación 1,1 s; 15 distintas a la vez, la última 2,8 s; 30, la última 5,5 s.

Decisiones abiertas de proposal.md: 1, 2 y 3 tomadas con su recomendación; la 4 se resuelve en la decisión 4 de abajo.

## Goals / Non-Goals

**Goals**
- Una imagen que se construye y levanta con un comando y no depende de pasos manuales ni de internet durante la clase.
- Una sola lista de librerías, que también servirá a h10.

**Non-Goals**
- HTTPS en la red local (h7), publicar la imagen en un registro, actualización automática.
- Cambiar el entorno de desarrollo: `velxio-spike` y el proxy de Vite quedan como están.
- Recortar el código del backend de Velxio.

## Decisions

### 1. Imagen nueva y mínima: `Dockerfile.bloquino`
Dos etapas, sin tocar `Dockerfile.standalone`:
- `pagina` (`node:24-slim`, el Node con que se desarrolla): `npm install` y `npx vite build`. Sin los pasos de SEO de `build:docker` (sitemap, prerender), que la sala no usa.
- final (`python:3.12-slim`): `curl`, `nginx`, `arduino-cli` 1.5.1, core `arduino:avr` 1.8.8, librerías del kit, dependencias de Python y `backend/app`. Las versiones son las del contenedor con que se probó el curso.

`docker/bloquino-entrypoint.sh` arranca `uvicorn` y `nginx` y termina si uno cae, para que Docker reinicie el contenedor.

### 2. Backend completo, con las dependencias de Python de Velxio
Se copia `backend/app` entero y se instala `requirements.txt` tal cual. Lo pesado que queda fuera es de sistema (ESP-IDF, QEMU, WASI-SDK, core de RP2040). Se probó dejar fuera `mcp`, `esptool`, `wasmtime` y `zstandard`: el backend no arrancó, porque `python-multipart`, que una ruta necesita, llega de rebote con `mcp`. Mantener una lista aparte por unos 70 MB no vale el riesgo. `python -c "import app.main"` corre en la construcción y la hace fallar si el backend deja de arrancar.

### 3. Todo lo que se descarga, se descarga al construir
- Ese mismo `import app.main` deja registrados los índices de las otras placas y descargados en la imagen (el de ATTiny se siembra antes con la copia de `backend/board-indexes/`, porque su servidor falla seguido). En la sala, el `update-index` del arranque puede fallar sin consecuencias.
- Después se compila un sketch vacío: comprueba `arduino-cli` y deja el core del UNO compilado en la caché de la imagen.
- Sin volúmenes: nada de lo que el curso necesita vive fuera de la imagen. La caché de resultados se pierde al recrear el contenedor, y no importa.

### 4. Hacia la red solo sale la compilación
`docker/bloquino-nginx.conf` reenvía `/api/compile/` y `/health`; el resto de `/api/` responde 404. Motivo: el backend de Velxio no tiene usuarios y trae servicios que un alumno curioso podría usar contra la clase (desinstalar `Servo` deja a todos sin compilar) o contra la red (proxy HTTP, grabado de placas).

Consecuencia para el modo profe (decisión abierta 4): `?profe` sigue abriendo el editor de Velxio en cualquier equipo y compila, pero su gestor de librerías no funciona en esta imagen. No hay estado en el servidor que proteger: cada navegador guarda su proyecto. Las librerías se agregan en la lista y reconstruyendo.

`index.html` se sirve con `no-cache` y `/assets/` (nombres con hash) como inmutable: tras actualizar la imagen ningún navegador queda con la página anterior.

### 5. Lista de librerías: `scripts/librerias-kit.txt`
Una línea por librería: `Nombre@versión`, o `Nombre@https://github.com/usuario/repo.git#commit` para las que no están en el índice de Arduino. `scripts/instalar-librerias.sh` la lee: las primeras con `arduino-cli lib install`; las segundas bajando el `.tar.gz` de ese commit con `curl`, así la imagen no necesita `git`. El test de paquetes comprueba que la lista trae el origen y el commit que declara cada paquete de bloques.

### 6. Arranque: `docker-compose.bloquino.yml`
`docker compose -f docker-compose.bloquino.yml up -d --build`. Proyecto `bloquino`, imagen `bloquino:sala`, `restart: unless-stopped`, puerto `${BLOQUINO_PUERTO:-80}`: con el 80 los alumnos escriben solo la IP. El `docker-compose.yml` de Velxio queda intacto.

### 7. Prueba de carga: `scripts/prueba-carga.mjs`
Manda N programas distintos (con `Servo`, para incluir una librería) a compilar a la vez y muestra el tiempo de la primera, la del medio y la última. Los cupos de la cola quedan en su valor por defecto (3): con la referencia medida no hace falta ajustarlos.

### 8. Verificación
- **Backend de la imagen**: tests de integración de bloques (`RUN_BLOQUES_COMPILE=1`, `BLOQUES_BACKEND_URL`) y el recorrido completo de `scripts/recorrido`, con la imagen ocupando por un rato el puerto 3080 del contenedor de desarrollo.
- **Página de la imagen**: el arnés del recorrido lee los módulos del servidor de desarrollo y no sirve sobre la página compilada. Guion aparte (`scripts/recorrido/sala.js`) que solo usa lo que ve un alumno: abrir un proyecto guardado, simular y mirar el LED y el monitor serie. Se corre entrando por la IP de la red local, que es como entran los alumnos (sin HTTPS el navegador desactiva algunas funciones; hay que ver que ninguna haga falta).
- **Sin internet**: contenedor con `--network none`, compilando desde adentro.

### 9. Medios de Blockly dentro de la página
La prueba por la IP mostró pedidos a `static.blockly.com` (`sprites.svg`, con la papelera, y cuatro sonidos). Sin internet la papelera quedaría sin dibujo. Se copia `node_modules/blockly/media` (51 KB) a `frontend/public/blockly-media/` y `BlocksPanel` lo indica con la opción `media`. Al subir de versión Blockly hay que volver a copiarla.

## Risks / Trade-offs

- **Firewall de Windows**: en una red marcada como pública bloquea el puerto. No se puede comprobar desde este mismo equipo; la guía trae la regla y la prueba desde otro dispositivo.
- **`install.sh` de arduino-cli y los `.tar.gz` de GitHub** se descargan al construir: sin internet no se puede reconstruir, pero la imagen ya construida no los necesita.
- **Actualizar Velxio** puede sumar una dependencia de Python que el backend importe al arrancar: la construcción falla en `import app.main` y avisa.
- **Notebook más lento que el de referencia**: la prueba de carga hay que repetirla en el equipo que se use en la sala.
