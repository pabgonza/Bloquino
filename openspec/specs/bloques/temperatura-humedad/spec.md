# temperatura-humedad Specification

## Purpose

Bloques para leer el DHT11 de la sesión 8 del curso, que generan el mismo código que las slides.

## Requirements

### Requirement: Bloques de temperatura y humedad
La categoría Sensores SHALL incluir `temperatura en °C (DHT11 en pin [p])` y `humedad en % (DHT11 en pin [p])`, bloques de valor numérico con el pin 2 por defecto.

#### Scenario: Alarma de fiebre
- **WHEN** el programa es `por siempre` [ `si temperatura en °C (DHT11 en pin 2) > 30` → `encender LED en pin 13` / `si no` → `apagar LED en pin 13` ] y en el simulador la temperatura del módulo sube a 31 °C
- **THEN** el LED del pin 13 se enciende

### Requirement: Código con la librería del curso
Los bloques SHALL generar código con la `DHT sensor library`: su `#include`, un objeto global por pin usado, su inicialización en `setup()` y las lecturas `readTemperature()` / `readHumidity()`. Varios bloques sobre el mismo pin SHALL compartir un solo objeto.

#### Scenario: Temperatura y humedad del mismo sensor
- **WHEN** un programa usa los dos bloques con el pin 2
- **THEN** el sketch declara un solo `DHT dht2(2, DHT11);`, llama una vez a `dht2.begin();` y lee con `dht2.readTemperature()` y `dht2.readHumidity()`

#### Scenario: Dos sensores
- **WHEN** un programa lee la temperatura en el pin 2 y en el pin 4
- **THEN** el sketch declara `dht2` y `dht4`

### Requirement: Lectura que no frena el programa
El sensor SHALL consultarse como máximo una vez cada 2 segundos; entre consultas los bloques SHALL devolver la última lectura sin esperar. En un programa de varios scripts, una consulta SHALL retener el turno a lo más 30 ms.

#### Scenario: Leer seguido
- **WHEN** un script muestra la temperatura cada medio segundo
- **THEN** el valor mostrado se renueva cada 2 segundos y el script no se atrasa

#### Scenario: Con un parpadeo paralelo
- **WHEN** un script lee la temperatura cada 0,1 s y otro parpadea un LED cada 0,1 s
- **THEN** el parpadeo se atrasa a lo más 30 ms, y solo en las vueltas en que el sensor se consulta de verdad
