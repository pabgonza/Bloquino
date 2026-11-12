import { categoria, pin } from './base';

// Los sombreros: cada uno encabeza un script. Hasta TOPE_SCRIPTS en total.
const sombreros = {
  ab_al_iniciar: { nextStatement: null },
  ab_cuando_boton: { args: [pin()], nextStatement: null },
  ab_cuando_serie: { nextStatement: null },
};
export const SOMBREROS = Object.keys(sombreros);
export const TOPE_SCRIPTS = 8;

export default categoria('eventos', '#FFBF00', sombreros, [
  'ab_al_iniciar',
  { type: 'ab_cuando_boton', fields: { PIN: '2' } },
  'ab_cuando_serie',
]);
