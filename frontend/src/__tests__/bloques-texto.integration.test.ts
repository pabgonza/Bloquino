/**
 * Textos y puerto serie (h8) de punta a punta: el programa se genera desde
 * bloques, se compila contra el backend y corre en el simulador AVR de Velxio,
 * que recibe texto por el puerto serie. Solo con RUN_BLOQUES_COMPILE=1:
 *
 *   RUN_BLOQUES_COMPILE=1 npx vitest run src/__tests__/bloques-texto.integration.test.ts
 */
import { describe, expect, it } from 'vitest';
import { TEXTO } from '../blocks/catalogo';
import { AVRSimulator } from '../simulation/AVRSimulator';
import { PinManager } from '../simulation/PinManager';
import {
  type B,
  CON_BACKEND,
  alIniciar,
  compilar,
  led,
  num,
  parpadeo,
  porSiempre,
  sketch,
} from './helpers/bloques';

const MS = 16_000; // ciclos de CPU por milisegundo (16 MHz)
const VARS = [
  { name: 'orden', id: 't', type: TEXTO },
  { name: 'cuenta', id: 'n' },
];
const txt = (TEXT: string) => ({ block: { type: 'text', fields: { TEXT } } });
const orden = { block: { type: 'ab_variable_texto', fields: { VAR: { id: 't' } } } };
const cuenta = { block: { type: 'variables_get', fields: { VAR: { id: 'n' } } } };
const definir = (id: 't' | 'n', VALUE: object): B => ({
  type: id === 't' ? 'ab_definir_texto' : 'variables_set',
  fields: { VAR: { id } },
  inputs: { VALUE },
});
const unir = (A: object, B: object) => ({ block: { type: 'ab_unir', inputs: { A, B } } });
const decir = (VALOR: object): B => ({ type: 'ab_decir', inputs: { VALOR } });
const siSino = (COND: object, si: B, sino?: B): B => ({
  type: sino ? 'ab_si_sino' : 'ab_si',
  inputs: { COND, DO: { block: si }, ...(sino && { SINO: { block: sino } }) },
});

/** UNO simulado con el programa cargado; `enviar` escribe en su puerto serie. */
async function placa(bloques: B[]) {
  const sim = new AVRSimulator(new PinManager());
  sim.loadHex((await compilar(sketch(bloques, VARS))).hex);
  let serie = '';
  sim.onSerialData = (c) => (serie += c);
  const pines: Record<number, boolean> = {};
  sim.onPinChangeWithTime = (pin, estado) => (pines[pin] = estado);
  const correr = (ms: number) => {
    const fin = sim.getCurrentCycles() + ms * MS;
    while (sim.getCurrentCycles() < fin) sim.step();
  };
  return {
    correr,
    enviar(texto: string, ms = 300) {
      sim.serialWrite(texto);
      correr(ms);
    },
    pin: (n: number) => !!pines[n],
    lineas: () => serie.trim().split(/\r?\n/),
  };
}

describe.skipIf(!CON_BACKEND)('textos y puerto serie en el simulador', { timeout: 120_000 }, () => {
  it('unir muestra los enteros sin decimales y los demás con dos', async () => {
    const p = await placa([
      alIniciar(
        definir('n', num(3)),
        decir(unir(txt('Vueltas: '), cuenta)),
        definir('n', num(2.5)),
        definir('t', unir(unir(txt('van '), cuenta), txt(' litros'))),
        decir(orden),
      ),
    ]);
    p.correr(200);
    expect(p.lineas()).toEqual(['Vueltas: 3', 'van 2.50 litros']);
  });

  it('los textos con tilde llegan bien al monitor', async () => {
    const p = await placa([alIniciar(decir(txt('¡Función número 1!')))]);
    p.correr(200);
    expect(p.lineas()).toEqual(['¡Función número 1!']);
  });

  it('una orden de texto por el puerto serie prende y apaga el LED, sin frenar un parpadeo', async () => {
    const igual = { block: { type: 'ab_texto_igual', inputs: { A: orden, B: txt('encender') } } };
    const p = await placa([
      {
        type: 'ab_cuando_serie',
        next: {
          block: {
            ...definir('t', { block: { type: 'ab_serie_texto' } }),
            next: {
              block: {
                ...siSino(igual, led('HIGH', 13), led('LOW', 13)),
                next: { block: decir(unir(txt('Recibido: '), orden)) },
              },
            },
          },
        },
      },
      alIniciar(parpadeo(12, 0.1)),
    ]);
    p.correr(300);
    expect(p.pin(13)).toBe(false);
    p.enviar('encender\n');
    expect(p.pin(13)).toBe(true);
    p.enviar('apagar\r\n');
    expect(p.pin(13)).toBe(false);
    expect(p.lineas()).toEqual(['Recibido: encender', 'Recibido: apagar']);
  });

  it('leer número: cada línea es un número y no aparecen ceros de más', async () => {
    const leer = definir('n', { block: { type: 'ab_serie_numero' } });
    const doble = decir({
      block: { type: 'ab_aritmetica', fields: { OP: '*' }, inputs: { A: cuenta, B: num(2) } },
    });
    const p = await placa([
      alIniciar(porSiempre(siSino({ block: { type: 'ab_serie_hay' } }, { ...leer, next: { block: doble } }))),
    ]);
    p.correr(100);
    p.enviar('21\n');
    p.enviar('1\n2.5\n');
    expect(p.lineas()).toEqual(['42.00', '2.00', '5.00']);
    // Sin fin de línea, la lectura espera 50 ms y sigue.
    p.enviar('7');
    expect(p.lineas().at(-1)).toBe('14.00');
  });
});
