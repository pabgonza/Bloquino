# Spec Delta

## Purpose

Define la disposición de la página del editor para un niño de 9 a 12 años: lienzo grande al centro, componentes a la derecha y tres botones principales, con Tinkercad Circuits como referencia.

## ADDED Requirements

### Requirement: Lienzo claro con Arduino UNO
La página del editor SHALL mostrar el lienzo del circuito con tema claro ocupando el centro de la pantalla. Un proyecto nuevo SHALL empezar con un Arduino UNO ya puesto en el lienzo.

#### Scenario: Abrir el editor por primera vez
- **WHEN** el usuario abre el editor sin proyecto guardado
- **THEN** ve un Arduino UNO en un lienzo de fondo claro, sin diálogos previos

### Requirement: Paleta de componentes
La página SHALL mostrar a la derecha una paleta con los componentes disponibles, cada uno con miniatura y nombre, y un buscador que filtra por nombre. Elegir un componente de la paleta SHALL agregarlo al lienzo.

#### Scenario: Agregar un LED
- **WHEN** el usuario hace clic en "LED" en la paleta
- **THEN** aparece un LED en el lienzo, listo para cablear

#### Scenario: Buscar
- **WHEN** el usuario escribe "serv" en el buscador
- **THEN** la paleta muestra solo el servo

### Requirement: Botones principales
La página SHALL mostrar arriba a la derecha los botones Código, Iniciar simulación y Cargar a la placa. Iniciar simulación SHALL compilar el programa si cambió y arrancar la simulación, y mientras corre SHALL ofrecer detenerla. Cargar a la placa SHALL verse deshabilitado mientras la carga no esté disponible.

#### Scenario: Iniciar y detener
- **WHEN** el usuario pulsa Iniciar simulación con el programa de parpadeo
- **THEN** el LED parpadea y el botón pasa a decir Detener simulación

#### Scenario: Error de compilación
- **WHEN** el programa no compila
- **THEN** la simulación no arranca y el usuario ve un mensaje con el error

### Requirement: Panel de programa
Al pulsar Código, el panel de programa SHALL abrirse a la derecha en el lugar de la paleta, y al volver a pulsarlo SHALL cerrarse y mostrar la paleta. El panel SHALL ofrecer un selector con los modos Bloques, Bloques + Texto y Texto, y un monitor serie plegable en su parte inferior.

#### Scenario: Abrir y cerrar
- **WHEN** el usuario pulsa Código dos veces
- **THEN** la primera vez ve el panel de programa en lugar de la paleta y la segunda vuelve a ver la paleta

#### Scenario: Monitor serie
- **WHEN** el programa usa `decir` y el usuario despliega el monitor serie durante la simulación
- **THEN** ve los valores que el programa envía

### Requirement: Pantallas de notebook
La distribución SHALL ser utilizable en una pantalla de 1366 × 768 píxeles sin desplazamiento horizontal: lienzo, paleta o panel de programa y botones principales visibles a la vez.

#### Scenario: Notebook de 1366 × 768
- **WHEN** el editor se abre en una ventana de 1366 × 768 con el panel de programa abierto en modo Bloques
- **THEN** se ven completos los tres botones principales, la paleta de bloques y el Arduino UNO del lienzo
