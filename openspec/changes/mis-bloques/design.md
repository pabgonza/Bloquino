# Design

## Context

Ver `proposal.md` (Why) y `docs/investigacion/bloques-propios.md` (carpeta del
proyecto), que estudió Blockly 13.4 y el generador.

- El generador (`blocks/generador/index.ts`) arma el sketch desde los
  sombreros de `SOMBREROS` y tiene dos modos: clásico (`setup`/`loop` con
  `delay`) y corrutinas (macros `EMPEZAR`/`ESPERAR`/`CEDER` con
  `case __LINE__`, una instrucción por línea). Lo que no cuelga de un
  sombrero se ignora y `disableOrphans` lo atenúa.
- Los bloques piden contribuciones al contexto (`contexto.ts`): `locales` son
  los `static` del script en curso; `contador()` nombra contadores
  (`ab_repetir` usa `vez`, `vez2`… según cuántos `repetir` lo rodean).
- Variables: de número (`float`, bloques de Blockly redefinidos) y de texto
  (`String`, tipo `texto`); la paleta de Variables la arma `BlocksPanel.tsx`
  con un callback propio.
- `lcd()` y `display()` buscan su bloque «preparar» con
  `SOMBREROS.includes(p.getRootBlock().type)`.
- El tema hereda de Zelos, que ya pinta `procedure_blocks` en `#FF6680`.
- Blockly 13.4 trae `Block.setDragStrategy`, `setDisabledReason` y
  `Blockly.dialog`.

Scratch 3, la referencia: «Crear un bloque» abre un diálogo con vista previa
y botones «Añadir una entrada número o texto», «Añadir una entrada booleana»,
«Añadir una etiqueta» y la casilla «Ejecutar sin actualizar pantalla»; sale el
sombrero «definir» con las entradas como bloques de valor que se arrastran
(copia) a la definición; clic derecho → «Editar»; una entrada fuera de su
definición vale 0; la recursión se permite. mBlock 5 (Scratch para Arduino)
hereda «Mis bloques» igual; no está documentado cómo lo traduce a C, así que
el código sigue las slides del curso (`void color(float r, …)`).

## Goals / Non-Goals

**Goals:**
- Verse y usarse como Scratch: forma, color, diálogo, sombrero «definir»,
  entradas que se arrastran, «Editar».
- C++ legible en modo clásico (la función que enseña la sesión 9) y correcto
  con varios programas (las esperas ceden).

**Non-Goals:**
- Reusar `procedures_*` de Blockly (ver Decisiones).
- Optimizar el tamaño del código expandido en corrutinas.

## Decisiones

### Bloques propios, no los procedimientos de Blockly

Tres tipos nuevos en `blocks/catalogo/misBloques.ts`:

- `ab_definir`: sombrero «definir» (solo conexión hacia abajo), con
  `extraState` `{ id, partes: [{ tipo: 'nombre' | 'rotulo' | 'numero' | 'texto' | 'sino', texto, id }] }`.
  Arma su forma desde `partes`: texto para nombre y rótulos, y para cada
  entrada un hueco con su bloque de entrada (ver abajo).
- `ab_mi_bloque`: instrucción, `extraState` `{ definicion: id }`. Su forma se
  copia de la definición: rótulos y un hueco por entrada (con sombra `0`, `""`
  o sin sombra la de sí/no, como los demás bloques de Bloquino). Los huecos se
  nombran con el `id` de la entrada, así que editar conserva lo encajado.
- `ab_entrada`: valor (`Number`, `String` o `Boolean` según el tipo), con
  `extraState` `{ definicion, entrada }` y el texto de la entrada.

Por qué no `procedures_defnoreturn`/`callnoreturn`: el uso se lee «nombre con:
a, b» (sin rótulos intercalados), los parámetros se editan con el engranaje
(una mini área de trabajo, difícil para 9 a 12 años), cada parámetro se vuelve
una variable del área de trabajo que aparecería en Variables, y no tienen tipo
ni entradas sí/no. Adaptarlos costaría más que tres bloques propios.

### Entradas que se arrastran desde el sombrero

Las entradas del sombrero son bloques `ab_entrada` fijos (no se pueden borrar
ni sacar). Con `setDragStrategy`, arrastrar uno crea una copia suelta en ese
punto y arrastra la copia: igual que Scratch. Primer paso de la
implementación: probar esa estrategia en Blockly 13.4. Si no funciona bien con
el renderer Zelos, el respaldo es listar las entradas de cada bloque en la
paleta de Mis bloques, debajo de su uso (Scratch no lo hace, pero cumple la
spec).

### Diálogo propio, con vista previa de Blockly

Componente React (`blocks/misBloques/Dialogo.tsx`) sobre el panel de bloques:
campo del nombre, una fila por entrada o rótulo (texto editable y botón
quitar), botones «Agregar entrada de número», «de texto», «de sí/no» y
«Agregar rótulo», y una vista previa: un área de trabajo de Blockly de solo
lectura que dibuja el uso tal como quedará. Scratch edita los textos sobre el
mismo bloque; con un formulario es más fácil escribir tildes, ver por qué un
nombre no sirve y probarlo con mouse real. Sin «Ejecutar sin actualizar
pantalla»: una placa no tiene pantalla que refrescar, y en corrutinas
significaría no ceder el turno, que la spec de scripts paralelos prohíbe.

Validación en el diálogo: nombre no vacío, distinto de los otros bloques del
programa (comparado sin tildes ni mayúsculas, que es como queda en C++), y
entradas con nombres distintos entre sí.

### Entradas de número y de texto separadas

Scratch tiene una sola entrada «número o texto»; en C++ el parámetro necesita
tipo. Como Bloquino ya separa las variables de número (`float`) y de texto
(`String`), el diálogo ofrece las dos. Inferir el tipo por el uso daría
sorpresas (un `"3"` que no suma) y obligaría a revisar todas las llamadas.

### Paleta dinámica

Categoría `mis-bloques` con `custom: 'MIS_BLOQUES'` (como `VARIABLE`):
el botón y un `ab_mi_bloque` por definición del área de trabajo, con sus
huecos de número en 0. Va después de Variables y antes de Avanzado.

### Editar y deshacer

Clic derecho en `ab_definir` o `ab_mi_bloque` agrega «Editar»
(`customContextMenu`). Al aceptar, en un grupo de eventos de Blockly: se
cambia el `extraState` de la definición y se rehacen las formas de la
definición, de cada uso y de cada `ab_entrada` de esa definición (por `id` de
entrada). Ctrl+Z en el panel deshace todo el grupo.

### Borrar con usos

Un oyente de eventos: al borrarse un `ab_definir` que todavía tiene usos, se
repone desde el `oldJson` del evento en el mismo grupo y se avisa con
`Blockly.dialog.alert` («Para borrar la definición de un bloque, primero
quita todos sus usos», el texto de Scratch). Marcarla como no borrable no
alcanza: el arrastre a la papelera no avisaría nada.

### Recursión y usos sueltos

Tras cada cambio se arma el grafo definición → bloques propios que usa; un uso
que cierra un ciclo queda con `setDisabledReason(true, 'recursion')` y un
aviso (`setWarningText`). Un uso suelto ya lo atenúa `disableOrphans`. Scratch
permite la recursión; aquí no, porque expandida en corrutinas no termina, y en
2 KB de RAM una función recursiva se queda sin pila sin aviso.

### Generación, modo clásico

- Las definiciones con bloques habilitados se generan como funciones en
  `ctx.funciones`: `void <nombre>(<parámetros>) { … }`, con `float`, `String`
  o `bool`. Su cuerpo se genera en el mismo contexto, así que sus `pinMode`,
  `include` y globales se reúnen como siempre. Si el cuerpo usa un bloque de
  fondo, `ctx.tick` hace regenerar con corrutinas, como hoy.
- Uso: `<nombre>(<arg1>, <arg2>);`; los de texto con la conversión que ya
  usan los bloques de texto, los de sí/no como condición.
- `ab_entrada` dentro de su definición devuelve el nombre del parámetro; fuera,
  `0`, `String("")` o `false`.
- Nombres: el del bloque y los de las entradas pasan por la limpieza de
  `nombreVariable` (sin tildes ni espacios). Si chocan con una palabra de C++,
  una función de Arduino o del sketch (`setup`, `loop`, `tone`, `delay`,
  `programaN`, las auxiliares de los bloques) o con una variable del programa,
  se les agrega `_bloque` (o `_entrada`).

### Generación, modo corrutinas

- Las definiciones no generan nada por sí solas.
- Cada uso se expande en su lugar: comentario `// parpadear (veces = 3)`,
  asignación de las entradas a `static` del script (`parpadear_veces = 3;`,
  en `ctx.locales`) y el cuerpo de la definición generado ahí, con las esperas
  dentro del `switch` de `programaN()`. Las entradas se evalúan una vez, al
  entrar (paso por valor).
- Una pila de expansión en el contexto (`ctx.dentroDe`) dice a `ab_entrada` qué
  `static` le toca y da el prefijo a los contadores: `contador()` antepone
  `parpadear_` (y `a_b_` si un bloque usa otro). Así un `repetir` dentro del
  bloque no pisa al `repetir` que rodea el uso.
- Cada script tiene sus propios `static` (`ctx.locales` se vacía por script):
  dos programas que usan el mismo bloque no se pisan.

### Raíz de lcd y display

`lcd()` y `display()` aceptan como raíz válida un `ab_definir` que tenga al
menos un uso habilitado, además de los sombreros.

## Risks / Trade-offs

- [La estrategia de arrastre de Blockly 13 no se comporta bien con Zelos] →
  probarla primero (tarea 1.1); respaldo: entradas en la paleta.
- [En corrutinas el código no muestra la función que el alumno definió] → el
  comentario con el nombre del bloque delimita cada expansión; el modo avanzado
  ya avisa que ese código es otro.
- [Código más grande en corrutinas por la expansión] → medir con el ejemplo
  nuevo (32 KB de flash, 2 KB de RAM); los `static` son por script, no por uso.
- [Formas que no se actualizan al editar o deshacer] → recorrido con mouse
  real que edita, deshace y recarga.
- [Proyectos con bloques propios abiertos en una versión anterior] → los tipos
  desconocidos no cargan; Bloquino no tiene versiones viejas en uso.

## Ajustes al implementar

- **Arrastre con copia**: funcionó en Zelos (tarea 1.1). La estrategia imita
  la de la paleta de Blockly (`getTargetBlock` crea la copia y la arrastra);
  un `ConnectionChecker` propio impide soltar bloques en los huecos del
  sombrero. No hizo falta el respaldo.
- **Estado de usos y entradas**: `ab_mi_bloque` guarda también las `partes` y
  `ab_entrada` su `tipo` y `texto`, para dibujarse sin depender de que la
  definición se cargue antes.
- **Modo clásico**: solo se generan las funciones de los bloques que se usan
  (la función se arma al generar su primer uso), así una definición sin usar
  no agrega `pinMode` al `setup()`.
- **Borrar con usos**: la definición vuelve a donde estaba antes de arrastrarla
  (se anota su lugar en cada evento sin arrastre en curso).
- **Vista previa del diálogo**: muestra el sombrero «definir» con los nombres
  de las entradas, más claro que el uso con sus huecos en 0.
- **Definición nueva**: aparece bajo los bloques de la izquierda de lo visible
  y el área se desplaza hasta ella.

## Migration Plan

Nada que migrar: los proyectos sin bloques propios no cambian. Reconstruir la
imagen de la sala al cerrar.

## Open Questions

- Si la sesión 9 del curso pasa a usar `color (r) (g) (b)`: se decide en
  `Curso_Arduino`, después de este change.
