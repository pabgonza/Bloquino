/**
 * Proyectos de ejemplo (frontend/public/ejemplos/*.bloquino): cada uno abre,
 * sus bloques generan el sketch que trae, entre todos usan cada bloque de la
 * paleta y cada componente del kit, y sus cables no se cruzan ni se montan.
 * Con RUN_BLOQUES_COMPILE=1, además compilan contra el backend.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { Blockly } from '../blocks/blockly';
import { CATEGORIAS } from '../blocks/catalogo';
import { generar } from '../blocks/generador';
import { ARCHIVO_BLOQUES } from '../blocks/archivo';
import textos from '../i18n/locales/es/bloquino.json';
import type { Wire } from '../types/wire';
import { getRenderedPoints } from '../utils/wireHitDetection';
import { parseVlxFile } from '../utils/vlxFile';
import { CON_BACKEND, compilar } from './helpers/bloques';

const DIR = path.resolve(__dirname, '../../public/ejemplos');
const EJEMPLOS = readdirSync(DIR)
  .filter((f) => f.endsWith('.bloquino'))
  .sort()
  .map((archivo) => {
    const proyecto = JSON.parse(readFileSync(path.join(DIR, archivo), 'utf8'));
    // Un programa por placa.
    const programas = (Object.values(proyecto.fileGroups) as { name: string; content: string }[][]).map((archivos) => {
      const de = (nombre: string) => archivos.find((a) => a.name === nombre)!.content;
      return { bloques: JSON.parse(de(ARCHIVO_BLOQUES)), ino: de('sketch.ino') };
    });
    return { archivo, proyecto, programas };
  });
const PROGRAMAS = EJEMPLOS.flatMap(({ archivo, programas }) =>
  programas.map((p, i) => ({ ...p, cual: `${archivo} (placa ${i + 1})` })),
);

// Todos los bloques de un programa guardado, con los anidados.
const tipos = (nodo: unknown, salida = new Set<string>()): Set<string> => {
  if (nodo && typeof nodo === 'object') {
    const n = nodo as Record<string, unknown>;
    if (typeof n.type === 'string') salida.add(n.type);
    Object.values(n).forEach((v) => tipos(v, salida));
  }
  return salida;
};

// Cruces permitidos: en la pantalla LCD, RW va a tierra y queda entre RS y E.
const CRUCES: Record<string, number> = { '07-estacion-del-tiempo.bloquino': 1 };

type Punto = { x: number; y: number };
type Tramo = [Punto, Punto];
const tramos = (w: Wire): Tramo[] => {
  const p = getRenderedPoints(w);
  return p.slice(1).map((q, i) => [p[i], q]);
};
const vertical = ([a, b]: Tramo) => Math.abs(a.x - b.x) < 0.5;
const entre = (v: number, a: number, b: number) => v > Math.min(a, b) + 0.5 && v < Math.max(a, b) - 0.5;
const seCruzan = (s: Tramo, t: Tramo) => {
  if (vertical(s) === vertical(t)) return false;
  const [v, h] = vertical(s) ? [s, t] : [t, s];
  return entre(v[0].x, h[0].x, h[1].x) && entre(h[0].y, v[0].y, v[1].y);
};
// Montados: sobre la misma línea (a menos de 3 px) y con más de 1 px en común.
const seMontan = (s: Tramo, t: Tramo) => {
  if (vertical(s) !== vertical(t)) return false;
  const [fijo, largo] = vertical(s) ? (['x', 'y'] as const) : (['y', 'x'] as const);
  if (Math.abs(s[0][fijo] - t[0][fijo]) > 3) return false;
  const comun =
    Math.min(Math.max(s[0][largo], s[1][largo]), Math.max(t[0][largo], t[1][largo])) -
    Math.max(Math.min(s[0][largo], s[1][largo]), Math.min(t[0][largo], t[1][largo]));
  return comun > 1;
};

describe('ejemplos', () => {
  it('son catorce, numerados', () => {
    expect(EJEMPLOS.map((e) => e.archivo.slice(0, 2))).toEqual(
      Array.from({ length: 14 }, (_, i) => String(i + 1).padStart(2, '0')),
    );
  });

  it.each(EJEMPLOS)('$archivo abre como proyecto de placas UNO, cada una con su programa', async ({ archivo, proyecto, programas }) => {
    const leido = await parseVlxFile(new File([JSON.stringify(proyecto)], archivo));
    expect(leido.boards.length).toBeGreaterThan(0);
    expect(leido.boards.every((b) => b.boardKind === 'arduino-uno')).toBe(true);
    expect(programas).toHaveLength(leido.boards.length);
    expect(leido.name).toBe(archivo.replace('.bloquino', ''));
    // Cada cable sale y llega a algo que existe.
    const ids = new Set([
      ...proyecto.boards.map((b: { id: string }) => b.id),
      ...proyecto.components.map((c: { id: string }) => c.id),
    ]);
    for (const w of proyecto.wires as Wire[]) {
      expect(ids.has(w.start.componentId)).toBe(true);
      expect(ids.has(w.end.componentId)).toBe(true);
    }
  });

  it.each(PROGRAMAS)('$cual trae el sketch que generan sus bloques', ({ bloques, ino }) => {
    const ws = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(bloques, ws);
    const generado = generar(ws);
    ws.dispose();
    expect(ino.replace(/\r\n/g, '\n')).toBe(generado);
  });

  it.each(EJEMPLOS)('$archivo no tiene cables cruzados ni montados', ({ archivo, proyecto }) => {
    const cables = (proyecto.wires as (Wire & { bb?: boolean })[]).filter((w) => !w.bb);
    const cruces: string[] = [];
    const montados: string[] = [];
    cables.forEach((a, i) =>
      cables.slice(i + 1).forEach((b) => {
        const par = `${a.start.pinName}→${a.end.pinName} y ${b.start.pinName}→${b.end.pinName}`;
        if (tramos(a).some((s) => tramos(b).some((t) => seCruzan(s, t)))) cruces.push(par);
        if (tramos(a).some((s) => tramos(b).some((t) => seMontan(s, t)))) montados.push(par);
      }),
    );
    expect(montados).toEqual([]);
    expect(cruces).toHaveLength(CRUCES[archivo] ?? 0);
  });

  it('entre todos usan cada bloque de la paleta', () => {
    const usados = new Set(PROGRAMAS.flatMap((p) => [...tipos(p.bloques)]));
    const paleta = [
      ...CATEGORIAS.flatMap((c) => c.paleta ?? []).map((b) => (b as { type: string }).type),
      'variables_set',
      'math_change',
      'variables_get',
      'ab_definir_texto',
      'ab_variable_texto',
      'ab_definir',
      'ab_mi_bloque',
      'ab_entrada',
    ];
    expect([...new Set(paleta)].filter((t) => !usados.has(t))).toEqual([]);
  });

  it('entre todos usan cada componente del kit', () => {
    const usados = new Set(
      EJEMPLOS.flatMap((e) => [
        ...e.proyecto.components.map((c: { metadataId: string }) => c.metadataId),
        ...e.proyecto.boards.map((b: { boardKind: string }) => b.boardKind),
      ]),
    );
    expect(Object.keys(textos.kit).filter((id) => !usados.has(id))).toEqual([]);
  });
});

describe.skipIf(!CON_BACKEND)('ejemplos: compilación', () => {
  it.each(PROGRAMAS)('$cual compila', async ({ ino }) => {
    expect((await compilar(ino)).hex.length).toBeGreaterThan(100);
  }, 60_000);
});
