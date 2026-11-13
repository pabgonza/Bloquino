/**
 * Panel de bloques: la interfaz de Blockly. Los bloques son la fuente de
 * verdad del programa: cada cambio se guarda en `bloques.json` del grupo de
 * archivos de la placa y regenera su sketch, que el botón Run compila.
 */
import { useEffect, useRef, useState } from 'react';
import { Blockly } from './blockly';
import { PALETA, SOMBREROS, TEXTO, TOPE_SCRIPTS } from './catalogo';
import { num, txt } from './catalogo/base';
import { type Definir, dialogo as dialogoMisBloques } from './catalogo/misBloques';
import { paleta as paletaMisBloques, vigilar } from './misBloques';
import Dialogo from './misBloques/Dialogo';
import { tema } from './tema';
import { generar } from './generador';
import { ARCHIVO_BLOQUES, BLOQUES_INICIALES, esTexto } from './archivo';
import { useEditorStore } from '../store/useEditorStore';
import './bloques.css';

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

export default function BlocksPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const area = useRef<Blockly.WorkspaceSvg>(null);
  // Diálogo de Mis bloques abierto: para crear (sin definición) o para editar.
  const [dialogo, setDialogo] = useState<{ definicion?: Definir } | null>(null);

  useEffect(() => {
    const ws = Blockly.inject(ref.current!, {
      toolbox: PALETA,
      renderer: 'zelos',
      theme: tema,
      trashcan: true,
      // Copia de node_modules/blockly/media: sin esto Blockly pide sus íconos y
      // sonidos a internet, y la sala puede no tenerla.
      media: '/blockly-media/',
    });
    // Paleta de Variables: los dos botones de crear, los bloques de número de
    // Blockly y los de texto. Blockly ofrece «fijar» con el hueco vacío, y sin
    // un valor que editar el alumno no tiene cómo dárselo: aquí sale con un 0.
    ws.registerButtonCallback('CREAR_TEXTO', (boton) =>
      Blockly.Variables.createVariableButtonHandler(boton.getTargetWorkspace(), undefined, TEXTO),
    );
    ws.registerToolboxCategoryCallback('VARIABLE', (w) => {
      const [crear, ...numeros] = Blockly.Variables.flyoutCategory(w);
      const textos = w.getVariableMap().getVariablesOfType(TEXTO);
      const campo = (v: (typeof textos)[number]) => ({ VAR: { name: v.getName(), type: TEXTO } });
      return [
        crear,
        { kind: 'button', text: '%{BKY_AB_CREAR_TEXTO}', callbackkey: 'CREAR_TEXTO' },
        ...numeros.map((b) =>
          (b as { type?: string }).type === 'variables_set'
            ? { ...b, inputs: { VALUE: num(0) } }
            : b,
        ),
        ...(textos.length
          ? [
              {
                kind: 'block',
                type: 'ab_definir_texto',
                gap: 20,
                fields: campo(textos.at(-1)!),
                inputs: { VALUE: txt('hola') },
              },
            ]
          : []),
        ...textos.map((v) => ({ kind: 'block', type: 'ab_variable_texto', gap: 8, fields: campo(v) })),
      ];
    });
    // Mis bloques: su paleta, el diálogo de crear y editar, y sus reglas.
    area.current = ws;
    ws.registerButtonCallback('CREAR_BLOQUE', () => setDialogo({}));
    ws.registerToolboxCategoryCallback('MIS_BLOQUES', paletaMisBloques as () => Blockly.utils.toolbox.FlyoutDefinition);
    dialogoMisBloques.abrir = (definicion) => setDialogo({ definicion });
    vigilar(ws);
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
    let json = BLOQUES_INICIALES; // último bloques.json leído o escrito
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
      const propio = archivos.find((f) => f.name === ARCHIVO_BLOQUES);
      // En modo Texto manda el código escrito a mano: los bloques no lo pisan.
      if (propio && esTexto(propio.content)) return;
      json = JSON.stringify(Blockly.serialization.workspaces.save(ws));
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

  return (
    <>
      <div ref={ref} style={{ position: 'absolute', inset: 0 }} />
      {dialogo && (
        <Dialogo ws={area.current!} definicion={dialogo.definicion} cerrar={() => setDialogo(null)} />
      )}
    </>
  );
}
