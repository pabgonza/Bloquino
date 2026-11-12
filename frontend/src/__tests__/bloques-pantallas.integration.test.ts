/**
 * Pantalla LCD (h8) de punta a punta: el programa se genera desde bloques, se
 * compila contra el backend con LiquidCrystal y corre en el simulador AVR de
 * Velxio con su LCD 16x2 conectado. Solo con RUN_BLOQUES_COMPILE=1:
 *
 *   RUN_BLOQUES_COMPILE=1 npx vitest run src/__tests__/bloques-pantallas.integration.test.ts
 */
import { describe, expect, it } from 'vitest';
import { AVRSimulator } from '../simulation/AVRSimulator';
import { PinManager } from '../simulation/PinManager';
import { PartSimulationRegistry } from '../simulation/parts/PartSimulationRegistry';
import '../simulation/parts/ComplexParts';
import {
  type B,
  CON_BACKEND,
  alIniciar,
  compilar,
  cursor,
  escribir,
  esperar,
  num,
  parpadeo,
  porSiempre,
  preparar,
  sketch,
  txt,
} from './helpers/bloques';

const MS = 16_000; // ciclos de CPU por milisegundo (16 MHz)
const VARS = [{ name: 'cuenta', id: 'n' }];
const cuenta = { block: { type: 'variables_get', fields: { VAR: { id: 'n' } } } };

/** UNO simulado con una LCD 16x2 cableada a los pines dados (RS, E, D4 a D7). */
async function placa(bloques: B[], pines = [12, 11, 5, 4, 3, 2]) {
  const sim = new AVRSimulator(new PinManager());
  sim.loadHex((await compilar(sketch(bloques, VARS))).hex);
  const pantalla = { characters: new Uint8Array(32).fill(32) };
  const cable = Object.fromEntries(['RS', 'E', 'D4', 'D5', 'D6', 'D7'].map((n, i) => [n, pines[i]]));
  PartSimulationRegistry.get('lcd1602')!.attachEvents!(
    pantalla as unknown as HTMLElement,
    sim as never,
    (pin) => cable[pin] ?? null,
    'lcd',
  );
  const cambios: number[] = [];
  sim.onPinChangeWithTime = (pin, _estado, ms) => {
    if (pin === 13) cambios.push(ms);
  };
  return {
    correr(ms: number) {
      const fin = sim.getCurrentCycles() + ms * MS;
      while (sim.getCurrentCycles() < fin) sim.step();
    },
    filas: () =>
      [0, 16].map((i) => String.fromCharCode(...pantalla.characters.slice(i, i + 16)).trimEnd()),
    cambios,
  };
}

describe.skipIf(!CON_BACKEND)('pantalla LCD en el simulador', { timeout: 120_000 }, () => {
  it('escribe en las dos filas, con un número unido a un texto', async () => {
    const p = await placa([
      alIniciar(
        escribir(txt('Hola')),
        cursor(1, 2),
        escribir({ block: { type: 'ab_unir', inputs: { A: txt('Temp: '), B: num(25) } } }),
      ),
    ]);
    p.correr(300);
    expect(p.filas()).toEqual(['Hola', 'Temp: 25']);
  });

  it('preparar pantalla con otros pines', async () => {
    const pines = [7, 8, 9, 10, 11, 12];
    const p = await placa([alIniciar(preparar(...pines), cursor(6, 1), escribir(txt('Bloquino')))], pines);
    p.correr(300);
    expect(p.filas()).toEqual(['     Bloquino', '']);
  });

  it('un contador en la pantalla no frena un parpadeo paralelo', async () => {
    const contar: B[] = [
      { type: 'ab_lcd_borrar' },
      escribir(cuenta),
      { type: 'math_change', fields: { VAR: { id: 'n' } }, inputs: { DELTA: num(1) } },
      esperar(0.5),
    ];
    const p = await placa([alIniciar(porSiempre(...contar)), alIniciar(parpadeo(13, 0.1))]);
    p.correr(1300);
    expect(p.filas()).toEqual(['2', '']);
    const periodos = p.cambios.slice(1).map((t, i) => t - p.cambios[i]);
    expect(periodos.length).toBeGreaterThan(10);
    // Borrar y escribir en la pantalla retiene el turno unos pocos milisegundos.
    expect(Math.max(...periodos)).toBeLessThan(110);
  });
});
