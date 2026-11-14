## MODIFIED Requirements

### Requirement: Bloques de sonido
El catálogo SHALL incluir `tocar nota [nota] por [n] segundos en pin [p]` y `silenciar pin [p]`. El desplegable de notas SHALL ofrecer al menos do, re, mi, fa, sol, la, si de dos octavas. En un programa de varios scripts, `tocar nota` SHALL ceder el turno mientras la nota suena. La categoría Sonido SHALL mostrar además, después de estos, los bloques de canciones del paquete BuzzerMusic (ver `bloques/buzzermusic`).

#### Scenario: Nota con duración
- **WHEN** se usa `tocar nota la por 0.5 segundos en pin 8`
- **THEN** se genera `tone(8, 440);`, `delay(500);` y `noTone(8);`: la nota la apaga el programa, no la duración de `tone()`

#### Scenario: Nota en un programa de varios scripts
- **WHEN** un script usa `tocar nota la por 0.5 segundos en pin 8` y otro parpadea un LED cada 0.1 segundos
- **THEN** se genera `tone(8, 440);`, una espera cooperativa de 500 ms y `noTone(8);`, y el LED sigue parpadeando mientras la nota suena

#### Scenario: Canciones en la categoría
- **WHEN** el usuario abre la categoría Sonido
- **THEN** ve `tocar nota`, `silenciar pin` y a continuación los bloques de canciones
