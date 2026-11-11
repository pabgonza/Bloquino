# generador-corrutinas Specification

## Purpose

Traduce un programa de varios scripts a Arduino C++ con un planificador cooperativo: cada script es una corrutina sin pila propia que avanza hasta su próxima espera y devuelve el control.

## Requirements

### Requirement: Selección del modo de generación
Un programa con más de un script, o con un sombrero de evento de hardware, SHALL generarse con corrutinas.

#### Scenario: Dos scripts al iniciar
- **WHEN** el programa tiene dos bloques `al iniciar` con bloques debajo
- **THEN** el sketch se genera con corrutinas

#### Scenario: Solo un evento de botón
- **WHEN** el programa tiene un único script y su sombrero es `cuando se presiona botón en pin 2`
- **THEN** el sketch se genera con corrutinas

### Requirement: Marca de modo avanzado
El sketch generado con corrutinas SHALL empezar con un comentario que indique que fue generado desde bloques y que es código avanzado.

#### Scenario: Primera línea
- **WHEN** se genera un programa de dos scripts
- **THEN** la primera línea del sketch es un comentario que contiene "Generado desde bloques" y "avanzado"

### Requirement: Sketch autocontenido
El planificador SHALL emitirse dentro del sketch, sin librerías externas. El sketch SHALL no usar `delay()` y SHALL compilar para `arduino:avr:uno`.

#### Scenario: Sin delay
- **WHEN** se genera un programa de dos scripts con bloques `esperar`
- **THEN** el sketch no contiene ninguna llamada a `delay()`

#### Scenario: Compila sin librerías
- **WHEN** se genera un programa de dos scripts que solo usa LEDs y esperas
- **THEN** el sketch no tiene ningún `#include` y compila con `arduino-cli compile --fqbn arduino:avr:uno`

### Requirement: Una función por script
Cada script SHALL generarse como una función propia, y `loop()` SHALL llamarlas a todas por turno, en el orden en que aparecen en el área de trabajo de arriba hacia abajo. El código de "tick" que declaren los bloques SHALL correr en cada vuelta de `loop()`.

#### Scenario: Dos scripts
- **WHEN** el programa tiene dos scripts
- **THEN** el sketch define `programa1()` y `programa2()` y `loop()` llama a las dos

### Requirement: Los contadores sobreviven a las esperas
Los contadores de `repetir` y `contar` SHALL conservar su valor mientras el script cede el turno.

#### Scenario: Repetir con esperas
- **WHEN** un script tiene `repetir 3 veces` [ `encender LED`, `esperar 1 segundos`, `apagar LED`, `esperar 1 segundos` ] y otro script parpadea otro LED
- **THEN** el LED del primer script se enciende exactamente 3 veces

### Requirement: Memoria
Un programa de 8 scripts SHALL caber en un Arduino UNO dejando libre al menos la mitad de su RAM.

#### Scenario: Ocho parpadeos
- **WHEN** se compila un programa de 8 scripts, cada uno con un parpadeo
- **THEN** las variables globales usan menos de 1024 bytes
