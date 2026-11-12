# paquetes Specification

## Purpose

Formato declarativo con que el administrador suma al catálogo los bloques de una librería de Arduino, sin escribir código de la plataforma.

## Requirements

### Requirement: Paquete como archivo de datos
Un paquete de bloques SHALL ser un archivo JSON en `frontend/src/blocks/paquetes/` que declara la librería de Arduino que usa (nombre, versión y origen), la categoría de la paleta, el `#include`, el objeto global, el código de cada vuelta de `loop()`, sus menús y sus bloques (tipo, texto, campos, forma y código). La plataforma SHALL cargar todos los paquetes de esa carpeta sin que haya que registrarlos en otro archivo.

#### Scenario: Paquete nuevo
- **WHEN** el administrador agrega un archivo de paquete válido a la carpeta
- **THEN** sus bloques aparecen al final de la categoría que declara, con su color, y generan código

#### Scenario: Bloque de valor
- **WHEN** un bloque del paquete declara la forma lógica
- **THEN** se puede encajar en una condición y su código se usa como expresión

### Requirement: Plantillas con los campos del bloque
El código de un paquete SHALL escribirse como plantillas donde `{CAMPO}` se reemplaza por el valor elegido en ese campo del bloque y `{CAMPO.dato}` por un dato adicional de la opción elegida en un menú del paquete.

#### Scenario: Pin en el nombre del objeto
- **WHEN** el objeto global del paquete es `BuzzerMusic musica{PIN}({PIN});` y el bloque tiene el pin 8
- **THEN** el sketch declara `BuzzerMusic musica8(8);`

#### Scenario: Dato de una opción
- **WHEN** el código de un bloque es `musica{PIN}.{CANCION.metodo}();` y la opción elegida tiene `metodo` igual a `marioBros`
- **THEN** se genera `musica8.marioBros();`

### Requirement: Aportes del paquete al sketch
Cada bloque de un paquete SHALL aportar al sketch el `#include` y el objeto global del paquete, sin repetirlos. Un bloque que lo declare SHALL aportar además el código de cada vuelta, que el generador pone al principio de `loop()` sin que el alumno lo vea.

#### Scenario: Varios bloques, un objeto
- **WHEN** un programa usa tres bloques del paquete sobre el pin 8
- **THEN** el sketch tiene un solo `#include` y una sola declaración del objeto

#### Scenario: Un objeto por pin
- **WHEN** un programa usa bloques del paquete sobre el pin 8 y sobre el pin 9
- **THEN** el sketch declara un objeto para cada pin

#### Scenario: Programa sin bloques del paquete
- **WHEN** un programa no usa bloques del paquete
- **THEN** el sketch no incluye su librería

### Requirement: Variantes de un bloque según el modo
Un bloque de paquete SHALL poder declarar una variante bloqueante, que se usa en un programa simple en lugar de su código, y una condición que espera después de su código. En un programa con corrutinas esa espera SHALL ceder el turno a los demás scripts.

#### Scenario: Programa simple
- **WHEN** un bloque con variante bloqueante se usa en un programa de un solo script sin bloques de fondo
- **THEN** se genera la variante bloqueante y el sketch no lleva código de cada vuelta

#### Scenario: Programa con corrutinas
- **WHEN** el mismo bloque se usa en un programa de varios scripts
- **THEN** se genera su código normal seguido de una espera cooperativa de su condición

### Requirement: Librería instalada de forma reproducible
La librería de un paquete SHALL instalarse en el backend de compilación con un script del repositorio que fija su versión, y el paquete SHALL declarar el mismo origen y versión.

#### Scenario: Backend recién creado
- **WHEN** el administrador corre el script de instalación en un backend sin librerías
- **THEN** un sketch generado con los bloques del paquete compila
