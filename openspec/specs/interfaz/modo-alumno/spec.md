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
En modo alumno, la paleta SHALL ofrecer solo los componentes del kit del curso, y la única placa disponible SHALL ser el Arduino UNO. La ficha de un componente SHALL mostrar, en español, solo las propiedades que el alumno puede cambiar.

#### Scenario: Componentes del kit
- **WHEN** un alumno revisa la paleta
- **THEN** encuentra LED, LED RGB, resistencia, botón, buzzer, servo, potenciómetro, sensor de distancia, temperatura y humedad, pantalla LCD, display de 1 dígito, display de 4 dígitos, receptor infrarrojo, control remoto y las protoboards, y no encuentra placas ESP32 ni Raspberry Pi

#### Scenario: Pantalla como la del kit
- **WHEN** el alumno agrega la pantalla LCD
- **THEN** sale azul con letras blancas

#### Scenario: Ficha de un display
- **WHEN** el alumno abre la ficha de un display de 7 segmentos
- **THEN** ve solo `Tipo`, con las opciones `Cátodo común` y `Ánodo común`

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

### Requirement: Una sola placa, fija
En la página de alumno el circuito SHALL tener siempre una sola placa Arduino UNO. La placa SHALL NOT ofrecer acciones para copiarla, girarla o eliminarla, ni con botones, ni con el teclado, ni en su ficha, y pegar una placa copiada SHALL NOT dejar una segunda placa en el lienzo.

#### Scenario: Barra de la placa
- **WHEN** el alumno hace clic en la placa
- **THEN** no aparecen botones para copiar, girar ni eliminar la placa

#### Scenario: Copiar y pegar con el teclado
- **WHEN** el alumno hace clic en la placa y presiona Ctrl+C y Ctrl+V
- **THEN** el lienzo sigue con una sola placa

#### Scenario: Girar y eliminar con el teclado
- **WHEN** el alumno hace clic en la placa y presiona R y después Supr
- **THEN** la placa no gira y no aparece la pregunta de eliminarla

#### Scenario: Ficha de la placa
- **WHEN** el alumno hace clic derecho en la placa
- **THEN** su ficha no ofrece rotarla ni eliminarla

### Requirement: Teclado según el foco
En la página de alumno, las teclas del lienzo (Supr, R, colores de cable, copiar, pegar, deshacer y rehacer) SHALL actuar solo cuando el foco no está en el panel de programa. Un clic en el lienzo SHALL devolverle el foco.

#### Scenario: Deshacer en los bloques
- **WHEN** el alumno tiende un cable, borra un bloque y presiona Ctrl+
