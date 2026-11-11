# generador-clasico Specification

## Purpose

Traduce un programa de bloques de un solo script al Arduino C++ que se enseña en el curso (`setup()`, `loop()`, `delay()`), listo para compilar con `arduino-cli` para un Arduino UNO.

## Requirements

### Requirement: Estructura setup / loop
Cuando el programa tiene un solo script y su sombrero es `al iniciar`, el generador SHALL emitir un sketch con `setup()` y `loop()`. Los bloques que cuelgan de `al iniciar` antes de `por siempre` SHALL ir a `setup()`; el cuerpo de `por siempre` SHALL ir a `loop()`. Con más de un script, o con un sombrero de evento de hardware, el programa SHALL generarse con corrutinas (ver `bloques/generador-corrutinas`).

#### Scenario: Parpadeo
- **WHEN** el programa es `al iniciar` → `por siempre` [ `encender LED en pin 13`, `esperar 1 segundos`, `apagar LED en pin 13`, `esperar 1 segundos` ]
- **THEN** el sketch contiene `pinMode(13, OUTPUT);` en `setup()` y en `loop()` las líneas `digitalWrite(13, HIGH);`, `delay(1000);`, `digitalWrite(13, LOW);`, `delay(1000);` en ese orden

#### Scenario: Sin por siempre
- **WHEN** el programa es `al iniciar` → `encender LED en pin 13`
- **THEN** `digitalWrite(13, HIGH);` queda en `setup()` y `loop()` queda vacío

#### Scenario: Programa vacío
- **WHEN** no hay ningún bloque
- **THEN** el sketch tiene `setup()` y `loop()` vacíos y compila

#### Scenario: Un solo script sigue siendo clásico
- **WHEN** el programa tiene un único `al iniciar` y además bloques sueltos sin sombrero
- **THEN** el sketch usa `delay()` y no contiene el planificador de corrutinas

### Requirement: Configuración automática de pines
El generador SHALL emitir un `pinMode` por cada pin usado, según el bloque que lo usa, una sola vez y al comienzo de `setup()`.

#### Scenario: Mismo pin en varios bloques
- **WHEN** el pin 13 aparece en cuatro bloques de LED
- **THEN** `pinMode(13, OUTPUT);` aparece una sola vez

#### Scenario: Botón
- **WHEN** el programa usa `¿botón en pin 2 presionado?`
- **THEN** `setup()` contiene `pinMode(2, INPUT_PULLUP);`

### Requirement: Contribuciones de los bloques
El generador SHALL reunir, sin repetir, los `#include`, las declaraciones globales, las líneas de `setup()` y las funciones auxiliares que declaren los bloques usados, y SHALL omitir las de los bloques no usados.

#### Scenario: Servo
- **WHEN** el programa usa `mover servo en pin 9 a 90°` dos veces
- **THEN** el sketch tiene un `#include <Servo.h>`, una declaración del servo del pin 9 y un `attach(9)` en `setup()`

#### Scenario: Programa sin servo
- **WHEN** el programa no usa bloques de servo
- **THEN** el sketch no incluye `Servo.h`

### Requirement: El sketch generado compila
Todo sketch generado desde un programa de bloques válido SHALL compilar sin errores para `arduino:avr:uno`.

#### Scenario: Programas de referencia
- **WHEN** se generan los programas de referencia del curso (parpadeo, semáforo, botón + LED, sirena, barrido de servo, perilla + servo, alarma de distancia, mezcla RGB)
- **THEN** cada sketch compila con `arduino-cli compile --fqbn arduino:avr:uno`

### Requirement: Código legible
El sketch generado SHALL usar sangría de dos espacios, una instrucción por línea y los nombres de función de Arduino que usa el curso (`digitalWrite`, `digitalRead`, `analogRead`, `analogWrite`, `delay`, `tone`).

#### Scenario: Comentario de origen
- **WHEN** se genera cualquier sketch
- **THEN** la primera línea es un comentario que indica que fue generado desde bloques
