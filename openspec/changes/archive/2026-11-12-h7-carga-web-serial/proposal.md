# Proposal

## Why

Con Tinkercad, pasar del simulador a la placa real exige copiar el código al Arduino IDE, elegir placa y puerto, y subir: demasiados pasos para un niño y una fuente constante de errores en clase. Bloquino debe tener un botón **Cargar a la placa** que envíe al Arduino real exactamente el mismo programa que se acaba de simular.

En el código abierto de Velxio la carga por web es solo un punto de extensión (`frontend/src/lib/proWebFlash.ts`) pensado para ESP32; no existe carga a un UNO.

## What Changes

- **Botón "Cargar a la placa"**: compila (si hace falta), pide al alumno elegir el puerto la primera vez, reinicia la placa y graba el programa por Web Serial con el protocolo del bootloader del UNO (STK500v1 / Optiboot, 115200 baudios). Muestra progreso y un mensaje final claro.
- **Compatibilidad con el clon del kit**: UNO R3 con chip USB **CH340**.
- **Mensajes de error con palabras de niño**: "No encuentro la placa: revisa el cable", "La placa está ocupada: cierra el monitor serie", etc.
- **Monitor serie de la placa real**: tras cargar, el monitor serie puede mostrar lo que envía la placa física (la sesión 8 lo usa).
- **Despliegue con HTTPS**: Web Serial solo funciona en contextos seguros. Se documenta y automatiza cómo servir Bloquino por HTTPS en la red local de la sala.

Fuera de este hito: detección automática del modelo de placa, otras placas, agente local, navegadores sin Web Serial (Firefox, Safari).

## Capabilities

### New Capabilities
- `carga/web-serial-uno`: grabación de un `.hex` en un Arduino UNO desde el navegador.
- `carga/monitor-serie-real`: lectura y escritura del puerto serie de la placa física desde el monitor serie.
- `despliegue/https-local`: servir la aplicación por HTTPS en la red de la sala.

### Modified Capabilities
- `interfaz/distribucion`: el botón Cargar a la placa pasa de deshabilitado a funcional.

## Impact

- Módulo nuevo `frontend/src/bloquino/flash/` con el cliente STK500v1 sobre Web Serial. Se engancha en el punto de extensión de `proWebFlash.ts` o directamente desde el botón nuevo. `@types/w3c-web-serial` ya está en las dependencias de desarrollo.
- Reutiliza `compileBoardForFlash` de `frontend/src/utils/boardCompile.ts` para obtener el `.hex`.
- Despliegue: proxy inverso con certificado (por ejemplo Caddy) delante del contenedor; documentación en `docs/`.
- Tests: tests unitarios del protocolo contra un bootloader simulado; prueba manual con el UNO CH340 real (obligatoria: no hay forma de automatizarla).

## Decisiones abiertas (para design.md)

1. **Implementación del protocolo**: escribirlo (es corto: sincronizar, entrar en modo programación, cargar dirección, programar página, verificar) frente a adaptar una librería existente (`avrgirl-arduino`, `stk500`). Revisar licencia y estado de mantenimiento antes de elegir.
2. **HTTPS en la sala**: la sala tiene internet. Opciones: (a) dominio propio con certificado obtenido por desafío DNS, apuntando a la IP local del notebook del profesor (nada que instalar en los equipos de los alumnos); (b) certificado local con una autoridad instalada en cada equipo; (c) alojar Bloquino en un servidor público. Recomendación: (a).
3. **Driver CH340**: en Windows suele instalarse solo; documentar el caso contrario para la sesión 2.
4. **Verificación tras grabar**: leer de vuelta y comparar alarga la carga; decidir si se hace siempre.
5. **Puerto recordado**: Web Serial permite recordar el puerto autorizado; usarlo para que desde la segunda carga sea un solo clic.
