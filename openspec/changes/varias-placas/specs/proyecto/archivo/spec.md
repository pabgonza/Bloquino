## MODIFIED Requirements

### Requirement: Archivos que no se pueden abrir
Un archivo que no es un proyecto válido, o que usa alguna placa distinta de Arduino UNO, SHALL rechazarse con un mensaje en español, y el proyecto en curso SHALL quedar intacto. Un proyecto con una o más placas Arduino UNO, o sin placas, SHALL abrirse con todas sus placas y el programa de cada una.

#### Scenario: Archivo cualquiera
- **WHEN** el alumno intenta abrir una foto o un archivo de texto
- **THEN** ve un mensaje que dice que no es un proyecto de Bloquino y su proyecto no cambia

#### Scenario: Otra placa
- **WHEN** el alumno intenta abrir un `.vlx` hecho para un ESP32
- **THEN** ve un mensaje que dice que el proyecto no es para Arduino UNO y su proyecto no cambia

#### Scenario: Dos placas UNO
- **WHEN** el alumno descarga un proyecto con dos placas de programas distintos, crea uno nuevo y abre el archivo
- **THEN** ve las dos placas, numeradas como antes, cada una con su programa

#### Scenario: Una placa UNO y otra distinta
- **WHEN** el alumno intenta abrir un `.vlx` con un Arduino UNO y un ESP32
- **THEN** ve el mensaje de que el proyecto no es para Arduino UNO y su proyecto no cambia
