# Tasks

Herramienta: MCP de Playwright sobre `http://localhost:5173/editor?alumno` a 1366 × 768, con el backend del puerto 3080.

## 1. Protoboard

- [x] 1.1 Agujeros bajo el margen de un componente cliqueables (CSS). Verificado: cables por clic desde los agujeros de la fila j bajo un DHT11 asentado; el programa lee el sensor.
- [x] 1.2 Tira conectada (`bloquino/tiras.ts`). Verificado con el mouse: 5 agujeros en una columna, el riel completo (50) y la columna de una patita asentada; las marcas se borran al salir.
- [x] 1.3 Sin nombre bajo los componentes en la página de alumno.
- [x] 1.4 Resaltado con la protoboard girada. Verificado con el mouse a 0°, 90°, 180° y 270°: las marcas caen a menos de 0,3 px de los agujeros.

## 2. Lienzo

- [x] 2.1 Componentes nuevos en la esquina visible del lienzo. Verificado con y sin panel de programa.
- [x] 2.2 Circuito encuadrado al restaurar y al abrir un archivo. Verificado en ambos casos.
- [x] 2.3 Componente nuevo sin tapar a otro ni a la placa. Verificado: 14 componentes agregados seguidos, ninguna caja se toca.

## 3. Textos

- [x] 3.1 Botón "Cancelar" del aviso de cableado y panel "Distancia" del sensor de distancia.
- [x] 3.2 Inspector sin proyectos de ejemplo, marca ni enlace de compra.
- [x] 3.3 Inspector en español: título con el nombre del kit, sin categoría ni valores internos, y solo color (LED, botón) y ohmios (resistencia) para cambiar. Verificado: el LED pasa a verde desde el inspector; el panel del sensor de distancia se titula «Sensor de distancia».
- [x] 3.4 Revisión del circuito en español y sin identificadores internos («Revisa tu circuito»); ya no sale además como error de compilación. La pestaña «Ficha técnica» queda oculta.
- [x] 3.5 `/api/metrics/run`: revisado, no se toca. Va al backend propio y lleva solo el tipo de placa; no hay analítica externa (`gtag` no está cargado, `index.html` no trae scripts de terceros). El 404 queda en la consola.
- [x] 3.6 Placa única y fija: sin barra para copiar, girar o eliminar la placa, y una placa pegada con el teclado se quita. Verificado con Ctrl+C y Ctrl+V.

## 4. Recorrido de las sesiones

- [x] 4.1 Circuito y programa de cada sesión, tomados de `Curso_Arduino/sketches/sesion-NN`:
  - S2 parpadeo del LED de la placa (pin 13). S3 semáforo: LEDs rojo 13, verde 12, amarillo 11, cada uno con 220 Ω al riel −.
  - S4 botón en el pin 2 y LED en el 13. S5 buzzer en el pin 8 (sirena, timbre con botón).
  - S6 servo en el pin 9 y potenciómetro en A0. S7 HC-SR04 con TRIG 9 y ECHO 10, LED 13 y buzzer 8.
  - S8 DHT11 en el pin 2. S9 LED RGB en los pines 3, 5 y 6. S10 integración: HC-SR04, servo, LEDs y buzzer.
  - Diferencias entre curso y Bloquino: la sesión 4 arma el botón con resistencia de 10 kΩ a GND (`INPUT`, apretado = HIGH) y el bloque de botón usa `INPUT_PULLUP` (botón entre el pin y GND, apretado = LOW); la slide de la sesión 8 dibuja el DHT11 como «+ / datos / −» y el módulo del kit es «S / + / −».
- [x] 4.2 Por cada sesión: armar en la protoboard con el mouse, programar con bloques, simular y comprobar. Arnés en `scripts/recorrido/` (ver su README); las nueve sesiones quedan repetibles (`s2` … `s10`).
  - [x] S2: el LED de la placa cambia cada 1000 ms (medido: 999, 991, 1021).
  - [x] S3: rojo, verde y amarillo prenden en orden, cada uno con su 220 Ω al riel −.
  - [x] S4: botón a caballo del canal entre el pin 2 y GND; el LED prende al apretar y apaga al soltar.
  - [x] S5: timbre. Suelto, silencio; apretado, notas de 300 ms alternando 440 y 659 Hz; al soltar calla.
  - [x] S6: perilla en la protoboard y servo directo; la perilla girada con el mouse lleva el servo a 0°, 88° y 180°.
  - [x] S7: con el panel del sensor en 150 y 60 cm, LED apagado y silencio; en 12 y 5 cm, LED prendido y pitidos.
  - [x] S8: DHT11; con el panel en 42 °C prende el LED de la placa, en 25 y 20 °C lo apaga.
  - [x] S9: LED RGB con tres 220 Ω a caballo del canal; rojo, verde, azul y amarillo en orden.
  - [x] S10: barrera. A 100 cm, servo en 0° y LED de alto; a 8 cm, servo en 90°, LED de paso y pitidos; vuelve al alejar.
  - Encontrado y corregido en el recorrido:
    - La resistencia de la paleta salía de 1 kΩ; ahora sale de 220 Ω, la del curso.
    - El botón de la paleta no calzaba a caballo del canal (sus patitas quedan a 2 filas y el canal pide 3): ahora sale girado 90° y sus cuatro patitas asientan en las filas c y h.
    - El tiempo simulado corría ~1,3 veces más rápido que el real (el bucle contaba instrucciones como ciclos): un `esperar 1 segundo` duraba 770 ms. Ahora dura 1000 ms.
    - Buzzer con `tone()`: la primera nota quedaba sonando para siempre, sin cambiar de frecuencia ni callar. Ahora cada nota suena con su frecuencia y su duración. Además el audio se abre al conectar el buzzer: abierto con la primera nota, las primeras salían apuradas.
    - Botón con `INPUT_PULLUP`: en cada arranque el pin leía «apretado» un instante (un resultado eléctrico calculado antes de activarse el pull); a veces duraba lo suficiente para que el programa lo viera (el timbre sonaba solo al iniciar). Ahora ese resultado se descarta.
    - Servo: `write(0)` no lo devolvía a 0° (el pulso mide unos µs menos que 544 y se descartaba). Ahora llega a los extremos.
    - El buzzer solo sonaba con la patita 1 al pin y la 2 a GND; al revés quedaba mudo (uno real suena igual). Ahora suena de las dos formas.
    - Un test de Velxio exigía etiquetas `wokwi-` o `velxio-` y fallaba desde h5 con `bloquino-dht11`: admite `bloquino-`.
  - Encontrado, sin corregir (a decisión de Pablo; están en la lista para probar a mano):
    - La perilla solo se puede arrastrar tomándola de la base: el dial gira (igual que en Tinkercad); anotarlo en la lista para probar a mano.
    - El LED de la paleta siempre sale rojo; para el semáforo se le cambia el color en el inspector (clic derecho), que ahora lo ofrece en español.
    - Un proyecto nuevo parte con el LED y la resistencia de ejemplo de Velxio junto a la placa.
- [x] 4.4 Programar con el mouse (`scripts/recorrido/bloques.js`): sacar un bloque de la paleta y encajarlo, cambiar un menú, escribir un número y botar un bloque a la papelera; cada paso comprobado en el sketch.
- [x] 4.3 Lista corta para probar a mano con el kit: `docs/bloquino-prueba-con-el-kit.md`, con las decisiones que siguen abiertas.

## 5. Cierre

- [x] 5.1 `openspec validate h5b-recorrido-kit --strict` válido; batería completa con 6127 tests en verde y solo los 14 fallos conocidos del entorno Windows; recorrido de las 9 sesiones y de los bloques repetido al final sin fallos.
