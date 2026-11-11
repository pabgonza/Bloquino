# identidad Specification

## Purpose

Presenta la aplicación como Bloquino, en español, y cumple con la licencia AGPLv3 de Velxio dando crédito y acceso al código fuente.

## Requirements

### Requirement: Nombre e icono propios
La aplicación SHALL presentarse como Bloquino en el título de la página, en el encabezado y en el icono, y SHALL no cargar analítica. La interfaz del alumno SHALL no enlazar a velxio.dev.

#### Scenario: Título de la pestaña
- **WHEN** el usuario abre el editor
- **THEN** el título de la pestaña del navegador contiene "Bloquino" y no "Velxio"

#### Scenario: Sin analítica
- **WHEN** se carga el editor
- **THEN** la página no hace ninguna petición a servicios de analítica

### Requirement: Interfaz en español
La interfaz del alumno SHALL estar en español sin que el usuario elija idioma.

#### Scenario: Navegador en inglés
- **WHEN** el editor se abre en un navegador configurado en inglés
- **THEN** los botones principales, la paleta y el panel de programa aparecen en español

### Requirement: Crédito y código fuente
La interfaz SHALL mostrar de forma visible el texto "Basado en Velxio (AGPLv3)" con un enlace al proyecto original y un enlace al código fuente de Bloquino.

#### Scenario: Enlaces visibles
- **WHEN** el usuario abre el editor en modo alumno
- **THEN** puede llegar con un clic al repositorio de Bloquino y al de Velxio
