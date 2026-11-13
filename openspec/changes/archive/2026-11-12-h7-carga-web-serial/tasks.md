# Tasks

## 1. Protocolo

- [x] 1.1 `bloquino/flash/stk500.ts`: sincronizar, firma, grabar por páginas, verificar, salir.
- [x] 1.2 `bloquino/flash/serie.ts`: conexión Web Serial con cola de lectura, reinicio por DTR y cierre limpio.
- [x] 1.3 Tests contra una placa simulada que se comporta como Optiboot: carga completa, bootloader ocupado al arrancar, programa anterior que habla, segundo reinicio, otra firma, byte dañado, placa muda, y la conexión como monitor (8 tests).

## 2. Carga desde la página

- [x] 2.1 `bloquino/flash/cargar.ts`: puerto recordado o elegido, compilar, grabar, estados y motivos de falla.
- [x] 2.2 Botón Cargar a la placa y tarjeta de avance en `PaginaAlumno`; textos en `bloquino.json`.
- [x] 2.3 Monitor serie de la placa real: lectura, escritura, título del panel y soltar al simular.
  - El campo para escribir estaba deshabilitado sin simulación: `SerialMonitor` recibe `placaReal`.
- [x] 2.4 Guion `scripts/recorrido/carga.js`, con mouse real: dos cargas, la memoria de la placa simulada igual al programa compilado, «123» y «Recibido: encender / apagar» en el monitor, rótulo «placa real» y soltar al simular.

## 3. HTTPS local

- [x] 3.1 Autoridad y certificado en el arranque del contenedor; volumen para conservarlos.
  - Comprobado: la autoridad es la misma tras reconstruir la imagen y tras cambiar la IP; el certificado se rehace y la IP anterior deja de valer.
- [x] 3.2 nginx en 443 y `/ca.crt`; puerto 443 y `BLOQUINO_NOMBRES` en compose. `/ca.key` no se entrega.
- [x] 3.3 `scripts/sala.ps1`.
- [x] 3.4 Guía del día de clase: HTTPS, instalar la autoridad, firewall, driver CH340.

## 4. Prueba con la placa real

- [x] 4.1 El protocolo contra el UNO del COM7 (Optiboot 4.4), por `scripts/puente-serie.ps1`: compila un programa con un sello único, lo graba, lo verifica y lee el sello que la placa imprime. 25 cargas seguidas sin falla; 2 kB en 3,1 s por el puente.
  - Aquí aparecieron dos fallas que la placa simulada no mostraba: el programa anterior hablando por el puerto serie agotaba los intentos, y los saludos de dos bytes desordenaban al bootloader mientras parpadeaba. De ahí el sondeo de un byte y la placa simulada más fiel.
- [x] 4.2 Página por HTTP desde la IP: no es contexto seguro y el botón ofrece la dirección `https://`. Por HTTPS, aceptando el aviso del navegador: contexto seguro y Web Serial disponible.
- [x] 4.3 En un navegador real con la placa real. Pablo cargó el parpadeo desde su Chrome en `http://localhost` y funcionó; también eligió el puerto en el navegador de pruebas, y `scripts/recorrido/carga.js` corrió contra la placa: dos cargas de 2,0 y 2,8 s con todas las etapas (compilando, conectando, grabando, verificando, lista), la segunda sin selector; el monitor mostró el «123» que imprime la placa y, al escribir «encender» y «apagar», la placa contestó «Recibido: …»; al simular, el monitor la soltó.
  - «Placa ocupada»: con el puerto tomado por otro programa sale su aviso y el permiso se conserva; al liberarse, la carga siguiente funciona.
- [x] 4.4 El clon CH340 del kit no estaba a mano: queda anotado en `docs/bloquino-prueba-con-el-kit.md`, con el puente para probarlo sin navegador.

## 5. Cierre

- [x] 5.1 Batería de tests (6219 pasan; los 15 fallos conocidos del entorno), `scripts/recorrido` completo y reconstrucción de la imagen.
- [x] 5.2 README, decisiones y pruebas pendientes de Pablo.
