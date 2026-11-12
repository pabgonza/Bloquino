/**
 * Control remoto (h8) de punta a punta: el programa se genera desde bloques, se
 * compila contra el backend con TinyIRReceiver (IRremote) y corre en el
 * simulador AVR de Velxio con su receptor infrarrojo en el pin 10; las teclas
 * llegan como tramas NEC por "el aire". Solo con RUN_BLOQUES_COMPILE=1:
 *
 *   RUN_BLOQUES_COMPILE=1 npx vitest run src/__tests__/bloques-control.integration.test.ts
 */
import { describe, expect, it } from 'vitest';
import { TECLAS } from '../bloquino/componentes/teclas';
import { AVRSimulator } from '../simulation/AVRSimulator';
import { PinManager } from '../simulation/PinManager';
import { emitIr } from '../simulation/ir/irAir';
import { necEncode, necEncodeRepeat } from '../simulation/ir/necCodec';
import { PartSimulationRegistry } from '../simulation/parts/PartSimulationRegistry';
import '../simulation/parts/ProtocolParts';
import {
  type B,
  CON_BACKEND,
  alIniciar,
  cadena,
  compilar,
  led,
  num,
  parpadeo,
  sketch,
  txt,
} from './helpers/bloques';

const MS = 16_000; // ciclos de CPU por milisegundo (16 MHz)
const cuandoTecla = (TECLA: string, ...bloques: B[]) =>
  cadena([{ type: 'ab_cuando_tecla', fields: { TECLA, PIN: '10' } }, ...bloques])!;
const valor = (type: string) => ({ block: { type, fields: { PIN: '10' } } });
const unir = (A: object, B: object) => ({ block: { type: 'ab_unir', inputs: { A, B } } });
const comando = (tecla: string) => TECLAS.find(([nombre]) => nombre === tecla)![1];

/** UNO simulado con el receptor infrarrojo en el pin 10. */
async function placa(bloques: B[]) {
  const sim = new AVRSimulator(new PinManager());
  sim.loadHex((await compilar(sketch(bloques))).hex);
  let serie = '';
  sim.onSerialData = (c) => (serie += c);
  const pines: Record<number, boolean> = {};
  const cambios: Record<number, number[]> = {};
  sim.onPinChangeWithTime = (pin, estado, ms) => {
    pines[pin] = estado;
    (cambios[pin] ??= []).push(ms);
  };
  const quitar = PartSimulationRegistry.get('ir-receiver')!.attachEvents!(
    { addEventListener() {}, removeEventListener() {} } as unknown as HTMLElement,
    sim as never,
    (pin) => (pin === 'DAT' ? 10 : null),
    'receptor',
  );
  const correr = (ms: number) => {
    const fin = sim.getCurrentCycles() + ms * MS;
    while (sim.getCurrentCycles() < fin) sim.step();
  };
  correr(100);
  return {
    correr,
    /** Aprieta una tecla; con `repeticiones`, la mantiene apretada. */
    apretar(tecla: string | number, repeticiones = 0) {
      emitIr({ pulses: necEncode(0, typeof tecla === 'number' ? tecla : comando(tecla)), sourceId: 'control' });
      correr(108);
      for (let i = 0; i < repeticiones; i++) {
        emitIr({ pulses: necEncodeRepeat(), sourceId: 'control' });
        correr(108);
      }
      correr(100);
    },
    pin: (n: number) => !!pines[n],
    cambios: (n: number) => cambios[n] ?? [],
    lineas: () => serie.trim().split(/\r?\n/),
    /** Detener e iniciar de nuevo, sin recompilar. */
    reiniciar() {
      sim.reset();
      serie = '';
      correr(100);
    },
    quitar,
  };
}

describe.skipIf(!CON_BACKEND)('control remoto en el simulador', { timeout: 120_000 }, () => {
  it('cada tecla corre su script, y última tecla da su nombre y su código', async () => {
    const p = await placa([
      cuandoTecla('*', {
        type: 'ab_decir',
        inputs: { VALOR: unir(valor('ab_tecla_ultima'), unir(txt(' '), valor('ab_tecla_codigo'))) },
      }),
      cuandoTecla('OK', led('HIGH', 13)),
      cuandoTecla('1', led('LOW', 13)),
      alIniciar(parpadeo(12, 0.1)),
    ]);
    p.apretar('OK');
    expect(p.pin(13)).toBe(true);
    p.apretar('1');
    expect(p.pin(13)).toBe(false);
    p.apretar('volver');
    p.apretar(0x99); // una tecla que no es de este control
    expect(p.lineas()).toEqual(['OK 28', '1 69', 'volver 82', ' 153']);
    const periodos = p.cambios(12).slice(1).map((t, i) => t - p.cambios(12)[i]);
    expect(Math.max(...periodos)).toBeLessThan(110);
    p.quitar();
  });

  it('mantener la tecla apretada cuenta una sola vez', async () => {
    const p = await placa([
      cuandoTecla('5', { type: 'ab_decir', inputs: { VALOR: txt('cinco') } }),
    ]);
    p.apretar('5', 4);
    p.apretar('5');
    expect(p.lineas()).toEqual(['cinco', 'cinco']);
    p.quitar();
  });

  it('el LED del pin 13 es del programa: mantener OK lo deja encendido', async () => {
    const p = await placa([cuandoTecla('OK', led('HIGH', 13)), cuandoTecla('borrar', led('LOW', 13))]);
    p.apretar('OK', 2);
    expect(p.pin(13)).toBe(true);
    p.apretar('borrar', 2);
    expect(p.pin(13)).toBe(false);
    p.quitar();
  });

  it('tras detener e iniciar de nuevo, la primera tecla llega', async () => {
    const p = await placa([cuandoTecla('5', { type: 'ab_decir', inputs: { VALOR: txt('cinco') } })]);
    p.apretar('5');
    p.reiniciar();
    p.apretar('5');
    expect(p.lineas()).toEqual(['cinco']);
    p.quitar();
  });

  it('el control convive con el buzzer: una tecla toca una nota', async () => {
    const nota = { type: 'ab_tocar_nota', fields: { NOTA: '440', PIN: '8' }, inputs: { S: num(0.2) } };
    const p = await placa([cuandoTecla('2', nota)]);
    p.apretar('2');
    p.correr(200);
    expect(p.cambios(8).length).toBeGreaterThan(150); // 440 Hz durante 200 ms
    p.quitar();
  });
});
