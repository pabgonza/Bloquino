/**
 * Generador de corrutinas (h2): selección del modo, armado de un programa de
 * varios scripts y cesión de turno, contra los escenarios de openspec
 * (bloques/generador-corrutinas, scripts-paralelos, eventos-hardware).
 * El comportamiento en un AVR emulado está en bloques-corrutinas.integration.
 */
import { describe, it, expect } from 'vitest';
import {
  type B,
  alIniciar,
  boton,
  cuandoBoton,
  cuandoSuelta,
  cuerpo,
  esperar,
  led,
  num,
  parpadeo,
  porSiempre,
  sketch,
} from './helpers/bloques';

const dosParpadeos = () => sketch([alIniciar(parpadeo(13, 1)), alIniciar(parpadeo(12, 0.3))]);

describe('selección del modo', () => {
  it('dos al iniciar: corrutinas, sin delay ni includes', () => {
    const codigo = dosParpadeos();
    expect(codigo).toContain('#define ESPERAR(ms)');
    expect(codigo).not.toContain('delay(');
    expect(codigo).not.toContain('#include');
  });

  it('un solo evento de botón: corrutinas', () => {
    expect(sketch([cuandoBoton(2, led('HIGH'))])).toContain('#define ESPERAR(ms)');
  });

  it('un solo al iniciar con bloques sueltos: clásico', () => {
    const codigo = sketch([alIniciar(parpadeo(13, 1)), led('HIGH', 7)]);
    expect(codigo).toContain('delay(1000);');
    expect(codigo).not.toContain('#define');
    expect(codigo.split('\n')[0]).toBe('// Generado desde bloques');
  });

  it('la primera línea marca el modo avanzado', () => {
    const primera = dosParpadeos().split('\n')[0];
    expect(primera).toMatch(/^\/\/ .*Generado desde bloques/);
    expect(primera).toContain('avanzado');
  });
});

describe('armado', () => {
  it('una función por script y loop las llama por turno', () => {
    const codigo = dosParpadeos();
    expect(cuerpo(codigo, 'programa1')).toEqual([
      'EMPEZAR();',
      'while (true) {',
      '  digitalWrite(13, HIGH);',
      '  ESPERAR(1000);',
      '  digitalWrite(13, LOW);',
      '  ESPERAR(1000);',
      '  CEDER();',
      '}',
      'TERMINAR();',
    ]);
    expect(cuerpo(codigo, 'programa2')[3]).toBe('  ESPERAR(300);');
    expect(cuerpo(codigo, 'setup')).toEqual(['pinMode(13, OUTPUT);', 'pinMode(12, OUTPUT);']);
    expect(cuerpo(codigo, 'loop')).toEqual(['programa1();', 'programa2();']);
  });

  it('los scripts van en orden de posición, de arriba hacia abajo', () => {
    const codigo = sketch([
      { ...alIniciar(led('HIGH', 5)), y: 500 },
      { ...alIniciar(led('HIGH', 4)), y: 20 },
    ]);
    expect(cuerpo(codigo, 'programa1')[1]).toBe('digitalWrite(4, HIGH);');
    expect(cuerpo(codigo, 'programa2')[1]).toBe('digitalWrite(5, HIGH);');
  });

  it('un script sin por siempre termina', () => {
    const codigo = sketch([alIniciar(led('HIGH', 12)), alIniciar(parpadeo(13, 1))]);
    expect(cuerpo(codigo, 'programa1')).toEqual([
      'EMPEZAR();',
      'digitalWrite(12, HIGH);',
      'TERMINAR();',
    ]);
  });

  it('las variables son globales, comunes a todos los scripts', () => {
    const VAR = { id: 'v' };
    const pausa = { block: { type: 'variables_get', fields: { VAR } } };
    const codigo = sketch(
      [
        cuandoBoton(2, { type: 'variables_set', fields: { VAR }, inputs: { VALUE: num(0.1) } }),
        alIniciar(porSiempre(led('HIGH'), { type: 'ab_esperar', inputs: { S: pausa } })),
      ],
      [{ name: 'pausa', id: 'v' }],
    );
    expect(codigo.match(/float pausa = 0;/g)).toHaveLength(1);
    expect(cuerpo(codigo, 'programa1')).toContain('  pausa = 0.1;');
    expect(cuerpo(codigo, 'programa2')).toContain('  ESPERAR(pausa * 1000);');
  });
});

describe('cesión de turno', () => {
  const junto = (bloque: B) =>
    cuerpo(sketch([alIniciar(bloque), alIniciar(esperar(1))]), 'programa1');

  it('por siempre sin esperas cede al final de cada vuelta', () => {
    expect(junto(porSiempre(led('HIGH')))).toEqual([
      'EMPEZAR();',
      'while (true) {',
      '  digitalWrite(13, HIGH);',
      '  CEDER();',
      '}',
      'TERMINAR();',
    ]);
  });

  it('repetir mientras cede al final de cada vuelta', () => {
    const mientras = { type: 'ab_mientras', inputs: { COND: boton, DO: { block: led('HIGH') } } };
    expect(junto(mientras).slice(1, 5)).toEqual([
      'while (digitalRead(2) == LOW) {',
      '  digitalWrite(13, HIGH);',
      '  CEDER();',
      '}',
    ]);
  });

  it('esperar hasta que', () => {
    expect(junto({ type: 'ab_esperar_hasta', inputs: { COND: boton } })[1]).toBe(
      'ESPERAR_HASTA(digitalRead(2) == LOW);',
    );
  });

  it('tocar nota: tone, espera cooperativa y noTone', () => {
    const nota = {
      type: 'ab_tocar_nota',
      fields: { NOTA: '440', PIN: '8' },
      inputs: { S: num(0.5) },
    };
    expect(junto(nota).slice(1, 4)).toEqual(['tone(8, 440);', 'ESPERAR(500);', 'noTone(8);']);
  });
});

describe('contadores', () => {
  it('repetir con esperas: contador estático del script', () => {
    const repetir = {
      type: 'ab_repetir',
      inputs: { VECES: num(3), DO: { block: esperar(1) } },
    };
    const codigo = sketch([alIniciar(repetir), alIniciar(repetir)]);
    expect(cuerpo(codigo, 'programa1')).toEqual([
      'static int vez;',
      'EMPEZAR();',
      'for (vez = 0; vez < 3; vez++) {',
      '  ESPERAR(1000);',
      '}',
      'TERMINAR();',
    ]);
    // Cada script tiene el suyo.
    expect(cuerpo(codigo, 'programa2')[0]).toBe('static int vez;');
  });

  it('contar: contador estático, sin variable global', () => {
    const contar = {
      type: 'ab_contar',
      fields: { VAR: { id: 'vi' } },
      inputs: { DESDE: num(1), HASTA: num(10), DO: { block: esperar(1) } },
    };
    const codigo = sketch([alIniciar(contar), alIniciar(esperar(1))], [{ name: 'i', id: 'vi' }]);
    expect(codigo).not.toContain('float i');
    expect(cuerpo(codigo, 'programa1').slice(0, 3)).toEqual([
      'static int i;',
      'EMPEZAR();',
      'for (i = 1; i <= 10; i++) {',
    ]);
    // El script que no cuenta no declara nada.
    expect(cuerpo(codigo, 'programa2')[0]).toBe('EMPEZAR();');
  });
});

describe('sombrero de botón', () => {
  it('se repite por pulsación, con antirrebote al presionar y al soltar', () => {
    const codigo = sketch([cuandoBoton(2, led('HIGH', 12))]);
    expect(cuerpo(codigo, 'setup')).toEqual(['pinMode(2, INPUT_PULLUP);', 'pinMode(12, OUTPUT);']);
    expect(cuerpo(codigo, 'programa1')).toEqual([
      'EMPEZAR();',
      'while (true) {',
      '  ESPERAR_HASTA(digitalRead(2) == LOW);',
      '  ESPERAR(20);',
      '  digitalWrite(12, HIGH);',
      '  ESPERAR_HASTA(digitalRead(2) == HIGH);',
      '  ESPERAR(20);',
      '}',
      'TERMINAR();',
    ]);
  });

  it('el de soltar corre después de que el botón sube, con el mismo antirrebote', () => {
    const codigo = sketch([cuandoSuelta(2, led('LOW', 12))]);
    expect(cuerpo(codigo, 'setup')).toEqual(['pinMode(2, INPUT_PULLUP);', 'pinMode(12, OUTPUT);']);
    expect(cuerpo(codigo, 'programa1')).toEqual([
      'EMPEZAR();',
      'while (true) {',
      '  ESPERAR_HASTA(digitalRead(2) == LOW);',
      '  ESPERAR(20);',
      '  ESPERAR_HASTA(digitalRead(2) == HIGH);',
      '  ESPERAR(20);',
      '  digitalWrite(12, LOW);',
      '}',
      'TERMINAR();',
    ]);
  });
});
