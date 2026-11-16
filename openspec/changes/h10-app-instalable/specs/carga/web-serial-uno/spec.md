# Spec Delta

## ADDED Requirements

### Requirement: Cargar desde la aplicación instalable
Dentro de la aplicación instalable, Cargar a la placa SHALL funcionar sin HTTPS, sin certificado y sin red, con las mismas etapas, comprobación y mensajes que en la web.

#### Scenario: Parpadeo en la placa real, sin red
- **WHEN** el alumno abre la aplicación con el wifi apagado, arma el parpadeo del pin 13 y pulsa Cargar a la placa con un Arduino UNO conectado
- **THEN** ve el avance de la carga, el mensaje de que el programa quedó en la placa, y la luz «L» de la placa real parpadea

### Requirement: Elegir el puerto en la aplicación
Dentro de la aplicación, si hay una sola placa conectada al equipo, la carga SHALL usarla sin preguntar. Con dos o más, SHALL mostrar una lista en español con los puertos de placas Arduino y sus clones para que el alumno elija. Sin ninguna, SHALL avisar que no encuentra una placa conectada.

#### Scenario: Una placa conectada
- **WHEN** hay un solo Arduino conectado y el alumno pulsa Cargar a la placa por primera vez
- **THEN** la carga empieza sin mostrar ninguna lista

#### Scenario: Dos placas conectadas
- **WHEN** hay dos Arduino conectados y el alumno pulsa Cargar a la placa
- **THEN** ve una lista con los dos puertos, elige uno y la carga sigue con ese

#### Scenario: Ninguna placa
- **WHEN** no hay ninguna placa conectada y el alumno pulsa Cargar a la placa
- **THEN** ve que no se encontró una placa y que revise el cable
