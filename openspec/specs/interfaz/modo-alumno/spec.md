# modo-alumno Specification

## Purpose

Deja a la vista del alumno solo lo que necesita para armar y programar su circuito, y permite al profesor recuperar las herramientas completas de Velxio.

## Requirements

### Requirement: Modo alumno por defecto
El editor SHALL abrirse en modo alumno. En modo alumno SHALL quedar ocultos el explorador de archivos, el osciloscopio, los avisos de simulación eléctrica, los menús de archivo y de cuenta, las novedades y la galería de ejemplos de Velxio.

#### Scenario: Primera visita
- **WHEN** un alumno abre el editor
- **THEN** no ve explorador de archivos, osciloscopio, avisos de SPICE, menús File o Account, novedades ni ejemplos

### Requirement: Solo el kit del curso
En modo alumno, la paleta SHALL ofrecer solo los componentes del kit del curso, y la única placa disponible SHALL ser el Arduino UNO.

#### Scenario: Componentes del kit
- **WHEN** un alumno revisa la paleta
- **THEN** encuentra LED, LED RGB, resistencia, botón, buzzer, servo, potenciómetro y sensor de distancia, y no encuentra placas ESP32 ni Raspberry Pi

### Requirement: Modo profe
Abrir el editor con el parámetro `profe` en la URL SHALL activar el modo profe, que muestra todo lo que el modo alumno oculta. El navegador SHALL recordar el modo entre visitas, y el parámetro `alumno` SHALL volver al modo alumno.

#### Scenario: Activar
- **WHEN** el profesor abre `/editor?profe`
- **THEN** ve el explorador de archivos, los menús completos y todos los componentes y placas de Velxio

#### Scenario: Se recuerda
- **WHEN** el profesor activó el modo profe y vuelve a abrir `/editor` sin parámetros
- **THEN** el editor sigue en modo profe

#### Scenario: Volver a modo alumno
- **WHEN** se abre `/editor?alumno`
- **THEN** el editor queda en modo alumno, también en las visitas siguientes
