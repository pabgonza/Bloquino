# Spec Delta

## Purpose

Bloques para tocar con un buzzer las canciones de la librería BuzzerMusic del curso, solas o de fondo mientras el resto del programa sigue.

## ADDED Requirements

### Requirement: Bloques de canciones
La categoría Sonido SHALL incluir `tocar canción [canción] en pin [p]`, `empezar canción [canción] en pin [p]`, `detener canción en pin [p]` y `¿canción sonando en pin [p]?`, con el pin 8 por defecto. El menú de canciones SHALL ofrecer Mario Bros, Marcha Imperial, Cumpleaños feliz e Himno de la Alegría.

#### Scenario: Paleta
- **WHEN** el usuario abre la categoría Sonido
- **THEN** encuentra los cuatro bloques de canciones después de `silenciar pin`, con Mario Bros y el pin 8 elegidos

### Requirement: Tocar una canción completa
`tocar canción` SHALL hacer sonar la canción entera antes de pasar al bloque siguiente. En un programa simple SHALL generar la llamada bloqueante de la librería, como en las slides del curso. En un programa con corrutinas SHALL ceder el turno mientras la canción suena.

#### Scenario: Programa simple
- **WHEN** el programa es `al iniciar` → `tocar canción Mario Bros en pin 8`
- **THEN** el sketch incluye `BuzzerMusic.h`, declara `BuzzerMusic musica8(8);`, llama a `musica8.marioBros();` en `setup()` y no usa corrutinas

#### Scenario: Canción y parpadeo en dos scripts
- **WHEN** un script hace `tocar canción Himno de la Alegría en pin 8` y luego enciende el LED del pin 12, y otro script parpadea el LED del pin 13 cada 0.2 segundos
- **THEN** el parpadeo mantiene su ritmo mientras la canción suena y el LED del pin 12 se enciende recién cuando termina

### Requirement: Canción de fondo
`empezar canción` SHALL iniciar la canción y pasar de inmediato al bloque siguiente; la canción SHALL avanzar sola mientras el programa sigue, aunque el programa tenga un solo script. `detener canción` SHALL cortarla y `¿canción sonando?` SHALL ser verdadero desde que empieza hasta que termina o se detiene.

#### Scenario: Música con un LED que parpadea
- **WHEN** el programa es `al iniciar` → `empezar canción Mario Bros en pin 8` → `por siempre` [ parpadeo del LED del pin 13 cada 0.2 segundos ]
- **THEN** en el simulador el buzzer toca las notas de la canción una tras otra y el LED parpadea a su ritmo al mismo tiempo

#### Scenario: Detener con un botón
- **WHEN** una canción suena de fondo y otro script hace `detener canción en pin 8` al presionar un botón
- **THEN** el buzzer calla y `¿canción sonando en pin 8?` pasa a falso

#### Scenario: La canción termina sola
- **WHEN** una canción de fondo llega a su última nota
- **THEN** `¿canción sonando en pin 8?` pasa a falso y el buzzer queda en silencio
