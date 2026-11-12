# Spec Delta

## MODIFIED Requirements

### Requirement: Operadores y variables
El catálogo SHALL incluir suma, resta, multiplicación, división, comparaciones (`<`, `>`, `=`), `y`, `o`, `no`, `número al azar entre [a] y [b]`, `asignar [x] del rango [a]-[b] al rango [c]-[d]`, `restringir [x] entre [a] y [b]`, y variables numéricas con `definir [v] en [n]`, que sale de la paleta con un número editable, y `cambiar [v] por [n]`. Los tipos de C++ SHALL permanecer ocultos. Los textos se definen en `bloques/texto`.

#### Scenario: Variable con espacios
- **WHEN** el usuario crea la variable `mi cuenta` y la usa
- **THEN** el sketch declara una variable global con un nombre válido en C++ y compila

#### Scenario: Definir con su número
- **WHEN** el usuario saca `definir [v] en` de la paleta
- **THEN** el bloque trae un 0 que se puede editar

### Requirement: Bloques avanzados de pin
El catálogo SHALL incluir, en la categoría Avanzado, `definir pin [p] en [ALTA/BAJA]`, `definir pin [p] en [0-255]`, `leer pin digital [p]`, `leer pin analógico [a]` y `comentario [texto]`. `decir [valor]` SHALL estar en la categoría Puerto serie (ver `bloques/puerto-serie`).

#### Scenario: Correspondencia con el código del curso
- **WHEN** se usa `definir pin 13 en ALTA`
- **THEN** se genera `digitalWrite(13, HIGH);` y `pinMode(13, OUTPUT);` en `setup()`

#### Scenario: Decir
- **WHEN** se usa `decir (distancia en cm ...)`
- **THEN** `setup()` contiene `Serial.begin(9600);` y se genera un `Serial.println` con el valor, que aparece en el monitor serie del simulador

#### Scenario: Comentario
- **WHEN** se usa `comentario "enciende la luz"`
- **THEN** el sketch contiene `// enciende la luz` en esa posición

#### Scenario: Textos con tilde en el monitor
- **WHEN** se usa `decir [¡Función número 1!]`
- **THEN** el monitor serie del simulador muestra el texto con sus tildes
