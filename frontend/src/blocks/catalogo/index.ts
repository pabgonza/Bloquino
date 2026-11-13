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
import pantallas from './pantallas';
import serie from './serie';
import operadores from './operadores';
import avanzado from './avanzado';
import './variables';
export { TEXTO } from './variables';
import './misBloques';
import { PAQUETES } from '../paquetes';

export const CATEGORIAS: Categoria[] = [
  eventos,
  control,
  luces,
  sonido,
  movimiento,
  sensores,
  pantallas,
  serie,
  operadores,
  // Sin paleta propia: dependen de las variables y los bloques que existan
  // (ver BlocksPanel). Mis bloques, rosada como en Scratch.
  { id: 'variables', color: '#FF8C1A', custom: 'VARIABLE' },
  { id: 'mis_bloques', color: '#FF6680', custom: 'MIS_BLOQUES' },
  avanzado,
];

// Los bloques de cada paquete van al final de su categoría.
for (const p of PAQUETES)
  CATEGORIAS.find((c) => c.id === p.categoria)!.paleta!.push(
    ...p.bloques.map((b) => ({
      kind: 'block',
      type: b.tipo,
      fields: Object.fromEntries(
        b.campos.filter((c) => p.porDefecto?.[c]).map((c) => [c, p.porDefecto![c]]),
      ),
    })),
  );

export const PALETA = {
  kind: 'categoryToolbox',
  contents: CATEGORIAS.map((c) => ({
    kind: 'category',
    name: `%{BKY_AB_CAT_${c.id.toUpperCase()}}`,
    colour: c.color,
    ...(c.paleta ? { contents: c.paleta } : { custom: c.custom }),
  })),
};
