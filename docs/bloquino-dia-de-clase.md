# Bloquino en la sala

Bloquino corre en el notebook del profesor, dentro de Docker, y los alumnos
entran desde sus equipos por la red de la sala. No hace falta internet durante
la clase. Los comandos son de PowerShell, desde la carpeta `repo/`.

La clase completa, con capturas y vista por el profesor y por el alumno:
[guia-de-la-clase/index.html](guia-de-la-clase/index.html) (abrirla en el
navegador).

## Una vez: construir la imagen

Con internet y Docker Desktop abierto:

```powershell
docker compose -f docker-compose.bloquino.yml up -d --build
```

Deja la imagen `bloquino:sala` y el contenedor `bloquino` andando en los
puertos 80 (HTTP) y 443 (HTTPS). Desde entonces el contenedor arranca solo cada vez que se abre Docker
Desktop.

Si el puerto 80 está ocupado, elegir otro antes de levantar (los alumnos
agregan `:8080` a la dirección):

```powershell
$env:BLOQUINO_PUERTO = 8080
docker compose -f docker-compose.bloquino.yml up -d
```

## Antes de cada clase

1. Conectar el notebook a la red de la sala y abrir Docker Desktop.
2. Levantar Bloquino con la IP de hoy:

   ```powershell
   .\scripts\sala.ps1
   ```

   Detecta la IP del notebook, la pone en el certificado de HTTPS y muestra
   las direcciones. La de los alumnos es `https://` más esa IP, por ejemplo
   `https://192.168.1.20`. Escribirla en la pizarra.
3. Ver que el contenedor está arriba (`STATUS` debe decir `healthy`):

   ```powershell
   docker ps --filter name=bloquino
   ```
4. Probar desde **otro equipo** (un celular en la misma red sirve): abrir la
   dirección, pulsar «Iniciar simulación» y ver que la luz de la placa
   parpadea. Si simula, compila.

## HTTPS y cargar a la placa

El navegador solo deja cargar a la placa desde una dirección `https://` (o
desde `http://localhost`, en el propio notebook). Por `http://` más la IP se
puede simular, pero no cargar: el botón «Cargar a la placa» lo explica y
ofrece la dirección segura.

El certificado lo firma una autoridad que el contenedor crea la primera vez y
conserva aunque se reconstruya la imagen. Los equipos de los alumnos no la
conocen, así que hay dos caminos:

- **Instalar la autoridad, una vez por equipo** (sin avisos después). En el
  equipo del alumno, abrir `http://<IP>/ca.crt`, que descarga
  `bloquino-ca.crt`, y en PowerShell, en la carpeta de descargas:

  ```powershell
  Import-Certificate -FilePath .\bloquino-ca.crt -CertStoreLocation Cert:\CurrentUser\Root
  ```

  Windows pregunta si confiar: Sí. Cerrar y volver a abrir Chrome o Edge. No
  necesita permisos de administrador. Sin PowerShell: doble clic en el
  archivo, «Instalar certificado», «Usuario actual», «Colocar todos los
  certificados en el siguiente almacén» y elegir «Entidades de certificación
  raíz de confianza».
- **Aceptar el aviso del navegador**: al abrir la dirección `https://`,
  «Configuración avanzada» y «Acceder a … (sitio no seguro)». También deja
  cargar; el aviso vuelve cada cierto tiempo.

Los proyectos se guardan por dirección: los alumnos deben entrar desde el
principio por `https://`. Uno que armó su proyecto en `http://` lo descarga y
lo abre en la dirección segura.

Para cargar: conectar el Arduino por USB, pulsar «Cargar a la placa» y, la
primera vez, elegir la placa en la lista del navegador. Funciona en Chrome y
Edge de computador; no en Firefox, Safari ni celulares.

### La placa no aparece en la lista

El clon del kit usa el chip USB CH340. Windows 10 y 11 instalan su driver
solos al conectarlo con internet. Si la lista sale vacía: mirar en el
Administrador de dispositivos, «Puertos (COM y LPT)», que aparezca
«USB-SERIAL CH340». Si aparece como dispositivo desconocido, instalar el
driver `CH341SER` del fabricante (WCH) antes de la clase, con internet.

## Si algo falla

| Qué pasa | Qué hacer |
| --- | --- |
| En el notebook abre (`http://localhost`) y en los otros equipos no | El firewall de Windows bloquea los puertos: abrirlos (abajo). O los equipos están en otra red (wifi de invitados, datos del celular). |
| Abría y dejó de abrir | Cambió la IP del notebook (se reconectó a la red): repetir el paso 2 y dar la dirección nueva. Los proyectos quedan guardados por dirección: un alumno que no descargó su archivo no verá el suyo con la IP nueva; vuelve a aparecer si la IP anterior regresa. |
| La página abre pero «Iniciar simulación» da error en todos los programas | Mirar el estado del contenedor (paso 3) y reiniciarlo: `docker restart bloquino`. |
| Un programa da error y los otros no | Es el programa: el error del compilador sale en la página. |
| La página se ve antigua después de actualizar | Recargar con Ctrl+F5. |
| «La placa está ocupada» al cargar | Otro programa tiene el puerto: el Arduino IDE con su monitor serie, u otra pestaña de Bloquino que ya cargó. Cerrarlo. |
| «La placa no responde» al cargar | Cable USB solo de carga (sin datos) o mal puesto, o no es un UNO. La próxima carga vuelve a preguntar por la placa. |

### Abrir los puertos en el firewall de Windows

Una vez, en PowerShell **como administrador**:

```powershell
New-NetFirewallRule -DisplayName "Bloquino" -Direction Inbound -Protocol TCP -LocalPort 80,443 -Action Allow
```

Para quitarla: `Remove-NetFirewallRule -DisplayName "Bloquino"`. Si la regla
ya existía solo con el puerto 80, quitarla y crearla de nuevo.

## Actualizar

Después de traer cambios del repositorio (bloques nuevos, una librería más en
`scripts/librerias-kit.txt`), con internet:

```powershell
.\scripts\sala.ps1 --build
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

- **El modo profe** (`?profe` al final de la dirección) abre el editor completo
  y compila, pero su gestor de librerías no funciona en esta imagen: hacia la
  red solo sale la compilación. Las librerías se agregan en
  `scripts/librerias-kit.txt` y actualizando.
- **Apagar**: `docker compose -f docker-compose.bloquino.yml down`. La imagen
  y la autoridad del certificado quedan guardadas; volver a levantar no
  descarga nada. (Con `down -v` se borraría la autoridad y habría que
  instalarla otra vez en cada equipo.)
