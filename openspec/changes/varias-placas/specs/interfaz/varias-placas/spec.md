## Purpose

Un circuito con más de una placa, como en Tinkercad Circuits: cada placa tiene su propio programa, que el alumno ve, simula y carga eligiendo la placa.

## ADDED Requirements

### Requirement: Placas numeradas
Cada placa SHALL tener un número que la nombra en la página («Placa 1», «Placa 2»…), sin repetirse en el circuito. Una placa agregada o pegada SHALL recibir el menor número libre. Con dos o más placas, el número SHALL verse bajo cada placa.

#### Scenario: Pegar una placa
- **WHEN** el circuito tiene la Placa 1 y el alumno la copia y la pega
- **THEN** la nueva se llama Placa 2

#### Scenario: Número libre
- **WHEN** el circuito tiene las placas 1, 2 y 3, el alumno borra la 2 y agrega una placa desde la paleta
- **THEN** la nueva se llama Placa 2

### Requirement: Programa de la placa elegida
Con dos o más placas, el panel de programa SHALL mostrar arriba un selector con cada placa por su número y tipo («1 (Arduino UNO)», «2 (Arduino UNO)»). Los bloques, el texto y el monitor serie del panel SHALL ser los de la placa elegida. Hacer clic en una placa del lienzo SHALL elegirla en el selector, y elegirla en el selector SHALL marcarla en el lienzo. Con una sola placa, el panel SHALL verse como hoy, sin selector.

#### Scenario: Cambiar de placa
- **WHEN** el circuito tiene dos placas con programas distintos y el alumno elige «2 (Arduino UNO)» en el selector
- **THEN** ve los bloques de la Placa 2 y la Placa 2 queda marcada en el lienzo

#### Scenario: Clic en la placa
- **WHEN** el alumno hace clic en la Placa 1 con el panel de programa abierto
- **THEN** el selector pasa a «1 (Arduino UNO)» y ve sus bloques

#### Scenario: Una sola placa
- **WHEN** el circuito tiene una sola placa
- **THEN** el panel de programa no muestra selector

### Requirement: Simular todas las placas
Iniciar simulación SHALL compilar y arrancar todas las placas a la vez, y Detener simulación SHALL detenerlas todas. Un cable entre un pin de una placa y un pin de otra SHALL conectarlas en la simulación. El monitor serie SHALL mostrar el de la placa elegida en el selector.

#### Scenario: Dos placas parpadean
- **WHEN** el circuito tiene dos placas, una con parpadeo de 1 s y otra de 3 s, y el alumno inicia la simulación
- **THEN** la luz «L» de cada placa parpadea a su ritmo

#### Scenario: Una placa le habla a otra
- **WHEN** la Placa 1 pone su pin 13 en alto y bajo cada segundo, un cable lo une al pin 2 de la Placa 2, y el programa de la Placa 2 copia el pin 2 en su pin 13
- **THEN** la luz «L» de la Placa 2 sigue a la de la Placa 1

#### Scenario: Monitor de la placa elegida
- **WHEN** las dos placas escriben textos distintos en el monitor serie y el alumno cambia de placa en el selector
- **THEN** el monitor muestra lo que escribe la placa elegida

### Requirement: Circuito sin placa
El alumno SHALL poder borrar la última placa. Sin placas, el panel de programa SHALL decir que no hay placas y que se agrega una desde la paleta, e Iniciar simulación y Cargar a la placa SHALL avisar lo mismo sin hacer nada más. Proyecto nuevo SHALL seguir empezando con una placa.

#### Scenario: Borrar la última placa
- **WHEN** el alumno borra la única placa y abre el panel de programa
- **THEN** ve que no hay placas en el circuito y que puede agregar un Arduino UNO desde la paleta

#### Scenario: Simular sin placa
- **WHEN** no hay placas y el alumno pulsa Iniciar simulación
- **THEN** ve el mismo aviso y la simulación no arranca
