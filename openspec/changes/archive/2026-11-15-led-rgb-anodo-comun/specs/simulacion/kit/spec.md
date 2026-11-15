## ADDED Requirements

### Requirement: LED RGB de ánodo o cátodo común
El LED RGB SHALL tener la propiedad `common` (`cathode` o `anode`). De cátodo común, cada color SHALL encenderse con su pin en alto; de ánodo común, en bajo, y con PWM SHALL brillar en proporción a `255 - valor`. Una pieza sin la propiedad SHALL ser de cátodo común.

#### Scenario: Ánodo común en bajo
- **WHEN** el LED RGB es de ánodo común y el programa deja el pin del rojo en bajo y los otros dos en alto
- **THEN** se ve solo el rojo

#### Scenario: Ánodo común con PWM
- **WHEN** el LED RGB es de ánodo común y el programa escribe `analogWrite` de 0 al rojo y de 255 al verde y al azul
- **THEN** el rojo brilla al máximo y el verde y el azul quedan apagados

#### Scenario: Pieza guardada sin el tipo
- **WHEN** se abre un proyecto con un LED RGB guardado sin la propiedad `common`
- **THEN** se comporta como de cátodo común
