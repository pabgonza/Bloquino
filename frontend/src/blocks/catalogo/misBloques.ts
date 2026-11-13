// Mis bloques: bloques propios del alumno, como en Scratch. Tres tipos, con
// la forma armada desde las partes de la definición (extraState):
//  - ab_definir: el sombrero «definir» con el nombre, los rótulos y una
//    entrada fija por cada entrada del bloque; lo que cuelga de él es lo que
//    hace el bloque.
//  - ab_mi_bloque: un uso, con un hueco por entrada (nombrado con su id, así
//    editar conserva lo encajado).
//  - ab_entrada: el valor de una entrada. Arrastrar una fija del sombrero deja
//    una copia.
import { Blockly } from '../blockly';

export type TipoEntrada = 'numero' | 'texto' | 'sino';
export interface Parte {
  tipo: 'nombre' | 'rotulo' | TipoEntrada;
  texto: string;
  id: string;
}
export const esEntrada = (p: Parte) => p.tipo !== 'nombre' && p.tipo !== 'rotulo';

/** Texto como nombre válido de C++: sin tildes ni espacios (`mi cuenta` → `mi_cuenta`). */
export const limpiar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\W/g, '_')
    .replace(/^(\d)/, '_$1');

interface Estado {
  definicion: string;
  partes: Parte[];
}
export type Definir = Blockly.Block & Estado;
export type Uso = Blockly.Block & Estado;
export type Entrada = Blockly.Block & { definicion: string; entrada: string; tipo: TipoEntrada; texto: string };

const SALIDA: Record<TipoEntrada, string> = { numero: 'Number', texto: 'String', sino: 'Boolean' };
const SOMBRA = {
  numero: { type: 'math_number', fields: { NUM: 0 } },
  texto: { type: 'text', fields: { TEXT: '' } },
  sino: null,
};

/** Lo abre BlocksPanel: el diálogo de crear (sin definición) o de editar. */
export const dialogo: { abrir?: (definicion?: Definir) => void } = {};

export const definiciones = (ws: Blockly.Workspace) =>
  ws.getBlocksByType('ab_definir', false) as Definir[];
export const definicion = (ws: Blockly.Workspace, id: string) =>
  definiciones(ws).find((d) => d.definicion === id);
export const usos = (ws: Blockly.Workspace, id: string) =>
  (ws.getBlocksByType('ab_mi_bloque', false) as Uso[]).filter((u) => u.definicion === id);

/**
 * Arma la forma de un bloque desde las partes: los textos seguidos van como
 * rótulo antes de la entrada que sigue; las entradas que ya no están se quitan
 * (lo encajado en ellas queda suelto) y las nuevas pasan por `nueva`.
 */
function armar(b: Blockly.Block & Estado, partes: Parte[], prefijo: string, nueva: (p: Parte, i: Blockly.Input) => void) {
  b.partes = partes;
  for (const i of [...b.inputList]) if (!partes.some((p) => esEntrada(p) && p.id === i.name)) b.removeInput(i.name);
  let rotulo = [prefijo];
  const ubicar = (input: Blockly.Input) => {
    const nombre = `ROTULO_${input.name}`;
    input.removeField(nombre, true);
    const texto = rotulo.filter(Boolean).join(' ');
    if (texto) input.insertFieldAt(0, texto, nombre);
    rotulo = [];
    b.moveInputBefore(input.name, null);
  };
  for (const p of partes) {
    if (!esEntrada(p)) {
      rotulo.push(p.texto);
      continue;
    }
    let input = b.getInput(p.id);
    if (!input) nueva(p, (input = b.appendValueInput(p.id)));
    ubicar(input);
  }
  if (rotulo.length) ubicar(b.appendDummyInput('FIN'));
}

const editar = (definir: () => Definir | undefined) => ({
  text: Blockly.Msg.AB_EDITAR,
  enabled: !!definir(),
  callback: () => dialogo.abrir?.(definir()),
});

Blockly.Blocks.ab_definir = {
  init(this: Definir) {
    this.setStyle('mis_bloques');
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.partes = [];
  },
  saveExtraState(this: Definir) {
    return { id: this.definicion, partes: this.partes };
  },
  loadExtraState(this: Definir, e: { id: string; partes: Parte[] }) {
    this.definicion = e.id;
    armar(this, e.partes, Blockly.Msg.AB_DEFINIR, () => {});
  },
  // Copiarla daría dos definiciones del mismo bloque.
  isCopyable: () => false,
  isDuplicatable: () => false,
  customContextMenu(this: Definir, opciones: object[]) {
    opciones.unshift(editar(() => this));
  },
};

Blockly.Blocks.ab_mi_bloque = {
  init(this: Uso) {
    this.setStyle('mis_bloques');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.partes = [];
  },
  saveExtraState(this: Uso) {
    return { definicion: this.definicion, partes: this.partes };
  },
  loadExtraState(this: Uso, e: Estado) {
    this.definicion = e.definicion;
    armar(this, e.partes, '', (p, input) => {
      if (p.tipo !== 'texto') input.setCheck(SALIDA[p.tipo as TipoEntrada]);
      const sombra = SOMBRA[p.tipo as TipoEntrada];
      if (sombra) input.connection!.setShadowState(sombra);
    });
  },
  customContextMenu(this: Uso, opciones: object[]) {
    opciones.unshift(editar(() => definicion(this.workspace, this.definicion)));
  },
};

/**
 * Arrastrar una entrada fija del sombrero crea una copia en ese punto y
 * arrastra la copia, como hace Blockly al sacar un bloque de la paleta.
 */
class CopiarEntrada extends Blockly.dragging.BlockDragStrategy {
  protected override getTargetBlock() {
    const fija = this.block;
    if (fija.getParent()?.type !== 'ab_definir') return super.getTargetBlock();
    const copia = Blockly.serialization.blocks.append(
      { type: 'ab_entrada', extraState: fija.saveExtraState!() },
      fija.workspace,
      { recordUndo: true },
    ) as Blockly.BlockSvg;
    Blockly.Events.setRecordUndo(false);
    copia.render();
    copia.moveDuringDrag(fija.getRelativeToSurfaceXY());
    copia.setDragging(true);
    Blockly.Events.setRecordUndo(true);
    return copia;
  }
}

Blockly.Blocks.ab_entrada = {
  init(this: Entrada) {
    this.setStyle('mis_bloques');
    this.appendDummyInput().appendField(new Blockly.FieldLabel(''), 'NOMBRE');
    this.setOutput(true);
    if (this instanceof Blockly.BlockSvg) this.setDragStrategy(new CopiarEntrada(this));
  },
  saveExtraState(this: Entrada) {
    const { definicion, entrada, tipo, texto } = this;
    return { definicion, entrada, tipo, texto };
  },
  loadExtraState(this: Entrada, e: Omit<Entrada, keyof Blockly.Block>) {
    Object.assign(this, e);
    this.setFieldValue(e.texto, 'NOMBRE');
    this.setOutput(true, SALIDA[e.tipo]);
  },
};

// Los huecos del sombrero guardan sus entradas fijas: no reciben otros bloques.
class Verificador extends Blockly.ConnectionChecker {
  override doDragChecks(a: Blockly.RenderedConnection, b: Blockly.RenderedConnection, distancia: number) {
    if (b.type === Blockly.ConnectionType.INPUT_VALUE && b.getSourceBlock().type === 'ab_definir') return false;
    return super.doDragChecks(a, b, distancia);
  }
}
Blockly.registry.register(Blockly.registry.Type.CONNECTION_CHECKER, Blockly.registry.DEFAULT, Verificador, true);

/** Entrada fija del sombrero (no se borra ni se copia: se arrastra una copia). */
export const entradaFija = (definicion: string, p: Parte) => ({
  type: 'ab_entrada',
  deletable: false,
  extraState: { definicion, entrada: p.id, tipo: p.tipo, texto: p.texto },
});

/** JSON de una definición nueva, con sus entradas fijas. */
export const nuevaDefinicion = (id: string, partes: Parte[]) => ({
  type: 'ab_definir',
  extraState: { id, partes },
  inputs: Object.fromEntries(partes.filter(esEntrada).map((p) => [p.id, { block: entradaFija(id, p) }])),
});
