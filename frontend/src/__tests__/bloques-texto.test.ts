/**
 * Textos y puerto serie (h8): variables de texto, unir, comparar y lectura del
 * puerto serie, contra los escenarios de openspec (bloques/texto y
 * bloques/puerto-serie). El comportamiento en un AVR emulado está en
 * bloques-texto.integration.
 */
import { describe, expect, it } from 'vitest';
import { Blockly } from '../blocks/blockly';
import { PALETA, TEXTO } from '../blocks/catalogo';
import { type B, alIniciar, cuerpo, led, num, parpadeo, porSiempre, sketch } from './helpers/bloques';

const txt = (TEXT: string) => ({ block: { type: 'text', fields: { TEXT } } });
const VARS = [
  { name: 'saludo', id: 't', type: TEXTO },
  { name: 'cuenta', id: 'n' },
];
const saludo = { block: { type: 'ab_variable_texto', fields: { VAR: { id: 't' } } } };
const cuenta = { block: { type: 'variables_get', fields: { VAR: { id: 'n' } } } };
const definirTexto = (VALUE: object): B => ({
  type: 'ab_definir_texto',
  fields: { VAR: { id: 't' } },
  inputs: { VALUE },
});
const unir = (A: object, B: object) => ({ block: { type: 'ab_unir', inputs: { A, B } } });
const decir = (VALOR: object, type = 'ab_decir'): B => ({ type, inputs: { VALOR } });
const enSetup = (...bloques: B[]) => cuerpo(sketch([alIniciar(...bloques)], VARS), 'setup');
const categoria = (nombre: string) =>
  (
    PALETA.contents.find((c) => c.name.includes(nombre)) as unknown as {
      contents: { type: string }[];
    }
  ).contents.map((b) => b.type);

describe('variables de texto', () => {
  it('se declaran como String y guardan un texto', () => {
    const codigo = sketch([alIniciar(definirTexto(txt('hola')), decir(saludo))], VARS);
    expect(codigo).toContain('String saludo = "";');
    expect(cuerpo(codigo, 'setup')).toEqual([
      'Serial.begin(9600);',
      'saludo = "hola";',
      'Serial.println(saludo);',
    ]);
  });

  it('un número guardado en un texto se convierte, sin decimales si es entero', () => {
    const codigo = sketch([alIniciar(definirTexto(cuenta))], VARS);
    expect(cuerpo(codigo, 'setup')).toEqual(['saludo = aTexto(cuenta);']);
    expect(codigo).toContain('return n == (long)n ? String((long)n) : String(n);');
  });

  it('un texto guardado en una variable de número se convierte a número', () => {
    const definir = { type: 'variables_set', fields: { VAR: { id: 'n' } } };
    expect(enSetup({ ...definir, inputs: { VALUE: saludo } })).toEqual([
      'cuenta = String(saludo).toFloat();',
    ]);
    expect(enSetup({ ...definir, inputs: { VALUE: num(5) } })).toEqual(['cuenta = 5;']);
  });

  it('los menús de cada bloque solo ofrecen las variables de su tipo', () => {
    const ws = new Blockly.Workspace();
    Blockly.serialization.workspaces.load({ variables: VARS }, ws);
    const nombres = (tipo: string) =>
      (ws.newBlock(tipo).getField('VAR') as Blockly.FieldVariable)
        .getOptions()
        .map(([nombre]) => nombre)
        .filter((n) => VARS.some((v) => v.name === n));
    expect(nombres('ab_definir_texto')).toEqual(['saludo']);
    expect(nombres('variables_set')).toEqual(['cuenta']);
    ws.dispose();
  });

  it('un texto no entra donde va un número', () => {
    const ws = new Blockly.Workspace();
    const texto = ws.newBlock('ab_variable_texto').outputConnection!;
    const checker = ws.connectionChecker;
    expect(checker.canConnect(texto, ws.newBlock('ab_esperar').getInput('S')!.connection, false)).toBe(false);
    expect(checker.canConnect(texto, ws.newBlock('ab_unir').getInput('A')!.connection, false)).toBe(true);
    expect(checker.canConnect(texto, ws.newBlock('ab_decir').getInput('VALOR')!.connection, false)).toBe(true);
    ws.dispose();
  });
});

describe('unir y comparar', () => {
  it('unir junta textos y números', () => {
    expect(enSetup(decir(unir(txt('Vueltas: '), cuenta)))).toEqual([
      'Serial.begin(9600);',
      'Serial.println(String("Vueltas: ") + aTexto(cuenta));',
    ]);
    expect(enSetup(definirTexto(unir(saludo, txt('!'))))).toEqual(['saludo = saludo + "!";']);
  });

  it('unir anidado conserva el orden', () => {
    expect(enSetup(definirTexto(unir(unir(txt('a'), txt('b')), unir(cuenta, saludo))))).toEqual([
      'saludo = (String("a") + "b") + (aTexto(cuenta) + saludo);',
    ]);
  });

  it('texto = compara textos', () => {
    const igual = (A: object, B: object) => ({
      type: 'ab_si',
      inputs: { COND: { block: { type: 'ab_texto_igual', inputs: { A, B } } }, DO: { block: led('HIGH') } },
    });
    expect(enSetup(igual(saludo, txt('encender')))[1]).toBe('if (saludo == "encender") {');
    expect(enSetup(igual(txt('a'), saludo))[1]).toBe('if (String("a") == saludo) {');
  });

  it('están en Operadores, después de los de números', () => {
    expect(categoria('OPERADORES').slice(-2)).toEqual(['ab_unir', 'ab_texto_igual']);
  });
});

describe('puerto serie', () => {
  it('la categoría tiene decir, las lecturas y ya no está en Avanzado', () => {
    expect(categoria('SERIE')).toEqual([
      'ab_decir',
      'ab_decir_seguido',
      'ab_serie_hay',
      'ab_serie_numero',
      'ab_serie_texto',
    ]);
    expect(categoria('AVANZADO')).not.toContain('ab_decir');
  });

  it('decir con y sin salto de línea', () => {
    expect(enSetup(decir(txt('Temp: '), 'ab_decir_seguido'), decir(num(25)))).toEqual([
      'Serial.begin(9600);',
      'Serial.print("Temp: ");',
      'Serial.println(25);',
    ]);
  });

  it('leer texto y leer número leen una línea completa, con espera corta', () => {
    const leerNumero = { type: 'variables_set', fields: { VAR: { id: 'n' } }, inputs: { VALUE: { block: { type: 'ab_serie_numero' } } } };
    const codigo = sketch(
      [alIniciar(definirTexto({ block: { type: 'ab_serie_texto' } }), leerNumero)],
      VARS,
    );
    expect(cuerpo(codigo, 'setup')).toEqual([
      'Serial.begin(9600);',
      'Serial.setTimeout(50);',
      'saludo = leerTexto();',
      'cuenta = leerTexto().toFloat();',
    ]);
    expect(codigo).toContain("String linea = Serial.readStringUntil('\\n');");
    expect(codigo.match(/String leerTexto\(\)/g)).toHaveLength(1);
  });

  it('¿hay datos? es una condición', () => {
    const si = { type: 'ab_si', inputs: { COND: { block: { type: 'ab_serie_hay' } }, DO: { block: led('HIGH') } } };
    expect(cuerpo(sketch([alIniciar(porSiempre(si))]), 'loop')[0]).toBe('if (Serial.available() > 0) {');
  });

  it('cuando llega un dato: corrutina que espera datos y cede el turno', () => {
    const codigo = sketch(
      [
        { type: 'ab_cuando_serie', next: { block: definirTexto({ block: { type: 'ab_serie_texto' } }) } },
        alIniciar(parpadeo(13, 0.5)),
      ],
      VARS,
    );
    expect(cuerpo(codigo, 'programa1')).toEqual([
      'EMPEZAR();',
      'while (true) {',
      '  ESPERAR_HASTA(Serial.available() > 0);',
      '  saludo = leerTexto();',
      '  CEDER();',
      '}',
      'TERMINAR();',
    ]);
    expect(cuerpo(codigo, 'setup')).toContain('Serial.begin(9600);');
  });

  it('un solo script con el sombrero de puerto serie usa corrutinas', () => {
    expect(sketch([{ type: 'ab_cuando_serie', next: { block: led('HIGH') } }])).toContain('#define ESPERAR(ms)');
  });
});
