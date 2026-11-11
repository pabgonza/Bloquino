// @vitest-environment jsdom
// Botón entre un pin con INPUT_PULLUP y GND. Al arrancar, el primer resultado
// eléctrico se calculó antes de que el programa activara el pull: da ~0 V en
// el pin y no debe leerse como «botón apretado».
import { expect, it, vi } from 'vitest';
import { buildNetlist } from '../simulation/spice/NetlistBuilder';

const sim = { setPinState: vi.fn(), spiceDrivenInputs: true };
let pull: 0 | 1 = 0;
const pinManager = { getOutputPins: () => new Set<number>(), getPinPull: () => pull };

vi.mock('../store/useSimulatorStore', () => ({
  useSimulatorStore: {
    getState: () => ({ boards: [{ id: 'arduino-uno', boardKind: 'arduino-uno', vcc: 5 }] }),
    subscribe: () => () => {},
  },
  getBoardSimulator: () => sim,
  getBoardPinManager: () => pinManager,
}));

const electrico = {
  nodeVoltages: {} as Record<string, number>,
  pinNetMap: new Map([['arduino-uno:2', 'n0']]),
  sourcedNets: new Set<string>(),
  voltageSources: [] as string[],
};
vi.mock('../store/useElectricalStore', () => ({
  useElectricalStore: { getState: () => electrico, subscribe: () => () => {} },
}));

const { connectDigitalInputsToMcu } = await import('../simulation/spice/connectDigitalInputsToMcu');

/** Llega un resultado: voltios del pin 2 y si el mazo ya traía su pull. */
function resultado(voltios: number, conPull: boolean) {
  sim.setPinState.mockClear();
  electrico.nodeVoltages = { n0: voltios };
  electrico.sourcedNets = new Set(['n0', ...(conPull ? ['pull:arduino-uno:2'] : [])]);
  connectDigitalInputsToMcu()(); // al montarse hace una pasada con lo publicado
  return sim.setPinState.mock.calls;
}

it('el netlist marca los pines cuyo pull interno ya conoce', () => {
  const circuito = (conPull: boolean) =>
    buildNetlist({
      components: [],
      wires: [],
      boards: [
        {
          id: 'arduino-uno',
          vcc: 5,
          pins: conPull ? { '2': { type: 'input', pull: 1 } } : {},
          groundPinNames: ['GND.1'],
          vccPinNames: ['5V'],
        },
      ],
      analysis: { kind: 'op' },
    }).sourcedNets;
  expect(circuito(true).has('pull:arduino-uno:2')).toBe(true);
  expect(circuito(false).has('pull:arduino-uno:2')).toBe(false);
});

it('antes de que el programa active el pull, el pin sigue al circuito', () => {
  pull = 0;
  expect(resultado(0, false)).toEqual([[2, false]]);
});

it('con el pull activo, un resultado que no lo trae se descarta', () => {
  pull = 1;
  expect(resultado(0, false)).toEqual([]);
});

it('el resultado del mazo rehecho sí llega: suelto en alto, apretado en bajo', () => {
  pull = 1;
  expect(resultado(4.9, true)).toEqual([[2, true]]);
  expect(resultado(0, true)).toEqual([[2, false]]);
});
