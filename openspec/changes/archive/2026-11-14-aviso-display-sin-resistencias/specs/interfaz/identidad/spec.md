## MODIFIED Requirements

### Requirement: Revisión del circuito en español
Cuando la revisión previa a simular encuentra un problema en el circuito, el aviso SHALL estar en español, explicar el problema sin identificadores internos de componentes y ofrecer volver a arreglarlo o simular igual. La página SHALL NOT presentarlo como un error del programa. La revisión SHALL avisar de un display de 7 segmentos con un segmento y un pin común unidos a la placa sin ninguna resistencia.

#### Scenario: LED sin resistencia
- **WHEN** el alumno conecta un LED entre el pin 13 y GND sin resistencia e inicia la simulación
- **THEN** aparece "Revisa tu circuito" con un texto que dice que el LED está sin resistencia y que le ponga una de 220 Ω, y no aparece el aviso de que el programa no se pudo compilar

#### Scenario: Display sin resistencias
- **WHEN** el alumno conecta los segmentos de un display directo a los pines 2 a 8 y su común directo a GND, e inicia la simulación
- **THEN** aparece "Revisa tu circuito" con un texto que dice que el display está sin resistencias y que le ponga una a cada segmento (220 Ω en el de 1 dígito, 1 kΩ en el de 4)

#### Scenario: Display con resistencias
- **WHEN** cada segmento del display llega a su pin por una resistencia y el alumno inicia la simulación
- **THEN** no aparece el aviso del display
