/**
 * Pantallas (h8): bloques de la LCD 16x2 contra los escenarios de openspec
 * (bloques/lcd). El comportamiento con el LCD simulado está en
 * bloques-pantallas.integration.
 */
import { describe, expect, it } from 'vitest';
import { PALETA } from '../blocks/catalogo';
import { alIniciar, cuerpo, cursor, escribir, num, preparar, sketch, txt } from './helpers/bloques';


describe('pantalla LCD', () => {
  it('la categoría Pantallas trae los cuatro bloques, con los pines del ejemplo de la librería', () => {
    const pantallas = (
      PALETA.contents.find((c) => c.name.includes('PANTALLAS')) as unknown as {
        contents: { type: string; fields?: Record<string, string> }[];
      }
    ).contents;
    expect(pantallas.map((b) => b.type).slice(0, 4)).toEqual([
      'ab_lcd_preparar',
      'ab_lcd_escribir',
      'ab_lcd_cursor',
      'ab_lcd_borrar',
    ]);
    expect(pantallas[0].fields).toEqual({ RS: '12', E: '11', D4: '5', D5: '4', D6: '3', D7: '2' });
  });

  it('escribir sin preparar usa los pines por defecto', () => {
    const codigo = sketch([alIniciar(escribir(txt('hola')))]);
    expect(codigo).toContain('#include <LiquidCrystal.h>\n\nLiquidCrystal lcd(12, 11, 5, 4, 3, 2);\n');
    expect(cuerpo(codigo, 'setup')).toEqual(['lcd.begin(16, 2);', 'lcd.print("hola");']);
  });

  it('preparar cambia los pines y no agrega líneas propias', () => {
    const codigo = sketch([alIniciar(preparar(7, 8, 9, 10, 11, 12), escribir(txt('hola')))]);
    expect(codigo.match(/^LiquidCrystal .*$/gm)).toEqual(['LiquidCrystal lcd(7, 8, 9, 10, 11, 12);']);
    expect(cuerpo(codigo, 'setup')).toEqual(['lcd.begin(16, 2);', 'lcd.print("hola");']);
  });

  it('un preparar suelto, sin sombrero, no cuenta', () => {
    const codigo = sketch([alIniciar(escribir(txt('hola'))), preparar(7, 8, 9, 10, 11, 12)]);
    expect(codigo).toContain('LiquidCrystal lcd(12, 11, 5, 4, 3, 2);');
  });

  it('columna y fila se cuentan desde 1', () => {
    const variable = { block: { type: 'variables_get', fields: { VAR: { id: 'n' } } } };
    const mover = { type: 'ab_lcd_cursor', inputs: { COLUMNA: variable, FILA: num(2) } };
    expect(cuerpo(sketch([alIniciar(cursor(1, 2), mover)], [{ name: 'x', id: 'n' }]), 'setup').slice(1)).toEqual([
      'lcd.setCursor(0, 1);',
      'lcd.setCursor(x - 1, 1);',
    ]);
  });

  it('un número se escribe como texto, sin decimales si es entero', () => {
    const temperatura = { block: { type: 'ab_temperatura', fields: { PIN: '2' } } };
    const codigo = sketch([alIniciar(escribir(temperatura), { type: 'ab_lcd_borrar' })]);
    expect(cuerpo(codigo, 'setup').slice(-2)).toEqual([
      'lcd.print(aTexto(dht2.readTemperature()));',
      'lcd.clear();',
    ]);
  });
});
