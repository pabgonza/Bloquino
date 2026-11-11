// Piezas comunes para declarar bloques por categoría. El texto de cada bloque
// sale de i18n (`ab_esperar` → mensaje AB_ESPERAR) y su estilo es la categoría.
import { Blockly } from '../blockly';

type Definicion = Record<string, unknown> & { args?: object[] };

export interface Categoria {
  id: string;
  color: string;
  /** Bloques de la paleta; sin ella, la categoría la arma Blockly (variables). */
  paleta?: object[];
}

export function categoria(
  id: string,
  color: string,
  bloques: Record<string, Definicion>,
  paleta: (string | object)[],
): Categoria {
  Blockly.defineBlocksWithJsonArray(
    Object.entries(bloques).map(([type, { args, ...resto }]) => ({
      type,
      message0: `%{BKY_${type.toUpperCase()}}`,
      args0: args,
      style: id,
      inputsInline: true,
      ...resto,
    })),
  );
  return {
    id,
    color,
    paleta: paleta.map((p) => ({ kind: 'block', ...(typeof p === 'string' ? { type: p } : p) })),
  };
}

// Formas de bloque
export const INSTRUCCION = { previousStatement: null, nextStatement: null };
export const NUMERO = { output: 'Number' };
export const LOGICO = { output: 'Boolean' };

// Entradas
export const valor = (name: string, check?: string) => ({ type: 'input_value', name, check });
export const cuerpo = (name: string) => ({ type: 'input_statement', name });
export const SALTO = { type: 'input_dummy' };

// Campos
export const menu = (name: string, opciones: [string, string][]) => ({
  type: 'field_dropdown',
  name,
  options: opciones,
});
const lista = (name: string, valores: (string | number)[]) =>
  menu(
    name,
    valores.map((v) => [String(v), String(v)]),
  );
// Los pines 0 y 1 quedan reservados al puerto serie.
export const pin = (name = 'PIN') => lista(name, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
export const pinPwm = (name = 'PIN') => lista(name, [3, 5, 6, 9, 10, 11]);
export const pinAnalogico = () => lista('PIN', ['A0', 'A1', 'A2', 'A3', 'A4', 'A5']);

/** Número por defecto (bloque sombra) de una entrada de la paleta. */
export const num = (n: number) => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
