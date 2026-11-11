# Spec Delta

## ADDED Requirements

### Requirement: Componentes nuevos a la vista
Un componente agregado desde la paleta SHALL aparecer dentro de la parte visible del lienzo, cualquiera sea el paneo, el zoom o el ancho del panel de programa.

#### Scenario: Con el panel de programa abierto
- **WHEN** el alumno agrega un componente con el panel de programa abierto
- **THEN** el componente aparece en el lienzo, no debajo del panel

### Requirement: Circuito encuadrado al cargar
Al restaurar el proyecto guardado y al abrir un archivo, el lienzo SHALL mostrar el circuito completo centrado.

#### Scenario: Recargar
- **WHEN** el alumno recarga la página con una protoboard y un sensor en su proyecto
- **THEN** la placa, la protoboard y el sensor se ven dentro del lienzo
