/**
 * Display de 7 segmentos (h8) en el simulador AVR: el programa se genera
 * desde bloques, se compila contra el backend y se miran los pines como los
 * vería el display: qué segmentos están encendidos mientras cada dígito está
 * activo. Solo con RUN_BLOQUES_COMPILE=1:
 *
 *   RUN_BLOQUES_COMPILE=1 npx vitest run src/__tests__/bloques-display.integration.test.ts
 */
import { describe, expect, it } from 'vitest';
import { AVRSimulator } from '../simulation/AVRSimulator';
import { PinManager } from '../simulation/PinManager';
import { type B, CON_BACKEND, alIniciar, compilar, esperar, num, parpadeo, porSiempre, sketch } from './helpers/bloques';

const MS = 16_000; // ciclos de CPU por milisegundo (16 MHz)
const SEGMENTOS = [2, 3, 4, 5, 6, 7, 8]; // A a G
const DIGITOS = [9, 10, 11, 12];
// Cifra que forman los segmentos encendidos (bit 0 = A).
const CIFRA: Record<number, string> = { 0: ' ', 0x3f: '0', 0x06: '1', 0x5b: '2', 0x4f: '3', 0x66: '4', 0x6d: '5', 0x7d: '6', 0x07: '7', 0x7f: '8', 0x6f: '9' };
const campos = (COMUN: string) => ({
  COMUN,
  ...Object.fromEntries(SEGMENTOS.map((p, i) => ['ABCDEFG'[i], String(p)])),
});
const preparar4 = (COMUN = 'catodo'): B => ({
  type: 'ab_display4_preparar',
  fields: { ...campos(COMUN), D1: '9', D2: '10', D3: '11', D4: '12' },
});
const mostrar = (NUMERO: object): B => ({ type: 'ab_display_mostrar', inputs: { NUMERO } });
const VARS = [{ name: 'cuenta', id: 'n' }];

async function placa(bloques: B[], anodo = false) {
  const sim = new AVRSimulator(new PinManager());
  sim.loadHex((await compilar(sketch(bloques, VARS))).hex);
  const nivel: Record<number, boolean> = {};
  const cambios: Record<number, number[]> = {};
  sim.onPinChangeWithTime = (pin, estado, ms) => {
    nivel[pin] = estado;
    (cambios[pin] ??= []).push(ms);
  };
  const correr = (ms: number) => {
    const fin = sim.getCurrentCycles() + ms * MS;
    while (sim.getCurrentCycles() < fin) sim.step();
  };
  /** Cifra que muestran los segmentos en este instante. */
  const cifra = () =>
    CIFRA[SEGMENTOS.reduce((bits, p, i) => bits | (Number(!!nivel[p] !== anodo) << i), 0)] ?? '?';
  return {
    correr,
    cifra,
    cambios: (pin: number) => cambios[pin] ?? [],
    /** Lo que se lee en el display de 4 dígitos durante `ms`, muestreando cada 0,25 ms. */
    leer(ms = 40) {
      const visto = ['', '', '', ''];
      for (let t = 0; t < ms; t += 0.25) {
        correr(0.25);
        const activos = DIGITOS.filter((p) => !!nivel[p] === anodo);
        // Nunca dos dígitos a la vez: se verían con la misma cifra.
        expect(activos.length).toBeLessThanOrEqual(1);
        if (activos.length) visto[DIGITOS.indexOf(activos[0])] = cifra();
      }
      return visto.join('');
    },
  };
}

describe.skipIf(!CON_BACKEND)('display de 7 segmentos en el simulador', { timeout: 120_000 }, () => {
  it('un dígito: muestra la cifra y se apaga', async () => {
    const p = await placa([alIniciar(mostrar(num(7)), esperar(0.5), mostrar(num(42)), esperar(0.5), { type: 'ab_display_apagar' })]);
    p.correr(200);
    expect(p.cifra()).toBe('7');
    p.correr(500);
    expect(p.cifra()).toBe('2'); // un dígito muestra la última cifra
    p.correr(500);
    expect(p.cifra()).toBe(' ');
  });

  it('cuatro dígitos de cátodo común: cada dígito con su cifra, a 125 vueltas por segundo', async () => {
    const p = await placa([alIniciar(preparar4(), mostrar(num(1234)), esperar(1), mostrar(num(42)))]);
    p.correr(100);
    expect(p.leer()).toBe('1234');
    // El primer dígito cambia dos veces por vuelta (se activa y se apaga).
    const turnos = p.cambios(9).filter((t) => t > 100);
    const vueltas = turnos.slice(2).map((t, i) => t - turnos[i]);
    expect(Math.min(...vueltas)).toBeGreaterThan(7.9);
    expect(Math.max(...vueltas)).toBeLessThan(8.6);
    p.correr(1000);
    expect(p.leer()).toBe('  42');
  });

  it('cuatro dígitos de ánodo común', async () => {
    const p = await placa([alIniciar(preparar4('anodo'), mostrar(num(905)))], true);
    p.correr(100);
    expect(p.leer()).toBe(' 905');
  });

  it('un contador en el display sigue refrescando con un parpadeo paralelo', async () => {
    const cuenta = { block: { type: 'variables_get', fields: { VAR: { id: 'n' } } } };
    const p = await placa([
      alIniciar(
        preparar4(),
        porSiempre(mostrar(cuenta), { type: 'math_change', fields: { VAR: { id: 'n' } }, inputs: { DELTA: num(1) } }, esperar(0.3)),
      ),
      alIniciar(parpadeo(13, 0.1)),
    ]);
    p.correr(1000);
    expect(p.leer()).toBe('   3');
    const periodos = p.cambios(13).slice(1).map((t, i) => t - p.cambios(13)[i]);
    expect(Math.max(...periodos)).toBeLessThan(105);
  });
});
