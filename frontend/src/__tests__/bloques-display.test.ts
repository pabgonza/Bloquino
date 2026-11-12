/**
 * Display de 7 segmentos (h8): bloques de 1 y 4 dígitos contra los escenarios
 * de openspec (bloques/siete-segmentos). El comportamiento con el display
 * simulado está en bloques-display.integration.
 */
import { describe, expect, it } from 'vitest';
import { type B, alIniciar, cuerpo, num, sketch } from './helpers/bloques';

const SEGMENTOS = { A: '2', B: '3', C: '4', D: '5', E: '6', F: '7', G: '8' };
const mostrar = (n: number): B => ({ type: 'ab_display_mostrar', inputs: { NUMERO: num(n) } });
const preparar4 = (COMUN = 'catodo'): B => ({
  type: 'ab_display4_preparar',
  fields: { COMUN, ...SEGMENTOS, D1: '9', D2: '10', D3: '11', D4: '12' },
});

describe('display de 7 segmentos', () => {
  it('un dígito sin preparar: cátodo común en los pines 2 a 8, sin corrutinas', () => {
    const codigo = sketch([alIniciar(mostrar(7), { type: 'ab_display_apagar' })]);
    expect(codigo).toContain('const byte DISPLAY_SEGMENTOS[] = {2, 3, 4, 5, 6, 7, 8};');
    expect(codigo).toContain('digitalWrite(DISPLAY_SEGMENTOS[i], prendido ? HIGH : LOW);');
    expect(cuerpo(codigo, 'setup').slice(-2)).toEqual(['mostrarCifra(abs((int)(7)) % 10);', 'mostrarCifra(-1);']);
    expect(codigo).not.toContain('#define');
    expect(codigo).not.toContain('#include');
  });

  it('preparar de 1 dígito con ánodo común invierte los niveles', () => {
    const preparar = { type: 'ab_display_preparar', fields: { COMUN: 'anodo', ...SEGMENTOS, A: '13' } };
    const codigo = sketch([alIniciar(preparar, mostrar(3))]);
    expect(codigo).toContain('const byte DISPLAY_SEGMENTOS[] = {13, 3, 4, 5, 6, 7, 8};');
    expect(codigo).toContain('digitalWrite(DISPLAY_SEGMENTOS[i], prendido ? LOW : HIGH);');
  });

  it('4 dígitos: guarda el número, refresca en cada vuelta y usa corrutinas', () => {
    const codigo = sketch([alIniciar(preparar4(), mostrar(1234), { type: 'ab_display_apagar' })]);
    expect(codigo).toContain('const byte DISPLAY_DIGITOS[] = {9, 10, 11, 12};');
    expect(codigo).toContain('#define ESPERAR(ms)');
    expect(cuerpo(codigo, 'programa1')).toEqual([
      'EMPEZAR();',
      'displayNumero = constrain(1234, 0, 9999);',
      'displayNumero = -1;',
      'TERMINAR();',
    ]);
    expect(cuerpo(codigo, 'loop')).toEqual(['refrescarDisplay();', 'programa1();']);
    // Cátodo común: el dígito en turno va en bajo y los demás en alto.
    expect(codigo).toMatch(/turno = \(turno \+ 1\) % 4;[\s\S]*digitalWrite\(DISPLAY_DIGITOS\[turno\], LOW\);/);
  });

  it('4 dígitos de ánodo común: el dígito en turno va en alto', () => {
    const codigo = sketch([alIniciar(preparar4('anodo'), mostrar(5))]);
    expect(codigo).toMatch(/mostrarCifra\(visible[^\n]*\n\s*digitalWrite\(DISPLAY_DIGITOS\[turno\], HIGH\);/);
  });
});
