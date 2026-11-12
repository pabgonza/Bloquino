# ejemplos Specification

## Purpose

Proyectos de ejemplo que acompañan a Bloquino: sirven para probar cada módulo, como documentación y como punto de partida para los alumnos.

## Requirements

### Requirement: Conjunto de ejemplos
El repositorio SHALL traer proyectos de ejemplo en formato `.bloquino`, cada uno con su circuito y su programa de bloques, que se abren con «Abrir». Entre todos SHALL usar cada bloque de la paleta y cada componente del kit.

#### Scenario: Abrir un ejemplo
- **WHEN** el alumno abre un ejemplo y pulsa Iniciar simulación
- **THEN** el circuito aparece completo y encuadrado, y el programa corre sin cambiar nada

#### Scenario: Bloque o componente nuevo
- **WHEN** se agrega un bloque a la paleta o un componente al kit y ningún ejemplo lo usa
- **THEN** el test de los ejemplos falla y dice cuál falta

### Requirement: Ejemplos al día con el generador
El sketch guardado en cada ejemplo SHALL ser exactamente el que generan sus bloques, y SHALL compilar.

#### Scenario: Cambia el generador
- **WHEN** un cambio en el generador altera el código de un bloque
- **THEN** el test señala los ejemplos cuyo sketch quedó distinto

### Requirement: Cables ordenados
En los ejemplos, los cables SHALL NOT cruzarse entre sí, montarse uno sobre otro ni pasar sobre un componente al que no llegan, salvo los cruces que el circuito hace inevitables, que SHALL quedar declarados.

#### Scenario: Circuito con varios componentes
- **WHEN** se abre el ejemplo de la barrera, con sensor de distancia, servo, dos LED y buzzer
- **THEN** sus trece cables se siguen de extremo a extremo sin cruces

#### Scenario: Cruce inevitable
- **WHEN** se abre el ejemplo de la pantalla LCD
- **THEN** hay un solo cruce, el del cable de RW con el de RS

### Requirement: Ejemplos en la sala
La imagen de la sala SHALL servir los ejemplos para que un alumno pueda bajarlos desde su equipo.

#### Scenario: Descargar desde otro equipo
- **WHEN** un alumno abre `http://<IP del notebook>/ejemplos/02-semaforo.bloquino`
- **THEN** su navegador descarga el archivo y puede abrirlo en Bloquino
