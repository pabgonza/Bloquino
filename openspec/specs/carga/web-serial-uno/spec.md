# web-serial-uno Specification

## Purpose

Grabar en un Arduino UNO real, desde el navegador, el mismo programa que el alumno simula.

## Requirements

### Requirement: Cargar el programa a la placa
Al pulsar Cargar a la placa, la página SHALL detener la simulación, compilar el programa de la placa elegida en el panel de programa, reiniciar la placa real por el puerto serie y grabarle el programa con el protocolo del bootloader del UNO (STK500v1 a 115200 baudios). Mientras dura SHALL mostrar la etapa en curso y el avance, y al terminar SHALL decir que el programa quedó en la placa.

#### Scenario: Parpadeo en la placa real
- **WHEN** el alumno arma el programa de parpadeo del pin 13 y pulsa Cargar a la placa con un Arduino UNO conectado
- **THEN** ve el avance de la carga, el mensaje de que el programa quedó en la placa, y la luz «L» de la placa real parpadea

#### Scenario: El programa no compila
- **WHEN** el programa tiene un error y el alumno pulsa Cargar a la placa
- **THEN** no se graba nada y ve el error del compilador

### Requirement: La placa que se carga
Con dos o más placas en el circuito, el avance de la carga SHALL decir qué placa se carga («Placa 2»). Sin placas, Cargar a la placa SHALL avisarlo sin cargar nada.

#### Scenario: Sin placas
- **WHEN** el circuito no tiene placas y el alumno pulsa Cargar a la placa
- **THEN** ve que no hay placas en el circuito y no se carga nada

#### Scenario: La placa elegida
- **WHEN** el circuito tiene dos placas, el alumno elige «2 (Arduino UNO)» en el panel de programa y pulsa Cargar a la placa
- **THEN** se graba el programa de la Placa 2 y el avance dice «Placa 2»

### Requirement: Comprobar lo grabado
Después de grabar, la página SHALL leer el programa de vuelta desde la placa y compararlo con el que envió. Si difiere, SHALL avisar que la carga falló.

#### Scenario: Grabación dañada
- **WHEN** la placa devuelve un byte distinto del que se le grabó
- **THEN** la carga termina con el aviso de que el programa no quedó bien grabado

### Requirement: Elegir la placa una sola vez
La primera carga de cada placa del circuito SHALL pedir al alumno que elija el puerto, mostrando solo puertos USB de placas Arduino y sus clones. Las siguientes cargas de esa placa SHALL usar ese puerto sin volver a preguntar. Si la placa real recordada no responde, la página SHALL olvidarla para que la próxima carga de esa placa vuelva a preguntar.

#### Scenario: Segunda carga
- **WHEN** el alumno ya cargó la Placa 1 y vuelve a cargarla
- **THEN** la carga empieza sin mostrar el selector de puerto

#### Scenario: Otra placa, otro puerto
- **WHEN** el alumno ya cargó la Placa 1 y carga por primera vez la Placa 2
- **THEN** la página le pide elegir el puerto de la Placa 2

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
