/**
 * «esperar [n] segundos o hasta que <c>» (change esperar-o-hasta), contra los
 * escenarios de openspec (bloques/catalogo-base y scripts-paralelos). El
 * comportamiento en un AVR emulado está en bloques-esperar.integration.
 */
import { describe, expect, it } from 'vitest';
import { PALETA } from '../blocks/catalogo';
import { alIniciar, boton, cuerpo, esperarOHasta, led, parpadeo, sketch } from './helpers/bloques';

const MACRO = '#define ESPERAR_O_HASTA(ms, condicion)';

describe('esperar … o hasta que', () => {
  it('va en Control, debajo de «esperar hasta que», con 1 segundo', () => {
    const control = PALETA.contents.find((c) => c.name.includes('CONTROL')) as unknown as { contents: { type: string; inputs?: object }[] };
    const tipos = control.contents.map((b) => b.type);
    expect(tipos.indexOf('ab_esperar_o_hasta')).toBe(tipos.indexOf('ab_esperar_hasta') + 1);
    expect(control.contents.find((b) => b.type === 'ab_esperar_o_hasta')!.inputs).toMatchObject({
      S: { shadow: { fields: { NUM: 1 } } },
    });
  });

  it('clásico: espera con millis() que se corta por la condición', () => {
    const codigo = sketch([alIniciar(led('HIGH', 12), esperarOHasta(5, boton), led('LOW', 12))]);
    expect(cuerpo(codigo, 'setup')).toContain(
      'for (unsigned long desde = millis(); millis() - desde < (unsigned long)(5000) && !(digitalRead(2) == LOW);) {}',
    );
    expect(codigo).not.toContain('delay(');
    expect(codigo).not.toContain(MACRO);
  });

  it('sin condición se comporta como esperar', () => {
    expect(sketch([alIniciar(esperarOHasta(0.5))])).toContain('millis() - desde < (unsigned long)(500) && !(false)');
  });

  it('corrutinas: su macro, solo si se usa, y una espera que cede el turno', () => {
    const codigo = sketch([alIniciar(led('HIGH', 12), esperarOHasta(5, boton), led('LOW', 12)), alIniciar(parpadeo(13, 1))]);
    expect(codigo.match(new RegExp(MACRO.replace(/[()]/g, '\\$&'), 'g'))).toHaveLength(1);
    expect(cuerpo(codigo, 'programa1')).toContain('ESPERAR_O_HASTA(5000, digitalRead(2) == LOW);');
    expect(sketch([alIniciar(parpadeo(12, 1)), alIniciar(parpadeo(13, 1))])).not.toContain(MACRO);
  });

  it('segundos calculados', () => {
    const variable = { block: { type: 'variables_get', fields: { VAR: { id: 'v' } } } };
    const codigo = sketch([alIniciar(esperarOHasta(variable, boton)), alIniciar(parpadeo(13, 1))], [{ name: 'pausa', id: 'v' }]);
    expect(cuerpo(codigo, 'programa1')).toContain('ESPERAR_O_HASTA(pausa * 1000, digitalRead(2) == LOW);');
  });
});
