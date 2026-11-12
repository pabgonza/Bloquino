# kit Specification

## Purpose

Los componentes del kit se comportan en el simulador como en la mesa: lo que el alumno arma y programa en la pantalla hace lo mismo, y al mismo ritmo, que el circuito real.

## Requirements

### Requirement: Tiempo real
La simulación SHALL avanzar al ritmo del reloj: una espera del programa dura en pantalla lo mismo que en la placa.

#### Scenario: Parpadeo de un segundo
- **WHEN** el programa enciende el LED de la placa, espera 1 segundo, lo apaga y espera 1 segundo, por siempre
- **THEN** el LED cambia de estado cada 1000 ms, con un error menor a 50 ms

### Requirement: Botón con la resistencia interna del pin
Un botón armado entre un pin y GND SHALL leerse apretado solo mientras el alumno lo mantiene apretado con el mouse, también en el instante en que arranca la simulación.

#### Scenario: Apretar y soltar
- **WHEN** el programa prende un LED mientras el botón del pin 2 está apretado, y el alumno aprieta y suelta el botón
- **THEN** el LED prende al apretar y apaga al soltar

#### Scenario: Arranque con el botón suelto
- **WHEN** arranca la simulación de un programa que toca una nota cuando el botón está apretado, con el botón suelto
- **THEN** no suena ninguna nota

### Requirement: Buzzer que toca notas
Un buzzer conectado entre un pin y GND, con cualquiera de sus dos patitas al pin, SHALL sonar con la frecuencia y la duración de cada nota que el programa toca, y callar cuando la nota termina o el programa lo silencia.

#### Scenario: Dos notas seguidas
- **WHEN** el programa toca la (440 Hz) por 0,3 segundos y luego mi agudo (659 Hz) por 0,3 segundos
- **THEN** suenan dos notas seguidas de 300 ms, la primera a 440 Hz y la segunda a 659 Hz, y después hay silencio

#### Scenario: Buzzer al revés
- **WHEN** el buzzer tiene la patita 2 al pin 8 y la patita 1 a GND, y el programa toca una nota en el pin 8
- **THEN** la nota suena igual

### Requirement: Servo de extremo a extremo
Un servo SHALL moverse al ángulo que el programa le pide en todo el rango de 0° a 180°, incluidos los extremos.

#### Scenario: Volver a cero
- **WHEN** el programa lleva el servo a 90° y después a 0°
- **THEN** el servo queda en 0°

#### Scenario: Perilla y servo
- **WHEN** el programa mueve el servo según la perilla y el alumno gira la perilla con el mouse del mínimo al máximo
- **THEN** el servo va de 0° a 180°

### Requirement: Sensores con valor ajustable
Con la simulación corriendo, un clic sobre el sensor de distancia o sobre el sensor de temperatura y humedad SHALL abrir un panel con deslizadores para fijar lo que el sensor mide, y el programa SHALL leer ese valor.

#### Scenario: Acercar un objeto
- **WHEN** el programa prende un LED si la distancia es menor a 20 cm y el alumno lleva el deslizador de distancia de 150 cm a 12 cm
- **THEN** el LED, que estaba apagado, prende
