# Design

## Contexto

Velxio guarda la selección como estado local de `SimulatorCanvas`
(`selectedComponentId`, `selectedWireId`, `selectedBoardId`). La ficha, la
barra de acciones y las teclas leen `selectedComponentId`. Mover deja que el
arrastre cambie `x`/`y` en vivo y registra un `recordMove`; girar, borrar y
pegar pasan por `recordRotate`, `recordRemoveComponent` y `pasteClipboard`.
`pushCommand` acepta un comando con `execute`/`undo`, así que un grupo puede ser
un solo paso de deshacer.

## Decisiones

- **El grupo vive en un store propio** (`bloquino/seleccion.ts`, zustand):
  `ids` de los componentes seleccionados. `selectedComponentId` de Velxio sigue
  siendo la pieza «principal» (la última sumada): la ficha y la barra la siguen
  usando sin cambios. Con un solo componente todo se comporta como hoy.
- **Clic**: sin tecla, deja solo esa pieza (como hoy). Con Shift la suma o la
  quita, como en Tinkercad. Un clic en el fondo o en un cable vacía el grupo: un
  cable sigue siendo una selección aparte (el lienzo nunca tiene cable y
  componentes a la vez).
- **La placa** entra en el grupo como en Tinkercad (su id va en el mismo
  store; en Velxio la placa no es un componente) y se mueve y gira con él: su
  centro gira en torno al del grupo y la placa suma 90° (`rotateBoard`). Sola,
  se gira con R, con el botón de su barra y desde su ficha (alumno.css deja a
  la vista solo «Rotar»). Supr y Ctrl+C la saltan: el proyecto tiene una sola
  placa (copiar y borrar placas es del change `varias-placas`).
- **Mover**: al arrastrar una pieza del grupo, el mismo desplazamiento se aplica
  a las demás, y a los puntos de quiebre de los cables cuyos dos extremos están
  en el grupo. Una pieza asentada en una protoboard del grupo no se desplaza
  dos veces: la lleva la protoboard (`updateComponent` ya lo hace).
- **Girar (R)**: 90° (el paso de Bloquino) en torno al centro de la caja del
  grupo; cada pieza suma 90° y su centro gira en torno a ese punto. Se
  reutiliza la cuenta de `giroProtoboard.ts`, generalizada a un centro dado.
  Una protoboard del grupo lleva lo suyo como ya hace al girar sola; para eso
  primero se mueve y después gira (con las dos cosas en un solo
  `updateComponent`, lo asentado se reasentaba corrido pero sin girar y perdía
  el asiento).
- **Borrar, copiar y pegar**: Supr borra el grupo en un comando. Ctrl+C guarda
  las piezas y los cables internos; Ctrl+V los pega corridos 20 px, con ids
  nuevos, y deja la copia seleccionada. El portapapeles de Velxio
  (`canvasClipboard`) se mantiene para una sola pieza.
- **Ctrl+A**: todas las piezas, la placa incluida; los cables no.
- **Shift + mouse** se atiende en la fase de captura del lienzo, antes que
  piezas, placa y agujeros (los agujeros de la protoboard tienen su propio
  mousedown). Si el mouse se arrastra, es un rectángulo (agregado de Bloquino,
  Tinkercad Circuits no lo tiene) y al soltar suma las piezas cuya caja queda
  entera dentro, la placa incluida; si no se mueve, es Shift + clic sobre lo que
  esté debajo. Así el rectángulo puede empezar sobre la protoboard. Arrastrar
  sin tecla sigue moviendo la vista.
- **Deshacer**: cada acción guarda una foto de piezas, cables y posición y giro
  de las placas antes y después, y registra un solo comando.
- **Marcas**: cada pieza del grupo lleva el mismo contorno que hoy marca la
  selección de una.
- **Durante la simulación** el grupo no se edita (igual que hoy una pieza).
- **Solo en la página de alumno**: el editor de Velxio (`/editor?profe`) no
  cambia.

## Riesgos

- `SimulatorCanvas.tsx` es grande y de Velxio: los cambios se limitan a llamar
  al módulo propio desde los puntos de clic, arrastre y teclas.
- Un grupo con una protoboard y piezas asentadas en ella: hay que excluir a los
  jinetes del desplazamiento propio para no moverlos dos veces.

## Fuera

- Duplicar con Ctrl+D o con Alt + arrastrar (Ctrl+D no hace nada en Tinkercad
  Circuits; Alt + arrastrar no se probó).
- Agrupar de forma permanente (Ctrl+G del editor 3D).
