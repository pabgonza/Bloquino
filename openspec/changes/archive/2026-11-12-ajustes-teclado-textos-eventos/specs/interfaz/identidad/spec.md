# Spec Delta

## ADDED Requirements

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
