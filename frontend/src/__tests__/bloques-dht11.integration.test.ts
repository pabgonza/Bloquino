/**
 * DHT11 (h5) de punta a punta: el programa se genera desde bloques, se compila
 * contra el backend con la librería del curso y corre en el simulador AVR de
 * Velxio con el modelo del sensor en el pin 2. Solo con RUN_BLOQUES_COMPILE=1:
 *
 *   RUN_BLOQUES_COMPILE=1 npx vitest run src/__tests__/bloques-dht11.integration.test.ts
 */
import { describe, expect, it } from 'vitest';
import '../bloquino/componentes/dht11';
import { AVRSimulator } from '../simulation/AVRSimulator';
import { PinManager } from '../simulation/PinManager';
import {
  type B,
  CON_BACKEND,
  alIniciar,
  compilar,
  esperar,
  led,
  num,
  parpadeo,
  porSiempre,
  sketch,
} from './helpers/bloques';

const MS = 16_000; // ciclos de CPU por milisegundo (16 MHz)
const decir = (tipo: string): B => ({
  type: 'ab_decir',
  inputs: { VALOR: { block: { type: tipo, fields: { PIN: '2' } } } },
});

/** UNO simulado con el programa cargado y un DHT11 en el pin 2. */
async function placa(bloques: B[]) {
  const sim = new AVRSimulator(new PinManager());
  sim.loadHex((await compilar(sketch(bloques))).hex);
  let serie = '';
  sim.onSerialData = (c) => (serie += c);
  const sensor = { sensor_type: 'dht11', pin: 2, temperature: 23, humidity: 61 };
  sim.lineHub().attach(sensor);
  return {
    sim,
    correr(ms: number) {
      const fin = sim.getCurrentCycles() + ms * MS;
      while (sim.getCurrentCycles() < fin) sim.step();
    },
    ajustar: (valores: { temperature?: number; humidity?: number }) =>
      sim.lineHub().update(2, valores),
    lineas: () => serie.trim().split(/\r?\n/),
  };
}

describe.skipIf(!CON_BACKEND)('DHT11 en el simulador', () => {
  it('el programa lee la temperatura y la humedad del sensor', async () => {
    const p = await placa([
      alIniciar(porSiempre(decir('ab_temperatura'), decir('ab_humedad'), esperar(1))),
    ]);
    p.correr(1500);
    expect(p.lineas().slice(0, 2)).toEqual(['23.00', '61.00']);
  }, 60_000);

  it('un cambio en el sensor aparece en la lectura siguiente, a los 2 s', async () => {
    const p = await placa([alIniciar(porSiempre(decir('ab_temperatura'), esperar(0.5)))]);
    p.correr(400);
    p.ajustar({ temperature: 31 });
    p.correr(4000);
    const lineas = p.lineas();
    // La librería renueva la lectura cada 2 s: las primeras siguen en 23.
    expect(lineas.slice(0, 4)).toEqual(['23.00', '23.00', '23.00', '23.00']);
    expect(lineas.at(-1)).toBe('31.00');
  }, 60_000);

  it('leer el sensor no frena un parpadeo paralelo', async () => {
    const p = await placa([
      alIniciar(porSiempre(decir('ab_temperatura'), esperar(0.1))),
      alIniciar(parpadeo(13, 0.1)),
    ]);
    const cambios: number[] = [];
    p.sim.onPinChangeWithTime = (pin, _estado, ms) => {
      if (pin === 13) cambios.push(ms);
    };
    p.correr(5000);
    const periodos = cambios.slice(1).map((t, i) => t - cambios[i]);
    expect(periodos.length).toBeGreaterThan(40);
    // Cada lectura real (una cada 2 s) bloquea unos 25 ms; el resto va a tiempo.
    expect(Math.max(...periodos)).toBeLessThan(130);
    expect(periodos.filter((d) => d > 105).length).toBeLessThanOrEqual(3);
  }, 60_000);

  it('alarma de fiebre: el LED se enciende cuando la temperatura pasa de 30', async () => {
    const temperatura = { block: { type: 'ab_temperatura', fields: { PIN: '2' } } };
    const p = await placa([
      alIniciar(
        porSiempre(
          {
            type: 'ab_si_sino',
            inputs: {
              COND: {
                block: { type: 'ab_comparar', fields: { OP: '>' }, inputs: { A: temperatura, B: num(30) } },
              },
              DO: { block: led('HIGH', 13) },
              SINO: { block: led('LOW', 13) },
            },
          },
          esperar(0.5),
        ),
      ),
    ]);
    let encendido = false;
    p.sim.onPinChangeWithTime = (pin, estado) => {
      if (pin === 13) encendido = estado;
    };
    p.correr(1000);
    expect(encendido).toBe(false);
    p.ajustar({ temperature: 31 });
    p.correr(3000);
    expect(encendido).toBe(true);
  }, 60_000);
});
