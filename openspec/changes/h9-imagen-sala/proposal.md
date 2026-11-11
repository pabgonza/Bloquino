# Proposal

## Why

El primer lanzamiento de Bloquino corre en el notebook del profesor dentro de la sala: un contenedor Docker con sus puertos abiertos al notebook, y los alumnos entran por la red local. Hoy eso se hace con la imagen de Velxio (5,3 GB, con ESP32, Raspberry Pi y QEMU que Bloquino no usa), con el frontend en modo desarrollo aparte y con las librerías del kit (`Servo`, `DHT sensor library`, `Adafruit Unified Sensor`) instaladas a mano dentro del contenedor: si el contenedor se recrea, se pierden y los programas con servo o DHT11 dejan de compilar.

Hace falta una imagen propia que se levante con un comando y traiga todo lo del curso.

## What Changes

- **Imagen de Bloquino**: frontend ya compilado, backend de compilación, `arduino-cli`, core `arduino:avr` y las librerías del kit, todo instalado al construir la imagen. Sin toolchains de ESP32, RP2040 ni QEMU.
- **Lista única de librerías del kit** en el repo (un archivo de texto con nombre y versión). La usa la imagen y la usará la aplicación instalable (h10). Cada hito que agrega una librería (h6, h8) la suma ahí.
- **Arranque con un comando** (`docker compose up`) y el puerto publicado en el notebook, para entrar desde otros equipos de la red con la IP del profesor.
- **Guía del día de clase** en `docs/`: levantar, conocer la IP, qué abren los alumnos, cómo comprobar que compila, qué hacer si cambia la IP o el firewall de Windows bloquea el puerto.
- **Prueba de carga**: un curso entero pulsando Iniciar simulación a la vez (unas 15 compilaciones) debe responder en un tiempo razonable; medirlo.

Fuera de este hito: HTTPS en la red local (es de h7, que lo necesita para cargar a la placa), servidor en internet, actualización automática de la imagen.

## Capabilities

### New Capabilities
- `despliegue/imagen-sala`: imagen Docker de Bloquino con todo lo del curso y su arranque en el notebook del profesor.

### Modified Capabilities
(ninguna)

## Impact

- `Dockerfile` y `docker-compose` propios (por ejemplo `Dockerfile.bloquino`), sin editar `Dockerfile.standalone` de Velxio.
- Archivo con la lista de librerías del kit; el backend ya instala el core AVR al arrancar (`REQUIRED_CORES`), aquí pasa a quedar dentro de la imagen.
- Medidas de referencia en el contenedor actual: core `arduino:avr` 254 MB, `arduino-cli` 37 MB, librerías del kit 0,5 MB.
- La página de alumno solo usa dos servicios del backend: `/api/compile/start` y `/api/compile/status/<id>`.

## Decisiones abiertas (para design.md)

1. **Base de la imagen**: partir de `Dockerfile.standalone` recortado frente a una imagen nueva mínima (Python + backend + `arduino-cli`). Recomendación: nueva y mínima; lo que no se instala no hay que mantenerlo.
2. **Backend completo o recortado**: el backend de Velxio trae rutas que el alumno no usa (chips, ESP-IDF, puente QEMU). Recomendación: dejar el código y no instalar sus dependencias pesadas; comprobar que arranca sin ellas.
3. **Dónde se publica la imagen**: construirla en el notebook del profesor frente a publicarla en GHCR. Recomendación: construir local en el primer lanzamiento.
4. **Modo profe por red**: `?profe` queda disponible para cualquiera en la red de la sala. Decidir si importa.
