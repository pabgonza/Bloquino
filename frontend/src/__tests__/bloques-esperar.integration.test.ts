/**
 * «esperar … o hasta que» en un AVR emulado: el programa se genera desde
 * bloques, se compila contra el backend y corre en helpers/avrTestHarness.
 * Solo con RUN_BLOQUES_COMPILE=1:
 *
 *   RUN_BLOQUES_COMPILE=1 npx vitest run src/__tests__/bloques-esperar
 */
import { describe, it, expect } from 'vitest';
import { AVRTestHarness } from './helpers/avrTestHarness';
import { hexToUint8Array } from '../utils/hexParser';
import {
  type B,
  CON_BACKEND,
  alIniciar,
  boton,
  compilar,
  cuandoBoton,
  definir,
  entrada,
  esperarOHasta,
  led,
  nombre,
  num,
  numero,
  porSiempre,
  repetir,
  sketch,
  usar,
} from './helpers/bloques';

const MS = 16_000; // ciclos de CPU por milisegundo (16 MHz)

/** Placa emulada con el programa cargado; el botón va en el pin 2 (puerto D). */
async function placa(bloques: B[], variables?: B[]) {
  const { hex } = await compilar(sketch(bloques, variables));
  const bytes = hexToUint8Array(hex);
  const avr = new AVRTestHarness();
  avr.loadProgram(new Uint16Array(bytes.buffer, 0, bytes.length >> 1));
  const cambios: Record<number, number[]> = {};
  avr.ports.B.addListener((valor, anterior) => {
    for (let bit = 0; bit < 6; bit++)
      if ((valor ^ anterior) & (1 << bit)) (cambios[8 + bit] ??= []).push(avr.cpu.cycles / MS);
  });
  avr.ports.D.setPin(2, true); // botón suelto (pull-up)
  return {
    cambios: (pin: number) => cambios[pin] ?? [],
    ahora: () => avr.cpu.cycles / MS,
    correr: (ms: number) => avr.runCycles(ms * MS),
    boton: (presionado: boolean) => avr.ports.D.setPin(2, !presionado),
  };
}

// LED 12 encendido, «esperar 5 segundos o hasta que botón presionado», LED apagado.
const conLimite = alIniciar(led('HIGH', 12), esperarOHasta(5, boton), led('LOW', 12));

describe.skipIf(!CON_BACKEND)('esperar … o hasta que en un AVR emulado', { timeout: 120_000 }, () => {
  it('clásico: el LED se apaga al apretar el botón', async () => {
    const p = await placa([conLimite]);
    p.correr(1000);
    p.boton(true);
    p.correr(50);
    expect(p.cambios(12)).toHaveLength(2);
    expect(p.cambios(12)[1] - 1000).toBeLessThan(5);
  });

  it('clásico: sin apretar, se apaga a los 5 segundos', async () => {
    const p = await placa([conLimite]);
    p.correr(5100);
    expect(p.cambios(12)).toHaveLength(2);
    expect(p.cambios(12)[1]).toBeGreaterThan(4999);
    expect(p.cambios(12)[1]).toBeLessThan(5010);
  });

  it('corrutinas: el latido de Pablo pasa a la alarma en menos de un segundo', async () => {
    // espera parte en 2,3; el botón la sube en 1; sobre 3, alarma (cada 200 ms).
    const ESPERA = { block: { type: 'variables_get', fields: { VAR: { id: 'e' } } } };
    const mayor = { block: { type: 'ab_comparar', fields: { OP: '>' }, inputs: { A: ESPERA, B: num(3) } } };
    const LATIDO = [nombre('latido'), numero('segundos')];
    const corta = (s: object) => esperarOHasta(s, mayor);
    const p = await placa(
      [
        alIniciar(
          { type: 'variables_set', fields: { VAR: { id: 'e' } }, inputs: { VALUE: num(2.3) } },
          porSiempre({
            type: 'ab_si_sino',
            inputs: {
              COND: mayor,
              DO: { block: { ...led('HIGH', 13), next: { block: { ...corta(num(0.2)), next: { block: { ...led('LOW', 13), next: { block: corta(num(0.2)) } } } } } } },
              SINO: { block: usar('l', LATIDO, { segundos: ESPERA }) },
            },
          }),
        ),
        cuandoBoton(2, { type: 'math_change', fields: { VAR: { id: 'e' } }, inputs: { DELTA: num(1) } }),
        definir('l', LATIDO, repetir(num(2), led('HIGH', 13), corta(entrada('l', 'segundos')), led('LOW', 13), corta(entrada('l', 'segundos'))), corta(num(0.5))),
      ],
      [{ name: 'espera', id: 'e' }],
    );
    p.correr(1000); // en medio de los 2,3 s encendido del latido
    const antes = p.cambios(13).length;
    p.boton(true);
    p.correr(60);
    p.boton(false);
    p.correr(1000);
    const despues = p.cambios(13).slice(antes);
    expect(despues.length).toBeGreaterThanOrEqual(4); // la alarma ya parpadea
    expect(despues[0] - 1000).toBeLessThan(100); // el latido se cortó al tiro
  });
});
