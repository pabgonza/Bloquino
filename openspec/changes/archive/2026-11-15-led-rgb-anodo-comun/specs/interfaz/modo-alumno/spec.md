## MODIFIED Requirements

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

#### Scenario: LED RGB como el del kit
- **WHEN** el alumno agrega el LED RGB y abre su ficha
- **THEN** sale de ánodo común, y la ficha muestra solo `Tipo`, con las opciones `Cátodo común` y `Ánodo común`
