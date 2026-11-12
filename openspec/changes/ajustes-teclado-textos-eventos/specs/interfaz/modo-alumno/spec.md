# Spec Delta

## ADDED Requirements

### Requirement: Teclado según el foco
En la página de alumno, las teclas del lienzo (Supr, R, colores de cable, copiar, pegar, deshacer y rehacer) SHALL actuar solo cuando el foco no está en el panel de programa. Un clic en el lienzo SHALL devolverle el foco.

#### Scenario: Deshacer en los bloques
- **WHEN** el alumno tiende un cable, borra un bloque y presiona Ctrl+Z con el foco en los bloques
- **THEN** el bloque vuelve y el cable sigue en su lugar

#### Scenario: Supr en los bloques con un cable seleccionado
- **WHEN** hay un cable seleccionado y el alumno presiona Supr con el foco en un bloque
- **THEN** se borra el bloque y el cable queda

#### Scenario: De vuelta al lienzo
- **WHEN** después de usar los bloques el alumno hace clic en un cable y presiona Supr
- **THEN** el cable se borra, y Ctrl+Z lo devuelve

## MODIFIED Requirements

### Requirement: Una sola placa, fija
En la página de alumno el circuito SHALL tener siempre una sola placa Arduino UNO. La placa SHALL NOT ofrecer acciones para copiarla, girarla o eliminarla, ni con botones, ni con el teclado, ni en su ficha, y pegar una placa copiada SHALL NOT dejar una segunda placa en el lienzo.

#### Scenario: Barra de la placa
- **WHEN** el alumno hace clic en la placa
- **THEN** no aparecen botones para copiar, girar ni eliminar la placa

#### Scenario: Copiar y pegar con el teclado
- **WHEN** el alumno hace clic en la placa y presiona Ctrl+C y Ctrl+V
- **THEN** el lienzo sigue con una sola placa

#### Scenario: Girar y eliminar con el teclado
- **WHEN** el alumno hace clic en la placa y presiona R y después Supr
- **THEN** la placa no gira y no aparece la pregunta de eliminarla

#### Scenario: Ficha de la placa
- **WHEN** el alumno hace clic derecho en la placa
- **THEN** su ficha no ofrece rotarla ni eliminarla
