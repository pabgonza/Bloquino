// @vitest-environment jsdom
/**
 * Los bloques se guardan con el proyecto (h1): `bloques.json` viaja en el
 * grupo de archivos de la placa, sobrevive exportar a .vlx e importar, y
 * nunca llega al compilador.
 */
import { describe, it, expect } from 'vitest';
import { Blockly } from '../blocks/blockly';
import '../blocks/catalogo';
import { ARCHIVO_BLOQUES } from '../blocks/archivo';
import { useEditorStore } from '../store/useEditorStore';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { buildVlxPayload } from '../utils/vlxFile';
import { deviceFiles } from '../utils/projectOnlyFiles';

const GRUPO = 'group-arduino-uno';
const PROGRAMA = {
  blocks: {
    blocks: [
      {
        type: 'ab_al_iniciar',
        x: 40,
        y: 70,
        next: { block: { type: 'ab_led', fields: { ESTADO: 'HIGH', PIN: '13' } } },
      },
      // Bloque suelto: también se guarda, con su posición.
      { type: 'ab_silenciar', x: 250, y: 15, fields: { PIN: '8' } },
    ],
  },
};

/** Lo que guarda el panel: el área de trabajo serializada. */
function guardar(estado: object) {
  const ws = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(estado, ws);
  const json = JSON.stringify(Blockly.serialization.workspaces.save(ws));
  ws.dispose();
  return json;
}

describe('bloques.json en el proyecto', () => {
  it('no llega al compilador', () => {
    const archivos = [
      { name: 'sketch.ino', content: '' },
      { name: ARCHIVO_BLOQUES, content: '{}' },
    ];
    expect(deviceFiles(archivos).map((f) => f.name)).toEqual(['sketch.ino']);
  });

  it('exportar a .vlx e importar conserva los bloques y sus posiciones', () => {
    const json = guardar(PROGRAMA);
    useSimulatorStore.getState().loadProjectState({
      boards: [
        { id: 'arduino-uno', boardKind: 'arduino-uno', x: 0, y: 0, activeFileGroupId: GRUPO },
      ] as never,
      fileGroups: {
        [GRUPO]: [
          { name: 'sketch.ino', content: '// Generado desde bloques\n' },
          { name: ARCHIVO_BLOQUES, content: json },
        ],
      },
      components: [],
      wires: [],
      activeBoardId: 'arduino-uno',
    });

    // El mismo viaje que hace el archivo: a texto y de vuelta.
    const vlx = JSON.parse(JSON.stringify(buildVlxPayload({ name: 'prueba' })));
    expect(vlx.fileGroups[GRUPO].map((f: { name: string }) => f.name)).toContain(ARCHIVO_BLOQUES);

    useEditorStore.getState().deleteFileGroup(GRUPO);
    useSimulatorStore.getState().loadProjectState(vlx);

    const restaurado = useEditorStore
      .getState()
      .getGroupFiles(GRUPO)
      .find((f) => f.name === ARCHIVO_BLOQUES)!.content;
    expect(restaurado).toBe(json);
    // Cargado en un área de trabajo nueva da los mismos bloques en el mismo lugar.
    expect(guardar(JSON.parse(restaurado))).toBe(json);
    const bloques = JSON.parse(restaurado).blocks.blocks;
    expect(bloques.map((b: { type: string; x: number; y: number }) => [b.type, b.x, b.y])).toEqual([
      ['ab_al_iniciar', 40, 70],
      ['ab_silenciar', 250, 15],
    ]);
  });
});
