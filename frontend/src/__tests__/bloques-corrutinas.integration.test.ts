/**
 * Comportamiento de los scripts paralelos (h2) en un AVR emulado: cada
 * programa se genera desde bloques, se compila contra el backend y su .hex
 * corre en helpers/avrTestHarness. Solo con RUN_BLOQUES_COMPILE=1:
 *
 *   RUN_BLOQUES_COMPILE=1 npx vitest run src/__tests__/bloques-corrutinas.integration.test.ts
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { AVRTestHarness } from './helpers/avrTestHarness';
import { hexToUint8Array } from '../utils/hexParser';
import {
  type B,
  CON_BACKEND,
  alIniciar,
  boton,
  cadena,
  compilar,
  cuandoBoton,
  distancia,
  esperar,
  led,
  num,
  parpadeo,
  porSiempre,
  sketch,
} from './helpers/bloques';

const MS = 16_000; // ciclos de CPU por milisegundo (16 MHz)

/** Placa emulada con el programa cargado. Los pines 8 a 13 son el puerto B; el 2, el D. */
async function placa(bloques: B[], variables?: B[]) {
  const { hex } = await compilar(sketch(bloques, variables));
  const bytes = hexToUint8Array(hex);
  const avr = new AVRTestHarness();
  avr.loadProgram(new Uint16Array(bytes.buffer, 0, bytes.length >> 1));
  const cambios: Record<number, number[]> = {}; // pin → instantes (ms) de cada cambio
  avr.ports.B.addListener((valor, anterior) => {
    for (let bit = 0; bit < 6; bit++)
      if ((valor ^ anterior) & (1 << bit)) (cambios[8 + bit] ??= []).push(avr.cpu.cycles / MS);
  });
  avr.ports.D.setPin(2, true); // botón suelto (pull-up)
  return {
    cambios: (pin: number) => cambios[pin] ?? [],
    correr: (ms: number) => avr.runCycles(ms * MS),
    boton: (presionado: boolean) => avr.ports.D.setPin(2, !presionado),
  };
}
type Placa = Awaited<ReturnType<typeof placa>>;

/** Pulsación limpia: presionado y suelto durante `ms` cada uno. */
function pulsar(p: Placa, ms = 60) {
  p.boton(true);
  p.correr(ms);
  p.boton(false);
  p.correr(ms);
}

// Conmuta el LED del pin 12 con cada pulsación.
const VAR = { id: 'v' };
const encendido = { block: { type: 'variables_get', fields: { VAR } } };
const conmutar: B[] = [
  {
    type: 'variables_set',
    fields: { VAR },
    inputs: {
      VALUE: {
        block: { type: 'ab_aritmetica', fields: { OP: '-' }, inputs: { A: num(1), B: encendido } },
      },
    },
  },
  {
    type: 'ab_si_sino',
    inputs: {
      COND: {
        block: { type: 'ab_comparar', fields: { OP: '==' }, inputs: { A: encendido, B: num(1) } },
      },
      DO: { block: led('HIGH', 12) },
      SINO: { block: led('LOW', 12) },
    },
  },
];
const VARIABLES = [{ name: 'encendido', id: 'v' }];

describe.skipIf(!CON_BACKEND)('scripts paralelos en un AVR emulado', { timeout: 120_000 }, () => {
  it('dos parpadeos, cada uno a su ritmo', async () => {
    const p = await placa([alIniciar(parpadeo(13, 0.1)), alIniciar(parpadeo(12, 0.03))]);
    p.correr(1205);
    expect(p.cambios(13)).toHaveLength(13); // enciende en 0 y cambia cada 100 ms
    expect(p.cambios(12)).toHaveLength(41); // cada 30 ms
    // El ritmo no se atrasa: el último cambio del pin 13 cae en 1200 ms.
    expect(p.cambios(13).at(-1)!).toBeGreaterThan(1199);
    expect(p.cambios(13).at(-1)!).toBeLessThan(1203);
  });

  it('parpadeo + botón: 5 pulsaciones son 5 cambios y el parpadeo no se interrumpe', async () => {
    const p = await placa([alIniciar(parpadeo(13, 0.1)), cuandoBoton(2, ...conmutar)], VARIABLES);
    p.correr(50);
    for (let i = 0; i < 5; i++) pulsar(p);
    p.correr(355);
    expect(p.cambios(12)).toHaveLength(5);
    expect(p.cambios(13)).toHaveLength(11); // 1005 ms: en 0 y cada 100 ms
  });

  it('mantener presionado no repite', async () => {
    const p = await placa([cuandoBoton(2, ...conmutar)], VARIABLES);
    p.correr(50);
    p.boton(true);
    p.correr(2000);
    expect(p.cambios(12)).toHaveLength(1);
  });

  it('un rebote de 5 ms al presionar y al soltar cuenta como una pulsación', async () => {
    const p = await placa([cuandoBoton(2, ...conmutar)], VARIABLES);
    p.correr(50);
    const rebote = (final: boolean) => {
      for (let i = 0; i < 10; i++) {
        p.boton(i % 2 === 0 ? final : !final);
        p.correr(0.5);
      }
      p.boton(final);
    };
    rebote(true);
    p.correr(100);
    rebote(false);
    p.correr(100);
    expect(p.cambios(12)).toHaveLength(1);
  });

  it('una pulsación mientras el script del botón corre se ignora', async () => {
    const largo = cuandoBoton(2, led('HIGH', 12), esperar(0.3), led('LOW', 12), esperar(0.3));
    const p = await placa([largo]);
    const encendidos = () => p.cambios(12).length / 2;
    p.correr(50);
    pulsar(p); // arranca el script (600 ms)
    p.correr(180);
    pulsar(p); // a los 300 ms: el script sigue corriendo
    p.correr(600);
    expect(encendidos()).toBe(1);
    pulsar(p); // ya terminó: corre de nuevo
    p.correr(700);
    expect(encendidos()).toBe(2);
  });

  it('repetir 3 veces con esperas enciende exactamente 3 veces', async () => {
    const repetir = {
      type: 'ab_repetir',
      inputs: {
        VECES: num(3),
        DO: { block: cadena([led('HIGH', 12), esperar(0.05), led('LOW', 12), esperar(0.05)]) },
      },
    };
    const p = await placa([alIniciar(repetir), alIniciar(parpadeo(13, 0.1))]);
    p.correr(1000);
    expect(p.cambios(12)).toHaveLength(6);
    expect(p.cambios(13).length).toBeGreaterThanOrEqual(10);
  });

  it('un por siempre sin esperas no congela a los demás', async () => {
    const sinEsperas = porSiempre({
      type: 'ab_si_sino',
      inputs: { COND: boton, DO: { block: led('HIGH', 12) }, SINO: { block: led('LOW', 12) } },
    });
    const p = await placa([alIniciar(sinEsperas), alIniciar(parpadeo(13, 0.1))]);
    p.correr(505);
    expect(p.cambios(13)).toHaveLength(6);
    p.boton(true);
    p.correr(5);
    expect(p.cambios(12)).toHaveLength(1); // y el script sin esperas también avanza
  });

  it('un script que termina no afecta a los demás', async () => {
    const p = await placa([alIniciar(led('HIGH', 12)), alIniciar(parpadeo(13, 0.1))]);
    p.correr(505);
    expect(p.cambios(12)).toHaveLength(1);
    expect(p.cambios(13)).toHaveLength(6);
  });

  it('tocar nota cede el turno mientras suena', async () => {
    const nota = {
      type: 'ab_tocar_nota',
      fields: { NOTA: '440', PIN: '8' },
      inputs: { S: num(0.5) },
    };
    const p = await placa([alIniciar(porSiempre(nota)), alIniciar(parpadeo(13, 0.1))]);
    p.correr(1005);
    expect(p.cambios(13)).toHaveLength(11);
    expect(p.cambios(8).length).toBeGreaterThan(800); // 440 Hz ≈ 880 cambios por segundo
  });

  it('distancia sin eco retiene el turno a lo más 25 ms', async () => {
    const medir = porSiempre({
      type: 'ab_si',
      inputs: {
        COND: {
          block: { type: 'ab_comparar', fields: { OP: '<' }, inputs: { A: distancia, B: num(20) } },
        },
        DO: { block: led('HIGH', 12) },
      },
    });
    const p = await placa([alIniciar(medir), alIniciar(parpadeo(13, 0.1))]);
    p.correr(1100);
    const c = p.cambios(13);
    // La primera medición corre antes que el parpadeo: este arranca hasta 25 ms tarde.
    expect(c[0]).toBeLessThan(27);
    expect(c.length).toBeGreaterThanOrEqual(10);
    // Cada cambio se atrasa a lo más una medición respecto del ritmo de 100 ms.
    c.slice(1).forEach((t, i) => expect(t - c[i]).toBeLessThan(100 + 27));
  });

  it('ocho scripts usan menos de la mitad de la RAM del UNO', async () => {
    const ino = readFileSync(path.resolve(__dirname, 'fixtures/bloques/ocho-scripts.ino'), 'utf8');
    // Un comentario distinto cada vez: la caché de compilación no informa tamaños.
    const { stdout } = await compilar(`${ino}// ${Date.now()}\n`);
    console.log(stdout.trim());
    const ram = Number(/Global variables use (\d+) bytes/.exec(stdout)![1]);
    expect(ram).toBeLessThan(1024);
  });
});
