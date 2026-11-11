// Generador clásico (un solo script): arma el sketch desde el bloque
// `al iniciar`. Lo que cuelga de él antes de `por siempre` va a setup(); el
// cuerpo de `por siempre` va a loop(). Los bloques sin sombrero se ignoran.
import type { Blockly } from '../blockly';
import { gen } from './bloques';
import { contextoClasico } from './contexto';

const seccion = (lineas: Set<string>, separador = '\n') =>
  lineas.size ? [...lineas].join(separador) + '\n\n' : '';
const sangrado = (lineas: Iterable<string>) => [...lineas].map((l) => `  ${l}\n`).join('');

export function generar(ws: Blockly.Workspace, ctx = contextoClasico()): string {
  gen.ctx = ctx;
  gen.init(ws);
  let setup = '';
  let loop = '';
  const inicio = ws.getTopBlocks(true).find((b) => b.type === 'ab_al_iniciar' && b.isEnabled());
  for (let b = inicio?.getNextBlock(); b; b = b.getNextBlock()) {
    if (b.type === 'ab_por_siempre' && b.isEnabled()) {
      loop = gen.statementToCode(b, 'DO');
      break;
    }
    setup += gen.blockToCode(b, true);
  }
  // Los pinMode van primero, antes de attach y Serial.begin.
  const inicial = [...ctx.setup].sort(
    (a, b) => Number(b.startsWith('pinMode')) - Number(a.startsWith('pinMode')),
  );
  return (
    '// Generado desde bloques\n' +
    seccion(ctx.includes) +
    seccion(ctx.globales) +
    seccion(ctx.funciones, '\n\n') +
    `void setup() {\n${sangrado(inicial)}${setup && gen.prefixLines(setup, '  ')}}\n\n` +
    `void loop() {\n${sangrado(ctx.tick)}${loop}}\n`
  );
}
