// Variables de número y de texto. Las de número no llevan tipo (así se guardan
// desde h1) y usan los nombres de bloque de Blockly; las de texto llevan el
// tipo TEXTO y bloques propios. La paleta de la categoría la arma BlocksPanel,
// porque depende de las variables que existan.
import { Blockly } from '../blockly';
import { INSTRUCCION, TEXTO as SALIDA_TEXTO, valor } from './base';

export const TEXTO = 'texto';

/** Campo de variable que solo ofrece las de un tipo ('' = número). */
export const campoVariable = (tipo: string, variable?: string) => ({
  type: 'field_variable',
  name: 'VAR',
  variable,
  variableTypes: [tipo],
  defaultType: tipo,
});

// Los bloques de variable de Blockly ofrecen variables de cualquier tipo: se
// reemplazan por otros iguales que solo listan las de número.
const DE_BLOCKLY = ['variables_get', 'variables_set', 'math_change'];
DE_BLOCKLY.forEach((tipo) => delete Blockly.Blocks[tipo]);
const forma = { style: 'variable_blocks', inputsInline: true };
Blockly.defineBlocksWithJsonArray([
  { type: 'variables_get', message0: '%1', args0: [campoVariable('')], output: null, ...forma },
  {
    type: 'variables_set',
    message0: '%{BKY_VARIABLES_SET}',
    args0: [campoVariable(''), valor('VALUE')],
    ...forma,
    ...INSTRUCCION,
  },
  {
    type: 'math_change',
    message0: '%{BKY_MATH_CHANGE_TITLE}',
    args0: [campoVariable(''), valor('DELTA', 'Number')],
    ...forma,
    ...INSTRUCCION,
  },
  {
    type: 'ab_definir_texto',
    message0: '%{BKY_VARIABLES_SET}',
    args0: [campoVariable(TEXTO), valor('VALUE')],
    ...forma,
    ...INSTRUCCION,
  },
  {
    type: 'ab_variable_texto',
    message0: '%1',
    args0: [campoVariable(TEXTO)],
    ...forma,
    ...SALIDA_TEXTO,
  },
]);
