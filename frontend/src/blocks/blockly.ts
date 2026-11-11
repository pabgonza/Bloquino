// Único punto de entrada a Blockly: es UMD y choca con el cargador AMD de
// Monaco, así que se importa siempre entre amdOff y amdOn. Deja los textos en
// español: los de Blockly y los de los bloques propios (espacio `bloques`).
import './amdOff';
import * as Blockly from 'blockly';
import * as Es from 'blockly/msg/es';
import './amdOn';
import textos from '../i18n/locales/es/bloques.json';

Blockly.setLocale(Es as unknown as Record<string, string>);
Blockly.setLocale(textos);

export { Blockly };
