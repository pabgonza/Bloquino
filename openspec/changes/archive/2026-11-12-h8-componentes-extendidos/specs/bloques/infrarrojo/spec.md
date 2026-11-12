# Spec Delta

## Purpose

Bloques para reaccionar a las teclas del control remoto infrarrojo del kit, y el control mismo como componente del simulador.

## ADDED Requirements

### Requirement: Sombrero de tecla
La categoría Eventos SHALL incluir `cuando llega la tecla [tecla] del control (receptor en pin [p])`. Su menú SHALL ofrecer `cualquiera` y las 17 teclas del control del kit con su nombre en español: 1 a 9, silencio, 0, borrar, función, autoprueba, OK, reinicio y volver. El script SHALL correr una vez por cada pulsación de esa tecla.

#### Scenario: Encender con OK
- **WHEN** el programa tiene `cuando llega la tecla OK` → `encender LED en pin 13` y `cuando llega la tecla borrar` → `apagar LED en pin 13`, y se aprieta OK en el control
- **THEN** el LED del pin 13 se enciende y queda encendido

#### Scenario: Tecla mantenida
- **WHEN** una tecla se mantiene apretada
- **THEN** su script corre una sola vez

#### Scenario: Con otros scripts
- **WHEN** llegan teclas mientras otro script parpadea un LED cada 0.1 segundos
- **THEN** el parpadeo mantiene su ritmo

### Requirement: Lectura de la última tecla
La categoría Sensores SHALL incluir `última tecla del control (receptor en pin [p])`, que entrega el nombre de la tecla como texto (vacío si la tecla no es del control), y `código de la última tecla (receptor en pin [p])`, que entrega su número. Un programa de un solo script que los use SHALL generarse con corrutinas.

#### Scenario: Nombre y código
- **WHEN** se aprieta `volver` y el programa dice `unir [última tecla] [unir [ ] [código de la última tecla]]`
- **THEN** el monitor muestra `volver 82`

### Requirement: Receptor compatible con el resto del kit
El código SHALL decodificar el control sin usar temporizadores ni el LED de la placa, de modo que funcione junto con el buzzer, el servo y un LED en el pin 13. Si el programa nombra dos pines de receptor, SHALL valer el primero.

#### Scenario: Tecla que toca una nota
- **WHEN** el programa tiene `cuando llega la tecla 2` → `tocar nota la por 0.2 segundos en pin 8`
- **THEN** el sketch compila y al apretar la tecla 2 suena la nota

### Requirement: Control remoto del kit en el simulador
La paleta del alumno SHALL ofrecer el receptor infrarrojo y un control remoto con las 17 teclas del control del kit, rotuladas en español. Al apretar una tecla con el mouse, el control SHALL emitir la trama de esa tecla y repetirla mientras se mantiene apretada. El receptor SHALL recibir la primera tecla también después de detener e iniciar de nuevo la simulación.

#### Scenario: Apretar con el mouse
- **WHEN** la simulación corre con el receptor cableado al pin 10 y el alumno hace clic en la tecla OK del control
- **THEN** el script de la tecla OK corre

#### Scenario: Segunda simulación
- **WHEN** el alumno detiene la simulación, la inicia de nuevo y aprieta una tecla
- **THEN** esa primera tecla llega al programa
