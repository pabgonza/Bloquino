import {
  categoria,
  INSTRUCCION,
  menu,
  NUMERO,
  num,
  pin,
  pinAnalogico,
  pinPwm,
  valor,
} from './base';

export default categoria(
  'avanzado',
  '#7F8C8D',
  {
    ab_pin_digital: {
      args: [
        pin(),
        menu('ESTADO', [
          ['%{BKY_AB_ALTA}', 'HIGH'],
          ['%{BKY_AB_BAJA}', 'LOW'],
        ]),
      ],
      ...INSTRUCCION,
    },
    ab_pin_pwm: { args: [pinPwm(), valor('VALOR', 'Number')], ...INSTRUCCION },
    // Sin tipo de salida: sirve como número (0 / 1) y como condición.
    ab_leer_digital: { args: [pin()], output: null },
    ab_leer_analogico: { args: [pinAnalogico()], ...NUMERO },
    ab_comentario: { args: [{ type: 'field_input', name: 'TEXTO', text: '' }], ...INSTRUCCION },
  },
  [
    { type: 'ab_pin_digital', fields: { PIN: '13' } },
    { type: 'ab_pin_pwm', fields: { PIN: '9' }, inputs: { VALOR: num(255) } },
    'ab_leer_digital',
    'ab_leer_analogico',
    'ab_comentario',
  ],
);
