# Design

## Context

Lo que Velxio ya trae y condiciona el diseño:

- `utils/vlxFile.ts` serializa el proyecto entero (`buildVlxPayload`, `buildVlxBlob`) y valida un archivo (`parseVlxFile`). Los bloques y la marca de modo Texto viajan dentro, porque `bloques.json` es un archivo más del grupo de la placa.
- `useSimulatorStore.loadProjectState()` reemplaza el proyecto en caliente; `BlocksPanel` y `PanelPrograma` ya reaccionan a ese reemplazo.
- `hooks/useAutoSaveProject.ts` ofrece `installAutoSaveImpl()`, pero quien consume ese hook es `EditorPage`, la página del modo profe.
- `EditorPage` vacía el espacio de trabajo al entrar y muestra su diálogo de proyecto nuevo.
- El proyecto inicial del store (UNO + LED del pin 13 + sketch de parpadeo) no tiene `bloques.json` hasta que se abre el panel de bloques.

Decisiones abiertas de proposal.md, tomadas con su recomendación: `localStorage`, un solo proyecto por navegador, exportar `.bloquino` y aceptar también `.vlx`.

## Goals / Non-Goals

**Goals**
- Un módulo propio (`frontend/src/bloquino/proyecto.ts`) con guardar, restaurar, abrir, descargar y descartar; sin editar stores ni archivos de Velxio.
- Que ningún fallo del almacenamiento rompa la página.

**Non-Goals**
- Varios proyectos con nombre, historial, servidor o enlaces para compartir.
- Guardado automático en modo profe (el profe tiene el exportador `.vlx` de Velxio).

## Decisions

### 1. `localStorage`, una clave
El proyecto se guarda como el JSON de `buildVlxPayload()` en la clave `bloquino-proyecto`. Es síncrono, lo que permite guardar al cerrar la página, y un proyecto del curso pesa pocos KB frente a un límite de unos 5 MB. El tamaño real se mide en la verificación.

Alternativa descartada: IndexedDB. Es asíncrono (no garantiza el guardado al cerrar) y agrega código para un problema de tamaño que no existe.

### 2. Solo en la página de alumno, sin `installAutoSaveImpl`
`PaginaAlumno` arranca el guardado en un efecto propio. No se usa el punto de extensión de Velxio que proponía proposal.md: su hook corre en `EditorPage`, así que en modo profe se guardaría sin haber restaurado, y el espacio vacío con que parte el profe pisaría el proyecto del alumno.

### 3. Cuándo se guarda
- Suscripción a los dos stores, filtrada por referencia (`boards`, `components`, `wires`, `fileGroups`): durante la simulación el store cambia muchas veces sin que cambie el proyecto.
- Ante un cambio se compara la foto del proyecto con la última guardada; si difiere, el indicador pasa a "Guardando…" y se programa el guardado 1 segundo después del último cambio.
- `pagehide` guarda de inmediato lo pendiente.
- La foto es el payload sin fecha de exportación, para que dos fotos del mismo proyecto sean iguales.
- Si `setItem` lanza, el indicador pasa a error y la página sigue.

### 4. Restaurar al abrir
Al montar la página de alumno se lee la clave y se abre con la misma función que un archivo (validación de `parseVlxFile` + `loadProjectState`). Cualquier fallo (sin almacenamiento, JSON roto, proyecto inválido) se ignora y queda el proyecto inicial. El guardado automático arranca después de restaurar, así que un proyecto dañado solo se reemplaza cuando el alumno cambia algo.

### 5. El proyecto del alumno siempre tiene `bloques.json`
Tras restaurar, si el grupo de la placa no tiene `bloques.json`, se le agrega el programa de parpadeo (el mismo con que parte `BlocksPanel`, que pasa a exportarse desde `blocks/archivo.ts`). Así todo proyecto guardado o descargado desde la página de alumno trae bloques, y un archivo sin ellos solo puede venir de código escrito a mano.

### 6. Abrir un archivo
- Acepta `.bloquino` y `.vlx`: mismo formato.
- Se rechaza si alguna placa no es Arduino UNO: la página de alumno no tiene cómo mostrar ni programar otra placa.
- A un grupo sin `bloques.json` se le agrega con la marca de modo Texto: sin eso, abrir el panel de bloques regeneraría el sketch y borraría el código escrito a mano.
- Los mensajes de error son propios y en español; los de `parseVlxFile` están en inglés.
- Confirmación con `window.confirm` y errores con `window.alert`, como el aviso de modo Texto de h3.

### 7. Descargar
`buildVlxBlob()` con extensión `.bloquino`. El nombre se pide con `window.prompt`; se recuerda dentro del proyecto (campo `name` del formato) para proponerlo la vez siguiente.

### 8. Proyecto nuevo
Confirmación siempre, borrar la clave y recargar la página. La recarga deja todo en su estado inicial (simulador, historial de deshacer, área de bloques, compilación) sin código que lo reconstruya pieza por pieza. Antes de recargar se cancela el guardado pendiente para que `pagehide` no vuelva a escribir el proyecto descartado.

proposal.md pedía confirmar solo "si hay trabajo sin exportar". Saberlo con certeza no es barato (abrir el panel de bloques ya reescribe archivos del proyecto) y una confirmación de más no le cuesta nada al alumno; lo mismo vale para abrir un archivo.

### 9. Interfaz
En la barra, junto a la marca: Nuevo, Abrir y Descargar, más el indicador de guardado. Los tres botones principales de la derecha no cambian.

## Risks / Trade-offs

- **Un proyecto por navegador**: dos niños en el mismo notebook se pisan. Mitigación: Descargar / Abrir, y la confirmación de Nuevo lo recuerda.
- **Borrar los datos del navegador borra el proyecto**. Mitigación: Descargar.
- **Formato atado a Velxio**: si Velxio cambia `.vlx`, cambia `.bloquino`. Es lo que se busca (compatibilidad), y el formato lleva número de versión.
