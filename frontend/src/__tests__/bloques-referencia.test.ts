/**
 * Programas de referencia del curso (h1 y h2): cada JSON de bloques de
 * fixtures/bloques genera exactamente su `.ino` esperado. Los mismos `.ino`
 * se compilan contra el backend en bloques-compile.integration.test.ts.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { Blockly } from '../blocks/blockly';
import { generar } from '../blocks/generador';

const DIR = path.resolve(__dirname, 'fixtures/bloques');
const leer = (archivo: string) =>
  readFileSync(path.join(DIR, archivo), 'utf8').replace(/\r\n/g, '\n');
const PROGRAMAS = readdirSync(DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace('.json', ''))
  .sort();

describe('programas de referencia', () => {
  it('están los de h1 y los de h2', () => {
    expect(PROGRAMAS).toEqual([
      'alarma-distancia',
      'barrido-servo',
      'boton-led',
      'dos-parpadeos',
      'mezcla-rgb',
      'ocho-scripts',
      'parpadeo',
      'parpadeo-boton',
      'perilla-servo',
      'semaforo',
      'sirena',
    ]);
  });

  it.each(PROGRAMAS)('%s genera su sketch', (nombre) => {
    const ws = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(JSON.parse(leer(`${nombre}.json`)), ws);
    expect(generar(ws)).toBe(leer(`${nombre}.ino`));
    ws.dispose();
  });
});
