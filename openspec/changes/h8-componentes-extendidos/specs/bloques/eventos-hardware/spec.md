# Spec Delta

## ADDED Requirements

### Requirement: Sombreros de puerto serie y de control remoto
La categoría Eventos SHALL incluir, además del sombrero de botón, `cuando llega un dato por el puerto serie` (ver `bloques/puerto-serie`) y `cuando llega la tecla [tecla] del control (receptor en pin [p])` (ver `bloques/infrarrojo`). Un programa con cualquiera de ellos SHALL generarse con corrutinas y contar para el tope de scripts.

#### Scenario: Paleta de eventos
- **WHEN** el usuario abre la categoría Eventos
- **THEN** encuentra `al iniciar`, el sombrero de botón, el de puerto serie y el de tecla del control, este con la tecla OK y el pin 10

#### Scenario: Un solo sombrero de tecla
- **WHEN** el programa tiene un único script y su sombrero es `cuando llega la tecla OK del control`
- **THEN** el sketch se genera con corrutinas
