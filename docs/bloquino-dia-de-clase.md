# Bloquino en la sala

Bloquino corre en el notebook del profesor, dentro de Docker, y los alumnos
entran desde sus equipos por la red de la sala. No hace falta internet durante
la clase. Los comandos son de PowerShell, desde la carpeta `repo/`.

## Una vez: construir la imagen

Con internet y Docker Desktop abierto:

```powershell
docker compose -f docker-compose.bloquino.yml up -d --build
```

Deja la imagen `bloquino:sala` y el contenedor `bloquino` andando en el puerto
80. Desde entonces el contenedor arranca solo cada vez que se abre Docker
Desktop.

Si el puerto 80 está ocupado, elegir otro antes de levantar (los alumnos
agregan `:8080` a la dirección):

```powershell
$env:BLOQUINO_PUERTO = 8080
docker compose -f docker-compose.bloquino.yml up -d
```

## Antes de cada clase

1. Conectar el notebook a la red de la sala y abrir Docker Desktop.
2. Ver que el contenedor está arriba (`STATUS` debe decir `healthy`):

   ```powershell
   docker ps --filter name=bloquino
   ```

   Si no aparece: `docker compose -f docker-compose.bloquino.yml up -d`.
3. Anotar la IP del notebook en esa red:

   ```powershell
   Get-NetIPAddress -AddressFamily IPv4 -PrefixOrigin Dhcp | Select-Object InterfaceAlias, IPAddress
   ```

   La dirección para los alumnos es `http://` más esa IP, por ejemplo
   `http://192.168.1.20`. Escribirla en la pizarra.
4. Probar desde **otro equipo** (un celular en la misma red sirve): abrir la
   dirección, pulsar «Iniciar simulación» y ver que la luz de la placa
   parpadea. Si simula, compila.

## Si algo falla

| Qué pasa | Qué hacer |
| --- | --- |
| En el notebook abre (`http://localhost`) y en los otros equipos no | El firewall de Windows bloquea el puerto: abrirlo (abajo). O los equipos están en otra red (wifi de invitados, datos del celular). |
| Abría y dejó de abrir | Cambió la IP del notebook (se reconectó a la red): repetir el paso 3 y dar la dirección nueva. Los proyectos quedan guardados por dirección: un alumno que no descargó su archivo no verá el suyo con la IP nueva; vuelve a aparecer si la IP anterior regresa. |
| La página abre pero «Iniciar simulación» da error en todos los programas | Mirar el estado del contenedor (paso 2) y reiniciarlo: `docker restart bloquino`. |
| Un programa da error y los otros no | Es el programa: el error del compilador sale en la página. |
| La página se ve antigua después de actualizar | Recargar con Ctrl+F5. |

### Abrir el puerto en el firewall de Windows

Una vez, en PowerShell **como administrador**:

```powershell
New-NetFirewallRule -DisplayName "Bloquino" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
```

Para quitarla: `Remove-NetFirewallRule -DisplayName "Bloquino"`.

## Actualizar

Después de traer cambios del repositorio (bloques nuevos, una librería más en
`scripts/librerias-kit.txt`), con internet:

```powershell
docker compose -f docker-compose.bloquino.yml up -d --build
```

Los proyectos de los alumnos no se pierden: viven en el navegador de cada
equipo, no en el contenedor.

## Medir si el notebook aguanta al curso

Simula a 15 alumnos pulsando «Iniciar simulación» a la vez, cada uno con un
programa distinto:

```powershell
node scripts/prueba-carga.mjs http://localhost 15
```

## Qué queda fuera

- **Cargar a la placa real** desde el navegador necesita HTTPS: llega con h7.
- **El modo profe** (`?profe` al final de la dirección) abre el editor completo
  y compila, pero su gestor de librerías no funciona en esta imagen: hacia la
  red solo sale la compilación. Las librerías se agregan en
  `scripts/librerias-kit.txt` y actualizando.
- **Apagar**: `docker compose -f docker-compose.bloquino.yml down`. La imagen
  queda guardada; volver a levantar no descarga nada.
