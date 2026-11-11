/**
 * Compila cada sketch de referencia de bloques (fixtures/bloques/*.ino) contra
 * el backend, para arduino:avr:uno. Necesita el backend arriba, así que solo
 * corre con RUN_BLOQUES_COMPILE=1 (como RUN_LIBRARY_TESTS):
 *
 *   RUN_BLOQUES_COMPILE=1 npx vitest run src/__tests__/bloques-compile.integration.test.ts
 *
 * El backend se toma de BLOQUES_BACKEND_URL (por defecto http://localhost:3080).
 */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { CON_BACKEND, compilar } from './helpers/bloques';

const DIR = path.resolve(__dirname, 'fixtures/bloques');
const SKETCHES = readdirSync(DIR).filter((f) => f.endsWith('.ino'));

describe.skipIf(!CON_BACKEND)('los sketches de referencia compilan', () => {
  it.each(SKETCHES)('%s', { timeout: 120_000 }, async (archivo) => {
    const { hex } = await compilar(readFileSync(path.join(DIR, archivo), 'utf8'));
    expect(hex).toMatch(/^:/);
  });
});
