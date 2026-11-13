/**
 * Ayudantes de los tests de bloques: armar programas como JSON de Blockly,
 * generar su sketch y compilarlo contra el backend.
 */
import { Blockly } from '../../blocks/blockly';
import { generar } from '../../blocks/generador';
import { type Parte, nuevaDefinicion } from '../../blocks/catalogo/misBloques';

export type B = Record<string, unknown>;

/** Enlaza una lista de instrucciones con `next`. */
export const cadena = (bloques: B[]) =>
  bloques.reduceRight<B | undefined>(
    (sig, b) => ({ ...b, ...(sig && { next: { block: sig } }) }),
    undefined,
  );
export const alIniciar = (...bloques: B[]) => cadena([{ type: 'ab_al_iniciar' }, ...bloques])!;
export const cuandoBoton = (pin: number, ...bloques: B[]) =>
  cadena([{ type: 'ab_cuando_boton', fields: { PIN: String(pin) } }, ...bloques])!;
export const cuandoSuelta = (pin: number, ...bloques: B[]) =>
  cadena([{ type: 'ab_cuando_suelta', fields: { PIN: String(pin) } }, ...bloques])!;
export const porSiempre = (...bloques: B[]): B => ({
  type: 'ab_por_siempre',
  inputs: { DO: { block: cadena(bloques) } },
});
export const num = (n: number) => ({ block: { type: 'math_number', fields: { NUM: n } } });
export const led = (estado: 'HIGH' | 'LOW', pin = 13): B => ({
  type: 'ab_led',
  fields: { ESTADO: estado, PIN: String(pin) },
});
export const esperar = (s: number): B => ({ type: 'ab_esperar', inputs: { S: num(s) } });
export const parpadeo = (pin: number, s: number) =>
  porSiempre(led('HIGH', pin), esperar(s), led('LOW', pin), esperar(s));
export const boton = { block: { type: 'ab_boton', fields: { PIN: '2' } } };
export const distancia = {
  block: { type: 'ab_distancia', fields: { DISPARO: '7', ECO: '6' } },
};
export const txt = (TEXT: string) => ({ block: { type: 'text', fields: { TEXT } } });

// Pantalla LCD
export const escribir = (VALOR: object): B => ({ type: 'ab_lcd_escribir', inputs: { VALOR } });
export const cursor = (columna: number, fila: number): B => ({
  type: 'ab_lcd_cursor',
  inputs: { COLUMNA: num(columna), FILA: num(fila) },
});
export const preparar = (...pines: number[]): B => ({
  type: 'ab_lcd_preparar',
  fields: Object.fromEntries(['RS', 'E', 'D4', 'D5', 'D6', 'D7'].map((c, i) => [c, String(pines[i])])),
});

// Mis bloques
export const nombre = (texto: string): Parte => ({ tipo: 'nombre', texto, id: 'n' });
export const numero = (texto: string, id = texto): Parte => ({ tipo: 'numero', texto, id });
export const rotulo = (texto: string): Parte => ({ tipo: 'rotulo', texto, id: `r-${texto}` });
/** Copia de una entrada, para usarla en la definición. */
export const entrada = (definicion: string, id: string, texto = id, tipo = 'numero') => ({
  block: { type: 'ab_entrada', extraState: { definicion, entrada: id, tipo, texto } },
});
/** «definir» con lo que hace debajo. */
export const definir = (id: string, partes: Parte[], ...hace: B[]): B => ({
  ...nuevaDefinicion(id, partes),
  ...(hace.length && { next: { block: cadena(hace) } }),
});
export const usar = (id: string, partes: Parte[], valores: Record<string, object> = {}): B => ({
  type: 'ab_mi_bloque',
  extraState: { definicion: id, partes },
  inputs: valores,
});
export const repetir = (veces: object, ...hace: B[]): B => ({
  type: 'ab_repetir',
  inputs: { VECES: veces, DO: { block: cadena(hace) } },
});
// «definir parpadear (veces) veces»: repetir (veces) [encender, esperar, apagar, esperar].
export const PARPADEAR = [nombre('parpadear'), numero('veces'), rotulo('veces')];
export const defParpadear = (pin = 13, s = 0.2) =>
  definir('p', PARPADEAR, repetir(entrada('p', 'veces'), led('HIGH', pin), esperar(s), led('LOW', pin), esperar(s)));
export const parpadear = (veces: number) => usar('p', PARPADEAR, { veces: num(veces) });

/** Sketch de un programa. Los scripts quedan en el orden dado, de arriba hacia abajo. */
export function sketch(bloques: B[], variables: B[] = []) {
  const ws = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(
    { blocks: { blocks: bloques.map((b, i) => ({ x: 0, y: 300 * i, ...b })) }, variables },
    ws,
  );
  const codigo = generar(ws);
  ws.dispose();
  return codigo;
}

/** Cuerpo de una función del sketch, sin su sangría. */
export const cuerpo = (codigo: string, funcion: string) =>
  codigo
    .split(`void ${funcion}() {\n`)[1]
    .split('\n}\n')[0]
    .split('\n')
    .map((l) => l.replace(/^ {2}/, ''));

export const CON_BACKEND = process.env.RUN_BLOQUES_COMPILE === '1';
const BACKEND = process.env.BLOQUES_BACKEND_URL ?? 'http://localhost:3080';

/** Compila un sketch para arduino:avr:uno en el backend. Falla con el error del compilador. */
export async function compilar(codigo: string): Promise<{ hex: string; stdout: string }> {
  const inicio = await fetch(`${BACKEND}/api/compile/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: [{ name: 'sketch.ino', content: codigo }],
      board_fqbn: 'arduino:avr:uno',
    }),
  });
  const { job_id } = await inicio.json();
  let trabajo;
  do {
    await new Promise((r) => setTimeout(r, 300));
    trabajo = await (await fetch(`${BACKEND}/api/compile/status/${job_id}`)).json();
  } while (trabajo.state === 'pending' || trabajo.state === 'running');
  if (!trabajo.result?.success) throw new Error(trabajo.result?.stderr ?? trabajo.error);
  return { hex: trabajo.result.hex_content, stdout: trabajo.result.stdout };
}
