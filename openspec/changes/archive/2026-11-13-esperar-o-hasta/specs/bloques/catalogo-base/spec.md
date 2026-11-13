## MODIFIED Requirements

### Requirement: Bloques de control
El catálogo SHALL incluir `por siempre`, `esperar [n] segundos`, `repetir [n] veces`, `repetir mientras <c>`, `contar [i] de [a] a [b]`, `si <c>`, `si <c> / si no`, `esperar hasta que <c>`, `esperar [n] segundos o hasta que <c>`, `cronómetro` y `reiniciar cronómetro`. `esperar [n] segundos o hasta que <c>` SHALL terminar cuando pasan los segundos o cuando se cumple la condición, lo que ocurra primero.

#### Scenario: Esperar con decimales
- **WHEN** se usa `esperar 0.5 segundos`
- **THEN** se genera `delay(500);`

#### Scenario: Repetir
- **WHEN** se usa `repetir 3 veces` con un bloque dentro
- **THEN** se genera un `for` que ejecuta el cuerpo 3 veces

#### Scenario: Cronómetro
- **WHEN** se usa `reiniciar cronómetro` y luego `cronómetro`
- **THEN** `cronómetro` devuelve los segundos transcurridos desde el reinicio, calculados con `millis()`

#### Scenario: Esperar con tiempo límite
- **WHEN** un programa enciende un LED, usa `esperar 5 segundos o hasta que ¿botón presionado?` y apaga el LED, y el botón se presiona al segundo
- **THEN** el LED se apaga al presionar el botón; sin presionarlo, se apaga a los 5 segundos
