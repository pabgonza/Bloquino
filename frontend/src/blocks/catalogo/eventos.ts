import { TECLAS } from '../../bloquino/componentes/teclas';
import { categoria, menu, pin } from './base';

// Los sombreros: cada uno encabeza un script. Hasta TOPE_SCRIPTS en total.
const sombreros = {
  ab_al_iniciar: { nextStatement: null },
  ab_cuando_boton: { args: [pin()], nextStatement: null },
  ab_cuando_suelta: { args: [pin()], nextStatement: null },
  ab_cuando_serie: { nextStatement: null },
  ab_cuando_tecla: {
    args: [
      menu('TECLA', [['%{BKY_AB_TECLA_CUALQUIERA}', '*'], ...TECLAS.map(([n]): [string, string] => [n, n])]),
      pin(),
    ],
    nextStatement: null,
  },
};
export const SOMBREROS = Object.keys(sombreros);
export const TOPE_SCRIPTS = 8;

export default categoria('eventos', '#FFBF00', sombreros, [
  'ab_al_iniciar',
  { type: 'ab_cuando_boton', fields: { PIN: '2' } },
  { type: 'ab_cuando_suelta', fields: { PIN: '2' } },
  'ab_cuando_serie',
  { type: 'ab_cuando_tecla', fields: { TECLA: 'OK', PIN: '10' } },
]);
