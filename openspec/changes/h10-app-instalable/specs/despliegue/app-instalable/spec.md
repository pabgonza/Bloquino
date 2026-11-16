# Spec Delta

## Purpose

Aplicación de Bloquino para Windows que se instala en cada notebook y trae adentro la página y la compilación, para usarla sin Docker, sin red y sin internet.

## ADDED Requirements

### Requirement: Instalar sin ser administrador
Bloquino SHALL distribuirse como un instalador para Windows que instala para el usuario en curso sin pedir permisos de administrador, deja un acceso directo y se puede desinstalar desde Windows. El instalador no va firmado: la guía SHALL explicar el aviso de «editor desconocido» y cómo continuar.

#### Scenario: Notebook de colegio
- **WHEN** un usuario sin permisos de administrador corre el instalador
- **THEN** Bloquino queda instalado y abre desde su acceso directo

#### Scenario: Desinstalar
- **WHEN** el usuario desinstala Bloquino desde Windows
- **THEN** la aplicación y lo que instaló desaparecen del equipo

### Requirement: Todo adentro
La aplicación SHALL abrir la página de alumno de Bloquino en su propia ventana y SHALL permitir armar, programar, simular y cargar a la placa sin Docker, sin red y sin internet. La página SHALL ser la misma que sirve la imagen de la sala.

#### Scenario: Notebook sin red
- **WHEN** el alumno abre Bloquino con el wifi apagado, arma el parpadeo del pin 13 y pulsa Iniciar simulación
- **THEN** el programa compila y el LED parpadea

#### Scenario: Una sola ventana
- **WHEN** Bloquino ya está abierto y el alumno vuelve a abrirlo desde el acceso directo
- **THEN** pasa al frente la ventana que ya estaba, sin abrir otra

### Requirement: Compilación local
La aplicación SHALL compilar los programas en el propio equipo, con el compilador, el core `arduino:avr` y las librerías del kit que trae el instalador, en las mismas versiones que la imagen de la sala. Las librerías SHALL salir de la lista única del repositorio. Un error de compilación SHALL mostrarse igual que en la web.

#### Scenario: Programas del curso
- **WHEN** el alumno simula un programa con servo, DHT11, pantalla LCD, control remoto o una canción, sin internet
- **THEN** el programa compila sin instalar nada

#### Scenario: Usuario con tilde y espacio
- **WHEN** la cuenta de Windows se llama «José Pérez» y el alumno simula un programa
- **THEN** el programa compila

#### Scenario: Programa con error
- **WHEN** el programa en modo Texto tiene un error de sintaxis y el alumno pulsa Iniciar simulación
- **THEN** ve el mismo error del compilador que vería en la web

### Requirement: La compilación no sale a la red
El servicio de compilación de la aplicación SHALL atender solo al propio equipo. Otro equipo de la red no SHALL poder pedirle nada.

#### Scenario: Pedido desde otro equipo
- **WHEN** otro equipo de la red intenta conectarse al servicio de compilación de un notebook con Bloquino abierto
- **THEN** la conexión se rechaza

### Requirement: El proyecto se conserva
El guardado automático SHALL conservar el proyecto entre un cierre y la siguiente apertura de la aplicación, también después de actualizar la página o reinstalar. Guardar SHALL dejar al alumno elegir dónde queda el archivo `.bloquino`.

#### Scenario: Cerrar y volver
- **WHEN** el alumno arma un circuito, cierra Bloquino y lo abre de nuevo
- **THEN** encuentra su circuito y sus bloques

#### Scenario: Guardar en el pendrive
- **WHEN** el alumno pulsa Guardar
- **THEN** elige la carpeta y el archivo `.bloquino` queda ahí

### Requirement: Abrir un proyecto con doble clic
El instalador SHALL asociar los archivos `.bloquino` a la aplicación. Abrir uno desde Windows SHALL abrir Bloquino con ese proyecto, igual que al abrirlo desde la página; si Bloquino ya está abierto, SHALL abrirlo en la ventana que ya está.

#### Scenario: Doble clic con Bloquino cerrado
- **WHEN** el alumno hace doble clic en `semaforo.bloquino`
- **THEN** Bloquino abre con el circuito y los bloques de ese archivo

#### Scenario: Archivo que no es de Bloquino
- **WHEN** el alumno abre con doble clic un archivo `.bloquino` dañado
- **THEN** Bloquino abre con el proyecto que tenía y muestra el aviso de archivo inválido

### Requirement: Modo profe
La aplicación SHALL dar acceso al modo profe y de vuelta al modo alumno desde su menú, y SHALL recordar el modo entre aperturas, como la web.

#### Scenario: Profesor en su notebook
- **WHEN** el profesor elige Modo profe en el menú de la aplicación
- **THEN** ve el editor completo y compila un programa escrito a mano

### Requirement: Driver de la placa
El instalador SHALL ofrecer, como paso opcional, instalar el driver CH340 de la placa del kit. Ese paso SHALL ser el único que pide permisos de administrador; si se omite o se rechaza, la instalación SHALL terminar bien igual. La guía SHALL decir cómo instalar el driver después.

#### Scenario: Sin administrador
- **WHEN** el usuario no puede dar permisos de administrador durante la instalación
- **THEN** Bloquino queda instalado y simula; la guía indica qué pedirle a quien administra el equipo

### Requirement: Actualizar la página sin reinstalar
La aplicación SHALL poder reemplazar su página por la de un paquete de actualización elegido desde su menú, sin reinstalar y sin internet. El paquete SHALL traer solo la página. Si el paquete está dañado o no es de Bloquino, la aplicación SHALL avisarlo y seguir con la página que tenía.

#### Scenario: Corrección de un bloque
- **WHEN** el profesor elige Actualizar desde archivo y da el paquete de la versión nueva
- **THEN** Bloquino se reabre con la página nueva y el proyecto del alumno sigue ahí

#### Scenario: Paquete dañado
- **WHEN** el archivo elegido está incompleto
- **THEN** la aplicación avisa que el paquete no sirve y sigue con la página anterior

### Requirement: Paquete que pide un instalador más nuevo
Cada paquete de actualización SHALL declarar qué versión mínima del instalador necesita. Si el instalador del equipo es más viejo, por ejemplo porque la página nueva usa una librería que no trae, la aplicación SHALL rechazar el paquete y decir que hay que instalar la versión nueva completa.

#### Scenario: Librería nueva
- **WHEN** el paquete declara una versión mínima del instalador mayor que la instalada
- **THEN** la aplicación no cambia la página y pide instalar la versión completa

### Requirement: Versión a la vista
La página SHALL mostrar su versión, tanto en la web como en la aplicación. La aplicación SHALL mostrar además la versión del instalador.

#### Scenario: Notebook atrasado
- **WHEN** el profesor mira la versión en el notebook de un alumno y en el suyo
- **THEN** sabe si a ese notebook le falta una actualización

### Requirement: Una sola publicación
El repositorio SHALL traer un comando que construye, desde un mismo commit y con una misma versión, la imagen de la sala, el instalador y el paquete de actualización de la página.

#### Scenario: Publicar una corrección
- **WHEN** el administrador corre el comando de publicación después de corregir un bloque
- **THEN** obtiene la imagen, el instalador y el paquete, y los tres muestran la misma versión de la página

### Requirement: Guía de instalación
El repositorio SHALL traer una guía para quien instala: instalar, el aviso de «editor desconocido», el driver de la placa, actualizar la página desde un archivo y cuándo hace falta reinstalar.

#### Scenario: Apoderado en casa
- **WHEN** un adulto que no conoce Bloquino sigue la guía en el notebook de un alumno
- **THEN** deja Bloquino instalado y comprueba que simula y que carga a la placa
