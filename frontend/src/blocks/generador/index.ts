// Arma el sketch desde los scripts (bloques con sombrero) del área de trabajo.
// Los bloques sin sombrero se ignoran. Hay dos modos:
//  - Clásico, con un solo `al iniciar`: lo que cuelga de él antes de
//    `por siempre` va a setup() y el cuerpo de `por siempre` va a loop().
//  - Corrutinas, con varios scripts o un evento de hardware: cada script es
//    una función que avanza hasta su próxima espera y devuelve el control.
import type { Blockly } from '../blockly';
import { SOMBREROS } from '../catalogo';
import { gen } from './bloques';
import { contextoClasico, contextoCorrutinas } from './contexto';

// Corrutinas sin pila, al estilo protothreads: cada punto de espera guarda su
// número de línea en `paso` y deja un `case` para retomar ahí. Exige una
// instrucción por línea, que es como genera este módulo.
const PLANIFICADOR = `// Cada programa es una función que avanza hasta su próxima espera y devuelve
// el control; "paso" recuerda por dónde iba. Así ninguno frena a los demás.
#define EMPEZAR() static int paso = 0; static unsigned long despierta = 0; switch (paso) { case 0:
#define TERMINAR() } paso = -1
#define CEDER() do { paso = __LINE__; return; case __LINE__:; } while (0)
#define ESPERAR(ms) do { despierta = millis() + (unsigned long)(ms); paso = __LINE__; return; case __LINE__: if ((long)(millis() - despierta) < 0) return; } while (0)
#define ESPERAR_HASTA(condicion) do { paso = __LINE__; case __LINE__: if (!(condicion)) return; } while (0)

`;

const seccion = (lineas: Set<string>, separador = '\n') =>
  lineas.size ? [...lineas].join(separador) + '\n\n' : '';
const lineas = (xs: Iterable<string>) => [...xs].map((l) => `  ${l}\n`).join('');
const sangrar = (codigo: string) => codigo && gen.prefixLines(codigo, '  ');

export function generar(ws: Blockly.Workspace, paralelo = false): string {
  const scripts = ws.getTopBlocks(true).filter((b) => SOMBREROS.includes(b.type) && b.isEnabled());
  const clasico =
    !paralelo &&
    (scripts.length === 0 || (scripts.length === 1 && scripts[0].type === 'ab_al_iniciar'));
  const ctx = (gen.ctx = clasico ? contextoClasico() : contextoCorrutinas());
  gen.init(ws);
  let setup = '';
  let loop = '';
  let programas = '';
  if (clasico) {
    for (let b = scripts[0]?.getNextBlock(); b; b = b.getNextBlock()) {
      if (b.type === 'ab_por_siempre' && b.isEnabled()) {
        loop = gen.statementToCode(b, 'DO');
        break;
      }
      setup += gen.blockToCode(b, true);
    }
    // Un bloque que trabaja de fondo (una canción que sigue sonando) pide
    // código en cada vuelta y no convive con delay(): se arma con corrutinas.
    if (ctx.tick.size) return generar(ws, true);
  } else {
    scripts.forEach((script, i) => {
      ctx.locales.clear();
      const pin = script.getFieldValue('PIN');
      if (script.type === 'ab_cuando_boton') ctx.setup.add(`pinMode(${pin}, INPUT_PULLUP);`);
      let cuerpo = gen.blockToCode(script.getNextBlock()) as string;
      if (script.type === 'ab_cuando_boton') {
        // Se repite por cada pulsación. Mientras corre no mira el botón, así
        // que una pulsación a medio camino se ignora.
        cuerpo =
          'while (true) {\n' +
          `  ESPERAR_HASTA(digitalRead(${pin}) == LOW);\n` +
          '  ESPERAR(20);\n' +
          sangrar(cuerpo) +
          `  ESPERAR_HASTA(digitalRead(${pin}) == HIGH);\n` +
          '  ESPERAR(20);\n' +
          '}\n';
      }
      if (script.type === 'ab_cuando_serie') {
        // Se repite mientras haya datos; cede el turno en cada vuelta por si
        // el script no los lee.
        ctx.setup.add('Serial.begin(9600);');
        cuerpo =
          'while (true) {\n' +
          '  ESPERAR_HASTA(Serial.available() > 0);\n' +
          sangrar(cuerpo) +
          '  CEDER();\n' +
          '}\n';
      }
      programas += `void programa${i + 1}() {\n${lineas(ctx.locales)}  EMPEZAR();\n${sangrar(cuerpo)}  TERMINAR();\n}\n\n`;
      loop += `  programa${i + 1}();\n`;
    });
  }
  // Los pinMode van primero, antes de attach y Serial.begin.
  const inicial = [...ctx.setup].sort(
    (a, b) => Number(b.startsWith('pinMode')) - Number(a.startsWith('pinMode')),
  );
  return (
    (clasico
      ? '// Generado desde bloques\n'
      : '// Generado desde bloques (avanzado: varios programas a la vez)\n') +
    seccion(ctx.includes) +
    (clasico ? '' : PLANIFICADOR) +
    seccion(ctx.globales) +
    seccion(ctx.funciones, '\n\n') +
    programas +
    `void setup() {\n${lineas(inicial)}${sangrar(setup)}}\n\n` +
    `void loop() {\n${lineas(ctx.tick)}${loop}}\n`
  );
}
