# Tasks

Entorno: Docker Desktop en el notebook de Pablo. Construir la imagen descarga las imágenes base, paquetes de Debian, npm y pip, `arduino-cli`, el core AVR y las librerías: requiere el permiso de Pablo.

## 1. Lista de librerías

- [x] 1.1 `scripts/librerias-kit.txt` con las seis librerías del kit; `scripts/instalar-librerias.sh` la lee (índice de Arduino o `.tar.gz` de un commit de GitHub). Test de paquetes contra la lista. Fin de línea LF en `.gitattributes`.

## 2. Imagen

- [x] 2.1 `Dockerfile.bloquino`, `docker/bloquino-nginx.conf`, `docker/bloquino-entrypoint.sh` y `docker-compose.bloquino.yml`.
- [x] 2.2 Construir la imagen (con permiso de Pablo). Anotar tamaño y tiempo de construcción.
  - `bloquino:sala`: 774 MB (la de Velxio, 5,3 GB). Primera construcción, unos 2 minutos con buena conexión; reconstruir tras cambiar la página, 15 s.
  - El primer intento falló en `import app.main`: sin `mcp` faltaba `python-multipart`. Se instala `requirements.txt` completo (decisión 2).

## 3. Verificación

- [x] 3.1 Backend de la imagen: tests de integración de bloques y `scripts/recorrido` completo contra ella.
  - `RUN_BLOQUES_COMPILE=1 BLOQUES_BACKEND_URL=http://localhost npx vitest run src/__tests__/bloques-`: 171 tests pasan.
  - Recorrido con la imagen en el puerto 3080 (con `velxio-spike` detenido ese rato): sesiones 2 a 10, `bloques`, `canciones`, `variables`, `textos`, `lcd`, `control` y `display` pasan igual que al cerrar h8.
- [x] 3.2 Página de la imagen con mouse real, entrando por la IP de la red local: abrir un proyecto, simular, monitor serie, guardar. Sin pedidos a internet. Guion `scripts/recorrido/sala.js`.
  - Por `http://192.168.18.111` (contexto no seguro): paleta con 16 componentes, el proyecto inicial parpadea, `sala.bloquino` abre con sus bloques, las órdenes del monitor serie prenden y apagan el LED, descarga `prueba-sala.bloquino`, el proyecto vuelve tras recargar y el servo sale de la paleta al lienzo.
  - Encontrado y corregido: Blockly pedía `sprites.svg` y cuatro sonidos a `static.blockly.com` (decisión 9). Después, ningún pedido sale de la sala.
  - El MCP de Playwright corta el guion en los diálogos del navegador: el guion responde `confirm` y `prompt` desde la página.
  - Único error en consola: `/api/metrics/run` responde 404 (métrica de Velxio que solo existe en su versión de pago); no afecta.
- [x] 3.3 Sin internet: contenedor con `--network none` arranca y compila.
  - Responde a los 2 s; compila en 0,7 s un sketch con `Servo`, `DHT`, `LiquidCrystal` y `BuzzerMusic`; sirve la página y los medios de Blockly.
- [x] 3.4 Solo compilación hacia la red: instalar una librería responde 404; `?profe` abre y compila.
  - `POST /api/libraries/install` y `GET /api/libraries/list`: 404. `?profe` abre el editor de Velxio con Monaco; su pedido de novedades (`/api/news/feed`) da 404 sin consecuencias. La compilación desde `?profe` no se probó aparte: usa la misma ruta que el modo alumno.
- [x] 3.5 Prueba de carga con `scripts/prueba-carga.mjs`: 15 y 30 compilaciones a la vez.
  - Una sola: 0,7 s. Quince distintas a la vez: la del medio 1,7 s y la última 2,8 s. Treinta: la última 4,9 s. Contenedor en reposo: 71 MB de memoria. Medido en el notebook de Pablo (16 hilos), con la cola en sus 3 cupos por defecto.
- [x] 3.6 Batería de tests.

## 4. Documentación

- [x] 4.1 `docs/bloquino-dia-de-clase.md`; `docs/bloquino-agregar-libreria.md` apunta a la lista; decisiones y README del proyecto.

## Sin verificar

- Entrar desde otro equipo de la red (el firewall de Windows puede bloquear el puerto 80): solo se probó desde el mismo notebook por su IP. La guía trae la prueba y la regla.
- La sala real: red sin internet pero con DNS, notebook distinto del de referencia.
