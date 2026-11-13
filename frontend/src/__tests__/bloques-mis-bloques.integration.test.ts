/**
 * Mis bloques en un AVR emulado: el programa se genera desde bloques, se
 * compila contra el backend y su .hex corre en helpers/avrTestHarness. Solo
 * con RUN_BLOQUES_COMPILE=1:
 *
 *   RUN_BLOQUES_COMPILE=1 npx vitest run src/__tests__/bloques-mis-bloques
 */
import { describe, it, expect } from 'vitest';
import { AVRTestHarness } from './helpers/avrTestHarness';
import { hexToUint8Array } from '../utils/hexParser';
import {
  type B,
  CON_BACKEND,
  alIniciar,
  compilar,
  defParpadear,
  definir,
  entrada,
  led,
  nombre,
  num,
  numero,
  parpadear,
  parpadeo,
  porSiempre,
  repetir,
  sketch,
  usar,
} from './helpers/bloques';

const MS = 16_000; // ciclos de CPU por milisegundo (16 MHz)

/** Placa emulada con el programa cargado; anota los cambios de los pines 8 a 13. */
async function placa(bloques: B[]) {
  const codigo = sketch(bloques);
  const { hex } = await compilar(codigo);
  const bytes = hexToUint8Array(hex);
  const avr = new AVRTestHarness();
  avr.loadProgram(new Uint16Array(bytes.buffer, 0, bytes.length >> 1));
  const cambios: Record<number, number[]> = {};
  avr.ports.B.addListener((valor, anterior) => {
    for (let bit = 0; bit < 6; bit++)
      if ((valor ^ anterior) & (1 << bit)) (cambios[8 + bit] ??= []).push(avr.cpu.cycles / MS);
  });
  return { codigo, cambios: (pin: number) => cambios[pin] ?? [], correr: (ms: number) => avr.runCycles(ms * MS) };
}

describe.skipIf(!CON_BACKEND)('mis bloques en un AVR emulado', { timeout: 120_000 }, () => {
  it('clásico: parpadear 3 veces enciende la luz L tres veces', async () => {
    const p = await placa([alIniciar(parpadear(3)), defParpadear(13, 0.05)]);
    expect(p.codigo).toContain('void parpadear(float veces)');
    p.correr(600);
    expect(p.cambios(13)).toHaveLength(6);
  });

  it('clásico: una definición vacía compila y no hace nada', async () => {
    const p = await placa([alIniciar(parpadear(3)), definir('p', [nombre('parpadear')])]);
    p.correr(100);
    expect(p.cambios(13)).toHaveLength(0);
  });

  it('corrutinas: dos ritmos a la vez con el mismo bloque, cada uno con su espera', async () => {
    // «definir pausa (segundos)»: esperar (segundos). El pin es un menú, no una entrada.
    const PAUSA = [nombre('pausa'), numero('segundos')];
    const pausa = (s: number) => usar('s', PAUSA, { segundos: num(s) });
    const latido = (pin: number, s: number) => porSiempre(led('HIGH', pin), pausa(s), led('LOW', pin), pausa(s));
    const p = await placa([
      alIniciar(latido(13, 0.1)),
      alIniciar(latido(12, 0.03)),
      definir('s', PAUSA, { type: 'ab_esperar', inputs: { S: entrada('s', 'segundos') } }),
    ]);
    expect(p.codigo).toContain('#define ESPERAR(ms)');
    p.correr(1205);
    expect(p.cambios(13)).toHaveLength(13); // enciende en 0 y cambia cada 100 ms
    expect(p.cambios(12)).toHaveLength(41); // cada 30 ms
  });

  it('corrutinas: parpadear (2) dentro de repetir 3 veces son 6 parpadeos', async () => {
    const p = await placa([
      alIniciar(repetir(num(3), parpadear(2))),
      alIniciar(parpadeo(12, 0.1)),
      defParpadear(13, 0.05),
    ]);
    p.correr(1000);
    expect(p.cambios(13)).toHaveLength(12);
    expect(p.cambios(12).length).toBeGreaterThanOrEqual(9); // el otro programa no se frena
  });
});
