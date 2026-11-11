import { Blockly } from '../blockly';
import { categoria, INSTRUCCION, menu, num, pin, valor } from './base';

// Frecuencias (Hz) de dos octavas, de do4 a si5; el valor del menú es la frecuencia.
const FRECUENCIAS = [262, 294, 330, 349, 392, 440, 494, 523, 587, 659, 698, 784, 880, 988];
const nombres = Blockly.Msg['AB_NOTAS'].split(' ');
const NOTAS = FRECUENCIAS.map((f, i): [string, string] => [
  i < 7 ? nombres[i] : Blockly.Msg['AB_NOTA_AGUDA'].replace('%1', nombres[i - 7]),
  String(f),
]);

export default categoria(
  'sonido',
  '#CF63CF',
  {
    ab_tocar_nota: { args: [menu('NOTA', NOTAS), valor('S', 'Number'), pin()], ...INSTRUCCION },
    ab_silenciar: { args: [pin()], ...INSTRUCCION },
  },
  [
    { type: 'ab_tocar_nota', fields: { NOTA: '262', PIN: '8' }, inputs: { S: num(0.5) } },
    { type: 'ab_silenciar', fields: { PIN: '8' } },
  ],
);
