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

const BACKEND = process.env.BLOQUES_BACKEND_URL ?? 'http://localhost:3080';
const DIR = path.resolve(__dirname, 'fixtures/bloques');
const SKETCHES = readdirSync(DIR).filter((f) => f.endsWith('.ino'));

describe.skipIf(process.env.RUN_BLOQUES_COMPILE !== '1')(
  'los sketches de referencia compilan',
  () => {
    it.each(SKETCHES)('%s', { timeout: 120_000 }, async (archivo) => {
      const inicio = await fetch(`${BACKEND}/api/compile/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: [{ name: 'sketch.ino', content: readFileSync(path.join(DIR, archivo), 'utf8') }],
          board_fqbn: 'arduino:avr:uno',
        }),
      });
      const { job_id } = await inicio.json();
      let trabajo;
      do {
        await new Promise((r) => setTimeout(r, 500));
        trabajo = await (await fetch(`${BACKEND}/api/compile/status/${job_id}`)).json();
      } while (trabajo.state === 'pending' || trabajo.state === 'running');
      expect(trabajo.result?.success, trabajo.result?.stderr ?? trabajo.error).toBe(true);
    });
  },
);
