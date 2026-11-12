# Spec Delta

## MODIFIED Requirements

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
