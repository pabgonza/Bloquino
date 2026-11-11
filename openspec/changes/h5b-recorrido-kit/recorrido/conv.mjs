// node conv.mjs s3 [s4 ...]
// Arma los scripts del recorrido en frontend/.recorrido/ (carpeta ignorada por
// git, que el servidor de desarrollo sirve): instalar.js con las ayudas de
// lib.js y un <sesion>.js por cada cuerpo de sesión. Ver README.md.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const salida = join(aqui, '../../../../frontend/.recorrido');
mkdirSync(salida, { recursive: true });
const lib = readFileSync(join(aqui, 'lib.js'), 'utf8');
const nombres = [...lib.matchAll(/^(?:async )?function (\w+)|^const (\w+) =/gm)].map((m) => m[1] ?? m[2]);
writeFileSync(
  join(salida, 'instalar.js'),
  `async (page) => {\n${lib}\npage.__h = { ${nombres.join(', ')} };\nreturn 'ayudas instaladas: ' + Object.keys(page.__h).length;\n}\n`,
);
for (const s of process.argv.slice(2)) {
  const cuerpo = readFileSync(join(aqui, `${s}.js`), 'utf8');
  writeFileSync(
    join(salida, `${s}.js`),
    `async (page) => {\nconst { ${nombres.join(', ')} } = page.__h;\nlog.length = 0;\nconst R = {};\ntry {\n${cuerpo}\n} catch (e) { R.error = String(e.message ?? e).slice(0, 300); }\nR.notas = [...log];\nreturn R;\n}\n`,
  );
}
