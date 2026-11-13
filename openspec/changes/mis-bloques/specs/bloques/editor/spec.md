## MODIFIED Requirements

### Requirement: Bloques sin sombrero
Los bloques que no cuelgan de un bloque de evento ni de un sombrero «definir» de Mis bloques SHALL ignorarse al generar y SHALL verse atenuados.

#### Scenario: Bloque suelto
- **WHEN** hay un bloque `encender LED` suelto en el área de trabajo
- **THEN** no aparece en el código generado y se dibuja atenuado

#### Scenario: Bloque dentro de una definición
- **WHEN** `encender LED en pin 13` cuelga de «definir parpadear»
- **THEN** se dibuja normal y forma parte de lo que hace `parpadear`
