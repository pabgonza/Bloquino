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

- [ ] 4.1 Tomar de las slides el circuito y el programa de cada sesión (1 a 10) y anotar las diferencias entre slides y kit.
- [ ] 4.2 Por cada sesión: armar en la protoboard con el mouse, programar con bloques, simular y comprobar. Sesión 8 (DHT11) ya hecha.
- [ ] 4.3 Lista corta para probar a mano con el kit.

## 5. Cierre

- [ ] 5.1 `openspec validate h5b-recorrido-kit --strict` y tests en verde.
