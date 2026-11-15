## MODIFIED Requirements

### Requirement: Bloques de canciones
La categoría Sonido SHALL incluir `tocar canción [canción] a velocidad [v] en pin [p]`, `empezar canción [canción] a velocidad [v] en pin [p]`, `detener canción en pin [p]` y `¿canción sonando en pin [p]?`, con velocidad normal y el pin 8 por defecto. El menú de canciones SHALL ofrecer Mario Bros, Marcha Imperial, Cumpleaños feliz e Himno de la Alegría.

#### Scenario: Paleta
- **WHEN** el usuario abre la categoría Sonido
- **THEN** encuentra los cuatro bloques de canciones después de `silenciar pin`, con Mario Bros, velocidad normal y el pin 8 elegidos

## ADDED Requirements

### Requirement: Velocidad de la canción
El menú de velocidad SHALL ofrecer muy lenta, lenta, normal, rápida y muy rápida, que multiplican el tempo de la partitura por 0,5, 0,75, 1, 1,25 y 1,5. Con velocidad normal el código SHALL ser el de la librería sin tempo; con otra SHALL pasar el tempo resultante en pulsos por minuto, redondeado. Un programa guardado antes de este menú SHALL cargar con velocidad normal.

#### Scenario: Normal, como en las slides
- **WHEN** el programa es `al iniciar` → `tocar canción Mario Bros a velocidad normal en pin 8`
- **THEN** se genera `musica8.marioBros();`

#### Scenario: Más rápida
- **WHEN** el programa es `al iniciar` → `tocar canción Mario Bros a velocidad rápida en pin 8`
- **THEN** se genera `musica8.marioBros(250);`, porque la partitura va a 200 pulsos por minuto

#### Scenario: De fondo y más lenta
- **WHEN** un programa con corrutinas usa `empezar canción Himno de la Alegría a velocidad lenta en pin 8`
- **THEN** se genera `musica8.start(BuzzerMusic::ODE_TO_JOY, 86);` (114 × 0,75)

#### Scenario: Programa guardado sin velocidad
- **WHEN** se abre un programa guardado cuyo bloque `tocar canción` no tiene velocidad
- **THEN** el bloque muestra velocidad normal y genera el mismo código que antes
