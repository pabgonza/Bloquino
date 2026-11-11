# Tasks

Herramienta: MCP de Playwright sobre `http://localhost:5173/editor?alumno` a 1366 × 768, con el backend del puerto 3080.

## 1. Protoboard

- [x] 1.1 Agujeros bajo el margen de un componente cliqueables (CSS). Verificado: cables por clic desde los agujeros de la fila j bajo un DHT11 asentado; el programa lee el sensor.
- [x] 1.2 Tira conectada (`bloquino/tiras.ts`). Verificado con el mouse: 5 agujeros en una columna, el riel completo (50) y la columna de una patita asentada; las marcas se borran al salir.
- [x] 1.3 Sin nombre bajo los componentes en la página de alumno.
- [ ] 1.4 Resaltado con la protoboard rotada, o impedir rotarla.

## 2. Lienzo

- [x] 2.1 Componentes nuevos en la esquina visible del lienzo. Verificado con y sin panel de programa.
- [x] 2.2 Circuito encuadrado al restaurar y al abrir un archivo. Verificado en ambos casos.
- [ ] 2.3 Los componentes agregados seguidos caen a 36 px uno de otro y se tapan entre sí (sensor de distancia, potenciómetro y botón quedaron apilados): separar más o repartir.

## 3. Textos

- [x] 3.1 Botón "Cancelar" del aviso de cableado y panel "Distancia" del sensor de distancia.
- [x] 3.2 Inspector sin proyectos de ejemplo, marca ni enlace de compra.
- [ ] 3.3 Inspector: nombre del componente ("Pushbutton"), categoría ("Input") y nombres de propiedades (`color`, `pressed`, `label`, `xray`) siguen en inglés; decidir qué propiedades ve el alumno.
- [ ] 3.4 Diálogo de revisión del circuito y pestaña "Ficha técnica" del inspector: revisar idioma y si corresponden al alumno.
- [ ] 3.5 La página pide `/api/metrics/run` al iniciar la simulación (404 en este backend): quitar la llamada o confirmar que no envía datos.

## 4. Recorrido de las sesiones

- [x] 4.1 Circuito y programa de cada sesión, tomados de `Curso_Arduino/sketches/sesion-NN`:
  - S2 parpadeo del LED de la placa (pin 13). S3 semáforo: LEDs rojo 13, verde 12, amarillo 11, cada uno con 220 Ω al riel −.
  - S4 botón en el pin 2 y LED en el 13. S5 buzzer en el pin 8 (sirena, timbre con botón).
  - S6 servo en el pin 9 y potenciómetro en A0. S7 HC-SR04 con TRIG 9 y ECHO 10, LED 13 y buzzer 8.
  - S8 DHT11 en el pin 2. S9 LED RGB en los pines 3, 5 y 6. S10 integración: HC-SR04, servo, LEDs y buzzer.
  - Diferencias entre curso y Bloquino: la sesión 4 arma el botón con resistencia de 10 kΩ a GND (`INPUT`, apretado = HIGH) y el bloque de botón usa `INPUT_PULLUP` (botón entre el pin y GND, apretado = LOW); la slide de la sesión 8 dibuja el DHT11 como «+ / datos / −» y el módulo del kit es «S / + / −».
- [x] 4.2 Por cada sesión: armar en la protoboard con el mouse, programar con bloques, simular y comprobar. Arnés en `recorrido/` (ver su README); las nueve sesiones quedan repetibles (`s2` … `s10`).
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
  - Encontrado, sin corregir (pasa a las tareas de abajo o a decisión de Pablo):
    - El panel del sensor de distancia se titula «HC-SR04», no «Sensor de distancia» (3.3).
    - La protoboard recién agregada queda con su riel inferior debajo de la placa (2.3).
    - La perilla solo se puede arrastrar tomándola de la base: el dial gira (igual que en Tinkercad); anotarlo en la lista para probar a mano.
    - El LED de la paleta siempre sale rojo; para el semáforo hay que cambiarle el color en el inspector (3.3).
- [ ] 4.4 Arrastrar bloques desde la paleta de bloques con el mouse (hasta ahora los programas se cargaron como JSON).
- [ ] 4.3 Lista corta para probar a mano con el kit.

## 5. Cierre

- [ ] 5.1 `openspec validate h5b-recorrido-kit --strict` y tests en verde.
