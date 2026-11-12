# Tasks

Entorno: backend en el contenedor Docker del puerto 3080; frontend con `npx vite` desde `frontend/`. Tests: `npx vitest run <archivo>` desde `frontend/`; los que compilan, con `RUN_BLOQUES_COMPILE=1`. Pruebas con mouse: `scripts/recorrido/`.

## 1. Textos y puerto serie

- [x] 1.1 Variables de texto (tipo `texto`, bloques propios, menús por tipo, dos botones de crear), `unir`, `texto =` y conversión automática entre número y texto.
- [x] 1.2 Categoría Puerto serie: `decir` con y sin salto, `¿hay datos?`, `leer número`, `leer texto` y sombrero `cuando llega un dato`.
- [x] 1.3 Tests: generador (`bloques-texto.test.ts`), AVR emulado (`bloques-texto.integration.test.ts`) y mouse (`textos.js`).
  - Con mouse: variable de texto creada desde la paleta, texto escrito en el bloque, órdenes «encender» y «apagar» por el monitor serie.

## 2. Pantalla LCD

- [x] 2.1 Instalar `LiquidCrystal` 1.0.7 e `IRremote` 4.7.1 en el contenedor (con permiso de Pablo) y fijarlas en `scripts/instalar-librerias.sh`.
- [x] 2.2 Categoría Pantallas con los cuatro bloques del LCD; pantalla en la paleta del alumno, azul.
- [x] 2.3 Tests: generador, LCD simulado (`bloques-pantallas*.test.ts`) y mouse (`lcd.js`).
  - Con mouse: pantalla cableada a la placa (9 cables), muestra «Hola Bloquino» y un contador en la segunda fila.
  - No se probó sobre la protoboard ni con el potenciómetro de contraste.

## 3. Control remoto

- [x] 3.1 Componente `bloquino-control` con las 17 teclas del control del kit y receptor infrarrojo en la paleta.
- [x] 3.2 Sombrero `cuando llega la tecla`, `última tecla` y `código de la última tecla`, con `TinyIRReceiver`.
- [x] 3.3 Tests: generador, receptor simulado con tramas NEC (`bloques-control*.test.ts`) y mouse (`control.js`).
  - Encontrado y corregido: la librería usaba el LED del pin 13; la primera tecla tras detener e iniciar se perdía; las tildes salían mal en el monitor serie.
  - Los comandos de las teclas no están comprobados con el control real.

## 4. Displays de 7 segmentos

- [x] 4.1 Bloques `preparar display` (1 y 4 dígitos, tipo y pines), `mostrar número` y `apagar display`.
- [x] 4.2 Simulador: propiedad `common`; componente `display-4`; tipo editable en la ficha.
- [x] 4.3 Tests: generador, pines en el AVR emulado (`bloques-display*.test.ts`) y mouse (`display.js`).
  - Con mouse: 1 dígito alterna 7 y 4; 4 dígitos muestra 1234 y un contador; 60 lecturas seguidas de un número fijo dicen lo mismo.
  - Los displays se cablearon sin resistencias y no se probó el de ánodo común en el navegador (sí sus pines en el AVR emulado).

## 5. Cierre

- [x] 5.1 Regresión: `scripts/recorrido` completo y batería de tests.
- [x] 5.2 Documentos: lista de prueba con el kit y decisión de variables de texto.
- [x] 5.3 `openspec validate h8-componentes-extendidos --strict`.
