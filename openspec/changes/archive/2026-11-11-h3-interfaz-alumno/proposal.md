# Proposal

## Why

La interfaz de Velxio está pensada para desarrolladores: tema oscuro, explorador de archivos, 40 placas, osciloscopio, avisos de SPICE, menús en inglés y enlaces a velxio.dev. Un niño de 9 años necesita ver solo su circuito, sus bloques y tres botones. La referencia elegida es Tinkercad Circuits, que los alumnos y el profesor ya conocen.

## What Changes

- **Distribución estilo Tinkercad**:
  - lienzo claro al centro, ocupando casi toda la pantalla;
  - paleta de componentes a la derecha, con buscador y miniaturas grandes con nombre, limitada a los componentes del kit;
  - arriba a la derecha, los botones **Código**, **Iniciar simulación** y **Cargar a la placa** (este último queda deshabilitado hasta h7);
  - al pulsar Código, el panel de programa se abre a la derecha en lugar de la paleta, con selector Bloques / Bloques + Texto / Texto y el monitor serie plegable abajo.
- **Arduino UNO ya puesto** en el lienzo al crear un proyecto.
- **Modo alumno por defecto**: se ocultan el explorador de archivos, el osciloscopio, los avisos de SPICE, los menús File / Account, las placas que no son UNO, las novedades y la galería de ejemplos de Velxio.
- **Modo profe**: un interruptor que muestra todo lo oculto.
- **Español completo** en la interfaz del alumno, sobre el i18n existente (i18next), completando los textos que hoy están fijos en inglés.
- **Identidad de Bloquino**: nombre, título de página, icono y colores propios; se retiran los enlaces y la analítica de velxio.dev.
- **Crédito y código fuente**: enlace visible "Basado en Velxio (AGPLv3)" y enlace al repositorio de Bloquino. La AGPLv3 exige ofrecer el código fuente a quien usa la aplicación por red.

Fuera de este hito: cables curvos y aspecto exacto de los componentes de Tinkercad (se conserva el dibujo de Velxio), vista de esquemático, lista de componentes.

## Capabilities

### New Capabilities
- `interfaz/distribucion`: disposición de lienzo, paleta de componentes, panel de programa y botones principales.
- `interfaz/modo-alumno`: qué se oculta por defecto y cómo el modo profe lo muestra.
- `interfaz/identidad`: nombre, idioma, crédito a Velxio y enlace al código fuente.

### Modified Capabilities
- `bloques/editor`: el editor de bloques pasa del panel izquierdo al panel de programa de la derecha y gana el modo Bloques + Texto.

## Impact

- `frontend/src/pages/EditorPage.tsx` y hojas de estilo: nueva distribución. Es el cambio más invasivo sobre archivos de Velxio; hacerlo con componentes nuevos que envuelvan a los existentes (`SimulatorCanvas`, `SerialMonitor`) en vez de editarlos.
- `frontend/src/components/simulator/BoardPickerModal.tsx` y el selector de componentes: filtro por lista blanca del kit.
- `frontend/src/i18n/locales/es/`: textos faltantes.
- `frontend/index.html`, `public/` (icono, manifest), `backend/app/api/routes/news.py` (`VELXIO_NEWS=off`).
- Tests: los tests de Velxio que dependan del tema o de textos en inglés pueden requerir ajuste.

## Decisiones abiertas (para design.md)

1. **Modo Texto**: al pasar de Bloques a Texto el alumno edita C++; volver a Bloques descarta esos cambios (como Tinkercad, con aviso). Confirmar.
2. **Cómo se activa el modo profe**: interruptor en un menú, parámetro en la URL o contraseña simple. Recomendación: parámetro en la URL (`?profe`), recordado en el navegador.
3. **Tema claro**: Velxio ya tiene un tema claro (`Switch to light theme`); evaluar si basta con activarlo por defecto.
4. **Pantallas chicas**: ancho mínimo soportado para los notebooks de los alumnos.
