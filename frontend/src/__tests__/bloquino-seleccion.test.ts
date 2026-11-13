// @vitest-environment jsdom
/**
 * Varias piezas seleccionadas (change seleccion-multiple): el grupo y las
 * cuentas de mover, girar, borrar, copiar y pegar, contra el store real.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import * as grupo from '../bloquino/seleccion';
import { useSimulatorStore } from '../store/useSimulatorStore';
import type { Wire } from '../types/wire';

const sim = () => useSimulatorStore.getState();
const pieza = (id: string, x: number, y: number, metadataId = 'led') => ({ id, metadataId, x, y, properties: {} });
const cable = (id: string, de: string, a: string, extra: Partial<Wire> = {}): Wire => ({
  id,
  start: { componentId: de, pinName: 'A', x: 0, y: 0 },
  end: { componentId: a, pinName: 'C', x: 0, y: 0 },
  waypoints: [{ x: 10, y: 10 }],
  color: '#000',
  ...extra,
});
// Cajas de 20×20 (medio 10×10) para todo.
const medio = () => ({ w: 10, h: 10 });
const placa = () => sim().boards[0];

beforeEach(() => {
  useSimulatorStore.setState({
    components: [pieza('a', 0, 0), pieza('b', 100, 0), pieza('bb', 0, 200, 'breadboard'), pieza('r', 10, 210)],
    wires: [
      cable('w-ab', 'a', 'b'),
      cable('w-placa', 'a', placa().id),
      { ...cable('bb-r', 'r', 'bb'), bb: true },
    ],
  });
  grupo.vaciar();
});

describe('el grupo', () => {
  it('Shift suma y quita; la principal es la última pieza que no es la placa', () => {
    grupo.alternar('a');
    grupo.alternar(placa().id);
    grupo.alternar('b');
    expect(grupo.principal()).toBe('b');
    grupo.alternar('b');
    expect(grupo.useGrupo.getState().ids).toEqual(['a', placa().id]);
    expect(grupo.principal()).toBe('a');
  });

  it('Ctrl+A junta las piezas y la placa', () => {
    grupo.seleccionarTodo();
    expect(grupo.useGrupo.getState().ids).toEqual(expect.arrayContaining(['a', 'b', 'bb', 'r', placa().id]));
  });
});

describe('mover', () => {
  it('corre el resto del grupo, la placa y los puntos de los cables internos', () => {
    const { x, y } = placa();
    grupo.fijar(['a', 'b', placa().id]);
    grupo.desplazar(5, 7, 'a');
    const c = (id: string) => sim().components.find((p) => p.id === id)!;
    expect([c('a').x, c('a').y]).toEqual([0, 0]); // la arrastrada la mueve el mouse
    expect([c('b').x, c('b').y]).toEqual([105, 7]);
    expect([placa().x, placa().y]).toEqual([x + 5, y + 7]);
    const w = (id: string) => sim().wires.find((x) => x.id === id)!;
    expect(w('w-ab').waypoints).toEqual([{ x: 15, y: 17 }]);
    expect(w('w-placa').waypoints).toEqual([{ x: 15, y: 17 }]);
  });

  it('lo asentado en una protoboard del grupo no se mueve dos veces', () => {
    grupo.fijar(['bb', 'r', 'a']);
    grupo.desplazar(10, 0, 'a');
    // La protoboard lleva a la resistencia: +10, no +20.
    expect(sim().components.find((p) => p.id === 'r')!.x).toBe(20);
  });
});

describe('girar', () => {
  it('gira 90° en torno al centro del grupo y se deshace en un paso', () => {
    grupo.fijar(['a', 'b']);
    grupo.girar(medio);
    // Caja del grupo: x 0..120, y 0..20 → centro (60, 10). Centro de a (10, 10)
    // → (60, -40); de b (110, 10) → (60, 60). Esquina = centro − 10.
    const c = (id: string) => sim().components.find((p) => p.id === id)!;
    expect([c('a').x, c('a').y, c('a').properties.rotation]).toEqual([50, -50, 90]);
    expect([c('b').x, c('b').y, c('b').properties.rotation]).toEqual([50, 50, 90]);
    sim().undo();
    expect([c('a').x, c('a').y, c('a').properties.rotation]).toEqual([0, 0, undefined]);
  });
});

describe('borrar', () => {
  it('borra las piezas y sus cables, deja la placa, y Ctrl+Z las devuelve', () => {
    grupo.fijar(['a', placa().id]);
    grupo.borrar();
    expect(sim().components.map((c) => c.id)).toEqual(['b', 'bb', 'r']);
    expect(sim().wires.map((w) => w.id)).toEqual(['bb-r']);
    expect(sim().boards).toHaveLength(1);
    expect(grupo.useGrupo.getState().ids).toEqual([placa().id]);
    sim().undo();
    expect(sim().components.map((c) => c.id)).toEqual(['a', 'b', 'bb', 'r']);
    expect(sim().wires).toHaveLength(3);
  });
});

describe('copiar y pegar', () => {
  it('pega las piezas corridas con ids nuevos, con sus cables internos, y las deja seleccionadas', () => {
    grupo.fijar(['a', 'b', placa().id]);
    grupo.copiar();
    expect(grupo.hayCopia()).toBe(true);
    const nuevos = grupo.pegar();
    expect(nuevos).toHaveLength(2); // la placa no se copia
    const copias = sim().components.filter((c) => nuevos.includes(c.id));
    expect(copias.map((c) => [c.x, c.y])).toEqual([[20, 20], [120, 20]]);
    const internos = sim().wires.filter((w) => nuevos.includes(w.start.componentId));
    expect(internos).toHaveLength(1);
    expect(nuevos).toContain(internos[0].end.componentId);
    expect(grupo.useGrupo.getState().ids).toEqual(nuevos);
    // Pegar otra vez corre de nuevo, como en Tinkercad.
    const otra = grupo.pegar();
    expect(sim().components.filter((c) => otra.includes(c.id)).map((c) => c.x)).toEqual([40, 140]);
  });

  it('copiar una sola pieza con Velxio después manda sobre la copia del grupo', () => {
    grupo.fijar(['a', 'b']);
    grupo.copiar();
    sim().copyComponent('a');
    expect(grupo.hayCopia()).toBe(false);
  });
});
