// Display de 7 segmentos de 4 dígitos del kit. Es el elemento de Wokwi con
// `digits: 4` y la misma simulación del de 1 dígito, como componente aparte:
// al cambiar los dígitos de un display ya puesto, el lienzo no renueva sus
// cuadros de pin y no se pueden cablear DIG1 a DIG4.
import { PartSimulationRegistry } from '../../simulation/parts/PartSimulationRegistry';
import '../../simulation/parts/ChipParts';

PartSimulationRegistry.register('display-4', PartSimulationRegistry.get('7segment')!);
