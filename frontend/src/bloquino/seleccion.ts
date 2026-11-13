// Varias piezas seleccionadas a la vez, como en Tinkercad Circuits: Shift + clic
// suma o quita, Ctrl+A junta todo, y mover, girar, borrar, copiar y pegar actúan
// sobre el grupo. Las placas también, con su programa. Velxio sigue llevando su
// `selectedComponentId`: es la pieza «principal» (la ficha la usa).
import { create } from 'zustand';
import { useEditorStore } from '../store/useEditorStore';
import { useSimulatorStore } from '../store/useSimulatorStore';
import type { Wire } from '../types/wire';
import { boardBox, boardSize } from '../utils/boardGeometry';
import textos from '../i18n/locales/es/bloquino.json';
import { girarEnTorno, girarPunto, medioDelDom } from './giroProtoboard';

type Sim = ReturnType<typeof useSimulatorStore.getState>;
type Pieza = Sim['components'][number];
type Placa = Sim['boards'][number];
type Programa = { archivos: { name: string; content: string }[]; carpetas: string[] };
type Foto = Pick<Sim, 'components' | 'wires' | 'boards'> & { programas: Record<string, Programa> };

/** Ids del grupo: componentes y placas. */
export const useGrupo = create<{ ids: string[] }>(() => ({ ids: [] }));

const sim = () => useSimulatorStore.getState();
const esPlaca = (id: string) => sim().boards.some((b) => b.id === id);
export const esAlumno = () => !!globalThis.document?.querySelector('.bq-pagina');
export const enGrupo = (id: string) => useGrupo.getState().ids.includes(id);
export const grupoMultiple = () => useGrupo.getState().ids.length > 1;
/** La última pieza del grupo que no es la placa: la que muestra la ficha. */
export const principal = () => useGrupo.getState().ids.filter((id) => !esPlaca(id)).at(-1) ?? null;

export const fijar = (ids: string[]) => useGrupo.setState({ ids: [...new Set(ids)] });
export const vaciar = () => fijar([]);
export const alternar = (id: string) =>
  fijar(enGrupo(id) ? useGrupo.getState().ids.filter((x) => x !== id) : [...useGrupo.getState().ids, id]);
export const seleccionarTodo = () => fijar([...sim().boards.map((b) => b.id), ...sim().components.map((c) => c.id)]);

/** Componentes asentados en la protoboard `bbId`. */
const jinetes = (bbId: string, wires: Wire[]) =>
  wires.filter((w) => w.bb && w.end.componentId === bbId).map((w) => w.start.componentId);

/**
 * Componentes del grupo que hay que mover o girar uno por uno: sin la placa y
 * sin lo asentado en una protoboard del grupo, que ya lo lleva ella.
 */
function propios(ids = useGrupo.getState().ids) {
  const { components, wires } = sim();
  const llevados = new Set(ids.flatMap((id) => jinetes(id, wires)));
  return components.filter((c) => ids.includes(c.id) && !llevados.has(c.id));
}

/** Ids que se mueven con el grupo: el grupo y lo asentado en sus protoboards. */
function movidos(ids = useGrupo.getState().ids) {
  return new Set([...ids, ...ids.flatMap((id) => jinetes(id, sim().wires))]);
}

/** Cables entre dos piezas del grupo (los de asiento los rehace Velxio). */
const internos = (wires: Wire[], ids: Set<string>) =>
  wires.filter((w) => !w.bb && ids.has(w.start.componentId) && ids.has(w.end.componentId));

// ── Deshacer ──────────────────────────────────────────────────────────────
const editor = () => useEditorStore.getState();
const programa = (b: Placa): Programa => ({
  archivos: editor().getGroupFiles(b.activeFileGroupId).map(({ name, content }) => ({ name, content })),
  carpetas: [...(editor().folderGroups[b.activeFileGroupId] ?? [])],
});
const foto = (): Foto => ({
  components: sim().components,
  wires: sim().wires,
  boards: sim().boards,
  programas: Object.fromEntries(sim().boards.map((b) => [b.id, programa(b)])),
});

/** Crea una placa como `b`, con su id (o uno nuevo si no trae) y el programa `p`. */
function crearPlaca(b: Placa, p: Programa) {
  const id = sim().addBoard(b.boardKind, b.x, b.y, b.id || undefined);
  const grupoArchivos = `group-${id}`;
  useSimulatorStore.setState({
    boards: sim().boards.map((x) =>
      x.id === id ? { ...b, id, activeFileGroupId: grupoArchivos, running: false } : x,
    ),
  });
  editor().deleteFileGroup(grupoArchivos);
  editor().createFileGroup(grupoArchivos, p.archivos);
  if (p.carpetas.length)
    useEditorStore.setState((s) => ({ folderGroups: { ...s.folderGroups, [grupoArchivos]: p.carpetas } }));
  return id;
}

function volverA(f: Foto) {
  // Las placas que faltan vuelven con su programa; de las que siguen, solo
  // posición y giro (el programa y la simulación no son del lienzo).
  const antes = new Map(f.boards.map((b) => [b.id, b]));
  for (const b of sim().boards) if (!antes.has(b.id)) sim().removeBoard(b.id);
  for (const b of f.boards) if (!sim().boards.some((x) => x.id === b.id)) crearPlaca(b, f.programas[b.id]);
  const boards = sim().boards.map((b) => {
    const a = antes.get(b.id)!;
    return { ...b, x: a.x, y: a.y, rotation: a.rotation };
  });
  useSimulatorStore.setState({ components: f.components, wires: f.wires, boards });
  sim().recalculateAllWirePositions();
}

/** Registra lo que cambió desde `antes` como un solo paso de deshacer. */
export function registrar(descripcion: string, antes: Foto) {
  const despues = foto();
  sim().pushCommand(
    { description: descripcion, execute: () => volverA(despues), undo: () => volverA(antes) },
    { applyNow: false },
  );
}
export { foto };

// ── Mover ─────────────────────────────────────────────────────────────────
/** Desplaza el grupo, menos `excepto` (la pieza que el mouse ya movió). */
export function desplazar(dx: number, dy: number, excepto: string) {
  if (!dx && !dy) return;
  const ids = useGrupo.getState().ids;
  const s = sim();
  for (const b of s.boards) if (ids.includes(b.id) && b.id !== excepto) s.setBoardPosition({ x: b.x + dx, y: b.y + dy }, b.id);
  for (const c of propios(ids)) if (c.id !== excepto) s.updateComponent(c.id, { x: c.x + dx, y: c.y + dy } as Partial<Pieza>);
  const dentro = movidos(ids);
  const conPuntos = new Set(internos(sim().wires, dentro).map((w) => w.id));
  useSimulatorStore.setState({
    wires: sim().wires.map((w) =>
      conPuntos.has(w.id) && w.waypoints?.length
        ? { ...w, waypoints: w.waypoints.map((p) => ({ x: p.x + dx, y: p.y + dy })) }
        : w,
    ),
  });
}

// ── Girar ─────────────────────────────────────────────────────────────────
/** Gira 90° las piezas del grupo, la placa incluida, en torno al centro del grupo. */
export function girar(medio = medioDelDom) {
  const ids = useGrupo.getState().ids;
  const piezas = propios(ids).filter((c) => medio(c.id));
  const placas = sim().boards.filter((b) => ids.includes(b.id));
  if (!piezas.length && !placas.length) return;
  const cajas = piezas.map((c) => ({ c, m: medio(c.id)! }));
  const xs = [
    ...cajas.flatMap(({ c, m }) => [c.x, c.x + 2 * m.w]),
    ...placas.flatMap((b) => [boardBox(b).left, boardBox(b).left + boardBox(b).w]),
  ];
  const ys = [
    ...cajas.flatMap(({ c, m }) => [c.y, c.y + 2 * m.h]),
    ...placas.flatMap((b) => [boardBox(b).top, boardBox(b).top + boardBox(b).h]),
  ];
  const centro = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
  const antes = foto();
  // Primero se mueve y después se gira: una protoboard que hace las dos cosas a
  // la vez reasentaría lo suyo a medio camino (corrido, pero sin girar).
  for (const { c } of cajas) {
    const nueva = girarEnTorno(centro, c, 90, medio)!;
    sim().updateComponent(c.id, { x: nueva.x, y: nueva.y } as Partial<Pieza>);
    sim().updateComponent(c.id, { properties: { ...c.properties, rotation: nueva.rotation } } as Partial<Pieza>);
  }
  // La placa gira en torno a su propio centro: se lleva su centro y se gira.
  for (const b of placas) {
    const { w, h } = boardSize(b.boardKind);
    const c = girarPunto(centro, { x: b.x + w / 2, y: b.y + h / 2 }, 90);
    sim().setBoardPosition({ x: c.x - w / 2, y: c.y - h / 2 }, b.id);
    sim().rotateBoard(b.id);
  }
  const dentro = new Set([
    ...placas.map((b) => b.id),
    ...piezas.map((c) => c.id),
    ...piezas.flatMap((c) => jinetes(c.id, sim().wires)),
  ]);
  const conPuntos = new Set(internos(sim().wires, dentro).map((w) => w.id));
  useSimulatorStore.setState({
    wires: sim().wires.map((w) =>
      conPuntos.has(w.id) && w.waypoints?.length ? { ...w, waypoints: w.waypoints.map((p) => girarPunto(centro, p, 90)) } : w,
    ),
  });
  sim().recalculateAllWirePositions();
  registrar('Girar grupo', antes);
}

// ── Borrar ────────────────────────────────────────────────────────────────
/** Borra las piezas con sus cables; si hay placas, antes pide confirmar. */
export function borrar(ids = useGrupo.getState().ids) {
  const quitar = new Set(ids);
  const placas = sim().boards.filter((b) => quitar.has(b.id));
  if (!quitar.size) return;
  if (
    placas.length &&
    !window.confirm(
      placas.length === 1 ? textos.avisoBorrarPlaca : textos.avisoBorrarPlacas.replace('{n}', `${placas.length}`),
    )
  )
    return;
  const antes = foto();
  for (const b of placas) sim().removeBoard(b.id);
  useSimulatorStore.setState({
    components: sim().components.filter((c) => !quitar.has(c.id)),
    wires: sim().wires.filter((w) => !quitar.has(w.start.componentId) && !quitar.has(w.end.componentId)),
  });
  fijar(useGrupo.getState().ids.filter((id) => !quitar.has(id)));
  registrar('Borrar grupo', antes);
}

// ── Copiar y pegar ────────────────────────────────────────────────────────
let copia: { piezas: Pieza[]; placas: { placa: Placa; programa: Programa }[]; cables: Wire[] } | null = null;
let pegadas = 0; // dos pegadas en el mismo milisegundo no repiten ids
export const hayCopia = () => !!copia && !sim().canvasClipboard;
const CORRIDO = 20;

/** Copia las piezas del grupo, las placas con su programa, y los cables entre ellas. */
export function copiar() {
  const ids = new Set(useGrupo.getState().ids);
  if (!ids.size) return;
  copia = {
    piezas: sim().components.filter((c) => ids.has(c.id)),
    placas: sim().boards.filter((b) => ids.has(b.id)).map((placa) => ({ placa, programa: programa(placa) })),
    cables: sim().wires.filter((w) => ids.has(w.start.componentId) && ids.has(w.end.componentId)),
  };
  // Lo último copiado manda: la copia de una sola pieza es la de Velxio.
  useSimulatorStore.setState({ canvasClipboard: null });
}

/** Pega la copia un poco corrida, con ids nuevos, y la deja seleccionada. */
export function pegar() {
  if (!copia) return [];
  const antes = foto();
  const sello = `${Date.now().toString(36)}${(pegadas++).toString(36)}`;
  const nuevoId = new Map(copia.piezas.map((c, i) => [c.id, `${c.id.split('_')[0]}_${sello}_${i}`]));
  // Sin nombre: la página le pone el número libre siguiente (placas.ts).
  const placas = copia.placas.map(({ placa, programa: p }) => {
    const id = crearPlaca({ ...placa, id: '', name: undefined, x: placa.x + CORRIDO, y: placa.y + CORRIDO }, p);
    nuevoId.set(placa.id, id);
    return { placa: sim().boards.find((b) => b.id === id)!, programa: p };
  });
  const piezas = copia.piezas.map((c) => ({ ...c, id: nuevoId.get(c.id)!, x: c.x + CORRIDO, y: c.y + CORRIDO }));
  const cables = copia.cables.map((w, i) => ({
    ...w,
    id: `${w.bb ? 'bbwire' : 'wire'}_${sello}_${i}`,
    start: { ...w.start, componentId: nuevoId.get(w.start.componentId)!, x: w.start.x + CORRIDO, y: w.start.y + CORRIDO },
    end: { ...w.end, componentId: nuevoId.get(w.end.componentId)!, x: w.end.x + CORRIDO, y: w.end.y + CORRIDO },
    waypoints: (w.waypoints ?? []).map((p) => ({ x: p.x + CORRIDO, y: p.y + CORRIDO })),
  }));
  useSimulatorStore.setState({ components: [...sim().components, ...piezas], wires: [...sim().wires, ...cables] });
  // La próxima pegada sale corrida de esta, como en Tinkercad.
  copia = { piezas, placas, cables };
  const ids = [...placas.map(({ placa }) => placa.id), ...piezas.map((c) => c.id)];
  fijar(ids);
  registrar('Pegar grupo', antes);
  return ids;
}

// ── Rectángulo ────────────────────────────────────────────────────────────
type Rect = { left: number; top: number; right: number; bottom: number };
const dentroDe = (r: DOMRect, caja: Rect) =>
  r.width > 0 && r.left >= caja.left && r.right <= caja.right && r.top >= caja.top && r.bottom <= caja.bottom;

/** Suma al grupo las piezas que quedan enteras dentro de `caja` (en pantalla). */
export function seleccionarEn(caja: Rect) {
  const d = globalThis.document;
  const placas = sim().boards.filter((b) => {
    const el = d.querySelector(`[data-board-id="${b.id}"]`);
    return el && dentroDe(el.getBoundingClientRect(), caja);
  });
  const piezas = sim().components.filter((c) => {
    const el = d.getElementById(c.id)?.closest('.dynamic-component-wrapper');
    return el && dentroDe(el.getBoundingClientRect(), caja);
  });
  fijar([...useGrupo.getState().ids, ...placas.map((b) => b.id), ...piezas.map((c) => c.id)]);
}
