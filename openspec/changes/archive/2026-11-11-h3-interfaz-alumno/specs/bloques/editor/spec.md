# Spec Delta

## MODIFIED Requirements

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
