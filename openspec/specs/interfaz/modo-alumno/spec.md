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
En modo alumno, la paleta SHALL ofrecer solo los componentes del kit del curso y la placa Arduino UNO, que SHALL ser la única placa disponible. Elegir la placa en la paleta SHALL agregar una placa con el programa inicial. La ficha de un componente SHALL mostrar, en español, solo las propiedades que el alumno puede cambiar.

#### Scenario: Componentes del kit
- **WHEN** un alumno revisa la paleta
- **THEN** encuentra Arduino UNO, LED, LED RGB, resistencia, botón, buzzer, servo, potenciómetro, sensor de distancia, temperatura y humedad, pantalla LCD, display de 1 dígito, display de 4 dígitos, receptor infrarrojo, control remoto y las protoboards, y no encuentra placas ESP32 ni Raspberry Pi

#### Scenario: Agregar una placa
- **WHEN** el alumno elige Arduino UNO en la paleta en un proyecto que ya tiene una placa
- **THEN** aparece una segunda placa, sin encimarse con nada, con el programa de parpadeo

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

### Requirement: Teclado según el foco
En la página de alumno, las teclas del lienzo (Supr, R, colores de cable, copiar, pegar, deshacer y rehacer) SHALL actuar solo cuando el foco no está en el panel de programa. Un clic en el lienzo SHALL devolverle el foco.

#### Scenario: Deshacer en los bloques
- **WHEN** el alumno tiende un cable, borra un bloque y presiona Ctrl+Z con el foco en los bloques
- **THEN** el bloque vuelve y el cable sigue en su lugar

#### Scenario: Supr en los bloques con un cable seleccionado
- **WHEN** hay un cable seleccionado y el alumno presiona Supr con el foco en un bloque
- **THEN** se borra el bloque y el cable queda

#### Scenario: De vuelta al lienzo
- **WHEN** después de usar los bloques el alumno hace clic en un cable y presiona Supr
- **THEN** el cable se borra, y Ctrl+Z lo devuelve

### Requirement: Selección en el lienzo
Un clic sobre una pieza SHALL dejarla seleccionada, sola; con piezas seleccionadas, Supr SHALL eliminarlas y R SHALL girarlas. Un clic en el fondo del lienzo SHALL quitar la selección. El lienzo SHALL tener seleccionadas piezas o un cable, nunca los dos.

#### Scenario: Eliminar con clic y Supr
- **WHEN** el alumno hace clic en un buzzer y presiona Supr
- **THEN** el buzzer desaparece, y Ctrl+Z lo devuelve

#### Scenario: Sin selección no se borra
- **WHEN** el alumno hace clic en un buzzer, después en el fondo del lienzo, y presiona Supr
- **THEN** el buzzer sigue en el lienzo

#### Scenario: Girar con clic y R
- **WHEN** el alumno hace clic en un buzzer y presiona R
- **THEN** el buzzer gira 90°

#### Scenario: Del componente al cable
- **WHEN** el alumno hace clic en un buzzer, después en un cable tendido sobre la protoboard, y presiona Supr
- **THEN** desaparece solo el cable; el buzzer y la protoboard siguen

#### Scenario: Del cable al componente
- **WHEN** el alumno hace clic en un cable, después en un buzzer, y presiona Supr
- **THEN** desaparece solo el buzzer; el cable sigue

### Requirement: Varias piezas seleccionadas
Un clic con Shift SHALL sumar una pieza a la selección, o quitarla si ya estaba. Ctrl+A SHALL seleccionar todas las piezas, las placas incluidas. Shift y arrastrar SHALL seleccionar las piezas que quedan enteras dentro del rectángulo, también si empieza sobre la protoboard; arrastrar sin tecla SHALL seguir moviendo la vista.

#### Scenario: Sumar y quitar con Shift
- **WHEN** el alumno hace clic en un LED, Shift y clic en una resistencia, y Shift y clic otra vez en el LED
- **THEN** queda seleccionada solo la resistencia

#### Scenario: Rectángulo de selección
- **WHEN** el alumno mantiene Shift y arrastra sobre la protoboard un rectángulo que encierra tres LED
- **THEN** los tres LED quedan seleccionados y la vista no se mueve

### Requirement: Acciones sobre el grupo
Con varias piezas seleccionadas, arrastrar una SHALL moverlas todas; R SHALL girarlas 90° en torno al centro del grupo; Supr SHALL eliminarlas, previa confirmación si hay placas entre ellas; y Ctrl+C y Ctrl+V SHALL pegar una copia de todas, las placas con una copia de su programa, que queda seleccionada. Los cables entre dos piezas del grupo SHALL acompañarlas, y cada acción SHALL deshacerse con un solo Ctrl+Z.

#### Scenario: Mover un grupo
- **WHEN** el alumno selecciona un LED y una resistencia unidos por un cable y arrastra el LED
- **THEN** el LED, la resistencia y el cable entre ellos se mueven lo mismo, y Ctrl+Z los devuelve juntos

#### Scenario: Girar un grupo
- **WHEN** el alumno selecciona dos componentes y presiona R
- **THEN** los dos giran 90° en torno al centro del grupo y quedan en la misma posición entre sí

#### Scenario: Copiar y pegar un grupo
- **WHEN** el alumno selecciona un LED y su resistencia unidos por un cable y presiona Ctrl+C y Ctrl+V
- **THEN** aparece al lado una copia de los dos con su cable, y la copia queda seleccionada

#### Scenario: La placa gira con el grupo y no se borra
- **WHEN** el alumno presiona Ctrl+A, R y Supr, y cancela la confirmación
- **THEN** todo gira, la placa incluida, y nada se borra

#### Scenario: Copiar y pegar un circuito con su placa
- **WHEN** el alumno presiona Ctrl+A, Ctrl+C y Ctrl+V sobre un semáforo armado
- **THEN** aparece al lado una copia de la placa con su programa, la protoboard, los LED, las resistencias y los cables, y la copia queda seleccionada

#### Scenario: Mover todo el circuito
- **WHEN** el alumno presiona Ctrl+A y arrastra la protoboard
- **THEN** la placa, la protoboard, lo asentado en ella y los cables se mueven juntos

#### Scenario: Borrar todo
- **WHEN** el alumno presiona Ctrl+A y Supr, y acepta la confirmación
- **THEN** el lienzo queda vacío, y un Ctrl+Z devuelve todo, la placa con su programa

### Requirement: Varias placas, cada una con su programa
En la página de alumno el circuito SHALL poder tener una o más placas Arduino UNO, cada una con su propio programa. Una placa SHALL poder girarse, copiarse y borrarse con R, Ctrl+C y Ctrl+V, Supr, su barra y su ficha, igual que las demás piezas. Copiar una placa SHALL copiar también su programa. Borrar una o más placas SHALL pedir confirmación en español, avisando que se pierde su programa, y SHALL llevarse sus cables; Ctrl+Z SHALL devolverlas con su programa y sus cables.

#### Scenario: Copiar la placa con su programa
- **WHEN** el alumno hace clic en la placa con el programa de parpadeo, presiona Ctrl+C y Ctrl+V, y cambia el programa de la copia
- **THEN** aparece al lado una segunda placa con el mismo programa, y al cambiar el de la copia el de la primera no cambia

#### Scenario: Borrar una placa
- **WHEN** el alumno hace clic en la segunda placa, presiona Supr y acepta la confirmación
- **THEN** la placa desaparece con sus cables, y Ctrl+Z la devuelve con su programa y sus cables

#### Scenario: Cancelar el borrado
- **WHEN** el alumno presiona Supr con una placa elegida y cancela la confirmación
- **THEN** la placa y su programa siguen

#### Scenario: Barra y ficha de la placa
- **WHEN** el alumno hace clic en una placa y después clic derecho en ella
- **THEN** su barra ofrece girarla, copiarla, pegar y eliminarla, y su ficha ofrece rotarla y eliminarla
