import { categoria, INSTRUCCION, num, pin, txt, valor } from './base';

// Pines de la pantalla LCD cuando el programa no trae «preparar pantalla»:
// los del ejemplo de la librería LiquidCrystal.
export const LCD_PINES = { RS: '12', E: '11', D4: '5', D5: '4', D6: '3', D7: '2' };

export default categoria(
  'pantallas',
  '#5C81A6',
  {
    ab_lcd_preparar: { args: Object.keys(LCD_PINES).map((p) => pin(p)), ...INSTRUCCION },
    ab_lcd_escribir: { args: [valor('VALOR')], ...INSTRUCCION },
    ab_lcd_cursor: { args: [valor('COLUMNA', 'Number'), valor('FILA', 'Number')], ...INSTRUCCION },
    ab_lcd_borrar: INSTRUCCION,
  },
  [
    { type: 'ab_lcd_preparar', fields: LCD_PINES },
    { type: 'ab_lcd_escribir', inputs: { VALOR: txt('hola') } },
    { type: 'ab_lcd_cursor', inputs: { COLUMNA: num(1), FILA: num(2) } },
    'ab_lcd_borrar',
  ],
);
