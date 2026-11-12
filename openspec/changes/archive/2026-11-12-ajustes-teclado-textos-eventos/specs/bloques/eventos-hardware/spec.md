# Spec Delta

## ADDED Requirements

### Requirement: Sombrero de botón al soltar
La categoría Eventos SHALL incluir `cuando se suelta botón en pin [p]`. Su script SHALL correr una vez cada vez que el botón, conectado entre el pin y GND, pasa de presionado a suelto, con el mismo antirrebote del sombrero de presionar.

#### Scenario: Presionar y soltar con dos programas
- **WHEN** un programa enciende un LED con `cuando se presiona botón en pin 2` y otro lo apaga con `cuando se suelta botón en pin 2`
- **THEN** el LED queda encendido mientras el botón está presionado y se apaga al soltarlo

#### Scenario: Mantener presionado
- **WHEN** el botón se presiona y se mantiene presionado
- **THEN** el script de `cuando se suelta` no corre hasta que se suelta

## MODIFIED Requirements

### Requirement: Sombreros de puerto serie y de control remoto
La categoría Eventos SHALL incluir, además de los sombreros de botón, `cuando llega un dato por el puerto serie` (ver `bloques/puerto-serie`) y `cuando llega la tecla [tecla] del control (receptor en pin [p])` (ver `bloques/infrarrojo`). Un programa con cualquiera de ellos SHALL generarse con corrutinas y contar para el tope de scripts.

#### Scenario: Paleta de eventos
- **WHEN** el usuario abre la categoría Eventos
- **THEN** encuentra `al iniciar`, los sombreros de botón al presionar y al soltar, el de puerto serie y el de tecla del control, este con la tecla OK y el pin 10

#### Scenario: Un solo sombrero de tecla
- **WHEN** el programa tiene un único script y su sombrero es `cuando llega la tecla OK del control`
- **THEN** el sketch se genera con corrutinas
