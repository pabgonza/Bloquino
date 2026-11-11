# Spec Delta

## MODIFIED Requirements

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
