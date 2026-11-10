# Spec Delta

## Purpose

Permite que un niño arme su programa encajando bloques, sin escribir código, dentro de la misma página donde arma y simula el circuito.

## ADDED Requirements

### Requirement: Editor de bloques en la página del editor
La página del editor SHALL ofrecer una vista Bloques y una vista Código para el programa de la placa. La vista Bloques SHALL mostrar una paleta de categorías con nombre y color, los bloques de la categoría elegida y un área de trabajo.

#### Scenario: Abrir la vista Bloques
- **WHEN** el usuario elige la vista Bloques con un Arduino UNO en el lienzo
- **THEN** ve las categorías Eventos, Control, Luces, Sonido, Movimiento, Sensores, Operadores, Variables y Avanzado, y puede arrastrar bloques al área de trabajo

#### Scenario: El panel cambia de tamaño
- **WHEN** el usuario arrastra el divisor entre el panel de programa y el lienzo
- **THEN** el área de trabajo de bloques se ajusta al nuevo tamaño sin cortarse

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
Mientras el proyecto tenga un programa de bloques, la vista Código SHALL mostrar el C++ generado sin permitir editarlo.

#### Scenario: Intentar escribir en la vista Código
- **WHEN** el usuario escribe en la vista Código de un proyecto de bloques
- **THEN** el texto no cambia

### Requirement: Bloques sin sombrero
Los bloques que no cuelgan de un bloque de evento SHALL ignorarse al generar y SHALL verse atenuados.

#### Scenario: Bloque suelto
- **WHEN** hay un bloque `encender LED` suelto en el área de trabajo
- **THEN** no aparece en el código generado y se dibuja atenuado
