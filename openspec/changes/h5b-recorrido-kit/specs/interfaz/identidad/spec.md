# Spec Delta

## ADDED Requirements

### Requirement: Lienzo sin contenido ajeno al curso
En la página de alumno, los avisos y paneles del lienzo que el alumno usa al armar y simular SHALL estar en español, y el inspector de un componente SHALL NOT mostrar proyectos de ejemplo de Velxio, marcas comerciales ni enlaces de compra. Los componentes del lienzo SHALL NOT llevar debajo su nombre en inglés.

#### Scenario: Cablear
- **WHEN** el alumno empieza un cable
- **THEN** el aviso dice en español qué hacer y su botón dice "Cancelar"

#### Scenario: Panel del sensor de distancia
- **WHEN** el alumno hace clic en el sensor de distancia durante la simulación
- **THEN** el control se llama "Distancia"

#### Scenario: Inspector de un componente
- **WHEN** el alumno hace clic derecho en un botón del lienzo
- **THEN** ve sus propiedades y las acciones Rotar y Eliminar, y no ve proyectos de ejemplo ni un enlace para comprar
