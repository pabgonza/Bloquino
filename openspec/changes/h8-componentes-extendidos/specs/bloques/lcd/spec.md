# Spec Delta

## Purpose

Bloques de la pantalla LCD 16x2 del kit, en conexión paralela de 4 bits y sin módulo I2C.

## ADDED Requirements

### Requirement: Bloques de la pantalla LCD
La categoría Pantallas SHALL incluir `preparar pantalla LCD (RS [p] E [p] D4 [p] D5 [p] D6 [p] D7 [p])`, `escribir [valor] en la pantalla`, `mover cursor a columna [n] fila [n]` y `borrar pantalla`. El código SHALL usar la librería `LiquidCrystal`, con un solo objeto y `lcd.begin(16, 2);` en `setup()`.

#### Scenario: Hola en la pantalla
- **WHEN** el programa es `al iniciar` → `escribir [Hola] en la pantalla` y la pantalla está cableada a los pines 12, 11, 5, 4, 3 y 2
- **THEN** en el simulador la primera fila de la pantalla dice `Hola`

### Requirement: Pines por defecto
Un programa sin `preparar pantalla LCD` SHALL usar los pines 12, 11, 5, 4, 3 y 2 (RS, E, D4 a D7). Con el bloque, SHALL usar los que el bloque indica. Un `preparar` suelto, sin sombrero, SHALL NOT contar.

#### Scenario: Otros pines
- **WHEN** el programa empieza con `preparar pantalla LCD (RS 7 E 8 D4 9 D5 10 D6 11 D7 12)`
- **THEN** el sketch declara `LiquidCrystal lcd(7, 8, 9, 10, 11, 12);` y la pantalla cableada a esos pines muestra el texto

### Requirement: Posiciones desde 1
`mover cursor` SHALL contar las columnas de 1 a 16 y las filas de 1 a 2.

#### Scenario: Segunda fila
- **WHEN** se usa `mover cursor a columna 1 fila 2`
- **THEN** se genera `lcd.setCursor(0, 1);` y lo que se escribe después aparece al principio de la segunda fila

### Requirement: Números y textos
`escribir` SHALL aceptar textos y números; un número SHALL mostrarse sin decimales si es entero.

#### Scenario: Temperatura
- **WHEN** se escribe `unir [Temp: ] [25]`
- **THEN** la pantalla muestra `Temp: 25`

#### Scenario: Con otros scripts
- **WHEN** un script borra y escribe un contador en la pantalla cada 0.5 segundos y otro parpadea un LED cada 0.1 segundos
- **THEN** el parpadeo mantiene su ritmo
