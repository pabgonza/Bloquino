# Spec Delta

## MODIFIED Requirements

### Requirement: Selección del modo de generación
Un programa con más de un script, o con un sombrero de evento de hardware, SHALL generarse con corrutinas. Un programa de un solo script SHALL generarse también con corrutinas cuando usa un bloque que trabaja de fondo, es decir, que necesita ejecutar código en cada vuelta de `loop()`: con `delay()` ese trabajo se detendría en cada espera.

#### Scenario: Dos scripts al iniciar
- **WHEN** el programa tiene dos bloques `al iniciar` con bloques debajo
- **THEN** el sketch se genera con corrutinas

#### Scenario: Solo un evento de botón
- **WHEN** el programa tiene un único script y su sombrero es `cuando se presiona botón en pin 2`
- **THEN** el sketch se genera con corrutinas

#### Scenario: Un solo script con un bloque de fondo
- **WHEN** el programa es `al iniciar` → `empezar canción Mario Bros en pin 8` → `por siempre` [ parpadeo con esperas ]
- **THEN** el sketch se genera con corrutinas, sin `delay()`, y `loop()` empieza con `musica8.update();`

#### Scenario: Bloque de fondo suelto
- **WHEN** el programa tiene un único `al iniciar` con un parpadeo y un `empezar canción` suelto, sin sombrero
- **THEN** el sketch sigue siendo clásico
