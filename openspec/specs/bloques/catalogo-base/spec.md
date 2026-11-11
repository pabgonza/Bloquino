# catalogo-base Specification

## Purpose

Define los bloques disponibles para programas de un solo script y el código Arduino que produce cada uno, con palabras de niño para los componentes del kit y vocabulario de Tinkercad para los bloques de pin.

## Requirements

### Requirement: Bloques de control
El catálogo SHALL incluir `por siempre`, `esperar [n] segundos`, `repetir [n] veces`, `repetir mientras <c>`, `contar [i] de [a] a [b]`, `si <c>`, `si <c> / si no`, `esperar hasta que <c>`, `cronómetro` y `reiniciar cronómetro`.

#### Scenario: Esperar con decimales
- **WHEN** se usa `esperar 0.5 segundos`
- **THEN** se genera `delay(500);`

#### Scenario: Repetir
- **WHEN** se usa `repetir 3 veces` con un bloque dentro
- **THEN** se genera un `for` que ejecuta el cuerpo 3 veces

#### Scenario: Cronómetro
- **WHEN** se usa `reiniciar cronómetro` y luego `cronómetro`
- **THEN** `cronómetro` devuelve los segundos transcurridos desde el reinicio, calculados con `millis()`

### Requirement: Bloques de luces
El catálogo SHALL incluir `encender LED en pin [p]`, `apagar LED en pin [p]`, `brillo del LED en pin [p] a [n] %` y `color del LED RGB (pines [r][g][b]) a [color]`.

#### Scenario: Brillo
- **WHEN** se usa `brillo del LED en pin 9 a 50 %`
- **THEN** se genera un `analogWrite` al pin 9 con un valor cercano a 127, y el desplegable de pin solo ofrece los pines PWM (3, 5, 6, 9, 10, 11)

#### Scenario: Color RGB
- **WHEN** se usa `color del LED RGB (pines 9, 10, 11) a rojo`
- **THEN** se generan tres `analogWrite`: 255 al pin 9 y 0 a los pines 10 y 11

### Requirement: Bloques de sonido
El catálogo SHALL incluir `tocar nota [nota] por [n] segundos en pin [p]` y `silenciar pin [p]`. El desplegable de notas SHALL ofrecer al menos do, re, mi, fa, sol, la, si de dos octavas. En un programa de varios scripts, `tocar nota` SHALL ceder el turno mientras la nota suena.

#### Scenario: Nota con duración
- **WHEN** se usa `tocar nota la por 0.5 segundos en pin 8`
- **THEN** se genera `tone(8, 440, 500);` seguido de `delay(500);`

#### Scenario: Nota en un programa de varios scripts
- **WHEN** un script usa `tocar nota la por 0.5 segundos en pin 8` y otro parpadea un LED cada 0.1 segundos
- **THEN** se genera `tone(8, 440, 500);` seguido de una espera cooperativa de 500 ms, y el LED sigue parpadeando mientras la nota suena

### Requirement: Bloque de servo
El catálogo SHALL incluir `mover servo en pin [p] a [n]°`, con el ángulo limitado entre 0 y 180.

#### Scenario: Ángulo fuera de rango
- **WHEN** se escribe 200 en el ángulo
- **THEN** el campo queda en 180

### Requirement: Bloques de sensores
El catálogo SHALL incluir `¿botón en pin [p] presionado?` (verdadero cuando el pin está en nivel bajo con `INPUT_PULLUP`), `perilla en pin [a]` (0 a 100), `distancia en cm (disparo [p] eco [p])`, `temperatura en °C (DHT11 en pin [p])` y `humedad en % (DHT11 en pin [p])`. En un programa de varios scripts, `distancia en cm` SHALL retener el turno a lo más 25 ms por medición.

#### Scenario: Botón con LED
- **WHEN** el programa es `por siempre` [ `si ¿botón en pin 2 presionado?` → `encender LED en pin 13` / `si no` → `apagar LED en pin 13` ] y en el simulador se presiona el botón conectado entre el pin 2 y GND
- **THEN** el LED del pin 13 se enciende mientras el botón está presionado

#### Scenario: Perilla
- **WHEN** el potenciómetro del pin A0 está al máximo
- **THEN** `perilla en pin A0` devuelve 100

#### Scenario: Distancia sin eco
- **WHEN** el sensor no recibe eco dentro del tiempo límite
- **THEN** `distancia en cm` devuelve 400

#### Scenario: Distancia en un programa de varios scripts
- **WHEN** un script mide la distancia sin que haya eco y otro parpadea un LED
- **THEN** la medición termina dentro de 25 ms y el parpadeo continúa

#### Scenario: Temperatura y humedad en la paleta
- **WHEN** el usuario abre la categoría Sensores
- **THEN** encuentra los bloques de temperatura y de humedad del DHT11, con el pin 2 por defecto

### Requirement: Operadores y variables
El catálogo SHALL incluir suma, resta, multiplicación, división, comparaciones (`<`, `>`, `=`), `y`, `o`, `no`, `número al azar entre [a] y [b]`, `asignar [x] del rango [a]-[b] al rango [c]-[d]`, `restringir [x] entre [a] y [b]`, y variables numéricas con `crear variable`, `definir [v] en [n]` y `cambiar [v] por [n]`. Los tipos de C++ SHALL permanecer ocultos.

#### Scenario: Variable con espacios
- **WHEN** el usuario crea la variable `mi cuenta` y la usa
- **THEN** el sketch declara una variable global con un nombre válido en C++ y compila

### Requirement: Bloques avanzados de pin
El catálogo SHALL incluir, en la categoría Avanzado, `definir pin [p] en [ALTA/BAJA]`, `definir pin [p] en [0-255]`, `leer pin digital [p]`, `leer pin analógico [a]`, `decir [valor]` y `comentario [texto]`.

#### Scenario: Correspondencia con el código del curso
- **WHEN** se usa `definir pin 13 en ALTA`
- **THEN** se genera `digitalWrite(13, HIGH);` y `pinMode(13, OUTPUT);` en `setup()`

#### Scenario: Decir
- **WHEN** se usa `decir (distancia en cm ...)`
- **THEN** `setup()` contiene `Serial.begin(9600);` y se genera un `Serial.println` con el valor, que aparece en el monitor serie del simulador

#### Scenario: Comentario
- **WHEN** se usa `comentario "enciende la luz"`
- **THEN** el sketch contiene `// enciende la luz` en esa posición
