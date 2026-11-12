import { categoria, cuerpo, INSTRUCCION, NUMERO, num, SALTO, valor } from './base';
import { campoVariable } from './variables';

export default categoria(
  'control',
  '#FFAB19',
  {
    ab_por_siempre: { args: [SALTO, cuerpo('DO')], previousStatement: null },
    ab_esperar: { args: [valor('S', 'Number')], ...INSTRUCCION },
    ab_repetir: { args: [valor('VECES', 'Number'), SALTO, cuerpo('DO')], ...INSTRUCCION },
    ab_mientras: { args: [valor('COND', 'Boolean'), SALTO, cuerpo('DO')], ...INSTRUCCION },
    ab_contar: {
      args: [
        campoVariable('', 'i'),
        valor('DESDE', 'Number'),
        valor('HASTA', 'Number'),
        SALTO,
        cuerpo('DO'),
      ],
      ...INSTRUCCION,
    },
    ab_si: { args: [valor('COND', 'Boolean'), SALTO, cuerpo('DO')], ...INSTRUCCION },
    ab_si_sino: {
      args: [valor('COND', 'Boolean'), SALTO, cuerpo('DO'), SALTO, cuerpo('SINO')],
      ...INSTRUCCION,
    },
    ab_esperar_hasta: { args: [valor('COND', 'Boolean')], ...INSTRUCCION },
    ab_cronometro: NUMERO,
    ab_reiniciar_cronometro: INSTRUCCION,
  },
  [
    'ab_por_siempre',
    { type: 'ab_esperar', inputs: { S: num(1) } },
    { type: 'ab_repetir', inputs: { VECES: num(10) } },
    'ab_mientras',
    { type: 'ab_contar', inputs: { DESDE: num(1), HASTA: num(10) } },
    'ab_si',
    'ab_si_sino',
    'ab_esperar_hasta',
    'ab_cronometro',
    'ab_reiniciar_cronometro',
  ],
);
