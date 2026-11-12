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

### Requirement: Menús y avisos del lienzo en español
En la página de alumno, el menú de clic derecho de un cable, la tarjeta de progreso de la compilación y el panel del receptor infrarrojo SHALL estar en español. El menú del cable SHALL NOT ofrecer el osciloscopio, que el alumno no tiene.

#### Scenario: Menú de un cable
- **WHEN** el alumno hace clic derecho en un cable
- **THEN** ve «Agregar una unión aquí», los colores y «Eliminar cable», y no ve la opción del osciloscopio

#### Scenario: Compilación en fila
- **WHEN** varios alumnos compilan a la vez y a uno le toca esperar
- **THEN** su tarjeta dice en español que espera turno y que empieza sola

#### Scenario: Panel del receptor infrarrojo
- **WHEN** el alumno hace clic en el receptor infrarrojo durante la simulación
- **THEN** el panel muestra «Dirección», «Código» y «Enviar»
