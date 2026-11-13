# imagen-sala Specification

## Purpose

Imagen Docker de Bloquino con todo lo del curso y su arranque en el notebook del profesor, para que los alumnos entren por la red de la sala.

## Requirements

### Requirement: Imagen con todo lo del curso
La imagen de Bloquino SHALL traer, ya instalados al construirse, la página compilada, el backend de compilación, `arduino-cli`, el core `arduino:avr` y las librerías del kit, con versiones fijas. No SHALL traer las herramientas de ESP32, RP2040 ni QEMU.

#### Scenario: Contenedor recién creado
- **WHEN** se crea un contenedor nuevo desde la imagen y un alumno simula un programa con servo, DHT11, pantalla LCD, control remoto o una canción
- **THEN** el programa compila sin instalar nada

#### Scenario: Primera compilación de la clase
- **WHEN** el primer alumno pulsa Iniciar simulación en un contenedor recién levantado
- **THEN** la respuesta no espera a que se compile el core de Arduino

#### Scenario: Sala sin internet
- **WHEN** el notebook del profesor no tiene salida a internet
- **THEN** el contenedor arranca, la página carga completa y los programas compilan

### Requirement: Lista única de librerías del kit
Las librerías de Arduino del kit SHALL declararse en un solo archivo de texto del repositorio, una por línea, con nombre y versión; las que no están en el índice de Arduino, con su repositorio y commit. La imagen y el script de instalación SHALL leer esa lista.

#### Scenario: Librería nueva
- **WHEN** el administrador agrega una línea a la lista y reconstruye la imagen
- **THEN** los programas que usan esa librería compilan

#### Scenario: Librería de un paquete de bloques
- **WHEN** un paquete de bloques declara una librería con origen y commit
- **THEN** la lista trae esa librería en ese mismo commit

### Requirement: Arranque con un comando
Bloquino SHALL levantarse en el notebook del profesor con un solo comando de Docker Compose, publicando un puerto del notebook (el 80, salvo que se elija otro), y SHALL volver a levantarse solo cuando Docker arranca.

#### Scenario: Alumno en la red de la sala
- **WHEN** un alumno abre en su navegador la dirección IP del notebook del profesor
- **THEN** ve la página de alumno de Bloquino y puede armar, programar y simular

#### Scenario: Puerto 80 ocupado
- **WHEN** el profesor define otro puerto antes de levantar
- **THEN** Bloquino queda en ese puerto

### Requirement: Solo la compilación sale a la red
De los servicios del backend, la imagen SHALL exponer a la red solo los de compilación y el de estado. Los demás (instalar o desinstalar librerías, grabar placas, proxy de red) SHALL responder que no existen.

#### Scenario: Instalar una librería desde otro equipo
- **WHEN** alguien en la red pide al backend instalar o desinstalar una librería
- **THEN** recibe un error y las librerías de la imagen no cambian

### Requirement: Guía del día de clase
El repositorio SHALL traer una guía para el profesor: levantar Bloquino, conocer la dirección que abren los alumnos, comprobar que compila, y qué hacer si cambia la IP, si el firewall de Windows bloquea el puerto o si hay que actualizar.

#### Scenario: Profesor antes de la clase
- **WHEN** el profesor sigue la guía con el notebook conectado a la red de la sala
- **THEN** obtiene la dirección para los alumnos y comprueba desde otro equipo que la página abre y simula

### Requirement: Un curso compilando a la vez
Con 15 alumnos pulsando Iniciar simulación al mismo tiempo, cada uno con un programa distinto, todos SHALL recibir su resultado en menos de 15 segundos. El repositorio SHALL traer un script que lo mide.

#### Scenario: Quince compilaciones simultáneas
- **WHEN** se corre el script de carga con 15 programas distintos
- **THEN** informa el tiempo de la primera, la del medio y la última, y la última queda bajo 15 segundos

### Requirement: Guía ilustrada de la clase
El repositorio SHALL traer una guía en HTML, que se abre sin internet, con capturas reales de la página: cómo el profesor prepara la clase, cómo se suma cada alumno y cómo transcurre la clase vista por el profesor y por el alumno. Un guion SHALL rehacer las capturas desde la imagen de la sala.

#### Scenario: Profesor nuevo
- **WHEN** un profesor que no conoce Bloquino lee la guía
- **THEN** sabe qué correr en su notebook, qué dirección dar, qué hacer en cada equipo la primera vez y qué hacen él y los alumnos durante la clase

#### Scenario: Cambia la página
- **WHEN** cambia la página del alumno y se corre el guion de capturas contra la sala
- **THEN** las capturas de la guía quedan al día sin editar el HTML
