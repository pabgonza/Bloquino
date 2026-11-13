## MODIFIED Requirements

### Requirement: Lienzo claro con Arduino UNO
La página del editor SHALL mostrar el lienzo del circuito con tema claro ocupando el centro de la pantalla. Un proyecto nuevo SHALL empezar con un Arduino UNO ya puesto en el lienzo y ningún otro componente ni cable.

#### Scenario: Abrir el editor por primera vez
- **WHEN** el usuario abre el editor sin proyecto guardado
- **THEN** ve un Arduino UNO en un lienzo de fondo claro, sin diálogos previos

#### Scenario: Proyecto nuevo solo con la placa
- **WHEN** el alumno aprieta «Nuevo» y acepta
- **THEN** en el lienzo queda solo el Arduino UNO, sin LED, resistencia ni cables, y al simular parpadea el LED de la placa
