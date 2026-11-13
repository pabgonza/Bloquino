# editor Specification

## Purpose

Permite que un niño arme su programa encajando bloques, sin escribir código, dentro de la misma página donde arma y simula el circuito.

## Requirements

### Requirement: Editor de bloques en la página del editor
El panel de programa SHALL ofrecer tres modos para el programa de la placa: Bloques, Bloques + Texto y Texto. El modo Bloques SHALL mostrar una paleta de categorías con nombre y color, los bloques de la categoría elegida y un área de trabajo. El modo Bloques + Texto SHALL mostrar además, al lado, el C++ generado.

#### Scenario: Abrir la vista Bloques
- **WHEN** el usuario abre el panel de programa en modo Bloques con un Arduino UNO en el lienzo
- **THEN** ve las categorías Eventos, Control, Luces, Sonido, Movimiento, Sensores, Operadores, Variables y Avanzado, y puede arrastrar bloques al área de trabajo

#### Scenario: El panel cambia de tamaño
- **WHEN** el usuario arrastra el divisor entre el panel de programa y el lienzo
- **THEN** el área de trabajo de bloques se ajusta al nuevo tamaño sin cortarse

#### Scenario: Bloques + Texto
- **WHEN** el usuario elige Bloques + Texto y cambia `esperar 1 segundos` por `esperar 2 segundos`
- **THEN** el texto de al lado pasa a mostrar `delay(2000);`

### Requirement: Textos en español
Todos los textos de los bloques, las categorías y los menús del editor de bloques SHALL estar en español.

#### Scenario: Menú contextual
- **WHEN** el usuario hace clic derecho sobre un bloque
- **THEN** las opciones del menú aparecen en español

### Requirement: El código se regenera con cada cambio
Cada cambio en los bloques SHALL regenerar el sketch de la placa y marcarlo como modificado, de modo que el botón de ejecutar compile el programa actual.

#### Scenario: Cambiar un valor y ejecutar
- **WHEN** el usuario cambia `esperar 1 segundos` por `esperar 0.2 segundos` y pulsa ejecutar
- **THEN** el simulador compila de nuevo y el LED parpadea más rápido

#### Scenario: Placa agregada después de abrir Bloques
- **WHEN** el usuario abre la vista Bloques sin placa y después agrega un Arduino UNO
- **THEN** el sketch de la placa contiene el código generado por los bloques, sin que el usuario tenga que modificar un bloque

### Requirement: Los bloques se guardan con el proyecto
El programa de bloques SHALL guardarse dentro del proyecto y SHALL restaurarse al abrirlo. El archivo de bloques SHALL quedar fuera de la compilación.

#### Scenario: Exportar e importar
- **WHEN** el usuario exporta un proyecto con bloques y lo importa en otro navegador
- **THEN** la vista Bloques muestra los mismos bloques en las mismas posiciones

### Requirement: Código de solo lectura en proyectos de bloques
En los modos Bloques y Bloques + Texto, el C++ generado SHALL mostrarse sin permitir editarlo. En el modo Texto el usuario SHALL poder editar el C++, y los bloques dejan de regenerarlo. Volver de Texto a un modo con bloques SHALL descartar los cambios hechos en Texto, previo aviso y confirmación.

#### Scenario: Intentar escribir en la vista Código
- **WHEN** el usuario escribe en el texto de un proyecto en modo Bloques + Texto
- **THEN** el texto no cambia

#### Scenario: Editar en modo Texto
- **WHEN** el usuario pasa a modo Texto, cambia `delay(1000)` por `delay(100)` e inicia la simulación
- **THEN** el LED parpadea con el nuevo ritmo

#### Scenario: Volver a Bloques descarta el texto
- **WHEN** el usuario editó el código en modo Texto, elige Bloques y confirma el aviso
- **THEN** el código vuelve a ser el que generan los bloques

#### Scenario: Cancelar el aviso
- **WHEN** el usuario editó el código en modo Texto, elige Bloques y cancela el aviso
- **THEN** sigue en modo Texto con su código intacto

#### Scenario: El modo se guarda con el proyecto
- **WHEN** el usuario deja el proyecto en modo Texto, lo exporta y lo vuelve a importar
- **THEN** el proyecto abre en modo Texto con el código editado

### Requirement: Bloques sin sombrero
Los bloques que no cuelgan de un bloque de evento ni de un sombrero «definir» de Mis bloques SHALL ignorarse al generar y SHALL verse atenuados.

#### Scenario: Bloque suelto
- **WHEN** hay un bloque `encender LED` suelto en el área de trabajo
- **THEN** no aparece en el código generado y se dibuja atenuado

#### Scenario: Bloque dentro de una definición
- **WHEN** `encender LED en pin 13` cuelga de «definir parpadear»
- **THEN** se dibuja normal y forma parte de lo que hace `parpadear`
