# Tasks

Entorno: backend en el contenedor Docker del puerto 3080; frontend con `npx vite` desde `frontend/`. Tests: `npx vitest run <archivo>` desde `frontend/`; los que compilan, con `RUN_BLOQUES_COMPILE=1`.

## 1. Librería en el backend

- [x] 1.1 `scripts/instalar-librerias.sh`: librerías del kit con versión fija y BuzzerMusic por commit. Correrlo en el contenedor (con permiso de Pablo) y comprobar con `arduino-cli lib list`.
  - Instalada BuzzerMusic 1.1.0 (commit `7742b6c5`); Servo 1.3.0, DHT sensor library 1.4.7 y Adafruit Unified Sensor 1.1.15 ya estaban.
  - `.gitattributes` deja el script con fin de línea LF: con CRLF `sh` falla dentro del contenedor.

## 2. Paquetes

- [x] 2.1 `blocks/paquetes/index.ts` (cargador y plantillas) y `blocks/paquetes/buzzermusic.json`.
- [x] 2.2 Catálogo: los bloques de cada paquete al final de su categoría. Generador: una función por bloque de paquete, `paralelo` en el contexto y paso a corrutinas cuando un bloque pide `tick`.
- [x] 2.3 Tests del generador: paleta, programa simple, corrutinas, un objeto por pin, bloque de fondo en un solo script, bloque suelto. Programas de referencia `cancion.json/.ino` y `musica-de-fondo.json/.ino`.
  - 13 tests en `bloques-paquetes.test.ts`, incluido que el script de instalación trae el commit que declara el paquete.

## 3. Comportamiento

- [x] 3.1 Test de integración (compila con la librería y corre en el AVR emulado): canción de fondo con parpadeo, `tocar canción` que cede el turno, detener con botón y fin de la canción.
  - Mario Bros en modo simple: mi7 mi7 mi7 do7 mi7 sol7, 90 ms cada una, en su tiempo.
  - Himno de la Alegría de fondo: mi mi fa sol de 474 ms mientras el LED parpadea cada 200 ms (±2 %).
  - Cumpleaños feliz con `tocar canción` en un programa de tres scripts: el bloque siguiente corre menos de 300 ms después de la última nota y `¿canción sonando?` baja en ese momento.
- [x] 3.2 Prueba con mouse real (Playwright): armar buzzer y LED, programar con bloques arrastrados, simular y comprobar notas y parpadeo. Guion en `scripts/recorrido/`.
  - `canciones.js`: `empezar canción` arrastrado bajo `al iniciar`, menú cambiado a Himno de la Alegría, segundo programa `cuando se presiona botón` → `detener canción`. Suenan 331, 331, 349, 393 Hz de 474 ms con el LED de la placa parpadeando; el botón apretado con el mouse la corta. `tocar canción Mario Bros` sola: 2660, 2660, 2660, 2101, 2660, 3165 Hz.
  - El audio se comprobó por las notas que el buzzer pide al navegador, no al oído.
  - Corregido en el arnés: `nuevo()` no partía de cero porque la página guarda el proyecto al salir.
- [x] 3.3 Regresión: `scripts/recorrido` completo y batería de tests.
  - Sesiones 2 a 10 y `bloques` pasan igual que al cerrar h5b. Batería: 6142 pasan; los 14 que fallan son los conocidos del entorno Windows.

## 4. Guía y cierre

- [x] 4.1 `docs/bloquino-agregar-libreria.md`.
- [x] 4.2 `openspec validate h6-libreria-buzzermusic --strict`.
