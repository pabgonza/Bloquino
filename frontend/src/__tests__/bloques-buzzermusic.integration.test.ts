/**
 * Canciones de BuzzerMusic (h6) en un AVR emulado: cada programa se genera
 * desde bloques, se compila contra el backend con la librería instalada
 * (scripts/instalar-librerias.sh) y su .hex corre en helpers/avrTestHarness.
 * Solo con RUN_BLOQUES_COMPILE=1:
 *
 *   RUN_BLOQUES_COMPILE=1 npx vitest run src/__tests__/bloques-buzzermusic.integration.test.ts
 */
import { describe, expect, it } from 'vitest';
import { AVRTestHarness } from './helpers/avrTestHarness';
import { hexToUint8Array } from '../utils/hexParser';
import {
  type B,
  CON_BACKEND,
  alIniciar,
  compilar,
  cuandoBoton,
  led,
  parpadeo,
  porSiempre,
  sketch,
} from './helpers/bloques';

const MS = 16_000; // ciclos de CPU por milisegundo (16 MHz)

/** Placa emulada con el programa cargado. Buzzer en el pin 8; los pines 8 a 13 son el puerto B. */
async function placa(bloques: B[]) {
  const { hex } = await compilar(sketch(bloques));
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
    /** Notas que sonaron en el pin 8: tramos de onda cuadrada separados por más de 5 ms. */
    notas() {
      const notas: { inicio: number; ms: number; hz: number }[] = [];
      let tramo: number[] = [];
      for (const t of [...(cambios[8] ?? []), Infinity]) {
        if (tramo.length > 1 && t - tramo.at(-1)! > 5) {
          const ms = tramo.at(-1)! - tramo[0];
          notas.push({ inicio: tramo[0], ms, hz: ((tramo.length - 1) / 2 / ms) * 1000 });
          tramo = [];
        }
        tramo.push(t);
      }
      return notas;
    },
  };
}

const cancion = (accion: 'tocar' | 'empezar', CANCION: string): B => ({
  type: `ab_${accion}_cancion`,
  fields: { CANCION, PIN: '8' },
});
const detener: B = { type: 'ab_detener_cancion', fields: { PIN: '8' } };
/** Script que enciende el LED del pin 11 mientras la canción suena. */
const avisoSonando = alIniciar(
  porSiempre({
    type: 'ab_si_sino',
    inputs: {
      COND: { block: { type: 'ab_cancion_sonando', fields: { PIN: '8' } } },
      DO: { block: led('HIGH', 11) },
      SINO: { block: led('LOW', 11) },
    },
  }),
);
const periodos = (instantes: number[]) => instantes.slice(1).map((t, i) => t - instantes[i]);
const cerca = (valor: number, esperado: number, tolerancia = 0.03) =>
  expect(Math.abs(valor - esperado) / esperado).toBeLessThan(tolerancia);

describe.skipIf(!CON_BACKEND)('canciones en un AVR emulado', { timeout: 180_000 }, () => {
  it('programa simple: tocar canción hace sonar las notas de Mario Bros', async () => {
    const p = await placa([alIniciar(cancion('tocar', 'MARIO_BROS'))]);
    p.correr(1000);
    // mi7 mi7 · mi7 · do7 mi7 · sol7, a 100 ms por figura (90 ms de sonido).
    const notas = p.notas().slice(0, 6);
    [2637, 2637, 2637, 2093, 2637, 3136].forEach((hz, i) => cerca(notas[i].hz, hz));
    notas.forEach((n) => cerca(n.ms, 90, 0.1));
    expect(notas.map((n) => Math.round(n.inicio / 100))).toEqual([0, 1, 3, 5, 6, 8]);
  });

  it('canción de fondo en un solo script: las notas avanzan y el LED parpadea a su ritmo', async () => {
    const p = await placa([alIniciar(cancion('empezar', 'ODE_TO_JOY'), parpadeo(13, 0.2))]);
    p.correr(2200);
    // mi mi fa sol, negras a 114 por minuto (526 ms, 90 % de sonido).
    const notas = p.notas().slice(0, 4);
    [330, 330, 349, 392].forEach((hz, i) => cerca(notas[i].hz, hz));
    notas.forEach((n) => cerca(n.ms, 474));
    const ritmo = periodos(p.cambios(13));
    expect(ritmo).toHaveLength(10);
    ritmo.forEach((ms) => cerca(ms, 200, 0.02));
  });

  it('tocar canción cede el turno y sigue cuando la canción termina', async () => {
    const p = await placa([
      alIniciar(cancion('tocar', 'HAPPY_BIRTHDAY'), led('HIGH', 12)),
      alIniciar(parpadeo(13, 0.2)),
      avisoSonando,
    ]);
    p.correr(20_000);
    const fin = p.cambios(8).at(-1)!;
    expect(fin).toBeGreaterThan(5000);
    // El LED del pin 12 espera a la última nota; el aviso se apaga con ella.
    expect(p.cambios(12)).toHaveLength(1);
    expect(p.cambios(12)[0] - fin).toBeGreaterThan(0);
    expect(p.cambios(12)[0] - fin).toBeLessThan(300);
    expect(p.cambios(11)).toHaveLength(2);
    expect(p.cambios(11)[0]).toBeLessThan(5);
    cerca(p.cambios(11)[1], p.cambios(12)[0], 0.001);
    periodos(p.cambios(13)).forEach((ms) => cerca(ms, 200, 0.02));
  });

  it('detener canción con un botón calla el buzzer', async () => {
    const p = await placa([
      alIniciar(cancion('empezar', 'ODE_TO_JOY'), parpadeo(13, 0.2)),
      cuandoBoton(2, detener),
      avisoSonando,
    ]);
    p.correr(700);
    expect(p.cambios(8).length).toBeGreaterThan(300);
    p.boton(true);
    p.correr(60);
    p.boton(false);
    const alDetener = p.cambios(8).length;
    p.correr(2000);
    expect(p.cambios(8).length - alDetener).toBeLessThanOrEqual(1);
    // El aviso de "sonando" se encendió al empezar y se apagó al detener.
    expect(p.cambios(11)).toHaveLength(2);
    expect(p.cambios(11)[1]).toBeGreaterThan(700);
    expect(p.cambios(11)[1]).toBeLessThan(760);
  });
});
