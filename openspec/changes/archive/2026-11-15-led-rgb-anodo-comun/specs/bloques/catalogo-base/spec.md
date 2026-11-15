## MODIFIED Requirements

### Requirement: Bloques de luces
El catálogo SHALL incluir `encender LED en pin [p]`, `apagar LED en pin [p]`, `brillo del LED en pin [p] a [n] %` y `color del LED RGB [tipo] (pines [r][g][b]) a [color]`. El tipo SHALL ofrecer `cátodo común` y `ánodo común`; con ánodo común cada `analogWrite` SHALL llevar `255 - valor`, para que el color elegido sea el que se ve. En la paleta el bloque SHALL salir con `ánodo común`, como el LED del kit; un bloque guardado sin el tipo SHALL ser de cátodo común.

#### Scenario: Brillo
- **WHEN** se usa `brillo del LED en pin 9 a 50 %`
- **THEN** se genera un `analogWrite` al pin 9 con un valor cercano a 127, y el desplegable de pin solo ofrece los pines PWM (3, 5, 6, 9, 10, 11)

#### Scenario: Color RGB
- **WHEN** se usa `color del LED RGB cátodo común (pines 9, 10, 11) a rojo`
- **THEN** se generan tres `analogWrite`: 255 al pin 9 y 0 a los pines 10 y 11

#### Scenario: Color RGB de ánodo común
- **WHEN** se usa `color del LED RGB ánodo común (pines 9, 10, 11) a rojo`
- **THEN** se generan tres `analogWrite`: 0 al pin 9 y 255 a los pines 10 y 11

#### Scenario: Programa guardado sin el tipo
- **WHEN** se abre un programa con `color del LED RGB` guardado antes de que el bloque tuviera el tipo
- **THEN** el bloque queda en `cátodo común` y genera lo mismo que antes
