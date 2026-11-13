# Proposal

## Why

Los programas del curso se alargan repitiendo grupos de bloques: la sesión 9
(`rueda_perilla`) usa en C++ las funciones `color(r, g, b)` y `rueda(pos)`, y
su `.bloquino` las tuvo que desarmar en 9 bloques «fijar pin PWM». Pablo
recuerda los bloques rosados de Scratch que resumen varios bloques en uno
(«Mis bloques»), los quiere en Bloquino y pide copiar Scratch, con mBlock
(Scratch para Arduino) para lo que falte. Tinkercad Circuits no los tiene. La
investigación previa está en `docs/investigacion/bloques-propios.md` (carpeta
del proyecto, fuera del repo).

## What Changes

- Categoría nueva **«Mis bloques»**, rosada (`#FF6680`, la de Scratch), entre
  Variables y Avanzado, con el botón **«Crear un bloque»** y un bloque por cada
  bloque creado.
- **Diálogo «Crear un bloque»**, como el de Scratch: nombre del bloque y
  botones para agregar entradas y rótulos, con una vista previa del bloque.
  Entradas de **número**, de **texto** y de **sí/no** (booleana), y
  **rótulos** de texto entre ellas.
- Al aceptar aparece en el área de trabajo el sombrero **«definir»** con el
  bloque y sus entradas; lo que cuelga de él es lo que hace el bloque. Las
  entradas se arrastran desde el sombrero y se usan como valores dentro de la
  definición.
- **Editar**: clic derecho en la definición o en un uso → «Editar» abre el
  mismo diálogo; los cambios llegan a todos los usos.
- **Borrar**: una definición con usos no se borra; se avisa que primero hay
  que quitar sus usos (como Scratch).
- **Código**: con un solo `al iniciar`, cada bloque propio es una función de
  C++ (`void color(float r, float g, float b)`), como en las slides. Con
  varios programas a la vez, cada uso se expande en su lugar para que sus
  esperas cedan el turno.
- Un ejemplo nuevo con bloques propios y un recorrido con mouse real.

Diferencias con Scratch (en `design.md`): entradas de número y de texto
separadas, porque en C++ tienen tipo y Bloquino ya separa las variables de
número y de texto; sin «ejecutar sin actualizar la pantalla», que no tiene
sentido en una placa; un bloque no puede usarse dentro de sí mismo
(recursión), porque con varios programas no se puede generar y en 2 KB de RAM
es frágil.

Fuera: bloques que devuelven un valor (Scratch tampoco los tiene), bloques
compartidos entre proyectos o placas, y cambiar los programas del curso para
usarlos (las slides de la sesión 9 son de `Curso_Arduino` y se deciden
aparte).

## Capabilities

### New Capabilities
- `bloques/mis-bloques`: categoría «Mis bloques», crear, editar, usar y borrar
  bloques propios con entradas y rótulos, y su código en los dos modos de
  generación.

### Modified Capabilities
- `bloques/editor`: «Bloques sin sombrero»: lo que cuelga de un «definir» no
  está suelto.

(Que una definición no cuente como programa para el modo de generación ni
para el tope de 8 queda en `bloques/mis-bloques`, sin cambiar el texto de
`generador-corrutinas` ni de `scripts-paralelos`.)

## Impact

- `frontend/src/blocks/`: catálogo (categoría y bloques de definición, uso y
  entrada), `BlocksPanel.tsx` (paleta dinámica, diálogo, menú «Editar»,
  arrastre que copia la entrada, regla de borrado), generador
  (`generador/index.ts`, `bloques.ts`, `contexto.ts`: funciones en modo
  clásico, expansión en corrutinas, entradas, contadores con prefijo, raíz de
  `lcd`/`display`), textos en `i18n/locales/es/bloques.json`.
- Proyectos: las definiciones se guardan en el JSON de bloques de cada placa;
  `.bloquino` y autosave no cambian.
- Tests del generador (clásico, corrutinas, compilación real), un ejemplo en
  `frontend/public/ejemplos/` (lo exige `bloquino-ejemplos.test.ts`) y un
  guion en `scripts/recorrido/`.
