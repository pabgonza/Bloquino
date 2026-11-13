# protoboard Specification

## Purpose

La protoboard del simulador se usa como la real y como la de Tinkercad, que es la referencia del curso: los componentes calzan en sus agujeros, el alumno ve qué agujeros están unidos y puede cablear desde cualquiera que esté libre.

## Requirements

### Requirement: Tira conectada a la vista
Al pasar el mouse por un agujero de la protoboard, la página de alumno SHALL marcar en verde todos los agujeros unidos a él por dentro: los cinco de su columna en esa mitad, o el riel completo. Lo mismo SHALL ocurrir al pasar el mouse por la patita de un componente asentado en la protoboard. Las marcas SHALL desaparecer al salir.

#### Scenario: Agujero de una columna
- **WHEN** el alumno pasa el mouse por un agujero de la columna 40 de la mitad inferior
- **THEN** quedan marcados en verde los cinco agujeros de esa columna en esa mitad, y ninguno de la mitad superior

#### Scenario: Riel de alimentación
- **WHEN** el alumno pasa el mouse por un agujero del riel positivo superior
- **THEN** queda marcado todo ese riel

#### Scenario: Protoboard girada
- **WHEN** el alumno gira la protoboard 90° y pasa el mouse por uno de sus agujeros
- **THEN** las marcas verdes quedan sobre los agujeros de esa tira, en su posición girada

#### Scenario: Patita de un componente asentado
- **WHEN** el alumno pasa el mouse por la patita S de un DHT11 asentado en la columna 26
- **THEN** quedan marcados los cinco agujeros de la columna 26 de esa mitad

### Requirement: Agujeros libres cliqueables
Un componente SHALL tapar al mouse solo los agujeros que quedan bajo su dibujo. Los que quedan bajo su margen SHALL poder cliquearse para empezar o terminar un cable.

#### Scenario: Cablear junto a un módulo
- **WHEN** un DHT11 está asentado con sus patitas en la fila h y el alumno hace clic en el agujero de la fila j de la misma columna y luego en el pin 2 del Arduino
- **THEN** se crea un cable entre ese agujero y el pin 2, y el programa lee el sensor

### Requirement: Componentes que calzan
Al soltar un componente sobre la protoboard, sus patitas SHALL quedar exactamente sobre agujeros y conectadas a sus tiras.

#### Scenario: Soltar el DHT11
- **WHEN** el alumno arrastra el DHT11 y lo suelta sobre la protoboard
- **THEN** sus tres patitas quedan en tres columnas vecinas y marcadas como asentadas

#### Scenario: Botón a caballo del canal
- **WHEN** el alumno toma el botón de la paleta y lo suelta sobre el canal central de la protoboard
- **THEN** sus cuatro patitas quedan asentadas, dos en cada mitad, y las patitas de un mismo lado del canal quedan en columnas distintas

#### Scenario: Resistencia de 220 Ω al riel
- **WHEN** el alumno toma la resistencia de la paleta y suelta una patita en la fila g de la mitad inferior
- **THEN** la resistencia es de 220 Ω, queda vertical y su otra patita cae en el riel negativo

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
