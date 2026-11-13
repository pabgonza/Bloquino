/**
 * Mis bloques: bloques propios del alumno, contra los escenarios de openspec
 * (bloques/mis-bloques y bloques/editor). El comportamiento en un AVR
 * emulado está en bloques-mis-bloques.integration.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { Blockly } from '../blocks/blockly';
import { PALETA, SOMBREROS, TOPE_SCRIPTS } from '../blocks/catalogo';
import type { Definir, Parte, Uso } from '../blocks/catalogo/misBloques';
import { editar, paleta, revisarRecursion, validar } from '../blocks/misBloques';
import { generar } from '../blocks/generador';
import {
  type B,
  PARPADEAR,
  alIniciar,
  cuerpo,
  defParpadear,
  definir,
  entrada,
  esperar,
  led,
  nombre,
  num,
  numero,
  parpadear,
  parpadeo,
  porSiempre,
  repetir,
  rotulo,
  txt,
  usar,
} from './helpers/bloques';

// ── Bloques de prueba ───────────────────────────────────────────────────────
const COLOR = [nombre('color'), numero('r'), numero('g'), numero('b')];
const pwm = (pin: number, valor: object): B => ({
  type: 'ab_pin_pwm',
  fields: { PIN: String(pin) },
  inputs: { VALOR: valor },
});

// «definir color (r) (g) (b)»: fija los pines 9, 10 y 11.
const defColor = definir(
  'c',
  COLOR,
  pwm(9, entrada('c', 'r')),
  pwm(10, entrada('c', 'g')),
  pwm(11, entrada('c', 'b')),
);
const rojo = usar('c', COLOR, { r: num(255), g: num(0), b: num(0) });
const parpadeaLed = (pin: number, s: number) =>
  repetir(entrada('p', 'veces'), led('HIGH', pin), esperar(s), led('LOW', pin), esperar(s));

const espacios: Blockly.Workspace[] = [];
afterEach(() => espacios.splice(0).forEach((ws) => ws.dispose()));
function area(bloques: B[], variables: B[] = []) {
  const ws = new Blockly.Workspace();
  espacios.push(ws);
  Blockly.serialization.workspaces.load(
    { blocks: { blocks: bloques.map((b, i) => ({ x: 0, y: 300 * i, ...b })) }, variables },
    ws,
  );
  return ws;
}
const sketch = (bloques: B[], variables?: B[]) => generar(area(bloques, variables));
const guardado = (ws: Blockly.Workspace) => Blockly.serialization.workspaces.save(ws);
const unico = <T extends Blockly.Block>(ws: Blockly.Workspace, tipo: string) =>
  ws.getBlocksByType(tipo, false)[0] as T;
const texto = (b: Blockly.Block) =>
  b.inputList.flatMap((i) => [...i.fieldRow.map((f) => f.getText()), ...(i.type === 1 ? ['( )'] : [])]).join(' ');
const tick = () => new Promise((r) => setTimeout(r, 0));

// ── 1. Bloques y paleta ─────────────────────────────────────────────────────
describe('bloques', () => {
  it('definición, uso y entrada se guardan y vuelven iguales', () => {
    const ws = area([defColor, alIniciar(rojo)]);
    const json = guardado(ws);
    const otra = area([]);
    Blockly.serialization.workspaces.load(json, otra);
    expect(guardado(otra)).toEqual(json);
    expect(otra.getBlocksByType('ab_entrada', false)).toHaveLength(6); // 3 fijas y 3 copias
  });

  it('la forma sale de las partes', () => {
    const ws = area([defColor, alIniciar(rojo), defParpadear(), alIniciar(parpadear(3))]);
    const [defC, defP] = ws.getBlocksByType('ab_definir', false);
    expect(texto(defC)).toBe('definir color ( ) ( ) ( )');
    expect(defC.getInputTargetBlock('g')!.getFieldValue('NOMBRE')).toBe('g');
    expect(texto(defP)).toBe('definir parpadear ( ) veces');
    const [usoC, usoP] = ws.getBlocksByType('ab_mi_bloque', false);
    expect(texto(usoC)).toBe('color ( ) ( ) ( )');
    expect(texto(usoP)).toBe('parpadear ( ) veces');
  });

  it('las entradas fijas no se borran; las copias, sí', () => {
    const ws = area([defColor]);
    const [fija, copia] = [
      unico<Definir>(ws, 'ab_definir').getInputTargetBlock('r')!,
      ws.getBlocksByType('ab_entrada', false).find((e) => e.getParent()?.type !== 'ab_definir')!,
    ];
    expect(fija.isDeletable()).toBe(false);
    expect(copia.isDeletable()).toBe(true);
  });
});

describe('paleta', () => {
  const callback = (ws: Blockly.Workspace) => paleta(ws).map((b) => (b as { text?: string }).text ?? (b as { extraState: { partes: Parte[] } }).extraState.partes[0].texto);

  it('va después de Variables y antes de Avanzado, en rosado', () => {
    const nombres = PALETA.contents.map((c) => c.name);
    const i = nombres.indexOf('%{BKY_AB_CAT_MIS_BLOQUES}');
    expect(nombres[i - 1]).toBe('%{BKY_AB_CAT_VARIABLES}');
    expect(nombres[i + 1]).toBe('%{BKY_AB_CAT_AVANZADO}');
    expect(PALETA.contents[i]).toMatchObject({ colour: '#FF6680', custom: 'MIS_BLOQUES' });
  });

  it('sin bloques propios: solo el botón', () => {
    expect(callback(area([]))).toEqual(['%{BKY_AB_CREAR_BLOQUE}']);
  });

  it('con dos bloques propios: el botón y los dos', () => {
    expect(callback(area([defParpadear(), defColor]))).toEqual(['%{BKY_AB_CREAR_BLOQUE}', 'parpadear', 'color']);
  });

  it('el bloque de la paleta trae sus huecos de número en 0', () => {
    const ws = area([defColor]);
    const [, enPaleta] = paleta(ws) as B[];
    const uso = Blockly.serialization.blocks.append(enPaleta as unknown as Blockly.serialization.blocks.State, ws);
    expect(['r', 'g', 'b'].map((e) => uso.getInputTargetBlock(e)?.getFieldValue('NUM'))).toEqual([0, 0, 0]);
  });
});

describe('bloques sin sombrero', () => {
  it('lo que cuelga de «definir» no está suelto; un uso suelto, sí', async () => {
    const ws = area([]);
    // disableOrphans pregunta si se está arrastrando, y un área sin dibujar no lo sabe.
    Object.assign(ws, { isDragging: () => false });
    ws.addChangeListener(Blockly.Events.disableOrphans);
    Blockly.serialization.blocks.append(defParpadear() as unknown as Blockly.serialization.blocks.State, ws);
    const suelto = Blockly.serialization.blocks.append(parpadear(2) as unknown as Blockly.serialization.blocks.State, ws);
    await tick();
    expect(unico(ws, 'ab_repetir').isEnabled()).toBe(true);
    expect(unico(ws, 'ab_led').isEnabled()).toBe(true);
    expect(suelto.isEnabled()).toBe(false);
  });

  it('una definición no cuenta para el tope de programas', () => {
    expect(SOMBREROS).not.toContain('ab_definir');
    const ws = area([...Array.from({ length: TOPE_SCRIPTS }, () => alIniciar()), defColor]);
    expect(ws.getTopBlocks(false).filter((b) => SOMBREROS.includes(b.type))).toHaveLength(TOPE_SCRIPTS);
  });
});

// ── 2. Diálogo, edición y borrado ───────────────────────────────────────────
describe('validación del diálogo', () => {
  const ws = () => area([defParpadear()]);
  it('nombre vacío', () => expect(validar([nombre('  ')], ws())).toBe(Blockly.Msg.AB_FALTA_NOMBRE));
  it('nombre repetido, sin importar tildes ni mayúsculas', () => {
    expect(validar([nombre('Parpadear')], ws())).toBe(Blockly.Msg.AB_NOMBRE_REPETIDO);
    expect(validar([nombre('párpadear')], ws())).toBe(Blockly.Msg.AB_NOMBRE_REPETIDO);
  });
  it('al editar, el nombre propio no cuenta como repetido', () =>
    expect(validar([nombre('parpadear')], ws(), 'p')).toBe(''));
  it('entradas repetidas', () =>
    expect(validar([nombre('mezcla'), numero('a', '1'), numero('a', '2')], ws())).toBe(
      Blockly.Msg.AB_ENTRADA_REPETIDA,
    ));
  it('entrada o rótulo sin texto', () =>
    expect(validar([nombre('mezcla'), rotulo('')], ws())).toBe(Blockly.Msg.AB_FALTA_TEXTO));
  it('un bloque válido', () => expect(validar(COLOR, ws())).toBe(''));
});

describe('editar', () => {
  const conUso = () => {
    const ws = area([defParpadear(), alIniciar(parpadear(3))]);
    return { ws, def: unico<Definir>(ws, 'ab_definir'), uso: unico<Uso>(ws, 'ab_mi_bloque') };
  };

  it('agregar una entrada: el uso pasa a parpadear (3) ( ), con el 3 en su lugar', () => {
    const { def, uso } = conUso();
    editar(def, [...PARPADEAR, numero('espera')]);
    expect(texto(uso)).toBe('parpadear ( ) veces ( )');
    expect(uso.getInputTargetBlock('veces')!.getFieldValue('NUM')).toBe(3);
    expect(uso.getInputTargetBlock('espera')!.getFieldValue('NUM')).toBe(0);
    expect(def.getInputTargetBlock('espera')!.getFieldValue('NOMBRE')).toBe('espera');
  });

  it('renombrar una entrada: el sombrero y sus copias cambian', () => {
    const { ws, def } = conUso();
    editar(def, [nombre('parpadear'), numero('cuantas', 'veces'), rotulo('veces')]);
    const nombres = ws.getBlocksByType('ab_entrada', false).map((e) => e.getFieldValue('NOMBRE'));
    expect(nombres).toEqual(['cuantas', 'cuantas']);
    expect(generar(ws)).toContain('void parpadear(float cuantas)');
    expect(generar(ws)).toContain('vez < cuantas');
  });

  it('quitar una entrada: sus copias valen como fuera de la definición', () => {
    const { ws, def } = conUso();
    editar(def, [nombre('parpadear'), rotulo('veces')]);
    expect(ws.getBlocksByType('ab_entrada', false)).toHaveLength(1); // la fija se va
    expect(generar(ws)).toContain('for (int vez = 0; vez < 0; vez++)');
    expect(generar(ws)).toContain('parpadear();');
  });

  it('Ctrl+Z deshace todo de una vez', async () => {
    const { ws, def } = conUso();
    const antes = guardado(ws);
    await tick();
    ws.clearUndo();
    editar(def, [nombre('pestañear'), numero('cuantas', 'veces'), numero('espera')]);
    await tick();
    ws.undo(false);
    await tick();
    expect(guardado(ws)).toEqual(antes);
    ws.undo(true);
    await tick();
    expect(texto(unico(ws, 'ab_mi_bloque'))).toBe('pestañear ( ) ( )');
  });
});

describe('borrar', () => {
  // vigilar() necesita un área dibujada: aquí se prueba la regla con el mismo evento.
  it('sin usos se borra y sale de la paleta', () => {
    const ws = area([defParpadear()]);
    unico(ws, 'ab_definir').dispose(false);
    expect(paleta(ws)).toHaveLength(1);
  });
});

describe('recursión', () => {
  it('un uso dentro de su propia definición queda deshabilitado y fuera del código', () => {
    const ws = area([definir('p', PARPADEAR, parpadeaLed(13, 0.2), parpadear(2)), alIniciar(parpadear(3))]);
    revisarRecursion(ws);
    const [fuera, dentro] = ws.getBlocksByType('ab_mi_bloque', false).sort((a, b) =>
      a.getRootBlock().type === 'ab_definir' ? 1 : b.getRootBlock().type === 'ab_definir' ? -1 : 0,
    );
    expect(dentro.isEnabled()).toBe(false);
    expect(fuera.isEnabled()).toBe(true);
    const codigo = generar(ws);
    expect(codigo).toContain('parpadear(3);');
    expect(codigo).not.toContain('parpadear(2);');
  });

  it('indirecta: A usa B y B usa A', () => {
    const A = [nombre('a')];
    const Bp = [nombre('b')];
    const ws = area([definir('a', A, usar('b', Bp)), definir('b', Bp, usar('a', A)), alIniciar(usar('a', A))]);
    revisarRecursion(ws);
    const deshabilitados = ws
      .getBlocksByType('ab_mi_bloque', false)
      .filter((u) => !u.isEnabled())
      .map((u) => (u.getRootBlock() as Definir).definicion);
    expect(deshabilitados.sort()).toEqual(['a', 'b']);
    expect(generar(ws)).toContain('a();');
  });
});

// ── 3. Generación ───────────────────────────────────────────────────────────
describe('modo clásico', () => {
  it('un al iniciar y dos definiciones: clásico, con la función color', () => {
    const codigo = sketch([alIniciar(rojo), defColor, defParpadear()]);
    expect(codigo.split('\n')[0]).toBe('// Generado desde bloques');
    expect(codigo).toContain(
      'void color(float r, float g, float b) {\n  analogWrite(9, r);\n  analogWrite(10, g);\n  analogWrite(11, b);\n}',
    );
    expect(cuerpo(codigo, 'setup')).toContain('color(255, 0, 0);');
    expect(codigo).not.toContain('parpadear'); // definida pero sin usar
  });

  it('una entrada fuera de su definición vale 0', () => {
    expect(cuerpo(sketch([alIniciar(pwm(9, entrada('c', 'r'))), defColor]), 'setup')).toContain(
      'analogWrite(9, 0);',
    );
  });

  it('definición vacía: el uso llama a una función vacía', () => {
    const codigo = sketch([alIniciar(parpadear(3)), definir('p', PARPADEAR)]);
    expect(codigo).toContain('void parpadear(float veces) {\n}');
  });

  it('entradas de texto y de sí/no', () => {
    const partes: Parte[] = [
      nombre('avisar'),
      { tipo: 'texto', texto: 'mensaje', id: 'm' },
      rotulo('si'),
      { tipo: 'sino', texto: 'fuerte', id: 'f' },
    ];
    const decir = { type: 'ab_decir', inputs: { VALOR: entrada('x', 'm', 'mensaje', 'texto') } };
    const si = { type: 'ab_si', inputs: { COND: entrada('x', 'f', 'fuerte', 'sino'), DO: { block: led('HIGH') } } };
    const verdadero = { block: { type: 'ab_comparar', fields: { OP: '<' }, inputs: { A: num(1), B: num(2) } } };
    const codigo = sketch([alIniciar(usar('x', partes, { m: txt('hola'), f: verdadero })), definir('x', partes, decir, si)]);
    expect(codigo).toContain('void avisar(String mensaje, bool fuerte) {');
    expect(codigo).toContain('  Serial.println(mensaje);');
    expect(codigo).toContain('  if (fuerte) {');
    expect(cuerpo(codigo, 'setup')).toContain('avisar("hola", 1 < 2);');
  });

  it('nombres que chocan: setup, tone y una variable', () => {
    const codigo = sketch(
      [
        alIniciar(usar('s', [nombre('setup')]), usar('t', [nombre('tone'), numero('cuenta')])),
        definir('s', [nombre('setup')]),
        definir('t', [nombre('tone'), numero('cuenta')]),
      ],
      [{ name: 'cuenta', id: 'v' }],
    );
    expect(codigo).toContain('void setup_bloque() {');
    expect(codigo).toContain('void tone_bloque(float cuenta_entrada) {');
    expect(codigo).toContain('void setup() {');
  });

  it('nombre con tildes y espacios', () => {
    const partes = [nombre('encender luz azúl')];
    expect(sketch([alIniciar(usar('e', partes)), definir('e', partes)])).toContain('void encender_luz_azul() {');
  });
});

describe('modo corrutinas', () => {
  it('dos programas con el mismo bloque: cada uno con sus entradas y contadores', () => {
    const codigo = sketch([
      alIniciar(porSiempre(parpadear(2))),
      alIniciar(porSiempre(parpadear(5))),
      defParpadear(),
    ]);
    expect(codigo).toContain('#define ESPERAR(ms)');
    for (const [programa, veces] of [
      ['programa1', 2],
      ['programa2', 5],
    ] as const)
      expect(cuerpo(codigo, programa)).toEqual([
        'static float parpadear_veces;',
        'static int parpadear_vez;',
        'EMPEZAR();',
        'while (true) {',
        '  // parpadear (veces = ' + veces + ') veces',
        '  parpadear_veces = ' + veces + ';',
        '  for (parpadear_vez = 0; parpadear_vez < parpadear_veces; parpadear_vez++) {',
        '    digitalWrite(13, HIGH);',
        '    ESPERAR(200);',
        '    digitalWrite(13, LOW);',
        '    ESPERAR(200);',
        '  }',
        '  CEDER();',
        '}',
        'TERMINAR();',
      ]);
    expect(codigo).not.toContain('void parpadear(');
  });

  it('repetir dentro de repetir: contadores distintos', () => {
    const codigo = sketch([alIniciar(repetir(num(3), parpadear(2))), alIniciar(parpadeo(12, 1)), defParpadear()]);
    const p1 = cuerpo(codigo, 'programa1');
    expect(p1).toContain('for (vez = 0; vez < 3; vez++) {');
    expect(p1).toContain('  for (parpadear_vez = 0; parpadear_vez < parpadear_veces; parpadear_vez++) {');
  });

  it('un bloque que usa otro: prefijo de los dos', () => {
    const doble = [nombre('doble')];
    const codigo = sketch([
      alIniciar(usar('d', doble)),
      alIniciar(parpadeo(12, 1)),
      definir('d', doble, parpadear(2), parpadear(1)),
      defParpadear(),
    ]);
    expect(cuerpo(codigo, 'programa1')).toContain('doble_parpadear_veces = 2;');
    expect(codigo).toContain('static int doble_parpadear_vez;');
  });

  it('un bloque con un bloque de fondo pasa el programa a corrutinas', () => {
    const fondo = { type: 'ab_empezar_cancion', fields: { CANCION: 'MARIO_BROS', PIN: '8' } };
    const codigo = sketch([alIniciar(usar('n', [nombre('musica')])), definir('n', [nombre('musica')], fondo)]);
    expect(codigo).toContain('#define ESPERAR(ms)');
    expect(cuerpo(codigo, 'programa1')).toContain('// musica');
    expect(cuerpo(codigo, 'loop')).toContain('musica8.update();');
  });
});

describe('pantallas dentro de un bloque propio', () => {
  it('«preparar pantalla» en una definición usada vale como el del programa', () => {
    const escribirEn = [nombre('saludar')];
    const preparar = { type: 'ab_lcd_preparar', fields: { RS: '7', E: '8', D4: '9', D5: '10', D6: '11', D7: '12' } };
    const escribir = { type: 'ab_lcd_escribir', inputs: { VALOR: txt('hola') } };
    const codigo = sketch([alIniciar(usar('s', escribirEn)), definir('s', escribirEn, preparar, escribir)]);
    expect(codigo).toContain('LiquidCrystal lcd(7, 8, 9, 10, 11, 12);');
    expect(codigo).toContain('  lcd.print("hola");');
  });
});
