## MODIFIED Requirements

### Requirement: Cargar el programa a la placa
Al pulsar Cargar a la placa, la página SHALL detener la simulación, compilar el programa de la placa elegida en el panel de programa, reiniciar la placa real por el puerto serie y grabarle el programa con el protocolo del bootloader del UNO (STK500v1 a 115200 baudios). Mientras dura SHALL mostrar la etapa en curso y el avance, y con dos o más placas, qué placa se carga («Placa 2»), y al terminar SHALL decir que el programa quedó en la placa. Sin placas en el circuito SHALL avisarlo sin cargar nada.

#### Scenario: Parpadeo en la placa real
- **WHEN** el alumno arma el programa de parpadeo del pin 13 y pulsa Cargar a la placa con un Arduino UNO conectado
- **THEN** ve el avance de la carga, el mensaje de que el programa quedó en la placa, y la luz «L» de la placa real parpadea

#### Scenario: El programa no compila
- **WHEN** el programa tiene un error y el alumno pulsa Cargar a la placa
- **THEN** no se graba nada y ve el error del compilador

#### Scenario: La placa elegida
- **WHEN** el circuito tiene dos placas, el alumno elige «2 (Arduino UNO)» en el panel de programa y pulsa Cargar a la placa
- **THEN** se graba el programa de la Placa 2 y el avance dice «Placa 2»

### Requirement: Elegir la placa una sola vez
La primera carga de cada placa del circuito SHALL pedir al alumno que elija el puerto, mostrando solo puertos USB de placas Arduino y sus clones. Las siguientes cargas de esa placa SHALL usar ese puerto sin volver a preguntar. Si la placa real recordada no responde, la página SHALL olvidarla para que la próxima carga de esa placa vuelva a preguntar.

#### Scenario: Segunda carga
- **WHEN** el alumno ya cargó la Placa 1 y vuelve a cargarla
- **THEN** la carga empieza sin mostrar el selector de puerto

#### Scenario: Otra placa, otro puerto
- **WHEN** el alumno ya cargó la Placa 1 y carga por primera vez la Placa 2
- **THEN** la página le pide elegir el puerto de la Placa 2
