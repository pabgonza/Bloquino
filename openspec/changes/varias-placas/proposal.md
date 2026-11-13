# Proposal

> **Deseable, etapa posterior.** No bloquea el curso actual. Se aplica después
> de archivar `seleccion-multiple`, cuyo requisito «Una sola placa, fija» este
> change reemplaza.

## Why

Hoy un proyecto de Bloquino tiene exactamente una placa: no se copia ni se
borra, y si aparece una segunda la página la quita. Pablo quiere el modelo de
Tinkercad Circuits, la referencia del curso: un circuito puede tener varias
placas, cada una con su propio programa, que se sube a cada placa real por
separado. Con eso las placas se copian y se borran como cualquier pieza, y se
abren proyectos de dos placas que se hablan (un pin de una a otro, o serie).

Probado en Tinkercad Circuits el 2026-11-13, en un circuito de prueba:

| Acción | Tinkercad Circuits |
| --- | --- |
| Copiar y pegar una placa (Ctrl+C, Ctrl+V) | Aparece otra un poco corrida, con nombre «2» y una **copia del programa** de la original; desde ahí cada una cambia sola |
| Agregar una placa desde la paleta | Llega con el programa de parpadeo inicial y el número siguiente en el selector |
| Panel Código | Arriba a la derecha, «Seleccionar dispositivo»: «1 (Arduino Uno R3)», «2 (Arduino Uno R3)»…; cada placa tiene sus bloques |
| Iniciar simulación | Corren todas las placas a la vez |
| Monitor serie | Uno solo, debajo del código, del dispositivo elegido en el selector |
| Cable de un pin de una placa a otro | Se puede |
| Borrar una placa | Pide confirmar: «Estás a punto de eliminar uno o varios componentes programables de tu diseño. Cualquier código que hayas escrito para esos componentes se perderá definitivamente y no se restaurará mediante la función de deshacer. ¿Seguro que quieres continuar?». Sus cables se van con ella. En la prueba, Ctrl+Z sí la devolvió con su programa |
| Borrar la última placa | Se puede. El panel Código dice «No hay componentes programables en este circuito» y el selector, «Ninguno» |

## What Changes

- El proyecto puede tener una o más placas Arduino UNO (otras placas son otros
  changes: `placa-nano`, `placa-mega`, `placa-esp32`).
- La paleta ofrece «Arduino UNO»: agrega una placa con el programa inicial.
- Las placas se copian (con una copia de su programa) y se borran como las
  demás piezas, sola o en un grupo de `seleccion-multiple`. Borrar placas pide
  confirmar, con un texto que dice que se pierde su programa; Ctrl+Z la
  devuelve con él.
- Se puede borrar la última placa, como en Tinkercad: el panel de programa lo
  dice y la paleta deja agregar otra.
- Cada placa tiene un número que la nombra («Placa 1», «Placa 2»). Con dos o
  más placas, el panel de programa muestra arriba un selector «1 (Arduino
  UNO)», «2 (Arduino UNO)»; los bloques, el texto y el monitor serie son los de
  la placa elegida.
- Iniciar simulación arranca todas las placas; un cable entre dos placas las
  conecta.
- Cargar a la placa graba el programa de la placa elegida en el selector, y
  recuerda el puerto de cada placa por separado.
- El archivo `.bloquino` guarda todas las placas con sus programas; abrir uno
  con una o más placas UNO funciona, y uno con otra placa se sigue rechazando.

## Capabilities

### Modified Capabilities
- `interfaz/modo-alumno`: «Una sola placa, fija» pasa a «Varias placas, cada
  una con su programa»; la paleta ofrece la placa; la selección incluye copiar
  y borrar placas.
- `proyecto/archivo`: archivos con varias placas UNO.
- `carga/web-serial-uno`: la carga es de la placa elegida y el puerto se
  recuerda por placa.

### New Capabilities
- `interfaz/varias-placas`: selector de placa en el panel de programa,
  simulación conjunta, monitor serie por placa, numeración y última placa.

## Impact

- `frontend/src/bloquino/`: `PaginaAlumno.tsx` (ya no quita la segunda placa),
  `PanelPrograma.tsx` (selector), `PaletaComponentes.tsx` (placa en la
  paleta), `proyecto.ts` (`abrir` con varias placas), `seleccion.ts` (copiar y
  borrar placas), `flash/cargar.ts` (puerto por placa), `alumno.css` (botones de
  la placa), textos en `i18n/locales/es/bloquino.json`.
- `SimulatorCanvas.tsx`: las marcas `Bloquino:` que hoy bloquean copiar y
  borrar la placa en la página de alumno.
- Tests de proyecto, selección y carga; un ejemplo de dos placas; recorrido
  `scripts/recorrido/placas.js`; capturas de la guía de la clase si cambian.
