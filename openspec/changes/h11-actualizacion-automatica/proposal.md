# Proposal

> Perfil: solo la propuesta. Specs, diseño y tareas se escriben cuando h10 esté implementada y probada en la sala.

## Why

h10 deja la aplicación actualizable a mano: el profesor lleva el paquete de la página (decenas de MB) en un pendrive y elige «Actualizar desde archivo» en cada notebook. Con un curso de 15 a 20 notebooks, y con alumnos que se la llevan a la casa, esa tarea se olvida o queda a medias, y la sala termina con versiones distintas. Si la aplicación se actualizara sola, una corrección llegaría a todos sin que nadie pase por cada equipo.

## What Changes

- **Buscar versión nueva al arrancar**: la aplicación lee un manifiesto pequeño (versión, `baseMinima`, tamaño, `sha256`) y lo compara con su página. Sin red, sigue con la que tiene y no avisa nada.
- **Dos orígenes, en este orden**: la sala del profesor (`https://<IP>/bloquino-version.json`, servido por la imagen de h9, sin internet) y GitHub Releases de `pabgonza/Bloquino` (casa del alumno).
- **Descarga en segundo plano** del mismo paquete `.asar` de h10, con las mismas comprobaciones (`sha256` y `baseMinima`). Se aplica al reiniciar, nunca en medio de una clase ni con un proyecto sin guardar.
- **Paquete firmado**: el manifiesto lleva una firma que la aplicación verifica con una clave pública que trae el instalador. Un `sha256` dentro del mismo manifiesto no prueba quién lo publicó.
- **Volver atrás**: se guarda la página anterior; si la nueva no arranca, la aplicación vuelve sola a la anterior.
- **Instalador nuevo** (cuando sube `base`): la aplicación avisa y ofrece descargarlo; no lo instala sola.
- **Interruptor**: el profesor puede apagar la búsqueda automática; «Actualizar desde archivo» sigue igual.
- **Publicar**: `publicar.ps1` firma el manifiesto, deja el paquete en la imagen de la sala y lo sube como release.

Fuera de este hito: actualizar el instalador completo de forma automática, canales beta, macOS y Linux.

## Cuándo empezar

Cuando h10 esté en los notebooks y la actualización desde archivo se haya usado al menos una vez en la sala: así se sabe cuánto pesa el paquete real y cuánto tarda en la red del colegio.

## Capabilities

### New Capabilities
- (ninguna)

### Modified Capabilities
- `despliegue/app-instalable`: actualización automática de la página, desde la sala o desde internet.
- `despliegue/imagen-sala`: servir el manifiesto y el paquete de la página.

## Impact

- `app/principal.mjs`: búsqueda, descarga y aplicación al reiniciar; reutiliza la rutina de «Actualizar desde archivo» de h10, que recibe la ruta de un paquete y no sabe de dónde vino.
- `Dockerfile.bloquino` / `sala.ps1`: la imagen sirve `bloquino-version.json` y el paquete.
- `scripts/publicar.ps1`: firma y release en GitHub (requiere un token con permiso de releases).
- Clave de firma: privada fuera del repo, en el equipo que publica; la pública va en el instalador.
- Sin dependencias nuevas si se usa `fetch` y `crypto` de Node (Ed25519). `electron-updater` solo haría falta para el instalador, que queda fuera.

## Decisiones abiertas (para design.md)

1. **Origen preferido**: la sala primero (sin internet, misma versión que la web de esa clase) o GitHub primero. Recomendación: la sala primero.
2. **Cómo encuentra la aplicación la sala**: IP guardada la última vez que el alumno abrió la página web, o un nombre fijo en la red. Depende de cómo quede el certificado de h9.
3. **Cuándo aplicar**: al cerrar la aplicación o al abrirla la vez siguiente. Recomendación: al abrirla, con aviso de una línea.
4. **Firma**: Ed25519 con `crypto` de Node, frente a firmar el instalador con certificado de código (de pago, ya descartado en h10).
5. **Interruptor**: por notebook (menú con Alt) o por sala (el manifiesto de la sala dice «no actualizar»).
6. **Página que no arranca**: qué cuenta como «no arranca» para volver a la anterior (la ventana no carga, o la página no avisa que está lista en N segundos).
