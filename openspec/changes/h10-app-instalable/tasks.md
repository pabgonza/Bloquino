# Tasks

Antes de empezar: pruebas del kit terminadas y sus bugs corregidos en la web (proposal.md, «Cuándo empezar»).

Requieren el permiso de Pablo: instalar `electron` y `electron-builder` (1.2), descargar `arduino-cli` para Windows, el core y las librerías (2.1) y descargar el instalador del driver CH340 (6.2).

## 1. Estructura

- [ ] 1.1 Carpeta `app/` con `package.json` propio (versiones fijas de `electron` y `electron-builder`), `.gitignore` para `node_modules/`, `compilador/` y `salida/`. Verificar: `git status` no muestra esas carpetas.
- [ ] 1.2 Instalar las dependencias de `app/` (con permiso). Verificar: `npx electron --version` responde desde `app/`. Anotar el Windows mínimo que pide esa versión.

## 2. Servicio de compilación

- [ ] 2.1 `app/preparar-compilador.mjs`: arma `app/compilador/` con `arduino-cli` para Windows, el core y las librerías de `scripts/librerias-kit.txt`, leyendo las versiones de `Dockerfile.bloquino`. Verificar: `arduino-cli lib list` con esas carpetas muestra las seis librerías en las versiones de la lista; anotar el tamaño.
- [ ] 2.2 `app/servicio.mjs`: página estática con respaldo a `index.html`, las dos rutas de compilación, una compilación a la vez, solo `127.0.0.1`, rechazo por `Host`/`Origin`, 404 para el resto de `/api/`. Tests con `node --test`: compila el parpadeo, rechaza otra placa y un nombre de archivo con `..`, rechaza un `Origin` ajeno. Verificar: los tests pasan.
- [ ] 2.3 Tests de integración de bloques contra el servicio (`RUN_BLOQUES_COMPILE=1 BLOQUES_BACKEND_URL=http://127.0.0.1:<puerto>`) y guion que compara con la sala los programas de los ejemplos y uno con error. Verificar: pasan los mismos tests que contra la sala; anotar diferencias de mensajes y si el `.hex` coincide. Si el alumno vería un error distinto, replicar la anotación del backend.
- [ ] 2.4 Rutas con tilde y espacio: correr el servicio con el compilador, la caché y la carpeta temporal bajo `…\José Pérez\`. Verificar: compila un programa con servo y DHT11. Si falla, aplicar la salida prevista en design.md (rutas cortas o `C:\Bloquino`) y repetir.
- [ ] 2.5 Medir en Windows: primera compilación (core sin compilar), segunda, y un programa con librerías. Verificar: tiempos anotados aquí; si la habitual pasa de unos segundos, conservar la carpeta de compilación y volver a medir.
- [ ] 2.6 Recorrido de Bloquino desde Chrome contra el servicio sirviendo `frontend/dist`. Verificar: pasan las sesiones 2 a 10 igual que contra la sala.

## 3. Ventana

- [ ] 3.1 `app/principal.mjs`: arranca el servicio, abre la ventana en su origen, instancia única, enlaces externos al navegador del equipo, aviso claro si el puerto está ocupado, compilación de calentamiento en el primer arranque. Verificar con el guion de la aplicación: abre la página de alumno, simula el parpadeo con la red desconectada y un segundo arranque no abre otra ventana.
- [ ] 3.2 Guardado: cerrar y reabrir conserva el proyecto; Guardar abre «Guardar como». Verificar con el guion (el diálogo se responde desde el proceso principal).
- [ ] 3.3 Menú en español (decisión 7 de design.md) con Modo profe y Modo alumno. Verificar con el guion: Modo profe muestra el editor completo, compila un programa escrito a mano y el modo se recuerda al reabrir.
- [ ] 3.4 Comprobar que nadie de la red llega al servicio: desde otro equipo o desde la IP de la red local del propio notebook. Verificar: la conexión se rechaza.

## 4. Proyectos y carga

- [ ] 4.1 Abrir un `.bloquino` que llega de Windows: `app/puente.cjs`, lectura en `principal.mjs` y entrada en `PaginaAlumno.tsx` por el mismo camino que el botón Abrir. Verificar con el guion: arrancar con un `.bloquino` como argumento abre ese proyecto; con Bloquino ya abierto, también; un archivo dañado muestra el aviso de archivo inválido y conserva el proyecto.
- [ ] 4.2 Puerto serie: permisos solo para el origen propio, elección automática con un puerto, lista con varios, falla `sinPlaca` en `cargar.ts` y su texto en `bloquino.json`. Test de vitest para el mensaje de `sinPlaca`. Verificar con el guion y la placa en COM6: carga sin preguntar y el monitor serie muestra lo que manda la placa; sin placa, el aviso de que no se encontró.
- [ ] 4.3 Dos placas conectadas (COM6 y COM7). Verificar: aparece la lista, se elige una y la carga queda en esa. Si solo hay una placa a mano, anotarlo en «Sin verificar».

## 5. Versión, actualización y publicación

- [ ] 5.1 Versión de la página: `define` en `vite.config.ts` (comentario `Bloquino:`), argumento en `Dockerfile.bloquino`, `sala.ps1` lo pasa, y se muestra junto a Código fuente. Verificar: la sala reconstruida y la página compilada muestran la misma versión; sin la variable dice «desarrollo». Anotar el tamaño del paquete de la página.
- [ ] 5.2 `app/base.json` y su test de huella. Verificar: cambiar una línea de `scripts/librerias-kit.txt` sin subir `base` hace fallar el test con el mensaje que dice qué hacer.
- [ ] 5.3 Página desde `.asar`: la del instalador y las de `%LOCALAPPDATA%\Bloquino\pagina\`, eligiendo la más nueva; Actualizar desde archivo con comprobación de `sha256` y `baseMinima`. Verificar con el guion: un paquete bueno deja la versión nueva a la vista y el proyecto intacto; uno truncado y uno con `baseMinima` mayor avisan y dejan la página anterior.
- [ ] 5.4 Acerca de: versión de la página y del instalador. Verificar con el guion.
- [ ] 5.5 `scripts/publicar.ps1`. Verificar: con el árbol sucio se niega; con el árbol limpio deja imagen, instalador y paquete, y los tres muestran la misma versión.

## 6. Instalador

- [ ] 6.1 Configuración de `electron-builder`: NSIS por usuario, asociación de `.bloquino`, `extraResources`. Verificar: el instalador se construye; anotar tamaño y tiempo de instalación.
- [ ] 6.2 Driver CH340 (con permiso para descargarlo y tras revisar su licencia): paso opcional del instalador y entrada del menú. Verificar: sin marcar el paso, la instalación termina sin pedir administrador; marcándolo, pide elevación. Si la licencia no permite redistribuirlo, quitar el paso y dejar el enlace en la guía.
- [ ] 6.3 Prueba de Pablo en su notebook: instalar, abrir desde el acceso directo, doble clic en un `.bloquino`, cargar a la placa, desinstalar. Verificar: cada paso anotado aquí con su resultado.

## 7. Documentación

- [ ] 7.1 `docs/bloquino-instalar.md`: instalar, aviso de «editor desconocido», driver, actualizar desde archivo, cuándo reinstalar, menú con Alt. Verificar: Pablo la sigue en la tarea 6.3 sin ayuda.
- [ ] 7.2 `README.md` del proyecto, `CLAUDE.md` (cómo publicar, cuándo subir `base`) y `docs/decisiones.md` (agregar al final). Verificar: `scripts/publicar.ps1` corre como dice el README.

## 8. Integración

- [ ] 8.1 Batería completa: `npx vitest run` (mismos fallos de entorno que antes), `node --test` de `app/`, recorrido contra la sala y guion de la aplicación. Verificar: resultados anotados.
- [ ] 8.2 Ciclo de corrección completo: cambiar un texto de un bloque, publicar, actualizar la aplicación instalada desde el paquete. Verificar: la aplicación y la sala muestran el texto nuevo y la misma versión, sin reinstalar.

## Sin verificar

- Notebook de colegio real: sin administrador, con su antivirus y su versión de Windows.
- Cuenta de Windows con tilde de verdad (la tarea 2.4 lo simula con una carpeta).

## Workflow follow-up

- Archivar el change: `node <memoria>/sync-specs.mjs . h10-app-instalable` y `openspec validate --specs --strict`.
- Reconstruir la imagen de la sala al cerrar.
