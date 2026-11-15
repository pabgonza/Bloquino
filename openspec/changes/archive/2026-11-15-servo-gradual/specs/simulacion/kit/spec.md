## MODIFIED Requirements

### Requirement: Servo de extremo a extremo
Un servo SHALL moverse al ángulo que el programa le pide en todo el rango de 0° a 180°, incluidos los extremos. SHALL girar hacia ese ángulo a velocidad constante, como el de Tinkercad (de 0° a 180° en 1,1 s de tiempo de la placa), sin saltar; si el programa pide otro ángulo antes de que llegue, SHALL cambiar de rumbo desde donde va.

#### Scenario: Volver a cero
- **WHEN** el programa lleva el servo a 90° y después a 0°
- **THEN** el servo queda en 0°

#### Scenario: Perilla y servo
- **WHEN** el programa mueve el servo según la perilla y el alumno gira la perilla con el mouse del mínimo al máximo
- **THEN** el servo va de 0° a 180°

#### Scenario: Giro gradual
- **WHEN** el servo está en 0° y el programa lo lleva a 180°
- **THEN** medio segundo después va cerca de la mitad del recorrido, y llega a 180° pasado un segundo

#### Scenario: Otra orden antes de llegar
- **WHEN** el servo está en 0°, el programa lo lleva a 180° y 0,3 s después lo lleva a 0°
- **THEN** el servo no llega a 180°: vuelve a 0° desde donde iba
