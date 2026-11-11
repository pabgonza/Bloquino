// Catálogo de bloques: importarlo define todos los bloques. El orden de
// CATEGORIAS es el de la paleta.
import type { Categoria } from './base';
import eventos from './eventos';
export { SOMBREROS, TOPE_SCRIPTS } from './eventos';
import control from './control';
import luces from './luces';
import sonido from './sonido';
import movimiento from './movimiento';
import sensores from './sensores';
import operadores from './operadores';
import avanzado from './avanzado';

export const CATEGORIAS: Categoria[] = [
  eventos,
  control,
  luces,
  sonido,
  movimiento,
  sensores,
  operadores,
  // Sin paleta propia: Blockly arma "crear variable", definir, cambiar y una por variable.
  { id: 'variables', color: '#FF8C1A' },
  avanzado,
];

export const PALETA = {
  kind: 'categoryToolbox',
  contents: CATEGORIAS.map((c) => ({
    kind: 'category',
    name: `%{BKY_AB_CAT_${c.id.toUpperCase()}}`,
    colour: c.color,
    ...(c.paleta ? { contents: c.paleta } : { custom: 'VARIABLE' }),
  })),
};
