// Mis bloques en el área de trabajo: la paleta, crear y editar desde el
// diálogo, la regla de borrado y la de recursión.
import { Blockly } from '../blockly';
import {
  type Definir,
  type Entrada,
  type Parte,
  type Uso,
  definicion,
  definiciones,
  entradaFija,
  esEntrada,
  limpiar,
  nuevaDefinicion,
  usos,
} from '../catalogo/misBloques';

/** Paleta de Mis bloques: el botón de crear y un uso de cada bloque propio. */
export const paleta = (ws: Blockly.Workspace) => [
  { kind: 'button', text: '%{BKY_AB_CREAR_BLOQUE}', callbackkey: 'CREAR_BLOQUE' },
  ...definiciones(ws).map((d) => ({
    kind: 'block',
    type: 'ab_mi_bloque',
    extraState: { definicion: d.definicion, partes: d.partes },
  })),
];

/** Por qué no se pueden aceptar estas partes, o '' si se puede. Los nombres se comparan como quedan en C++. */
export function validar(partes: Parte[], ws: Blockly.Workspace, propia?: string): string {
  const clave = (t: string) => limpiar(t.trim()).toLowerCase();
  const [nombre, ...resto] = partes;
  if (!nombre.texto.trim()) return Blockly.Msg.AB_FALTA_NOMBRE;
  if (definiciones(ws).some((d) => d.definicion !== propia && clave(d.partes[0].texto) === clave(nombre.texto)))
    return Blockly.Msg.AB_NOMBRE_REPETIDO;
  if (resto.some((p) => !p.texto.trim())) return Blockly.Msg.AB_FALTA_TEXTO;
  const entradas = resto.filter(esEntrada).map((p) => clave(p.texto));
  if (new Set(entradas).size < entradas.length) return Blockly.Msg.AB_ENTRADA_REPETIDA;
  return '';
}

const limpias = (partes: Parte[]) => partes.map((p) => ({ ...p, texto: p.texto.trim() }));

/** Crea la definición a la izquierda de lo visible, bajo los bloques que haya ahí, y la lleva a la vista. */
export function crear(ws: Blockly.Workspace, partes: Parte[]) {
  const svg = ws instanceof Blockly.WorkspaceSvg ? ws : undefined;
  const vista = svg?.getMetricsManager().getViewMetrics(true);
  const x = (vista?.left ?? 0) + 30;
  const abajo = (svg?.getTopBlocks(false) ?? [])
    .map((b) => b.getBoundingRectangle())
    .filter((r) => r.left < x + 300 && r.right > x)
    .reduce((y, r) => Math.max(y, r.bottom + 40), (vista?.top ?? 0) + 30);
  const b = Blockly.serialization.blocks.append(
    { ...nuevaDefinicion(Blockly.utils.idGenerator.genUid(), limpias(partes)), x, y: abajo },
    ws,
    { recordUndo: true },
  ) as Definir;
  if (b instanceof Blockly.BlockSvg) {
    b.select();
    svg!.scrollBoundsIntoView(b.getBoundingRectangle());
  }
  return b;
}

/** Cambia la forma de un bloque y lo anota para deshacer. */
function mutar(b: Blockly.Block, cambio: () => void) {
  const antes = JSON.stringify(b.saveExtraState!());
  cambio();
  const despues = JSON.stringify(b.saveExtraState!());
  if (antes !== despues)
    Blockly.Events.fire(new (Blockly.Events.get(Blockly.Events.BLOCK_CHANGE))(b, 'mutation', null, antes, despues));
}

/**
 * Aplica las partes editadas a la definición, sus usos y sus entradas, en un
 * solo paso de deshacer. Las entradas que se mantienen conservan lo encajado.
 */
export function editar(def: Definir, partes: Parte[]) {
  const ws = def.workspace;
  const id = def.definicion;
  partes = limpias(partes);
  const quedan = new Set(partes.filter(esEntrada).map((p) => p.id));
  Blockly.Events.setGroup(true);
  for (const p of def.partes) if (esEntrada(p) && !quedan.has(p.id)) def.getInputTargetBlock(p.id)?.dispose(false);
  mutar(def, () => def.loadExtraState!({ id, partes }));
  for (const p of partes)
    if (esEntrada(p) && !def.getInputTargetBlock(p.id)) {
      const fija = Blockly.serialization.blocks.append(entradaFija(id, p), ws, { recordUndo: true });
      def.getInput(p.id)!.connection!.connect(fija.outputConnection!);
    }
  for (const u of usos(ws, id)) mutar(u, () => u.loadExtraState!({ definicion: id, partes }));
  for (const e of ws.getBlocksByType('ab_entrada', false) as Entrada[]) {
    const p = e.definicion === id && partes.find((q) => q.id === e.entrada);
    if (p) mutar(e, () => e.loadExtraState!({ ...e.saveExtraState!(), texto: p.texto }));
  }
  Blockly.Events.setGroup(false);
}

/** ¿Este uso está dentro de su propia definición, directa o indirectamente? */
export function cierraCiclo(u: Uso) {
  const raiz = u.getRootBlock();
  if (raiz.type !== 'ab_definir') return false;
  // Qué bloques propios usa cada definición en su cuerpo.
  const llama = new Map<string, string[]>();
  for (const v of u.workspace.getBlocksByType('ab_mi_bloque', false) as Uso[]) {
    const r = v.getRootBlock() as Definir;
    if (r.type === 'ab_definir') llama.set(r.definicion, [...(llama.get(r.definicion) ?? []), v.definicion]);
  }
  const vistos = new Set<string>();
  const alcanza = (desde: string): boolean =>
    desde === (raiz as Definir).definicion ||
    (!vistos.has(desde) && !!vistos.add(desde) && (llama.get(desde) ?? []).some(alcanza));
  return alcanza(u.definicion);
}

/** Deshabilita con un aviso los usos que cierran un ciclo; habilita los demás. */
export function revisarRecursion(ws: Blockly.Workspace) {
  const deshacer = Blockly.Events.getRecordUndo();
  Blockly.Events.setRecordUndo(false);
  for (const u of ws.getBlocksByType('ab_mi_bloque', false) as Uso[]) {
    const ciclo = cierraCiclo(u);
    if (ciclo === u.hasDisabledReason('recursion')) continue;
    u.setDisabledReason(ciclo, 'recursion');
    if (u instanceof Blockly.BlockSvg) u.setWarningText(ciclo ? Blockly.Msg.AB_RECURSION : null);
  }
  Blockly.Events.setRecordUndo(deshacer);
}

/**
 * Reglas del área de trabajo: una definición con usos no se borra (vuelve a
 * su lugar y se avisa), la recursión se deshabilita y la paleta se actualiza.
 */
export function vigilar(ws: Blockly.WorkspaceSvg) {
  // Dónde estaba cada definición antes de arrastrarla. Se anota con cualquier
  // evento sin arrastre en curso: el clic que empieza un arrastre selecciona
  // el bloque (un evento) antes de moverlo.
  const lugar = new Map<string, Blockly.utils.Coordinate>();
  ws.addChangeListener((e) => {
    if (!ws.isDragging()) for (const d of definiciones(ws)) lugar.set(d.id, d.getRelativeToSurfaceXY());
    if (e.isUiEvent) return;
    const tipo = (e as Blockly.Events.BlockBase).blockId
      ? (ws.getBlockById((e as Blockly.Events.BlockBase).blockId!)?.type ??
        (e as Blockly.Events.BlockDelete).oldJson?.type)
      : undefined;
    if (e.type === Blockly.Events.BLOCK_DELETE && tipo === 'ab_definir') {
      const json = (e as Blockly.Events.BlockDelete).oldJson as Blockly.serialization.blocks.State & {
        extraState: { id: string };
      };
      if (usos(ws, json.extraState.id).length && !definicion(ws, json.extraState.id)) {
        const donde = lugar.get(json.id!) ?? json;
        Blockly.Events.setGroup(e.group);
        Blockly.serialization.blocks.append({ ...json, x: donde.x, y: donde.y }, ws, { recordUndo: true });
        Blockly.Events.setGroup(false);
        Blockly.dialog.alert(Blockly.Msg.AB_BORRAR_CON_USOS);
      }
    }
    if (tipo === 'ab_definir') ws.refreshToolboxSelection();
    revisarRecursion(ws);
  });
}
