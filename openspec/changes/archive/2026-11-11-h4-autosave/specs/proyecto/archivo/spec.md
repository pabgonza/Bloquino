# Spec Delta

## Purpose

El alumno puede llevarse su proyecto como un archivo (a otro computador o para entregarlo al profesor), abrir uno que le pasen y empezar de cero.

## ADDED Requirements

### Requirement: Descargar el proyecto
La página de alumno SHALL ofrecer descargar el proyecto como un archivo `.bloquino` con el nombre que el alumno elija. El archivo SHALL contener placa, componentes, cables, bloques, código y modo Texto, en el formato de proyecto de Velxio (`.vlx`).

#### Scenario: Descargar
- **WHEN** el alumno pulsa Descargar y escribe "semaforo"
- **THEN** el navegador descarga `semaforo.bloquino`

#### Scenario: Compatible con Velxio
- **WHEN** ese archivo se abre con el importador de proyectos de Velxio
- **THEN** carga el mismo circuito y el mismo código

### Requirement: Abrir un proyecto
La página de alumno SHALL permitir abrir un archivo `.bloquino` o `.vlx`. Abrirlo SHALL reemplazar el proyecto en curso, previa confirmación, y el proyecto abierto SHALL pasar a ser el que se guarda en el navegador.

#### Scenario: Ida y vuelta
- **WHEN** el alumno descarga su proyecto, crea uno nuevo y abre el archivo descargado
- **THEN** ve el mismo circuito, cables y bloques que tenía al descargar

#### Scenario: Cancelar
- **WHEN** el alumno elige abrir un archivo y cancela la confirmación
- **THEN** su proyecto en curso no cambia

#### Scenario: Proyecto de Velxio sin bloques
- **WHEN** el alumno abre un `.vlx` cuyo programa fue escrito a mano, sin bloques
- **THEN** el proyecto abre en modo Texto con ese código intacto

### Requirement: Archivos que no se pueden abrir
Un archivo que no es un proyecto válido, o que usa una placa distinta de Arduino UNO, SHALL rechazarse con un mensaje en español, y el proyecto en curso SHALL quedar intacto.

#### Scenario: Archivo cualquiera
- **WHEN** el alumno intenta abrir una foto o un archivo de texto
- **THEN** ve un mensaje que dice que no es un proyecto de Bloquino y su proyecto no cambia

#### Scenario: Otra placa
- **WHEN** el alumno intenta abrir un `.vlx` hecho para un ESP32
- **THEN** ve un mensaje que dice que el proyecto no es para Arduino UNO y su proyecto no cambia

### Requirement: Proyecto nuevo
La página de alumno SHALL ofrecer empezar un proyecto nuevo. Antes de borrar el proyecto en curso SHALL pedir confirmación y recordar que se puede descargar. Al aceptar, SHALL quedar el proyecto inicial y SHALL dejar de existir el proyecto guardado anterior.

#### Scenario: Aceptar
- **WHEN** el alumno pulsa Nuevo y acepta la confirmación
- **THEN** ve un Arduino UNO con el programa de parpadeo, y al recargar la página sigue viendo ese proyecto inicial

#### Scenario: Cancelar
- **WHEN** el alumno pulsa Nuevo y cancela la confirmación
- **THEN** su proyecto en curso no cambia
