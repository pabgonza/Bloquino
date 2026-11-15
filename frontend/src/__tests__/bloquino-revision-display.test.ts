/**
 * Revisión previa a simular: un display de 7 segmentos sin resistencias avisa
 * (bloquino/revisionDisplay.ts). Se arma la misma entrada que el botón de simular.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { displaysSinResistencia } from '../bloquino/revisionDisplay';
import { buildInputFromStore } from '../simulation/spice/storeAdapter';
import { buildPreflightSnapshot, type PreflightState } from '../simulation/verify/verifyFromStore';

const SEGMENTOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const UNO = { id: 'arduino-uno', boardKind: 'arduino-uno' };
const avisos = (estado: PreflightState) =>
  displaysSinResistencia(buildInputFromStore(buildPreflightSnapshot(estado).snap)).map((a) => `${a.code} ${a.componentId}`);
const cable = (de: string, a: string) => {
  const [c1, p1] = de.split(':');
  const [c2, p2] = a.split(':');
  return { id: `${de}>${a}`, start: { componentId: c1, pinName: p1 }, end: { componentId: c2, pinName: p2 } };
};
const resistencia = (id: string) => ({ id, metadataId: 'resistor', properties: { value: '220' } });
const ejemplo = (nombre: string): PreflightState =>
  JSON.parse(readFileSync(path.resolve(__dirname, '../../public/ejemplos', nombre + '.bloquino'), 'utf8'));

describe('display sin resistencias', () => {
  it('avisa con los segmentos y el común directo a la placa', () => {
    expect(
      avisos({
        components: [{ id: 'd', metadataId: '7segment', properties: {} }],
        wires: [...SEGMENTOS.map((s, i) => cable(`d:${s}`, `arduino-uno:${i + 2}`)), cable('d:COM.1', 'arduino-uno:GND.1')],
        boards: [UNO],
      }),
    ).toEqual(['display-overcurrent d']);
  });

  it('avisa en el de 4 dígitos con los dígitos en pines', () => {
    expect(
      avisos({
        components: [{ id: 'd', metadataId: 'display-4', properties: { digits: 4 } }],
        wires: [cable('d:A', 'arduino-uno:12'), cable('d:DIG1', 'arduino-uno:10')],
        boards: [UNO],
      }),
    ).toEqual(['display-overcurrent d']);
  });

  it('no avisa con una resistencia por segmento', () => {
    expect(
      avisos({
        components: [{ id: 'd', metadataId: '7segment', properties: {} }, ...SEGMENTOS.map((s) => resistencia('r' + s))],
        wires: [
          ...SEGMENTOS.flatMap((s, i) => [cable(`d:${s}`, `r${s}:1`), cable(`r${s}:2`, `arduino-uno:${i + 2}`)]),
          cable('d:COM.1', 'arduino-uno:GND.1'),
        ],
        boards: [UNO],
      }),
    ).toEqual([]);
  });

  it('no avisa con la resistencia en el común', () => {
    expect(
      avisos({
        components: [{ id: 'd', metadataId: '7segment', properties: {} }, resistencia('r')],
        wires: [cable('d:A', 'arduino-uno:2'), cable('d:COM.1', 'r:1'), cable('r:2', 'arduino-uno:GND.1')],
        boards: [UNO],
      }),
    ).toEqual([]);
  });

  it.each(['09-control-y-digito', '10-marcador'])('%s: no avisa, y sí al puentear sus resistencias', (nombre) => {
    const proyecto = ejemplo(nombre);
    expect(avisos(proyecto)).toEqual([]);
    const puentes = proyecto.components.filter((c) => c.metadataId === 'resistor').map((r) => cable(`${r.id}:1`, `${r.id}:2`));
    expect(avisos({ ...proyecto, wires: [...proyecto.wires, ...puentes] })).toHaveLength(1);
  });
});
