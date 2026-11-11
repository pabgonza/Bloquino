// Buzzer con tone(): el pin conmuta desde una interrupción del Timer2. Cada
// nota debe sonar con su frecuencia y su duración, y callar al terminar.
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { PartSimulationRegistry } from '../simulation/parts/PartSimulationRegistry';
import '../simulation/parts/ComplexParts';

const OCR2A = 0xb3;
const TCCR2B = 0xb1;
let reloj = 0; // segundos del reloj de audio
let notas: { hz: number; desde: number; hasta?: number }[] = [];

class AudioFalso {
  state = 'running';
  destination = {};
  resume = vi.fn();
  close = vi.fn();
  get currentTime() {
    return reloj;
  }
  createOscillator() {
    const nota = { hz: 0, desde: 0 } as (typeof notas)[number];
    const osc = {
      type: '',
      frequency: { value: 440 },
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: (t: number) => notas.push(Object.assign(nota, { hz: Math.round(osc.frequency.value), desde: t })),
      stop: (t: number) => (nota.hasta = t),
    };
    return osc;
  }
  createGain() {
    return { gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() };
  }
}

let quitar = () => {};
beforeEach(() => {
  reloj = 0;
  notas = [];
  vi.useFakeTimers();
  vi.stubGlobal('AudioContext', AudioFalso);
});
afterEach(() => {
  quitar();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** Buzzer en el pin 8 y una función que simula tone(hz) durante `ms`, cuadro a cuadro. */
function armar() {
  const sim: any = { cpu: { data: new Uint8Array(512), cycles: 0 }, pinManager: { onPwmChange: () => () => {} } };
  let pin = (_: number, __: boolean) => {};
  sim.pinManager.onPinChange = (_: number, cb: typeof pin) => ((pin = cb), () => {});
  quitar = PartSimulationRegistry.get('buzzer')!.attachEvents!(
    { addEventListener: vi.fn(), removeEventListener: vi.fn() } as any,
    sim,
    (nombre: string) => (nombre === '1' ? 8 : null),
  );
  const cuadro = (ciclos: number) => {
    sim.cpu.cycles += ciclos;
    reloj = sim.cpu.cycles / 16e6;
    vi.advanceTimersByTime(ciclos / 16e3);
  };
  return {
    tono(hz: number, ms: number) {
      sim.cpu.data[OCR2A] = Math.round(31250 / hz) - 1;
      sim.cpu.data[TCCR2B] = 0x06; // divisor 256, el que usa tone() para estas notas
      const medio = 8e6 / hz; // ciclos de medio período
      for (let n = 0; n < Math.round((ms * hz) / 500); n++) {
        pin(8, n % 2 === 0);
        cuadro(medio);
      }
    },
    silencio(ms: number) {
      for (let t = 0; t < ms; t += 16) cuadro(16 * 16e3); // cuadros de 16 ms, como el navegador
    },
  };
}

it('una nota de tone() dura lo que dura y después calla', () => {
  const { tono, silencio } = armar();
  tono(440, 300);
  silencio(200);
  expect(notas).toHaveLength(1);
  expect(notas[0].hz).toBeGreaterThan(435);
  expect(notas[0].hz).toBeLessThan(445);
  expect((notas[0].hasta! - notas[0].desde) * 1000).toBeGreaterThan(290);
  expect((notas[0].hasta! - notas[0].desde) * 1000).toBeLessThan(330);
});

it('dos notas seguidas cambian de frecuencia sin encimarse', () => {
  const { tono, silencio } = armar();
  tono(440, 300);
  tono(659, 300);
  silencio(200);
  expect(notas.map((n) => Math.round(n.hz / 20))).toEqual([22, 33]);
  expect(notas[0].hasta! - notas[1].desde).toBeLessThan(0.01);
  expect((notas[1].hasta! - notas[1].desde) * 1000).toBeGreaterThan(290);
  expect((notas[1].hasta! - notas[1].desde) * 1000).toBeLessThan(330);
});

it('la misma nota repetida tras un silencio vuelve a sonar', () => {
  const { tono, silencio } = armar();
  tono(440, 200);
  silencio(200);
  tono(440, 200);
  silencio(200);
  expect(notas).toHaveLength(2);
  expect((notas[1].desde - notas[0].desde) * 1000).toBeGreaterThan(380);
});
