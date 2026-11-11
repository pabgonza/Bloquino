# Spec Delta

## MODIFIED Requirements

### Requirement: Bloques de sonido
El catálogo SHALL incluir `tocar nota [nota] por [n] segundos en pin [p]` y `silenciar pin [p]`. El desplegable de notas SHALL ofrecer al menos do, re, mi, fa, sol, la, si de dos octavas. En un programa de varios scripts, `tocar nota` SHALL ceder el turno mientras la nota suena.

#### Scenario: Nota con duración
- **WHEN** se usa `tocar nota la por 0.5 segundos en pin 8`
- **THEN** se genera `tone(8, 440, 500);` seguido de `delay(500);`

#### Scenario: Nota en un programa de varios scripts
- **WHEN** un script usa `tocar nota la por 0.5 segundos en pin 8` y otro parpadea un LED cada 0.1 segundos
- **THEN** se genera `tone(8, 440, 500);` seguido de una espera cooperativa de 500 ms, y el LED sigue parpadeando mientras la nota suena

### Requirement: Bloques de sensores
El catálogo SHALL incluir `¿botón en pin [p] presionado?` (verdadero cuando el pin está en nivel bajo con `INPUT_PULLUP`), `perilla en pin [a]` (0 a 100) y `distancia en cm (disparo [p] eco [p])`. En un programa de varios scripts, `distancia en cm` SHALL retener el turno a lo más 25 ms por medición.

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
