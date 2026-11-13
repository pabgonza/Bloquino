## MODIFIED Requirements

### Requirement: Cesión de turno
`esperar`, `esperar hasta que`, `esperar … o hasta que` y `tocar nota` SHALL ceder el turno a los demás scripts mientras duran. `por siempre` y `repetir mientras` SHALL ceder el turno al final de cada vuelta.

#### Scenario: Por siempre sin esperas
- **WHEN** un script tiene un `por siempre` sin ningún bloque de espera y otro parpadea un LED
- **THEN** el LED sigue parpadeando a su ritmo

#### Scenario: Esperar hasta que
- **WHEN** un script está detenido en `esperar hasta que ¿botón presionado?` y el botón no se presiona
- **THEN** los demás scripts siguen avanzando

#### Scenario: Espera larga que se corta
- **WHEN** un bloque propio `latido (segundos)` espera con `esperar (segundos) segundos o hasta que <espera > 3>`, otro script sube `espera` de 2,3 a 3,3 con un botón y el primero pasa a la alarma cuando `espera > 3`
- **THEN** la alarma empieza en menos de un segundo, sin esperar a que termine la vuelta del latido
