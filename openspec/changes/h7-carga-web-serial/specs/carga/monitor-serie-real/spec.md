# Spec Delta

## Purpose

Ver en el monitor serie de Bloquino lo que envía la placa real, y escribirle.

## ADDED Requirements

### Requirement: Monitor serie de la placa real
Al terminar una carga, el monitor serie SHALL mostrar lo que la placa real envía por su puerto serie, a la velocidad del `Serial.begin` del programa (9600 baudios si no lo tiene), y lo que el alumno escriba en el monitor SHALL llegar a la placa real. El panel SHALL indicar que el monitor está conectado a la placa real.

#### Scenario: Temperatura de la placa real
- **WHEN** el alumno carga un programa que hace `decir` de la temperatura cada segundo y abre el monitor serie
- **THEN** ve llegar las lecturas de la placa real y el panel dice que es la placa real

#### Scenario: Orden hacia la placa
- **WHEN** el programa cargado enciende el LED al recibir «encender» y el alumno lo escribe en el monitor
- **THEN** el LED de la placa real se enciende

### Requirement: Un solo origen en el monitor
El monitor SHALL dejar la placa real cuando el alumno inicia la simulación, vuelve a cargar o desconecta la placa.

#### Scenario: Volver a simular
- **WHEN** el monitor muestra la placa real y el alumno pulsa Iniciar simulación
- **THEN** el monitor muestra la salida de la simulación y deja de indicar la placa real
