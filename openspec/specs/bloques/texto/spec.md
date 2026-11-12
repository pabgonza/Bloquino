# texto Specification

## Purpose

Textos en los programas de bloques: variables de texto, unión y comparación, para mostrar mensajes en una pantalla y recibir órdenes por el puerto serie.

## Requirements

### Requirement: Variables de texto
La categoría Variables SHALL ofrecer `Crear variable de número...` y `Crear variable de texto...`. Una variable de texto SHALL tener sus bloques `fijar [v] en [texto]` y su bloque de valor, y SHALL generarse como un `String` global que parte vacío. Los bloques de número SHALL ofrecer en su menú solo variables de número y los de texto solo variables de texto. El alumno SHALL NOT ver nombres de tipos de C++.

#### Scenario: Crear y usar
- **WHEN** el usuario crea la variable de texto `saludo`, la fija en `hola` y la usa en `decir`
- **THEN** el sketch declara `String saludo = "";`, asigna `saludo = "hola";` y el monitor serie muestra `hola`

#### Scenario: Menús separados
- **WHEN** existen la variable de número `cuenta` y la de texto `saludo`
- **THEN** el menú de `fijar [ ] en (0)` ofrece `cuenta` y no `saludo`, y el de `fijar [ ] en [hola]` ofrece `saludo` y no `cuenta`

#### Scenario: Un texto no es un número
- **WHEN** el usuario intenta encajar una variable de texto en `esperar [ ] segundos`
- **THEN** el bloque no encaja

### Requirement: Conversión entre número y texto
Donde se espera un texto, un número SHALL convertirse solo: sin decimales si es entero y con dos decimales si no lo es. Un texto guardado en una variable de número SHALL convertirse al número que representa, o a 0 si no representa ninguno.

#### Scenario: Entero
- **WHEN** `cuenta` vale 3 y se usa `unir [Vueltas: ] [cuenta]`
- **THEN** el resultado es `Vueltas: 3`

#### Scenario: Con decimales
- **WHEN** `cuenta` vale 2.5 y se une a un texto
- **THEN** aparece como `2.50`

#### Scenario: Texto a número
- **WHEN** una variable de número se define con un texto que dice `12`
- **THEN** la variable vale 12

### Requirement: Unir y comparar textos
La categoría Operadores SHALL incluir `unir [a] [b]`, que entrega un texto con los dos valores seguidos, y `texto [a] = [b]`, que es verdadero cuando los dos textos son iguales. Sus entradas SHALL aceptar textos y números.

#### Scenario: Unir anidado
- **WHEN** se usa `unir [unir [van ] [cuenta]] [ litros]` con `cuenta` en 2.5
- **THEN** el resultado es `van 2.50 litros`

#### Scenario: Comparar una orden
- **WHEN** la variable de texto `orden` vale `encender` y se evalúa `texto [orden] = [encender]`
- **THEN** es verdadero
