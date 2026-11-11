# Spec Delta

## Purpose

El módulo DHT11 del kit del curso existe en el simulador: se ve como el real, se cablea por sus tres patitas y entrega la temperatura y la humedad que el alumno elige.

## ADDED Requirements

### Requirement: Módulo DHT11 en la paleta
La paleta del alumno SHALL ofrecer el módulo DHT11 con el nombre "Temperatura y humedad". El componente SHALL verse como el módulo del kit (sensor azul sobre placa negra) y SHALL tener tres patitas cableables, de izquierda a derecha mirándolo de frente: S (datos), + (5V) y − (GND), rotuladas como en el módulo real.

#### Scenario: Agregar y cablear
- **WHEN** el alumno hace clic en "Temperatura y humedad" y conecta un cable desde la patita S al pin 2 del Arduino
- **THEN** el módulo aparece en el lienzo y el cable termina en la punta de la patita S

#### Scenario: En la protoboard
- **WHEN** el módulo se pone sobre la protoboard
- **THEN** sus tres patitas calzan en tres columnas vecinas

### Requirement: Simulación del sensor
Durante la simulación, el módulo SHALL responder a un programa que lo lee con la librería del curso (`DHT sensor library`) con la temperatura y la humedad que tiene configuradas, en grados y porcentajes enteros. Al empezar SHALL entregar 25 °C y 50 %.

#### Scenario: Lectura inicial
- **WHEN** un programa lee el DHT11 conectado al pin 2 y envía temperatura y humedad al monitor serie
- **THEN** el monitor muestra 25.00 y 50.00

#### Scenario: Sin cable de datos
- **WHEN** la patita S no está conectada a la placa
- **THEN** la simulación corre igual y el programa no recibe lectura del sensor

### Requirement: Valores ajustables
Al hacer clic en el módulo durante la simulación SHALL abrirse un panel en español con dos controles: temperatura de 0 a 50 °C y humedad de 20 a 90 %, los rangos del DHT11 real. Un cambio SHALL reflejarse en la siguiente lectura del sensor.

#### Scenario: Subir la temperatura
- **WHEN** el alumno mueve la temperatura a 31 °C mientras el programa la muestra en el monitor serie
- **THEN** a más tardar 2 segundos después el monitor muestra 31.00
