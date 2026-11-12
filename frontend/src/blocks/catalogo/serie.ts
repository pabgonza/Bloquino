import { categoria, INSTRUCCION, LOGICO, NUMERO, TEXTO, txt, valor } from './base';

export default categoria(
  'serie',
  '#0FBD8C',
  {
    ab_decir: { args: [valor('VALOR')], ...INSTRUCCION },
    ab_decir_seguido: { args: [valor('VALOR')], ...INSTRUCCION },
    ab_serie_hay: LOGICO,
    ab_serie_numero: NUMERO,
    ab_serie_texto: TEXTO,
  },
  [
    { type: 'ab_decir', inputs: { VALOR: txt('hola') } },
    { type: 'ab_decir_seguido', inputs: { VALOR: txt('hola') } },
    'ab_serie_hay',
    'ab_serie_numero',
    'ab_serie_texto',
  ],
);
