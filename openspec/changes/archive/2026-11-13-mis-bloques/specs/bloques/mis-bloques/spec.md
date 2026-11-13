## Purpose

Que el alumno resuma en un bloque propio un grupo de bloques que repite, como «Mis bloques» de Scratch, con entradas para darle valores distintos en cada uso.

## ADDED Requirements

### Requirement: Categoría Mis bloques
La paleta SHALL tener la categoría «Mis bloques», rosada como en Scratch, después de Variables y antes de Avanzado. La categoría SHALL ofrecer el botón «Crear un bloque» y, debajo, un bloque por cada bloque propio del programa de la placa, listo para usar.

#### Scenario: Categoría vacía
- **WHEN** el alumno abre Mis bloques en un programa sin bloques propios
- **THEN** ve solo el botón «Crear un bloque»

#### Scenario: Con dos bloques propios
- **WHEN** el programa tiene los bloques propios `parpadear` y `color`
- **THEN** la categoría muestra el botón y los bloques `parpadear` y `color`

### Requirement: Crear un bloque
El botón «Crear un bloque» SHALL abrir un diálogo con el nombre del bloque, una vista previa y botones para agregar una entrada de número, una de texto, una de sí/no y un rótulo, en el orden en que se agregan. Cada entrada y rótulo SHALL poder renombrarse y quitarse. Al aceptar, SHALL aparecer en el área de trabajo, a la vista, el sombrero «definir» con el bloque.

#### Scenario: Bloque con tres entradas
- **WHEN** el alumno crea `color` con entradas de número `r`, `g` y `b`
- **THEN** aparece «definir color (r) (g) (b)» en el área de trabajo y el bloque `color ( ) ( ) ( )` en Mis bloques

#### Scenario: Rótulo entre entradas
- **WHEN** el alumno crea `parpadear` con una entrada de número `veces` y el rótulo `veces`
- **THEN** el bloque se lee «parpadear ( ) veces»

#### Scenario: Cancelar
- **WHEN** el alumno cancela el diálogo
- **THEN** no se crea nada

### Requirement: Nombres válidos y sin repetir
El diálogo SHALL exigir un nombre que no esté vacío y que no use ya otro bloque propio del programa, y SHALL exigir que las entradas de un bloque tengan nombres distintos entre sí. Mientras no se cumpla, SHALL decir por qué y no dejar aceptar.

#### Scenario: Nombre repetido
- **WHEN** el programa ya tiene el bloque `parpadear` y el alumno intenta crear otro `parpadear`
- **THEN** el diálogo avisa que ya existe un bloque con ese nombre y no lo crea

### Requirement: Usar las entradas en la definición
Cada entrada SHALL verse en el sombrero «definir» como un bloque de valor con su nombre: redondo las de número y texto, con puntas las de sí/no. Arrastrarla desde el sombrero SHALL dejar una copia lista para encajar en los bloques de la definición. Dentro de la definición, la copia SHALL valer lo que se le dio al bloque en ese uso; fuera de ella SHALL valer 0, texto vacío o falso, como en Scratch.

#### Scenario: Usar una entrada
- **WHEN** el alumno arrastra `r` desde «definir color (r) (g) (b)» al hueco de `fijar pin 9 en [ ]` dentro de la definición, y usa `color (255) (0) (0)`
- **THEN** el pin 9 queda en 255

#### Scenario: Entrada fuera de su definición
- **WHEN** el alumno lleva una copia de `r` a un bloque de un programa `al iniciar`
- **THEN** en ese lugar vale 0

### Requirement: Usar un bloque propio
Un bloque propio SHALL encajar donde encaja cualquier instrucción y SHALL hacer lo que cuelga de su definición, con los valores puestos en sus entradas en ese uso. Sin bloques debajo de su definición, no SHALL hacer nada. Un bloque propio suelto, sin sombrero, SHALL verse atenuado como cualquier otro bloque suelto.

#### Scenario: Parpadear tres veces
- **WHEN** «definir parpadear (veces)» tiene `repetir (veces) veces` [ encender LED 13, esperar 0.2, apagar LED 13, esperar 0.2 ] y el programa usa `parpadear (3)`
- **THEN** la luz «L» parpadea tres veces

#### Scenario: Definición vacía
- **WHEN** el programa usa un bloque propio cuya definición no tiene bloques debajo
- **THEN** el programa compila y ese uso no hace nada

### Requirement: Editar un bloque propio
El menú de clic derecho de la definición y de cada uso SHALL ofrecer «Editar», que abre el diálogo con el bloque como está. Al aceptar, el sombrero y todos los usos SHALL cambiar. Las entradas que se mantienen SHALL conservar lo encajado en cada uso y sus copias en la definición; las copias de una entrada quitada SHALL quedar valiendo como fuera de su definición. Editar SHALL poder deshacerse con Ctrl+Z.

#### Scenario: Agregar una entrada
- **WHEN** el programa usa `parpadear (3)` y el alumno edita `parpadear` para agregar una entrada de número `espera`
- **THEN** el uso pasa a `parpadear (3) ( )`, con el 3 en su lugar

#### Scenario: Renombrar una entrada
- **WHEN** el alumno renombra la entrada `veces` a `cuantas`
- **THEN** el sombrero y las copias de la entrada dentro de la definición dicen `cuantas`

### Requirement: Borrar un bloque propio
Una definición SHALL poder borrarse solo si el programa no usa su bloque. Si se intenta borrar una definición con usos, SHALL aparecer un aviso que diga que primero hay que quitar sus usos, y la definición SHALL quedar. Al borrar la definición, su bloque SHALL desaparecer de la categoría.

#### Scenario: Definición en uso
- **WHEN** el programa usa `parpadear (3)` y el alumno arrastra «definir parpadear» a la papelera
- **THEN** ve el aviso y la definición vuelve a su lugar

#### Scenario: Definición sin usos
- **WHEN** ningún programa usa `parpadear` y el alumno borra su definición
- **THEN** la definición se borra y `parpadear` ya no está en Mis bloques

### Requirement: Un bloque no se usa dentro de sí mismo
Un uso de un bloque propio dentro de su propia definición, directa o indirectamente a través de otro bloque propio, SHALL quedar atenuado, fuera del código, y con un aviso que lo explique.

#### Scenario: Uso dentro de sí mismo
- **WHEN** el alumno pone `parpadear (2)` dentro de «definir parpadear (veces)»
- **THEN** ese uso se ve atenuado, con un aviso, y el programa compila sin él

### Requirement: Una definición no es un programa
Un sombrero «definir» no SHALL contar como programa: no SHALL correr solo, no SHALL contar para decidir entre el modo clásico y el de corrutinas, ni para el tope de 8 programas.

#### Scenario: Un al iniciar y dos definiciones
- **WHEN** el programa tiene un `al iniciar` y las definiciones de `parpadear` y `color`
- **THEN** el sketch se genera en modo clásico

#### Scenario: Tope de programas
- **WHEN** el área de trabajo tiene 8 sombreros de evento y una definición
- **THEN** «Crear un bloque» sigue disponible y los sombreros de evento de la paleta, deshabilitados

### Requirement: Código de un bloque propio con un solo programa
Cuando el programa se genera en modo clásico, cada bloque propio SHALL generarse como una función de C++ con el nombre del bloque y una entrada por parámetro (`float` las de número, `String` las de texto, `bool` las de sí/no), y cada uso como una llamada a esa función.

#### Scenario: Función color
- **WHEN** el programa es `al iniciar` → `color (255) (0) (0)` y «definir color (r) (g) (b)» fija los pines 9, 10 y 11 en `r`, `g` y `b`
- **THEN** el sketch sigue siendo clásico, contiene `void color(float r, float g, float b)` con los tres `analogWrite` y `setup()` llama a `color(255, 0, 0);`

#### Scenario: Nombre que choca
- **WHEN** el alumno crea un bloque llamado `setup` o `tone`
- **THEN** la función recibe otro nombre válido y el sketch compila

### Requirement: Código de un bloque propio con varios programas
Cuando el programa se genera con corrutinas, cada uso de un bloque propio SHALL generarse en su lugar con lo que hace su definición, marcado con un comentario con el nombre del bloque, de modo que sus esperas cedan el turno. Dos programas que usan el mismo bloque propio a la vez SHALL tener cada uno sus propias entradas y contadores.

#### Scenario: Dos programas con el mismo bloque
- **WHEN** dos `al iniciar` usan en `por siempre` el bloque `parpadear`, uno en el pin 13 con espera 1 s y otro en el pin 12 con espera 0,3 s
- **THEN** cada LED parpadea a su ritmo y ninguno frena al otro

#### Scenario: Repetir dentro de repetir
- **WHEN** un programa usa `parpadear (2)`, cuya definición tiene un `repetir`, dentro de `repetir 3 veces`, con otro programa a la vez
- **THEN** la luz parpadea 6 veces

### Requirement: Los bloques propios se guardan con el proyecto
Las definiciones y los usos SHALL guardarse con el programa de su placa, en el autoguardado y en el archivo `.bloquino`, y SHALL volver iguales al abrir el proyecto. Cada placa SHALL tener sus propios bloques propios; copiar una placa SHALL copiar también los suyos.

#### Scenario: Recargar la página
- **WHEN** el alumno crea `color` con tres entradas, lo usa y recarga la página
- **THEN** la definición, sus usos y el bloque en Mis bloques vuelven iguales
