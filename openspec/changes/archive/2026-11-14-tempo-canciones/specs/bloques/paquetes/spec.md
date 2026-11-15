## MODIFIED Requirements

### Requirement: Plantillas con los campos del bloque
El código de un paquete SHALL escribirse como plantillas donde `{CAMPO}` se reemplaza por el valor elegido en ese campo del bloque, `{CAMPO.dato}` por un dato adicional de la opción elegida en un menú del paquete y `{A.x*B.y}` por el producto redondeado de esos datos, o por nada si a la opción le falta el dato. Un argumento que queda vacío al final de una llamada SHALL quitarse. El valor por defecto de un campo SHALL valer en la paleta y en los programas guardados sin ese campo.

#### Scenario: Pin en el nombre del objeto
- **WHEN** el objeto global del paquete es `BuzzerMusic musica{PIN}({PIN});` y el bloque tiene el pin 8
- **THEN** el sketch declara `BuzzerMusic musica8(8);`

#### Scenario: Dato de una opción
- **WHEN** el código de un bloque es `musica{PIN}.{CANCION.metodo}();` y la opción elegida tiene `metodo` igual a `marioBros`
- **THEN** se genera `musica8.marioBros();`

#### Scenario: Producto de datos
- **WHEN** el código es `musica{PIN}.{CANCION.metodo}({CANCION.tempo*VELOCIDAD.factor});`, la canción tiene `tempo` 200 y la velocidad `factor` 1.25
- **THEN** se genera `musica8.marioBros(250);`

#### Scenario: Argumento vacío
- **WHEN** el mismo código se usa con una velocidad sin `factor`
- **THEN** se genera `musica8.marioBros();`
