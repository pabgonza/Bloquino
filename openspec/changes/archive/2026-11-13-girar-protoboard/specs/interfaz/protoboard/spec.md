## ADDED Requirements

### Requirement: Lo asentado gira con la protoboard
Al girar la protoboard, cada componente asentado en ella SHALL girar con ella, en torno al centro de la protoboard, y SHALL quedar asentado en los mismos agujeros. Deshacer el giro SHALL devolver la protoboard y sus componentes a como estaban.

#### Scenario: Girar el semáforo armado
- **WHEN** el alumno gira 90° la protoboard con los tres LED y sus resistencias asentados
- **THEN** cada LED y cada resistencia queda girado sobre sus mismos agujeros, y la simulación prende los mismos LED que antes

#### Scenario: Soltar un componente en la protoboard girada
- **WHEN** la protoboard está girada 90° y el alumno suelta un LED sobre ella
- **THEN** sus patitas quedan asentadas en agujeros de la protoboard

#### Scenario: Deshacer el giro
- **WHEN** el alumno gira la protoboard y luego aprieta Ctrl+Z
- **THEN** la protoboard y sus componentes vuelven a su posición y giro anteriores, asentados en los mismos agujeros
