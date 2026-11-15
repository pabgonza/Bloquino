// Revisión previa a simular: un display de 7 segmentos es solo LED. Con un
// segmento y un pin común unidos a la placa sin ninguna resistencia en el
// camino, uno real se daña y le pide de más al pin. El verificador de Velxio
// solo conoce el LED suelto; esta regla la suma verifyFromStore.
import { buildNetlist } from '../simulation/spice/NetlistBuilder';
import type { BuildNetlistInput } from '../simulation/spice/types';
import type { CircuitWarning } from '../simulation/verify/circuitVerifier';

export function displaysSinResistencia(input: BuildNetlistInput): CircuitWarning[] {
  // Una resistencia separa redes: un pin del display en la misma red que un
  // pin de la placa llega a ella directo.
  const pines = [...buildNetlist({ ...input, analysis: { kind: 'op' } }).pinNetMap].map(([clave, red]) => {
    const corte = clave.indexOf(':');
    return { id: clave.slice(0, corte), pin: clave.slice(corte + 1), red };
  });
  const placas = new Set(input.boards.map((b) => b.id));
  const deLaPlaca = new Set(pines.filter((p) => placas.has(p.id)).map((p) => p.red));
  return input.components
    .filter((c) => c.metadataId === '7segment' || c.metadataId === 'display-4')
    .filter((c) => {
      const directos = pines.filter((p) => p.id === c.id && deLaPlaca.has(p.red)).map((p) => p.pin);
      return directos.some((p) => /^([A-G]|DP)$/.test(p)) && directos.some((p) => /^(COM|DIG)/.test(p));
    })
    .map((c) => ({
      severity: 'error',
      code: 'display-overcurrent',
      componentId: c.id,
      message: `7-segment display ${c.id} has no series resistors: its segments are bare LEDs. Add one resistor per segment.`,
    }));
}
