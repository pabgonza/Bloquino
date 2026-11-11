# Proposal

## Why

El primer lanzamiento depende del notebook del profesor: Docker corriendo, red local, dominio y certificado para poder cargar a la placa. Sirve en la sala, pero no en la casa de un alumno ni en otra sala sin el profesor. Una aplicación que se instala en cada notebook y trae todo adentro quita esas dependencias: sin Docker, sin red, sin HTTPS y sin internet.

Velxio tiene una aplicación de escritorio, pero es cerrada y de pago (su envoltorio Tauri no está en el repo), así que Bloquino necesita la suya. Es viable porque la página de alumno le pide muy poco al backend: compilar un sketch para el UNO.

## What Changes

- **Aplicación para Windows** (los notebooks del curso son Windows) con instalador: abre la página de alumno de Bloquino en su propia ventana.
- **Compilación local**: la aplicación trae `arduino-cli`, el core `arduino:avr` y las librerías del kit, y responde ella misma a los dos servicios que usa la página (`/api/compile/start` y `/api/compile/status/<id>`). Sin Python y sin Docker.
- **Carga a la placa** sin HTTPS ni dominio: dentro de la aplicación el origen es local, así que la carga de h7 funciona tal cual; como alternativa, cargar con el propio `arduino-cli`.
- **Proyectos**: el guardado automático y los archivos `.bloquino` siguen igual; abrir un `.bloquino` con doble clic.
- **Modo profe** disponible como hoy.

Fuera de este hito: macOS y Linux, actualización automática, firma de código, tienda de aplicaciones.

## Capabilities

### New Capabilities
- `despliegue/app-instalable`: aplicación de escritorio de Bloquino con compilación local.

### Modified Capabilities
- `carga/web-serial-uno`: la carga funciona también dentro de la aplicación, sin HTTPS.

## Impact

- Carpeta nueva (por ejemplo `app/`) con el envoltorio; el frontend se compila igual que para la imagen de la sala.
- Reutiliza la lista de librerías del kit de h9.
- Tamaño estimado del instalador: unos 400 MB (core AVR 254 MB y `arduino-cli` 37 MB medidos; el resto es el envoltorio y el frontend, sin medir).
- Dependencias de desarrollo nuevas (el envoltorio y su empaquetador): requieren permiso antes de instalar.
- Licencia: AGPLv3, con el enlace al código fuente ya visible en la página.

## Decisiones abiertas (para design.md)

1. **Electron frente a Tauri**: Electron lleva el mismo motor que Chrome, donde está probado todo Bloquino, y soporta Web Serial; pesa unos 100 MB más. Tauri usa el WebView2 del sistema y es más liviano, pero hay que verificar Web Serial y exige Rust. Recomendación: Electron.
2. **Quién compila**: un servicio pequeño dentro de la aplicación que llama a `arduino-cli`, frente a empaquetar el backend Python de Velxio. Recomendación: el servicio pequeño; son dos rutas.
3. **Carga a la placa**: Web Serial (el código de h7) frente a `arduino-cli upload`. Recomendación: decidir tras h7; si Web Serial dio problemas con el CH340, usar `arduino-cli`.
4. **Instalador sin firmar**: Windows muestra el aviso de "editor desconocido". Opciones: aceptarlo y documentarlo, o comprar un certificado de firma. Recomendación: aceptarlo en el primer año.
5. **Driver CH340**: incluirlo en el instalador o documentarlo.
6. **Permisos**: instalar sin ser administrador (por usuario), pensando en notebooks de colegio.
