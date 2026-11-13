# Design

## Contexto

Velxio ya es de varias placas: `boards[]` en `useSimulatorStore`, cada placa
con su grupo de archivos (`activeFileGroupId`), `activeBoardId` decide qué
grupo muestra el editor (`setActiveBoardId` → `setActiveGroup`), `copyBoard` y
`pasteClipboard` copian tipo, ajustes y programa (sin cables), y `removeBoard`
la quita con sus cables. El panel de bloques de Bloquino sigue al grupo
activo. Lo que impide varias placas es Bloquino:

- `PaginaAlumno.tsx` quita cualquier segunda placa.
- `SimulatorCanvas.tsx` (marca `Bloquino: en la página de alumno la placa se
  gira, pero no se copia ni se elimina`) y `alumno.css` esconden copiar y
  eliminar.
- `seleccion.ts` salta la placa al borrar y al copiar un grupo.
- `proyecto.ts` (`abrir`) exige exactamente una placa UNO.
- `flash/cargar.ts` recuerda un solo puerto.

La evaluación previa (`docs/investigacion/varias-placas.md`) recomendaba una
placa por proyecto y dejar esto para cuando el curso lo pida. Pablo lo pidió
como deseable, así que queda escrito y sin fecha.

## Decisiones

- **Como Tinkercad, en todo lo que se pudo probar.** Copiar una placa copia su
  programa; una placa de la paleta llega con el programa inicial; corren todas
  a la vez; un solo monitor serie, el de la placa elegida; se puede cablear
  entre placas; se puede borrar la última.
- **Nombre y selector.** Cada placa lleva un número que no se repite («Placa
  1», «Placa 2»…; el menor libre al agregar o pegar). En Tinkercad la placa
  agregada desde la paleta también se llamó «1» cuando ya había otra «1»: aquí
  no se repite, para que el alumno no programe la equivocada. El selector del
  panel de programa dice «1 (Arduino UNO)». Tinkercad lo muestra siempre; aquí
  aparece con dos o más placas, para que la página de una placa no cambie.
- **Elegir placa.** Hacer clic en una placa la deja elegida en el selector (lo
  que ya hace `setActiveBoardId` de Velxio al cliquear una placa), y elegirla en
  el selector la marca en el lienzo. Bloques, texto, monitor serie y Cargar a
  la placa son los de la placa elegida.
- **Borrar.** Supr, la barra y la ficha borran la placa (sola o en un grupo) con
  confirmación en español: «Vas a borrar una placa y su programa. Si quieres
  conservarlo, cancela y descarga el proyecto. ¿Seguro?». Se va con sus cables.
  Ctrl+Z la devuelve con su programa: en Bloquino deshacer guarda la placa
  entera (el aviso de Tinkercad dice que no, pero en la prueba sí volvió).
- **Sin placas.** Borrar la última deja el lienzo sin placa: el panel de
  programa dice «No hay placas en el circuito: agrega un Arduino UNO desde la
  paleta», Iniciar simulación y Cargar a la placa avisan lo mismo, y el
  autoguardado guarda ese proyecto vacío. Proyecto nuevo sigue empezando con una
  placa.
- **Copiar.** Ctrl+C / Ctrl+V de la placa sola usa `copyBoard` /
  `pasteClipboard` de Velxio. En un grupo, `seleccion.ts` copia también las
  placas con su programa y los cables entre piezas copiadas (incluidos los de
  una placa a otra).
- **Simular.** Iniciar simulación compila y arranca todas las placas. Revisar
  que el «Run» de Velxio (`EditorToolbar.handleRun`) lo haga para todas y no
  solo para la activa; si no, hacerlo desde `PaginaAlumno` con una llamada por
  placa. Detener las detiene todas.
- **Cargar.** Graba la placa elegida. El puerto se recuerda por placa (id de la
  placa → puerto autorizado): la primera carga de cada placa pregunta el
  puerto. Es el mismo flujo de hoy, con la placa elegida como argumento.
- **Archivo.** `.bloquino` ya guarda `boards[]` y `fileGroups` de Velxio. `abrir`
  acepta una o más placas si todas son UNO; un archivo sin placas también abre
  (es un proyecto válido de Tinkercad).
- **Solo UNO.** La paleta ofrece solo «Arduino UNO». Otros tipos llegan con sus
  propios changes, que agregarán su tarjeta a la paleta.

## Riesgos

- Programar la placa equivocada: el número en la placa y en el selector, y la
  placa elegida marcada en el lienzo.
- Rendimiento con varias placas simuladas en un notebook de la sala (cada placa
  es un avr8js más): medir con dos y tres placas.
- La selección múltiple y deshacer: las fotos de `seleccion.ts` deben incluir
  placas completas (con su grupo de archivos) cuando se borran o se pegan.
- Las slides del curso no usan dos placas: no cambian.

## Fuera

- Otras placas (Nano, Mega, ESP32).
- Un programa compartido por varias placas.
- Nombres de placa editables (Tinkercad deja cambiar el nombre en la ficha):
  puede venir después si hace falta.
