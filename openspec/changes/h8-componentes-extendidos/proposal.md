# Proposal

## Why

El kit del curso trae una pantalla LCD 16x2, displays de 7 segmentos y un receptor infrarrojo con control remoto, y Tinkercad, mBlock y PictoBlox tienen bloques para ellos. El profesor los quiere dentro del MVP, junto con el manejo completo del puerto serie, para los experimentos que van más allá de las 10 sesiones base ("mostrar la temperatura en pantalla", "mover el servo con el control remoto").

Velxio ya simula los cuatro componentes (`lcd1602`, `7segment`, `ir-receiver`, `ir-remote`); faltan los bloques y las librerías.

## What Changes

- **LCD 16x2** (conexión paralela, sin módulo I2C, como el del kit):
  - `preparar pantalla LCD (pines [ ][ ][ ][ ][ ][ ])`,
  - `escribir [texto] en la pantalla`,
  - `mover cursor a columna [ ] fila [ ]`,
  - `borrar pantalla`.
- **Display de 7 segmentos**:
  - `mostrar número [ ] en el display` para 1 dígito y para 4 dígitos (con refresco automático por tick),
  - `apagar display`.
- **Infrarrojo**:
  - sombrero `cuando llega la tecla [ ▾] del control (receptor en pin [ ])`,
  - `última tecla del control`.
- **Puerto serie** (completa el `decir` de h1):
  - `decir [ ]` con y sin salto de línea,
  - `¿hay datos en el puerto serie?`,
  - `leer número del puerto serie`, `leer texto del puerto serie`,
  - sombrero `cuando llega un dato por el puerto serie`.
- **Componentes en la paleta del alumno**: LCD 16x2, display de 7 segmentos, receptor infrarrojo y control remoto.

Fuera de este hito: LCD con módulo I2C, matriz de LEDs 8×8, teclado 4×4, RFID, reloj DS1302, motor paso a paso (candidatos posteriores, también vienen en el kit).

## Capabilities

### New Capabilities
- `bloques/lcd`: bloques de la pantalla LCD 16x2 en conexión paralela.
- `bloques/siete-segmentos`: bloques del display de 7 segmentos de 1 y 4 dígitos.
- `bloques/infrarrojo`: evento y lectura del control remoto.
- `bloques/puerto-serie`: escritura, lectura y evento del puerto serie.

### Modified Capabilities
- `bloques/catalogo-base`: `decir` se mueve de Avanzado a la categoría nueva de puerto serie.
- `bloques/eventos-hardware`: dos sombreros nuevos (tecla del control, dato por el puerto serie).
- `interfaz/modo-alumno`: cuatro componentes más en la lista del kit.

## Impact

- Paquetes de bloques nuevos con el formato de h6.
- Backend: librerías `LiquidCrystal` (viene con el IDE; confirmar en `arduino-cli`), una de infrarrojo y, si se usa, una de 7 segmentos.
- Textos con variables de tipo texto: hasta ahora todas las variables son numéricas; `escribir [texto]` y `leer texto` requieren al menos literales de texto y unión de texto con número.
- Tests: golden tests y pruebas en el simulador con los componentes existentes de Velxio.

## Decisiones abiertas (para design.md)

1. **Muchos pines en un bloque**: el LCD paralelo usa 6 pines. Alternativa: un bloque `preparar` con los pines de las slides por defecto, para que el alumno casi nunca los toque.
2. **7 segmentos de 4 dígitos**: multiplexado por software con refresco en el tick (necesita h2) frente a exigir el 74HC595 del kit. Confirmar además cómo simula Velxio el modelo de 4 dígitos.
3. **Librería de infrarrojo**: `IRremote` es grande para un UNO; evaluar una más liviana y verificar que funcione con el control simulado de Velxio (`ir-remote`).
4. **Texto**: ¿se agregan variables de texto o solo literales? Recomendación: solo literales y un bloque `unir [ ] [ ]`.
5. **Orden**: este hito depende de h2 (eventos, tick) y de h6 (formato de paquetes).
