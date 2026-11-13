# Spec Delta

## MODIFIED Requirements

### Requirement: Botones principales
La página SHALL mostrar arriba a la derecha los botones Código, Iniciar simulación y Cargar a la placa. Iniciar simulación SHALL compilar el programa si cambió y arrancar la simulación, y mientras corre SHALL ofrecer detenerla. Cargar a la placa SHALL estar siempre disponible y, mientras una carga está en curso, SHALL verse deshabilitado.

#### Scenario: Iniciar y detener
- **WHEN** el usuario pulsa Iniciar simulación con el programa de parpadeo
- **THEN** el LED parpadea y el botón pasa a decir Detener simulación

#### Scenario: Error de compilación
- **WHEN** el programa no compila
- **THEN** la simulación no arranca y el usuario ve un mensaje con el error

#### Scenario: Carga en curso
- **WHEN** el usuario pulsa Cargar a la placa y la carga está en curso
- **THEN** el botón se ve deshabilitado hasta que la carga termina o falla
