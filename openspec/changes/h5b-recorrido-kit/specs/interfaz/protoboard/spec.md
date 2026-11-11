# Spec Delta

## Purpose

La protoboard del simulador se usa como la real y como la de Tinkercad, que es la referencia del curso: los componentes calzan en sus agujeros, el alumno ve qué agujeros están unidos y puede cablear desde cualquiera que esté libre.

## ADDED Requirements

### Requirement: Tira conectada a la vista
Al pasar el mouse por un agujero de la protoboard, la página de alumno SHALL marcar en verde todos los agujeros unidos a él por dentro: los cinco de su columna en esa mitad, o el riel completo. Lo mismo SHALL ocurrir al pasar el mouse por la patita de un componente asentado en la protoboard. Las marcas SHALL desaparecer al salir.

#### Scenario: Agujero de una columna
- **WHEN** el alumno pasa el mouse por un agujero de la columna 40 de la mitad inferior
- **THEN** quedan marcados en verde los cinco agujeros de esa columna en esa mitad, y ninguno de la mitad superior

#### Scenario: Riel de alimentación
- **WHEN** el alumno pasa el mouse por un agujero del riel positivo superior
- **THEN** queda marcado todo ese riel

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
