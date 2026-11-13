# Spec Delta

## Purpose

Grabar en un Arduino UNO real, desde el navegador, el mismo programa que el alumno simula.

## ADDED Requirements

### Requirement: Cargar el programa a la placa
Al pulsar Cargar a la placa, la página SHALL detener la simulación, compilar el programa actual, reiniciar la placa por el puerto serie y grabarle el programa con el protocolo del bootloader del UNO (STK500v1 a 115200 baudios). Mientras dura SHALL mostrar la etapa en curso y el avance, y al terminar SHALL decir que el programa quedó en la placa.

#### Scenario: Parpadeo en la placa real
- **WHEN** el alumno arma el programa de parpadeo del pin 13 y pulsa Cargar a la placa con un Arduino UNO conectado
- **THEN** ve el avance de la carga, el mensaje de que el programa quedó en la placa, y la luz «L» de la placa real parpadea

#### Scenario: El programa no compila
- **WHEN** el programa tiene un error y el alumno pulsa Cargar a la placa
- **THEN** no se graba nada y ve el error del compilador

### Requirement: Comprobar lo grabado
Después de grabar, la página SHALL leer el programa de vuelta desde la placa y compararlo con el que envió. Si difiere, SHALL avisar que la carga falló.

#### Scenario: Grabación dañada
- **WHEN** la placa devuelve un byte distinto del que se le grabó
- **THEN** la carga termina con el aviso de que el programa no quedó bien grabado

### Requirement: Elegir la placa una sola vez
La primera carga SHALL pedir al alumno que elija el puerto de la placa, mostrando solo puertos USB de placas Arduino y sus clones. Las siguientes cargas SHALL usar ese puerto sin volver a preguntar. Si la placa recordada no responde, la página SHALL olvidarla para que la próxima carga vuelva a preguntar.

#### Scenario: Segunda carga
- **WHEN** el alumno ya cargó una vez y vuelve a pulsar Cargar a la placa
- **THEN** la carga empieza sin mostrar el selector de puerto

### Requirement: Fallas explicadas para un niño
Cada falla de la carga SHALL mostrarse con un mensaje en español que diga qué pasó y qué hacer: no se eligió placa, el puerto está ocupado por otro programa, la placa no responde, la placa no es un Arduino UNO, el programa no quedó bien grabado, el navegador no puede cargar, o la página no se abrió por HTTPS.

#### Scenario: Placa que no responde
- **WHEN** el puerto elegido no contesta al bootloader
- **THEN** el alumno ve que la placa no responde y que revise el cable

#### Scenario: Página abierta sin HTTPS
- **WHEN** el alumno abrió la página por `http://` desde otro equipo y pulsa Cargar a la placa
- **THEN** ve que para cargar debe entrar por la dirección `https://` de la sala

#### Scenario: Otra placa
- **WHEN** el bootloader contesta con una firma que no es la del ATmega328P
- **THEN** no se graba nada y el alumno ve que esa placa no es un Arduino UNO
