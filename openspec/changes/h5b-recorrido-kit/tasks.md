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
- [ ] 4.2 Por cada sesión: armar en la protoboard con el mouse, programar con bloques, simular y comprobar. Arnés en `recorrido/` (ver su README).
  - [x] Sesión 8 (DHT11): hecha a mano con Playwright.
  - [ ] Sesión 3 (semáforo): el arnés la arma y simula; rojo y verde prenden en orden. Falta repetirla con el amarillo en la columna 40: en la 38 no hay agujero de riel debajo, Velxio corre la resistencia una columna y el LED queda sin conectar (la simulación lo refleja: no prende).
  - [ ] Sesiones 2, 4, 5, 6, 7, 9 y 10.
  - Encontrado y corregido: la resistencia de la paleta salía de 1 kΩ; ahora sale de 220 Ω, la del curso.
- [ ] 4.4 Arrastrar bloques desde la paleta de bloques con el mouse (hasta ahora los programas se cargaron como JSON).
- [ ] 4.3 Lista corta para probar a mano con el kit.

## 5. Cierre

- [ ] 5.1 `openspec validate h5b-recorrido-kit --strict` y tests en verde.
