# Spec Delta

## MODIFIED Requirements

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
