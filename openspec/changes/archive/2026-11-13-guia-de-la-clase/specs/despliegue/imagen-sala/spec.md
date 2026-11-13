## ADDED Requirements

### Requirement: Guía ilustrada de la clase
El repositorio SHALL traer una guía en HTML, que se abre sin internet, con capturas reales de la página: cómo el profesor prepara la clase, cómo se suma cada alumno y cómo transcurre la clase vista por el profesor y por el alumno. Un guion SHALL rehacer las capturas desde la imagen de la sala.

#### Scenario: Profesor nuevo
- **WHEN** un profesor que no conoce Bloquino lee la guía
- **THEN** sabe qué correr en su notebook, qué dirección dar, qué hacer en cada equipo la primera vez y qué hacen él y los alumnos durante la clase

#### Scenario: Cambia la página
- **WHEN** cambia la página del alumno y se corre el guion de capturas contra la sala
- **THEN** las capturas de la guía quedan al día sin editar el HTML
