# Spec Delta

## Purpose

Bloques para escribir y leer por el puerto serie: mostrar valores en el monitor y recibir números y textos escritos por el alumno.

## ADDED Requirements

### Requirement: Categoría Puerto serie
El catálogo SHALL tener la categoría Puerto serie con `decir [valor]`, `decir [valor] sin saltar de línea`, `¿hay datos en el puerto serie?`, `leer número del puerto serie` y `leer texto del puerto serie`. Cualquiera de ellos SHALL agregar `Serial.begin(9600);` a `setup()`.

#### Scenario: Dos valores en una línea
- **WHEN** se usa `decir [Temp: ] sin saltar de línea` seguido de `decir (25)`
- **THEN** se generan `Serial.print("Temp: ");` y `Serial.println(25);` y el monitor muestra `Temp: 25` en una línea

### Requirement: Lectura por líneas
`leer texto` SHALL entregar la línea recibida sin su fin de línea, y `leer número` el número que esa línea representa. Una lectura SHALL consumir la línea completa, de modo que la lectura siguiente no entregue un valor vacío. Si no llega un fin de línea, la lectura SHALL esperar a lo más 50 ms.

#### Scenario: Dos números seguidos
- **WHEN** llegan las líneas `1` y `2.5` y el programa lee un número cada vez que hay datos y dice su doble
- **THEN** el monitor muestra `2.00` y `5.00`, y nada más

#### Scenario: Fin de línea de Windows
- **WHEN** llega `apagar` terminado en retorno de carro y salto de línea
- **THEN** `leer texto` entrega `apagar`

#### Scenario: Sin fin de línea
- **WHEN** llega `7` sin fin de línea
- **THEN** `leer número` entrega 7 después de una espera de a lo más 50 ms

### Requirement: Evento de dato recibido
La categoría Eventos SHALL incluir el sombrero `cuando llega un dato por el puerto serie`. Su script SHALL correr cada vez que hay datos sin leer, y SHALL ceder el turno a los demás scripts entre una ejecución y la siguiente.

#### Scenario: Orden por el puerto serie
- **WHEN** un script con ese sombrero guarda `leer texto` en una variable y enciende el LED del pin 13 si es `encender`, otro script parpadea el LED del pin 12, y por el monitor llega `encender`
- **THEN** el LED del pin 13 se enciende y el parpadeo no se interrumpe

#### Scenario: Script que no lee
- **WHEN** el script del sombrero no lee los datos
- **THEN** se repite sin congelar a los demás scripts
