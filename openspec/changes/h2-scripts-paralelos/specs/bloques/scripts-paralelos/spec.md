# Spec Delta

## Purpose

Permite que un programa de bloques tenga varios scripts con sombrero que avanzan a la vez, como en Scratch, sin que la espera de uno detenga a los demás.

## ADDED Requirements

### Requirement: Varios scripts a la vez
El área de trabajo SHALL admitir varios bloques sombrero. Todos los scripts SHALL avanzar de forma intercalada desde que la placa arranca, sin que el usuario escriba `millis()` ni máquinas de estado.

#### Scenario: Dos parpadeos independientes
- **WHEN** un script parpadea el LED del pin 13 cada 1 segundo y otro el del pin 12 cada 0.3 segundos
- **THEN** cada LED parpadea a su propio ritmo

#### Scenario: Parpadeo y botón
- **WHEN** un script parpadea un LED y otro conmuta un segundo LED cada vez que se presiona un botón, y el botón se presiona 5 veces
- **THEN** el segundo LED cambia 5 veces y el parpadeo no se interrumpe

### Requirement: Cesión de turno
`esperar`, `esperar hasta que` y `tocar nota` SHALL ceder el turno a los demás scripts mientras duran. `por siempre` y `repetir mientras` SHALL ceder el turno al final de cada vuelta.

#### Scenario: Por siempre sin esperas
- **WHEN** un script tiene un `por siempre` sin ningún bloque de espera y otro parpadea un LED
- **THEN** el LED sigue parpadeando a su ritmo

#### Scenario: Esperar hasta que
- **WHEN** un script está detenido en `esperar hasta que ¿botón presionado?` y el botón no se presiona
- **THEN** los demás scripts siguen avanzando

### Requirement: Script que termina
Un script que llega a su último bloque SHALL terminar sin afectar a los demás scripts.

#### Scenario: Script sin por siempre
- **WHEN** un script `al iniciar` enciende un LED y no tiene `por siempre`, y otro parpadea un segundo LED
- **THEN** el primer LED queda encendido y el segundo sigue parpadeando

### Requirement: Variables compartidas
Las variables SHALL ser comunes a todos los scripts, de modo que un script pueda leer lo que otro escribió.

#### Scenario: Un script cambia el ritmo de otro
- **WHEN** un script define la variable `pausa` al presionar un botón y otro usa `esperar (pausa) segundos` en su parpadeo
- **THEN** el parpadeo cambia de ritmo después de presionar el botón

### Requirement: Tope de scripts
Un programa SHALL admitir como máximo 8 scripts. Al alcanzar el tope, la paleta SHALL impedir agregar otro bloque sombrero.

#### Scenario: Noveno sombrero
- **WHEN** el área de trabajo ya tiene 8 bloques sombrero
- **THEN** los bloques sombrero de la paleta aparecen deshabilitados y no se pueden arrastrar
