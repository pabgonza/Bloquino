// Tema de los bloques: el de Zelos (Scratch) con un estilo por categoría. Lo
// usan el panel de bloques y la vista previa del diálogo de Mis bloques.
import { Blockly } from './blockly';
import { CATEGORIAS } from './catalogo';

export const tema = Blockly.Theme.defineTheme('bloquino', {
  name: 'bloquino',
  base: Blockly.Themes.Zelos,
  blockStyles: {
    ...Object.fromEntries(
      CATEGORIAS.map((c) => [
        c.id,
        { colourPrimary: c.color, hat: c.id === 'eventos' || c.id === 'mis_bloques' ? 'cap' : '' },
      ]),
    ),
    // Bloques propios de Blockly que usa el catálogo: número, variables y texto.
    math_blocks: { colourPrimary: '#59C059' },
    variable_blocks: { colourPrimary: '#FF8C1A' },
    text_blocks: { colourPrimary: '#7F8C8D' },
  },
  // La página es oscura y la paleta clara: sin esto los nombres heredan el blanco.
  componentStyles: { toolboxForegroundColour: '#333' },
  // Letra semigruesa, como Scratch: la negrita de Zelos ensancha los bloques.
  fontStyle: { family: '"Helvetica Neue", "Segoe UI", Helvetica, sans-serif', weight: '500', size: 12 },
});

/** Escala de los bloques en el panel y en la paleta. Scratch usa 0.675. */
export const ESCALA = 0.675;
