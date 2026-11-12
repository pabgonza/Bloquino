## ADDED Requirements

### Requirement: Selección en el lienzo
Un clic sobre un componente SHALL dejarlo seleccionado; con un componente seleccionado, Supr SHALL eliminarlo y R SHALL girarlo. Un clic en el fondo del lienzo SHALL quitar la selección. El lienzo SHALL tener seleccionado a lo más un componente o un cable, nunca los dos.

#### Scenario: Eliminar con clic y Supr
- **WHEN** el alumno hace clic en un buzzer y presiona Supr
- **THEN** el buzzer desaparece, y Ctrl+Z lo devuelve

#### Scenario: Sin selección no se borra
- **WHEN** el alumno hace clic en un buzzer, después en el fondo del lienzo, y presiona Supr
- **THEN** el buzzer sigue en el lienzo

#### Scenario: Girar con clic y R
- **WHEN** el alumno hace clic en un buzzer y presiona R
- **THEN** el buzzer gira 90°

#### Scenario: Del componente al cable
- **WHEN** el alumno hace clic en un buzzer, después en un cable tendido sobre la protoboard, y presiona Supr
- **THEN** desaparece solo el cable; el buzzer y la protoboard siguen

#### Scenario: Del cable al componente
- **WHEN** el alumno hace clic en un cable, después en un buzzer, y presiona Supr
- **THEN** desaparece solo el buzzer; el cable sigue
