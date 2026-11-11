/**
 * Panel de bloques: la interfaz de Blockly. Los bloques son la fuente de
 * verdad del programa: cada cambio se guarda en `bloques.json` del grupo de
 * archivos de la placa y regenera su sketch, que el botón Run compila.
 */
import { useEffect, useRef } from 'react';
import { Blockly } from './blockly';
import { CATEGORIAS, PALETA, SOMBREROS, TOPE_SCRIPTS } from './catalogo';
import { generar } from './generador';
import { ARCHIVO_BLOQUES } from './archivo';
import { useEditorStore } from '../store/useEditorStore';

const tema = Blockly.Theme.defineTheme('bloquino', {
  name: 'bloquino',
  base: Blockly.Themes.Zelos,
  blockStyles: {
    ...Object.fromEntries(
      CATEGORIAS.map((c) => [
        c.id,
        { colourPrimary: c.color, hat: c.id === 'eventos' ? 'cap' : '' },
      ]),
    ),
    // Bloques propios de Blockly que usa el catálogo: número, variables y texto.
    math_blocks: { colourPrimary: '#59C059' },
    variable_blocks: { colourPrimary: '#FF8C1A' },
    text_blocks: { colourPrimary: '#7F8C8D' },
  },
  // La página es oscura y la paleta clara: sin esto los nombres heredan el blanco.
  componentStyles: { toolboxForegroundColour: '#333' },
});

// Categoría de la paleta con un punto de color junto al nombre, en vez de la
// barra lateral de Blockly.
class CategoriaConPunto extends Blockly.ToolboxCategory {
  protected override addColourBorder_(color: string) {
    Object.assign((this.iconDom_ as HTMLElement).style, {
      display: 'inline-block',
      visibility: 'visible',
      verticalAlign: 'middle',
      width: '14px',
      height: '14px',
      margin: '0 6px',
      borderRadius: '50%',
      border: '1px solid #fff',
      background: color,
    });
  }
}
Blockly.registry.register(
  Blockly.registry.Type.TOOLBOX_ITEM,
  Blockly.ToolboxCategory.registrationName,
  CategoriaConPunto,
  true,
);

// Programa con el que parte un proyecto sin bloques: el parpadeo del pin 13.
const led = (ESTADO: string, next?: object) => ({
  type: 'ab_led',
  fields: { ESTADO, PIN: '13' },
  next: {
    block: {
      type: 'ab_esperar',
      inputs: { S: { shadow: { type: 'math_number', fields: { NUM: 1 } } } },
      next,
    },
  },
});
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
            inputs: { DO: { block: led('HIGH', { block: led('LOW') }) } },
          },
        },
      },
    ],
  },
};

export default function BlocksPanel() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = Blockly.inject(ref.current!, {
      toolbox: PALETA,
      renderer: 'zelos',
      theme: tema,
      trashcan: true,
    });
    // Los bloques sin sombrero quedan deshabilitados: atenuados y fuera del código.
    ws.addChangeListener(Blockly.Events.disableOrphans);
    // Tope de scripts: es de sombreros en total y Blockly limita por tipo, así
    // que a cada tipo se le permite lo que ya tiene más los cupos que quedan.
    const ajustarTope = () => {
      const cuenta = (tipo: string) => ws.getBlocksByType(tipo, false).length;
      const libres = Math.max(0, TOPE_SCRIPTS - SOMBREROS.reduce((n, t) => n + cuenta(t), 0));
      ws.options.maxInstances = Object.fromEntries(SOMBREROS.map((t) => [t, cuenta(t) + libres]));
    };

    let grupo: string | undefined; // grupo de archivos que muestra el área de trabajo
    let json = JSON.stringify(PARPADEO); // último bloques.json leído o escrito
    const cargar = (contenido: string) => {
      json = contenido;
      Blockly.Events.disable();
      Blockly.serialization.workspaces.load(JSON.parse(contenido), ws);
      Blockly.Events.enable();
      ajustarTope();
    };
    cargar(json);

    // Área de trabajo → bloques.json y sketch del grupo activo.
    const guardar = () => {
      const editor = useEditorStore.getState();
      const archivos = editor.fileGroups[editor.activeGroupId];
      if (!archivos) return;
      json = JSON.stringify(Blockly.serialization.workspaces.save(ws));
      const propio = archivos.find((f) => f.name === ARCHIVO_BLOQUES);
      if (!propio)
        editor.addFileToGroup(editor.activeGroupId, { name: ARCHIVO_BLOQUES, content: json });
      else if (propio.content !== json)
        editor.setGroupFileContent(editor.activeGroupId, propio.id, json);
      const sketch = archivos.find((f) => f.name.endsWith('.ino'));
      const cpp = generar(ws);
      if (sketch && sketch.content !== cpp) editor.setFileContent(sketch.id, cpp);
    };

    // Grupo activo → área de trabajo: al abrir el panel, al agregar o cambiar de
    // placa y al cargar un proyecto. Un grupo sin bloques recibe los actuales.
    const sincronizar = () => {
      const editor = useEditorStore.getState();
      const archivos = editor.fileGroups[editor.activeGroupId];
      const actual = archivos && editor.activeGroupId; // sin placa todavía no hay grupo
      const contenido = archivos?.find((f) => f.name === ARCHIVO_BLOQUES)?.content;
      if (actual === grupo && (contenido ?? json) === json) return;
      grupo = actual;
      if (contenido !== undefined && contenido !== json) cargar(contenido);
      guardar();
    };
    sincronizar();
    const desuscribir = useEditorStore.subscribe(sincronizar);

    ws.addChangeListener((e) => {
      if (e.isUiEvent) return;
      ajustarTope();
      guardar();
    });
    const ro = new ResizeObserver(() => Blockly.svgResize(ws));
    ro.observe(ref.current!);
    return () => {
      desuscribir();
      ro.disconnect();
      ws.dispose();
    };
  }, []);

  return <div ref={ref} style={{ position: 'absolute', inset: 0 }} />;
}
