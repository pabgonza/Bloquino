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
- **THEN** ve el título "Botón", su color para elegir entre nombres en español y las acciones Rotar y Eliminar, y no ve proyectos de ejemplo, un enlace para comprar, la categoría, la ficha técnica ni propiedades internas como `pressed` o `xray`

#### Scenario: Color de un LED
- **WHEN** el alumno abre el inspector de un LED y elige "Verde"
- **THEN** el LED del lienzo pasa a verde

### Requirement: Revisión del circuito en español
Cuando la revisión previa a simular encuentra un problema en el circuito, el aviso SHALL estar en español, explicar el problema sin identificadores internos de componentes y ofrecer volver a arreglarlo o simular igual. La página SHALL NOT presentarlo como un error del programa.

#### Scenario: LED sin resistencia
- **WHEN** el alumno conecta un LED entre el pin 13 y GND sin resistencia e inicia la simulación
- **THEN** aparece "Revisa tu circuito" con un texto que dice que el LED está sin resistencia y que le ponga una de 220 Ω, y no aparece el aviso de que el programa no se pudo compilar
