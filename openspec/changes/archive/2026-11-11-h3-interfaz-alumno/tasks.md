# Tasks

Entorno: backend en el contenedor Docker del puerto 3080; frontend con `npx vite` desde `frontend/` (http://localhost:5173/editor). Tests: `npx vitest run <archivo>` desde `frontend/`.

## 1. Modo y ruta

- [x] 1.1 `bloquino/modo.ts`: modo alumno por defecto, `?profe` / `?alumno` en la URL, recordado en `localStorage`. Test vitest: los tres escenarios de `specs/interfaz/modo-alumno` (activar, se recuerda, volver) y el caso de `localStorage` bloqueado.
- [x] 1.2 `bloquino/PaginaEditor.tsx` en la ruta del editor: `EditorPage` en modo profe, `PaginaAlumno` en modo alumno. `/` y `/editor` redirigen a `/es/editor` conservando los parámetros. Verificar en el navegador: `/editor?profe` muestra el editor completo de Velxio y `/editor?alumno` la página de alumno, ambos bajo `/es/`.
  - Verificado: `?profe` → `/es/editor?profe` con explorador y aviso de SPICE; `/editor` a secas sigue en profe; `?alumno` vuelve a la página de alumno.

## 2. Página de alumno

- [x] 2.1 `PaginaAlumno`: barra superior con marca, créditos y los tres botones; lienzo al centro con la cabecera de `SimulatorCanvas` oculta; sin diálogos al entrar y con el UNO inicial. Textos en `i18n/locales/es/bloquino.json`. Verificar en el navegador a 1366 × 768.
  - El proyecto inicial trae además el LED con resistencia en el pin 13 que Velxio pone por defecto.
- [x] 2.2 Iniciar / Detener simulación con los comandos de `EditorToolbar` montado fuera de la vista, y aviso de error de compilación. Test vitest (jsdom): al montar la página existe el comando `sim.run`. Verificar en el navegador: el parpadeo arranca y se detiene, y un sketch con error muestra el aviso.
  - El test (`bloquino-comandos.test.ts`) monta el toolbar de Velxio, no la página entera: es quien registra `sim.run` y `sim.stop`.
  - Verificado: el pin 13 cambia cada 100 ms simulados, el botón pasa a Detener simulación y un sketch inválido muestra el error del compilador sin arrancar.
- [x] 2.3 Paleta de componentes con buscador y lista blanca del kit (`bloquino/kit.ts`). Test vitest: el filtro deja solo los componentes del kit y el buscador encuentra "servo" con "serv". Verificar en el navegador: un clic en LED lo agrega al lienzo y se puede cablear.
- [x] 2.4 Ocultar el aviso de SPICE en la página de alumno (clase en la píldora de `ElectricalOverlay` + CSS). Verificar en el navegador en modo alumno (oculto) y profe (visible).

## 3. Panel de programa

- [x] 3.1 Panel con selector Bloques / Bloques + Texto / Texto, divisor arrastrable y monitor serie plegable. Verificar en el navegador: Bloques + Texto muestra `delay(2000);` al cambiar el bloque; el monitor serie muestra lo que envía `decir`.
  - El divisor arrastrable no se probó arrastrando con el mouse; el ancho inicial sí (50 % de la ventana).
- [x] 3.2 Modo Texto: marca `texto` en `bloques.json`, `CodeEditor` editable con la marca, confirmación al volver a Bloques. Test vitest de la marca (poner, quitar, proyecto sin bloques, JSON corrupto) y de que sobrevive al viaje por `.vlx`. Verificar en el navegador los escenarios "editar en modo Texto", "volver descarta" y "cancelar el aviso".

## 4. Identidad

- [x] 4.1 Tema claro por defecto (`index.html`, `lib/theme.ts`). Verificar en el navegador con `localStorage` limpio.
- [x] 4.2 `index.html`, `favicon.svg`, `manifest.webmanifest` y marca de `AppHeader` como Bloquino; sin script de analítica ni metadatos de velxio.dev. Verificar: el título de la pestaña contiene "Bloquino" y la página no pide nada a servicios de analítica.
  - Los PNG e ICO de Velxio siguen en `public/` pero ya no se referencian.
- [x] 4.3 Novedades apagadas por defecto en `backend/app/api/routes/news.py`. Verificar leyendo la función: sin `VELXIO_NEWS` devuelve la lista vacía.
  - El contenedor de desarrollo corre la imagen de Velxio, no este backend: el cambio rige cuando se construya una imagen propia. La página de alumno no monta el anuncio de novedades.
- [x] 4.4 Traducir los textos fijos en inglés que el alumno llega a ver en el lienzo y el monitor serie. Verificar recorriendo la página de alumno en el navegador.
  - Cuatro textos pasados a `t()` con su clave en español: "Wire", las dos ayudas táctiles del lienzo y el título de los baudios. El diálogo de revisión de circuito de Velxio no apareció en el recorrido y no se tradujo.

## 5. Cierre

- [x] 5.1 Recorrido completo en el navegador a 1366 × 768 en modo alumno: abrir, agregar un LED, abrir Código, cambiar un bloque, iniciar y detener la simulación. Enviar captura a Pablo.
  - Sin desplazamiento horizontal; con el panel de programa abierto el lienzo llega al píxel 677 y el UNO termina en el 626. El LED inicial queda tapado por el panel hasta que se mueve el lienzo.
- [x] 5.2 `npx vitest run` completo: sin fallos nuevos respecto de los del entorno Windows; ajustar los tests de Velxio que dependan del tema oscuro o del `index.html` original.
  - 6094 pasan y 15 fallan, los mismos 15 de h1 en los mismos 10 archivos. Ningún test de Velxio dependía del tema ni del `index.html`.
