# eventos-hardware Specification

## Purpose

Define los bloques sombrero que arrancan un script cuando pasa algo en el circuito, empezando por la pulsación de un botón.

## Requirements

### Requirement: Sombrero de botón
La categoría Eventos SHALL incluir `cuando se presiona botón en pin [p]`. Su script SHALL correr una vez cada vez que el botón, conectado entre el pin y GND, pasa de suelto a presionado.

#### Scenario: Una pulsación, una ejecución
- **WHEN** el botón se presiona y se mantiene presionado 2 segundos
- **THEN** el script corre una sola vez

#### Scenario: Configuración del pin
- **WHEN** el programa usa `cuando se presiona botón en pin 2`
- **THEN** `setup()` contiene `pinMode(2, INPUT_PULLUP);`

### Requirement: Antirrebote
El sombrero de botón SHALL ignorar los rebotes mecánicos de menos de 20 ms al presionar y al soltar.

#### Scenario: Rebote al presionar
- **WHEN** al presionar, el pin oscila entre bajo y alto durante 5 ms antes de quedar en bajo
- **THEN** el script corre una sola vez

### Requirement: Pulsación durante la ejecución
Una pulsación que ocurre mientras el script del botón todavía está corriendo SHALL ignorarse.

#### Scenario: Script largo
- **WHEN** el script del botón dura 2 segundos y el botón se presiona de nuevo al segundo 1
- **THEN** el script termina su ejecución y no vuelve a correr hasta la siguiente pulsación
