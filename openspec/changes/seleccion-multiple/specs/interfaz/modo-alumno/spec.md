## MODIFIED Requirements

### Requirement: Selección en el lienzo
Un clic sobre una pieza SHALL dejarla seleccionada, sola. Un clic con Shift SHALL sumarla a la selección, o quitarla si ya estaba. Ctrl+A SHALL seleccionar todas las piezas, la placa incluida. Shift y arrastrar en el fondo del lienzo SHALL seleccionar las piezas que quedan enteras dentro del rectángulo; arrastrar sin tecla SHALL seguir moviendo la vista. Con piezas seleccionadas, arrastrar una SHALL mover todas, la placa incluida; R SHALL girarlas juntas 90° en torno al centro del grupo, la placa incluida; Supr SHALL eliminar las que no son la placa; y Ctrl+C y Ctrl+V SHALL pegar una copia de las que no son la placa, que queda seleccionada. Los cables entre dos piezas seleccionadas SHALL acompañarlas, y cada una de esas acciones SHALL deshacerse con un solo Ctrl+Z. Un clic en el fondo del lienzo SHALL quitar la selección. El lienzo SHALL tener seleccionadas piezas o un cable, nunca los dos.

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

#### Scenario: Sumar y quitar con Shift
- **WHEN** el alumno hace clic en un LED, Shift y clic en una resistencia, y Shift y clic otra vez en el LED
- **THEN** queda seleccionada solo la resistencia

#### Scenario: Mover un grupo
- **WHEN** el alumno selecciona un LED y una resistencia unidos por un cable y arrastra el LED
- **THEN** el LED, la resistencia y el cable entre ellos se mueven lo mismo, y Ctrl+Z los devuelve juntos

#### Scenario: Girar un grupo
- **WHEN** el alumno selecciona dos componentes y presiona R
- **THEN** los dos giran 90° en torno al centro del grupo y quedan en la misma posición entre sí

#### Scenario: Copiar y pegar un grupo
- **WHEN** el alumno selecciona un LED y su resistencia unidos por un cable y presiona Ctrl+C y Ctrl+V
- **THEN** aparece al lado una copia de los dos con su cable, y la copia queda seleccionada

#### Scenario: Rectángulo de selección
- **WHEN** el alumno mantiene Shift y arrastra en el fondo un rectángulo que encierra tres LED
- **THEN** los tres LED quedan seleccionados y la vista no se mueve

#### Scenario: Mover todo el circuito
- **WHEN** el alumno presiona Ctrl+A y arrastra la protoboard
- **THEN** la placa, la protoboard, lo asentado en ella y los cables se mueven juntos

#### Scenario: La placa gira con el grupo y no se borra
- **WHEN** el alumno presiona Ctrl+A, R y después Supr
- **THEN** todo gira, la placa incluida, y después desaparecen los componentes y la placa queda; un Ctrl+Z devuelve los componentes

### Requirement: Una sola placa, fija
En la página de alumno el circuito SHALL tener siempre una sola placa Arduino UNO. La placa SHALL poder girarse (con R, con el botón de su barra y desde su ficha), pero SHALL NOT ofrecer acciones para copiarla o eliminarla, ni con botones, ni con el teclado, ni en su ficha, y pegar una placa copiada SHALL NOT dejar una segunda placa en el lienzo.

#### Scenario: Barra de la placa
- **WHEN** el alumno hace clic en la placa
- **THEN** su barra ofrece girarla y no ofrece copiarla, pegar ni eliminarla

#### Scenario: Copiar y pegar con el teclado
- **WHEN** el alumno hace clic en la placa y presiona Ctrl+C y Ctrl+V
- **THEN** el lienzo sigue con una sola placa

#### Scenario: Girar y eliminar con el teclado
- **WHEN** el alumno hace clic en la placa y presiona R y después Supr
- **THEN** la placa gira 90° y no aparece la pregunta de eliminarla

#### Scenario: Ficha de la placa
- **WHEN** el alumno hace clic derecho en la placa
- **THEN** su ficha ofrece rotarla y no ofrece eliminarla
