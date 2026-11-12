import { categoria, INSTRUCCION, menu, num, pin, txt, valor } from './base';

// Pines de la pantalla LCD cuando el programa no trae «preparar pantalla»:
// los del ejemplo de la librería LiquidCrystal.
export const LCD_PINES = { RS: '12', E: '11', D4: '5', D5: '4', D6: '3', D7: '2' };

// Display de 7 segmentos sin «preparar display»: un dígito de cátodo común.
export const DISPLAY_SEGMENTOS = { A: '2', B: '3', C: '4', D: '5', E: '6', F: '7', G: '8' };
export const DISPLAY_DIGITOS = { D1: '9', D2: '10', D3: '11', D4: '12' };
const comun = menu('COMUN', [
  ['%{BKY_AB_CATODO}', 'catodo'],
  ['%{BKY_AB_ANODO}', 'anodo'],
]);
const segmentos = Object.keys(DISPLAY_SEGMENTOS).map((p) => pin(p));

export default categoria(
  'pantallas',
  '#5C81A6',
  {
    ab_lcd_preparar: { args: Object.keys(LCD_PINES).map((p) => pin(p)), ...INSTRUCCION },
    ab_lcd_escribir: { args: [valor('VALOR')], ...INSTRUCCION },
    ab_lcd_cursor: { args: [valor('COLUMNA', 'Number'), valor('FILA', 'Number')], ...INSTRUCCION },
    ab_lcd_borrar: INSTRUCCION,
    ab_display_preparar: { args: [comun, ...segmentos], ...INSTRUCCION },
    ab_display4_preparar: {
      args: [comun, ...segmentos, { type: 'input_end_row' }, ...Object.keys(DISPLAY_DIGITOS).map((p) => pin(p))],
      ...INSTRUCCION,
    },
    ab_display_mostrar: { args: [valor('NUMERO', 'Number')], ...INSTRUCCION },
    ab_display_apagar: INSTRUCCION,
  },
  [
    { type: 'ab_lcd_preparar', fields: LCD_PINES },
    { type: 'ab_lcd_escribir', inputs: { VALOR: txt('hola') } },
    { type: 'ab_lcd_cursor', inputs: { COLUMNA: num(1), FILA: num(2) } },
    'ab_lcd_borrar',
    { type: 'ab_display_preparar', fields: DISPLAY_SEGMENTOS },
    { type: 'ab_display4_preparar', fields: { ...DISPLAY_SEGMENTOS, ...DISPLAY_DIGITOS } },
    { type: 'ab_display_mostrar', inputs: { NUMERO: num(7) } },
    'ab_display_apagar',
  ],
);
