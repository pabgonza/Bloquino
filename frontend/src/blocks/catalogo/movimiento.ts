import { categoria, INSTRUCCION, NUMERO, pin, valor } from './base';

export default categoria(
  'movimiento',
  '#4C97FF',
  {
    ab_servo: { args: [pin(), valor('ANGULO', 'Number')], ...INSTRUCCION },
    // Sombra del ángulo: el campo no deja salir de 0 a 180.
    ab_angulo: {
      args: [{ type: 'field_number', name: 'ANGULO', value: 90, min: 0, max: 180, precision: 1 }],
      ...NUMERO,
    },
  },
  [
    {
      type: 'ab_servo',
      fields: { PIN: '9' },
      inputs: { ANGULO: { shadow: { type: 'ab_angulo' } } },
    },
  ],
);
