# Proposal

## Why

En el código abierto de Velxio no hay guardado: el trabajo vive en memoria y se pierde al recargar la página, salvo que se exporte un archivo `.vlx` a mano. En una sala con niños, una recarga accidental o un notebook que se suspende no puede borrar la clase. Bloquino no tiene cuentas ni servidor de proyectos, así que el guardado debe ocurrir en el navegador del alumno.

## What Changes

- **Autosave local**: el proyecto completo (circuito, cables, bloques, código) se guarda solo en el navegador a los pocos segundos de cada cambio y se restaura al volver a abrir la página.
- **Archivo de proyecto**: exportar e importar el proyecto como un archivo (`.bloquino`, con el formato `.vlx` de Velxio más el archivo de bloques) para llevarlo a otro computador o entregarlo al profesor.
- **Nuevo proyecto**: acción que limpia el espacio de trabajo, con confirmación si hay trabajo sin exportar.
- **Aviso de estado**: indicador discreto "Guardado" / "Guardando…".

Fuera de este hito: varios proyectos guardados con nombre, historial de versiones, guardado en servidor, compartir por enlace.

## Capabilities

### New Capabilities
- `proyecto/autosave-local`: guardado y restauración automáticos en el navegador.
- `proyecto/archivo`: exportación e importación del proyecto como archivo, y creación de un proyecto nuevo.

### Modified Capabilities
(ninguna)

## Impact

- Módulo nuevo (por ejemplo `frontend/src/bloquino/autosave.ts`) que se registra en el punto de extensión que Velxio ya ofrece: `installAutoSaveImpl()` de `frontend/src/hooks/useAutoSaveProject.ts`. No requiere editar los stores.
- Reutiliza `buildVlxPayload` / `importVlxFile` de `frontend/src/utils/vlxFile.ts` para serializar.
- Almacenamiento: IndexedDB o `localStorage`. El navegador puede negarlo (modo privado, datos bloqueados): la aplicación debe seguir funcionando y avisar.
- Tests vitest: guardar, recargar el estado y comparar; proyecto corrupto en el almacenamiento no impide abrir la página.

## Decisiones abiertas (para design.md)

1. **IndexedDB frente a `localStorage`**: un proyecto del curso pesa pocos KB; `localStorage` basta y es más simple. Confirmar el tamaño real con un proyecto de la sesión 10.
2. **Un proyecto o varios**: el MVP guarda un solo proyecto "en curso" por navegador. Si dos niños comparten notebook, usan exportar / importar.
3. **Extensión del archivo**: `.bloquino` propio o mantener `.vlx` para seguir siendo compatible con Velxio. Recomendación: aceptar ambos al importar y exportar `.bloquino`.
