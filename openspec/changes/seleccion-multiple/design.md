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
- **La placa** entra en el grupo como en Tinkercad (`selectedBoardId` aparte
  del store, porque en Velxio la placa no es un componente) y se mueve con él.
  R, Supr y Ctrl+C la saltan: la placa de Bloquino es fija. Con la placa en el
  grupo, R gira las demás piezas en torno al centro de ellas, sin la placa.
- **Mover**: al arrastrar una pieza del grupo, el mismo desplazamiento se aplica
  a las demás, y a los puntos de quiebre de los cables cuyos dos extremos están
  en el grupo. Una pieza asentada en una protoboard del grupo no se desplaza
  dos veces: la lleva la protoboard (`updateComponent` ya lo hace).
- **Girar (R)**: 90° (el paso de Bloquino) en torno al centro de la caja del
  grupo; cada pieza suma 90° y su centro gira en torno a ese punto. Se
  reutiliza la cuenta de `giroProtoboard.ts`, generalizada a un centro dado.
  Una protoboard del grupo lleva lo suyo como ya hace al girar sola.
- **Borrar, copiar y pegar**: Supr borra el grupo en un comando. Ctrl+C guarda
  las piezas y los cables internos; Ctrl+V los pega corridos 20 px, con ids
  nuevos, y deja la copia seleccionada. El portapapeles de Velxio
  (`canvasClipboard`) se mantiene para una sola pieza.
- **Ctrl+A**: todas las piezas, la placa incluida; los cables no.
- **Rectángulo** (agregado de Bloquino, Tinkercad Circuits no lo tiene): Shift +
  arrastrar en el fondo dibuja un rectángulo (capa propia sobre el lienzo, como
  la de las tiras) y al soltar suma las piezas cuya caja queda entera dentro,
  la placa incluida. Arrastrar sin tecla sigue moviendo la vista.
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
