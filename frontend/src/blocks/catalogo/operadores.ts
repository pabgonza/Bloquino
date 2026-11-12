import { categoria, LOGICO, menu, NUMERO, num, TEXTO, txt, valor } from './base';

// El valor de cada menú es el operador de C++ que se genera.
const binario = (check: string, operadores: [string, string][]) => [
  valor('A', check),
  menu('OP', operadores),
  valor('B', check),
];
const numeros = (...nombres: string[]) => nombres.map((n) => valor(n, 'Number'));

export default categoria(
  'operadores',
  '#59C059',
  {
    ab_aritmetica: {
      args: binario('Number', [
        ['+', '+'],
        ['−', '-'],
        ['×', '*'],
        ['÷', '/'],
      ]),
      ...NUMERO,
    },
    ab_comparar: {
      args: binario('Number', [
        ['<', '<'],
        ['>', '>'],
        ['=', '=='],
      ]),
      ...LOGICO,
    },
    ab_logica: {
      args: binario('Boolean', [
        ['%{BKY_AB_Y}', '&&'],
        ['%{BKY_AB_O}', '||'],
      ]),
      ...LOGICO,
    },
    ab_no: { args: [valor('A', 'Boolean')], ...LOGICO },
    ab_azar: { args: numeros('A', 'B'), ...NUMERO },
    ab_mapear: { args: numeros('X', 'A', 'B', 'C', 'D'), ...NUMERO },
    ab_restringir: { args: numeros('X', 'A', 'B'), ...NUMERO },
    // Sin tipo en las entradas: un número se convierte a texto al generar.
    ab_unir: { args: [valor('A'), valor('B')], ...TEXTO },
    ab_texto_igual: { args: [valor('A'), valor('B')], ...LOGICO },
  },
  [
    { type: 'ab_aritmetica', inputs: { A: num(1), B: num(1) } },
    { type: 'ab_comparar', inputs: { A: num(0), B: num(50) } },
    'ab_logica',
    'ab_no',
    { type: 'ab_azar', inputs: { A: num(1), B: num(10) } },
    { type: 'ab_mapear', inputs: { X: num(50), A: num(0), B: num(100), C: num(0), D: num(180) } },
    { type: 'ab_restringir', inputs: { X: num(50), A: num(0), B: num(100) } },
    { type: 'ab_unir', inputs: { A: txt('hola '), B: txt('mundo') } },
    { type: 'ab_texto_igual', inputs: { A: txt('hola'), B: txt('hola') } },
  ],
);
