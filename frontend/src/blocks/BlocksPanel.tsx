/**
 * Prototipo del spike: panel de bloques (Blockly) que genera el sketch
 * Arduino y lo escribe en el archivo activo del editor. El botón Run
 * existente recompila porque setCode marca el código como cambiado.
 */
import { useEffect, useRef } from 'react';
import './amdOff';
import * as Blockly from 'blockly';
import * as Es from 'blockly/msg/es';
import './amdOn';
import { useEditorStore } from '../store/useEditorStore';

Blockly.setLocale(Es as unknown as Record<string, string>);

Blockly.defineBlocksWithJsonArray([
  { type: 'ab_al_iniciar', message0: 'al iniciar', nextStatement: null, style: 'evento' },
  {
    type: 'ab_por_siempre',
    message0: 'por siempre %1 %2',
    args0: [{ type: 'input_dummy' }, { type: 'input_statement', name: 'DO' }],
    previousStatement: null,
    style: 'control',
  },
  {
    type: 'ab_esperar',
    message0: 'esperar %1 segundos',
    args0: [{ type: 'field_number', name: 'S', value: 1, min: 0 }],
    previousStatement: null,
    nextStatement: null,
    style: 'control',
  },
  {
    type: 'ab_pin',
    message0: 'poner pin %1 en %2',
    args0: [
      { type: 'field_number', name: 'PIN', value: 13, min: 0, max: 19, precision: 1 },
      { type: 'field_dropdown', name: 'V', options: [['encendido', 'HIGH'], ['apagado', 'LOW']] },
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'salidas',
  },
]);

const tema = Blockly.Theme.defineTheme('arduino_bloques', {
  name: 'arduino_bloques',
  base: Blockly.Themes.Zelos,
  blockStyles: {
    evento: { colourPrimary: '#FFBF00', hat: 'cap' },
    control: { colourPrimary: '#FFAB19' },
    salidas: { colourPrimary: '#4C97FF' },
  },
});

const toolbox = {
  kind: 'flyoutToolbox',
  contents: ['ab_al_iniciar', 'ab_por_siempre', 'ab_esperar', 'ab_pin'].map((type) => ({
    kind: 'block',
    type,
  })),
};

const PARPADEO = {
  blocks: {
    blocks: [
      {
        type: 'ab_al_iniciar',
        x: 30,
        y: 30,
        next: {
          block: {
            type: 'ab_por_siempre',
            inputs: {
              DO: {
                block: {
                  type: 'ab_pin',
                  fields: { PIN: 13, V: 'HIGH' },
                  next: {
                    block: {
                      type: 'ab_esperar',
                      fields: { S: 1 },
                      next: {
                        block: {
                          type: 'ab_pin',
                          fields: { PIN: 13, V: 'LOW' },
                          next: { block: { type: 'ab_esperar', fields: { S: 1 } } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
};

// Generador clásico (un solo script): lo que cuelga de "al iniciar" va a
// setup(); el cuerpo de "por siempre" va a loop().
const gen = new Blockly.CodeGenerator('Arduino');
let pines = new Set<number>();
let cuerpoLoop = '';
gen.scrub_ = (block, code, thisOnly) => {
  const next = block.nextConnection?.targetBlock();
  return code + (next && !thisOnly ? gen.blockToCode(next) : '');
};
gen.forBlock['ab_al_iniciar'] = () => '';
gen.forBlock['ab_por_siempre'] = (b) => {
  cuerpoLoop = gen.statementToCode(b, 'DO');
  return '';
};
gen.forBlock['ab_esperar'] = (b) => `delay(${Math.round(Number(b.getFieldValue('S')) * 1000)});\n`;
gen.forBlock['ab_pin'] = (b) => {
  const pin = Number(b.getFieldValue('PIN'));
  pines.add(pin);
  return `digitalWrite(${pin}, ${b.getFieldValue('V')});\n`;
};

function generar(ws: Blockly.Workspace): string {
  pines = new Set();
  cuerpoLoop = '';
  gen.init(ws);
  const inicio = ws.getTopBlocks(true).find((b) => b.type === 'ab_al_iniciar');
  const codigoSetup = inicio ? (gen.blockToCode(inicio) as string) : '';
  const cuerpoSetup = codigoSetup && gen.prefixLines(codigoSetup, '  ');
  const modos = [...pines].map((p) => `  pinMode(${p}, OUTPUT);\n`).join('');
  return `// Generado desde bloques\nvoid setup() {\n${modos}${cuerpoSetup}}\n\nvoid loop() {\n${cuerpoLoop}}\n`;
}

let guardado: object = PARPADEO;

export default function BlocksPanel() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = Blockly.inject(ref.current!, { toolbox, renderer: 'zelos', theme: tema, trashcan: true });
    Blockly.serialization.workspaces.load(guardado, ws);
    const volcar = () => useEditorStore.getState().setCode(generar(ws));
    volcar();
    ws.addChangeListener((e) => {
      if (e.isUiEvent) return;
      guardado = Blockly.serialization.workspaces.save(ws);
      volcar();
    });
    const ro = new ResizeObserver(() => Blockly.svgResize(ws));
    ro.observe(ref.current!);
    return () => {
      ro.disconnect();
      ws.dispose();
    };
  }, []);

  return <div ref={ref} style={{ position: 'absolute', inset: 0 }} />;
}
