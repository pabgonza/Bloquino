# Design

## Contexto

Velxio trae los ganchos, no la carga: `compileBoardForFlash` entrega el `.hex`, `appendHardwareSerial` mete texto de una placa real en el monitor serie y `installSerialTxInterceptor` desvía lo que el alumno escribe. El punto de extensión `proWebFlash.ts` está hecho para su diálogo de ESP32 y no se usa: Bloquino tiene su propio botón.

La placa de prueba (UNO original, Optiboot 4.4) se sondeó antes de diseñar: tras el pulso de DTR tarda unos 450 ms en contestar, y lo que se le mandó mientras se reiniciaba lo contesta después, atrasado.

## Decisiones

1. **Protocolo propio** (`frontend/src/bloquino/flash/stk500.ts`). Son seis órdenes de STK500v1; `avrgirl-arduino` y `stk500` están pensadas para Node y habría que instalarlas. Trabaja sobre un canal de bytes abstracto, así se prueba contra un bootloader simulado.
2. **Sincronizar con un sondeo de un byte**. Optiboot 4.4 no atiende mientras parpadea al arrancar (unos 450 ms) y en ese rato retiene solo 3 bytes; una orden que le llega cortada lo hace abandonar y correr el programa. Se vio en la placa real: saludos de dos bytes cada 250 ms fallaban cuando el programa anterior hablaba por el puerto serie. Por eso se manda solo el byte de fin de orden (`0x20`) cada 100 ms: dos seguidos son una orden vacía, que contesta `14 10`, y perder alguno no rompe nada. Al primer `14 10` se descarta lo que venía en camino y se resuelve si quedó medio sondeo recibido (un byte más: si contesta, estaba a medias; si no, el siguiente contesta). Tras 1,5 s sin respuesta se reinicia la placa otra vez; a los 3 s se da por muda. Lo que llega del programa anterior se deja pasar.
3. **Verificar siempre** (decisión de Pablo): después de grabar se lee cada página y se compara. Una carga de 4 kB suma menos de un segundo.
4. **Páginas completas**: la última se rellena con `0xFF`, como hace avrdude.
5. **Puerto**: `getPorts()` primero, `requestPort()` si no hay ninguno, con filtro por fabricante USB (Arduino, CH340, FTDI, CP210x) para que el alumno no vea los puertos Bluetooth. Si la placa recordada no responde, el permiso se olvida y la próxima vez se vuelve a elegir.
6. **Siempre se compila antes de cargar**, con `compileBoardForFlash`: un solo camino, y el backend devuelve al instante lo que ya compiló. Antes se detiene la simulación.
7. **Monitor de la placa real**: al terminar la carga el puerto se reabre a la velocidad de `Serial.begin` del programa (9600 si no se encuentra) y alimenta el monitor serie de siempre. Se suelta al iniciar la simulación, al cargar de nuevo o al desconectar la placa. El panel lo dice en su título. El monitor de Velxio solo dejaba escribir con la simulación corriendo: recibe una propiedad `placaReal` que lo habilita (un toque marcado `Bloquino:`).
8. **Mensajes**: cada falla tiene un motivo y un texto para niño en `bloquino.json`. Sin Web Serial el botón sigue activo y explica qué hacer: usar Chrome o Edge, o entrar por la dirección `https://`, que se ofrece como enlace. Como el proyecto se guarda por dirección, el mensaje pide descargarlo y abrirlo allá.
9. **HTTPS con certificado local** (decisión de Pablo). El contenedor crea una autoridad certificadora propia la primera vez y la guarda en un volumen; con ella firma el certificado del servidor para `localhost` y las direcciones de `BLOQUINO_NOMBRES`, y lo rehace si cambian. nginx atiende 443 además de 80. `http://<IP>/ca.crt` entrega la autoridad para instalarla una vez en cada equipo.
10. **`scripts/sala.ps1`**: detecta la IP del notebook, levanta el contenedor con esa IP y el nombre del equipo en el certificado y muestra las direcciones para la pizarra.
11. **Driver CH340**: se documenta en la guía del día de clase; Windows 10 y 11 lo instalan solos con internet.
12. **Probar sin el selector del navegador**. El selector de puerto no se puede automatizar, así que hay tres pruebas: tests contra una placa simulada que se comporta como Optiboot (ocupada al arrancar, 3 bytes de espera, abandona ante una orden cortada); el mismo código contra la placa real por `scripts/puente-serie.ps1`, un puente serie-TCP; y el guion `scripts/recorrido/carga.js`, que en la página usa la placa real si el navegador ya la tiene autorizada y, si no, una simulada.

## Riesgos

- El clon CH340 del kit no se probó en este hito: la placa disponible es un UNO original. El protocolo y el reinicio por DTR son los mismos; queda como prueba de Pablo.
- Instalar la autoridad en cada equipo de alumno es un paso manual. Aceptar el aviso del navegador sin instalarla también deja la página en contexto seguro, con Web Serial (comprobado), pero el aviso vuelve.
- El selector de puerto es del navegador y no se puede automatizar: la primera elección la hace una persona. Pablo la hizo una vez en su Chrome y otra en el navegador de pruebas; con ese permiso, el guion de la página corrió contra la placa real.
