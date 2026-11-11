# Design

## Context

La página del editor de Velxio (`frontend/src/pages/EditorPage.tsx`, unas 870 líneas) arma header, menús, toolbar, explorador, editor, lienzo y paneles inferiores, y dispara dos diálogos al entrar. Piezas que condicionan el diseño:

- Compilar / ejecutar / detener vive dentro de `EditorToolbar` y no es un hook; sí expone los comandos `sim.run` y `sim.stop` en `lib/editorCommands.ts`, que funcionan mientras el toolbar esté montado.
- `SimulatorCanvas` recibe un `headerSlot` donde "portaliza" su cabecera (selector de placa, Serial, Scope, contador, Add). No tiene flags para ocultar piezas.
- El selector de componentes es un modal sin filtro; agregar un componente es `createComponentFromMetadata` + `recordAddComponent` del store.
- El store parte con un Arduino UNO; es `EditorPage` quien lo borra para mostrar el diálogo de proyecto nuevo.
- El idioma sale del prefijo de la URL (`/es/editor`); sin prefijo es inglés.
- El tema por defecto es oscuro y ya existe un tema claro completo.

Decisiones abiertas de proposal.md, resueltas con Pablo: modo Texto como Tinkercad, modo profe con `?profe` en la URL y 1366 × 768 como pantalla mínima.

## Goals / Non-Goals

**Goals**
- Una página de alumno nueva, hecha con componentes propios que montan los de Velxio sin editarlos.
- El modo profe es el editor de Velxio tal cual, para no mantener dos variantes de `EditorPage`.
- Cambios en archivos de Velxio contados y de pocas líneas.

**Non-Goals**
- Traducir el chrome de Velxio que solo ve el profe.
- Arrastrar componentes desde la paleta (se agregan con un clic, como el modal de Velxio).
- Vista para celular.

## Decisions

### 1. Dos páginas, una ruta
`/editor` monta un componente nuevo (`frontend/src/bloquino/PaginaEditor.tsx`) que elige: modo profe → `EditorPage` de Velxio sin cambios; modo alumno → `PaginaAlumno`. Todo lo nuevo vive en `frontend/src/bloquino/`.

Alternativa descartada: agregar condicionales de "modo alumno" dentro de `EditorPage`. Son decenas de puntos en el archivo más grande de la página y cada actualización de Velxio chocaría con ellos.

### 2. Modo alumno / profe
`bloquino/modo.ts` lee la URL al cargar: `?profe` o `?alumno` fijan el modo y lo guardan en `localStorage` (`bloquino-modo`); sin parámetro vale lo guardado, y si no hay nada, alumno. Si el navegador niega `localStorage`, el modo vale solo para esa visita.

### 3. Composición de la página de alumno
- **Barra superior**: marca Bloquino a la izquierda; a la derecha Código, Iniciar / Detener simulación y Cargar a la placa (deshabilitado hasta h7). Los créditos ("Basado en Velxio (AGPLv3)" y "Código fuente") van en la misma barra, junto a la marca.
- **Centro**: `SimulatorCanvas` con su cabecera portalizada a un contenedor oculto: así desaparecen selector de placa, Serial, Scope, contador y Add sin tocar el archivo.
- **Derecha**: la paleta de componentes o, si Código está activo, el panel de programa, con un divisor arrastrable.
- **Simulación**: se monta `EditorToolbar` fuera de la vista (sin `display: none`, para que sus diálogos de posición fija sigan viéndose) y los botones llaman `runEditorCommand('sim.run' | 'sim.stop')`. El estado sale del store (`running` de la placa activa) y del progreso de compilación.
- **Errores de compilación**: un aviso sobre el lienzo con las líneas de tipo `error` de `useCompileLogsStore`.
- No se montan `NewProjectDialog`, `NewsAnnouncer` ni `GitHubStarBanner`, y no se llama `clearWorkspaceForStarter`: el UNO inicial del store queda en el lienzo.
- Se repiten de `EditorPage` los dos efectos que el lienzo necesita: `startSimulation()` (simulación eléctrica) y deshacer / rehacer con el teclado.

### 4. Paleta de componentes
Componente propio que lee `ComponentRegistry` y filtra por una lista blanca (`bloquino/kit.ts`): LED, LED RGB, resistencia, botón, buzzer, servo, potenciómetro, sensor de distancia y las dos protoboard. Los hitos siguientes agregan los suyos a esa lista (DHT11 en h5; LCD, 7 segmentos e infrarrojo en h8). El nombre visible en español sale de `i18n/locales/es/bloquino.json`.

Clic en un componente: `createComponentFromMetadata` en el primer lugar libre junto a la placa (`pickDropSlot`) y `recordAddComponent`, igual que el modal. La miniatura es el propio elemento web a escala, o el SVG de los metadatos cuando existe.

### 5. Panel de programa y modo Texto
Selector Bloques / Bloques + Texto / Texto sobre los componentes existentes: `BlocksPanel` y `CodeEditor`, más `SerialMonitor` plegable abajo.

El modo Texto se guarda en el proyecto como una marca `texto: true` dentro de `bloques.json` (Blockly ignora las claves que no conoce al cargar):
- con la marca, `CodeEditor` deja editar y `BlocksPanel` no se monta, así que nada regenera el sketch;
- volver a un modo con bloques pide confirmación, quita la marca y monta `BlocksPanel`, que regenera el sketch desde los bloques;
- Bloques frente a Bloques + Texto es preferencia de vista, no se guarda.

Alternativa descartada: borrar `bloques.json` al pasar a Texto. Volver a Bloques empezaría de cero.

### 6. Español sin elegir idioma
`/` y `/editor` redirigen a `/es/editor` conservando los parámetros, que es el mecanismo de Velxio para activar un idioma. Los textos propios de la página de alumno salen de `bloquino.json` leído directo, como los de los bloques. Se traducen solo los textos fijos en inglés de Velxio que el alumno llega a ver.

Alternativa descartada: cambiar `DEFAULT_LOCALE` a `es`. El cargador de idiomas inlinea solo el inglés y varias rutas asumen que el idioma por defecto es `en`.

### 7. Tema claro e identidad
- Tema: se cambia el valor por defecto de oscuro a claro (`index.html` y `lib/theme.ts`). El profe puede seguir cambiándolo.
- `index.html`: título, descripción e idioma de Bloquino; se quitan el script de analítica y los metadatos de velxio.dev (Open Graph, JSON-LD, contenido SEO prerenderizado).
- Icono: `public/favicon.svg` propio, referenciado también desde `manifest.webmanifest`.
- Marca en `AppHeader` (lo ve el profe): Bloquino.
- Novedades: `backend/app/api/routes/news.py` pasa a apagado por defecto (`VELXIO_NEWS=on` las enciende).
- Aviso de SPICE: `ElectricalOverlay` gana una clase en su píldora y la página de alumno la oculta por CSS.

### 8. Pantalla de 1366 × 768
Barra superior de 48 px. Paleta de 280 px. Panel de programa al 50 % del ancho, entre 420 px y el 70 %, redimensionable. Con 1366 px quedan unos 677 px de lienzo junto al panel de programa: el UNO, que Velxio centra al abrir (hasta el píxel 626), se ve completo.

## Risks / Trade-offs

- **`EditorToolbar` fuera de la vista**: si Velxio cambia sus comandos, los botones dejan de responder. Mitigación: un test que monta el toolbar y comprueba que `sim.run` y `sim.stop` están registrados.
- **Verificación de circuito de Velxio**: su diálogo puede aparecer antes de simular, con textos en inglés. Se deja activo; protege de cortocircuitos y el profe está en la sala.
- **Proyecto en modo Texto abierto en modo profe**: la pestaña Bloques de Velxio muestra los bloques, pero mientras siga la marca no regeneran el sketch. Para volver a bloques hay que usar el selector de la página de alumno.
- **Tests de Velxio que asumen tema oscuro o el `index.html` original**: se ajustan los que fallen.
- **Sin vista de celular**: bajo 1024 px la página de alumno no se adapta. El curso usa notebooks.
