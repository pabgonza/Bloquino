# Spec Delta

## Purpose

Bloques de los displays de 7 segmentos del kit, de 1 y de 4 dígitos, conectados directo a los pines de la placa.

## ADDED Requirements

### Requirement: Bloques del display
La categoría Pantallas SHALL incluir `preparar display de 1 dígito de [tipo] (A [p] … G [p])`, `preparar display de 4 dígitos de [tipo] (A [p] … G [p]) dígitos ([p] [p] [p] [p])`, `mostrar número [n] en el display` y `apagar display`. El código SHALL NOT usar librerías. Sin bloque `preparar`, el programa SHALL usar un display de 1 dígito de cátodo común en los pines 2 a 8.

#### Scenario: Un dígito
- **WHEN** el programa es `al iniciar` → `mostrar número 7 en el display`, con el display de 1 dígito cableado a los pines 2 a 8 y su común a GND
- **THEN** el display muestra 7 y el sketch no usa corrutinas

#### Scenario: Número de varias cifras en un dígito
- **WHEN** se muestra 42 en el display de 1 dígito
- **THEN** el display muestra 2

### Requirement: Cátodo y ánodo común
El menú de tipo SHALL ofrecer cátodo común y ánodo común. Con cátodo común un segmento SHALL encender con nivel alto y un dígito activarse con nivel bajo; con ánodo común, al revés.

#### Scenario: Ánodo común
- **WHEN** el display de 4 dígitos se prepara como ánodo común y se muestra 905
- **THEN** el pin del dígito en turno está en alto, los segmentos encendidos en bajo y se lee ` 905`

### Requirement: Cuatro dígitos con refresco automático
Con el display de 4 dígitos, `mostrar número` SHALL guardar el número (de 0 a 9999, sin ceros a la izquierda) y el generador SHALL refrescar el display en cada vuelta de `loop()`, un dígito cada 2 ms y nunca dos a la vez, sin que el alumno vea ese código. El programa SHALL generarse con corrutinas.

#### Scenario: 1234
- **WHEN** el programa prepara el display de 4 dígitos y muestra 1234
- **THEN** cada dígito muestra su cifra y la vuelta completa dura unos 8 ms

#### Scenario: Contador con parpadeo
- **WHEN** un script cuenta en el display cada 0.3 segundos y otro parpadea un LED cada 0.1 segundos
- **THEN** el display sigue mostrando el número y el parpadeo mantiene su ritmo

### Requirement: Display del simulador como la pieza suelta
En la paleta del alumno, los displays SHALL comportarse como la pieza del kit, sin transistores: según su tipo (editable en la ficha), el dígito se activa y el segmento enciende con los niveles del requisito anterior.

#### Scenario: Común a GND
- **WHEN** un display de 1 dígito de cátodo común tiene su común cableado a GND y sus segmentos a pines que el programa pone en alto
- **THEN** esos segmentos se ven encendidos

#### Scenario: Número fijo sin parpadeos
- **WHEN** el display de 4 dígitos muestra 5309 durante la simulación
- **THEN** en lecturas sucesivas del lienzo siempre dice 5309
