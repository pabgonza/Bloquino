/**
 * Generador clásico de bloques (h1): contexto de contribuciones, armado de
 * setup() / loop() y código de cada bloque del catálogo, contra los
 * escenarios de openspec (bloques/generador-clasico y bloques/catalogo-base).
 */
import { describe, it, expect } from 'vitest';
import { Blockly } from '../blocks/blockly';
import {
  type B,
  alIniciar,
  boton,
  cuerpo,
  distancia,
  esperar,
  led,
  num,
  porSiempre,
  sketch,
} from './helpers/bloques';

/** Código que genera una instrucción colgada de `al iniciar`. */
const enSetup = (bloque: B, variables?: B[]) =>
  cuerpo(sketch([alIniciar(bloque)], variables), 'setup');
/** Código de una expresión, vista a través de `decir`. */
const expresion = (bloque: B, variables?: B[]) =>
  enSetup({ type: 'ab_decir', inputs: { VALOR: { block: bloque } } }, variables)
    .at(-1)!
    .replace(/^Serial\.println\((.*)\);$/, '$1');

describe('estructura setup / loop', () => {
  it('parpadeo', () => {
    const codigo = sketch([alIniciar(porSiempre(led('HIGH'), esperar(1), led('LOW'), esperar(1)))]);
    expect(cuerpo(codigo, 'setup')).toEqual(['pinMode(13, OUTPUT);']);
    expect(cuerpo(codigo, 'loop')).toEqual([
      'digitalWrite(13, HIGH);',
      'delay(1000);',
      'digitalWrite(13, LOW);',
      'delay(1000);',
    ]);
  });

  it('sin por siempre: todo a setup y loop vacío', () => {
    expect(sketch([alIniciar(led('HIGH'))])).toBe(
      '// Generado desde bloques\n' +
        'void setup() {\n  pinMode(13, OUTPUT);\n  digitalWrite(13, HIGH);\n}\n\n' +
        'void loop() {\n}\n',
    );
  });

  it('programa vacío', () => {
    expect(sketch([])).toBe('// Generado desde bloques\nvoid setup() {\n}\n\nvoid loop() {\n}\n');
  });

  it('lo que va antes de por siempre queda en setup', () => {
    const codigo = sketch([alIniciar(led('HIGH', 12), porSiempre(led('LOW')))]);
    expect(cuerpo(codigo, 'setup')).toEqual([
      'pinMode(12, OUTPUT);',
      'pinMode(13, OUTPUT);',
      'digitalWrite(12, HIGH);',
    ]);
    expect(cuerpo(codigo, 'loop')).toEqual(['digitalWrite(13, LOW);']);
  });

  it('el comentario de origen es la primera línea', () => {
    expect(sketch([alIniciar(esperar(1))]).split('\n')[0]).toBe('// Generado desde bloques');
  });

  it('un bloque sin sombrero no aparece en el código', () => {
    const codigo = sketch([alIniciar(porSiempre(esperar(1))), { ...led('HIGH', 7), x: 300, y: 0 }]);
    expect(codigo).not.toContain('7');
    expect(codigo).not.toContain('digitalWrite');
  });
});

describe('contribuciones', () => {
  it('el mismo pinMode pedido por varios bloques sale una sola vez', () => {
    const codigo = sketch([alIniciar(led('HIGH'), led('LOW'), led('HIGH'), led('LOW'))]);
    expect(codigo.match(/pinMode\(13, OUTPUT\);/g)).toHaveLength(1);
  });

  it('botón: INPUT_PULLUP', () => {
    const si = { type: 'ab_si', inputs: { COND: boton, DO: { block: led('HIGH') } } };
    expect(cuerpo(sketch([alIniciar(porSiempre(si))]), 'setup')).toEqual([
      'pinMode(2, INPUT_PULLUP);',
      'pinMode(13, OUTPUT);',
    ]);
  });

  it('servo usado dos veces: un include, una declaración y un attach', () => {
    const servo = (angulo: number): B => ({
      type: 'ab_servo',
      fields: { PIN: '9' },
      inputs: { ANGULO: { shadow: { type: 'ab_angulo', fields: { ANGULO: angulo } } } },
    });
    const codigo = sketch([alIniciar(porSiempre(servo(90), esperar(1), servo(0)))]);
    expect(codigo.match(/#include <Servo\.h>/g)).toHaveLength(1);
    expect(codigo.match(/Servo servo9;/g)).toHaveLength(1);
    expect(cuerpo(codigo, 'setup')).toEqual(['servo9.attach(9);']);
    expect(cuerpo(codigo, 'loop')).toEqual([
      'servo9.write(90);',
      'delay(1000);',
      'servo9.write(0);',
    ]);
  });

  it('sin servo no hay Servo.h', () => {
    expect(sketch([alIniciar(led('HIGH'))])).not.toContain('Servo');
  });

  it('los pinMode van antes que el resto de setup', () => {
    const codigo = sketch([
      alIniciar({ type: 'ab_decir', inputs: { VALOR: num(1) } }, led('HIGH')),
    ]);
    expect(cuerpo(codigo, 'setup').slice(0, 2)).toEqual([
      'pinMode(13, OUTPUT);',
      'Serial.begin(9600);',
    ]);
  });
});

describe('control', () => {
  it('esperar con decimales', () => {
    expect(enSetup(esperar(0.5))).toEqual(['delay(500);']);
  });

  it('esperar el valor de otro bloque', () => {
    const perilla = { block: { type: 'ab_perilla', fields: { PIN: 'A0' } } };
    expect(enSetup({ type: 'ab_esperar', inputs: { S: perilla } })).toEqual([
      'delay(map(analogRead(A0), 0, 1023, 0, 100) * 1000);',
    ]);
  });

  it('repetir', () => {
    const repetir = { type: 'ab_repetir', inputs: { VECES: num(3), DO: { block: esperar(1) } } };
    expect(enSetup(repetir)).toEqual([
      'for (int vez = 0; vez < 3; vez++) {',
      '  delay(1000);',
      '}',
    ]);
  });

  it('repetir anidado usa otro contador', () => {
    const dentro = { type: 'ab_repetir', inputs: { VECES: num(2), DO: { block: esperar(1) } } };
    const codigo = enSetup({
      type: 'ab_repetir',
      inputs: { VECES: num(3), DO: { block: dentro } },
    });
    expect(codigo[1]).toBe('  for (int vez2 = 0; vez2 < 2; vez2++) {');
  });

  it('repetir mientras', () => {
    const mientras = { type: 'ab_mientras', inputs: { COND: boton, DO: { block: esperar(1) } } };
    expect(enSetup(mientras).slice(-3)).toEqual([
      'while (digitalRead(2) == LOW) {',
      '  delay(1000);',
      '}',
    ]);
  });

  it('contar: el contador es local y no se declara global', () => {
    const variables = [{ name: 'i', id: 'vi' }];
    const decirI = {
      type: 'ab_decir',
      inputs: { VALOR: { block: { type: 'variables_get', fields: { VAR: { id: 'vi' } } } } },
    };
    const contar = {
      type: 'ab_contar',
      fields: { VAR: { id: 'vi' } },
      inputs: { DESDE: num(1), HASTA: num(10), DO: { block: decirI } },
    };
    const codigo = sketch([alIniciar(contar)], variables);
    expect(codigo).not.toContain('float i');
    expect(cuerpo(codigo, 'setup').slice(-3)).toEqual([
      'for (int i = 1; i <= 10; i++) {',
      '  Serial.println(i);',
      '}',
    ]);
  });

  it('si', () => {
    const si = { type: 'ab_si', inputs: { COND: boton, DO: { block: esperar(1) } } };
    expect(enSetup(si).slice(-3)).toEqual(['if (digitalRead(2) == LOW) {', '  delay(1000);', '}']);
  });

  it('si / si no', () => {
    const si = {
      type: 'ab_si_sino',
      inputs: { COND: boton, DO: { block: led('HIGH') }, SINO: { block: led('LOW') } },
    };
    expect(enSetup(si).slice(-5)).toEqual([
      'if (digitalRead(2) == LOW) {',
      '  digitalWrite(13, HIGH);',
      '} else {',
      '  digitalWrite(13, LOW);',
      '}',
    ]);
  });

  it('si sin condición no entra', () => {
    expect(enSetup({ type: 'ab_si' })[0]).toBe('if (false) {');
  });

  it('esperar hasta que', () => {
    expect(enSetup({ type: 'ab_esperar_hasta', inputs: { COND: boton } }).at(-1)).toBe(
      'while (!(digitalRead(2) == LOW)) {}',
    );
  });

  it('cronómetro: segundos desde el reinicio, con millis()', () => {
    const codigo = sketch([
      alIniciar(
        { type: 'ab_reiniciar_cronometro' },
        { type: 'ab_decir', inputs: { VALOR: { block: { type: 'ab_cronometro' } } } },
      ),
    ]);
    expect(codigo.match(/unsigned long cronometro = 0;/g)).toHaveLength(1);
    expect(cuerpo(codigo, 'setup').slice(-2)).toEqual([
      'cronometro = millis();',
      'Serial.println((millis() - cronometro) / 1000.0);',
    ]);
  });

  it('por siempre anidado es un while (true)', () => {
    const si = { type: 'ab_si', inputs: { COND: boton, DO: { block: porSiempre(esperar(1)) } } };
    expect(enSetup(si)).toContain('  while (true) {');
  });
});

describe('luces', () => {
  it('brillo: 50 % es un valor cercano a 127', () => {
    const brillo = { type: 'ab_led_brillo', fields: { PIN: '9' }, inputs: { BRILLO: num(50) } };
    expect(enSetup(brillo)).toEqual(['pinMode(9, OUTPUT);', 'analogWrite(9, 127);']);
  });

  it('brillo: el pin solo ofrece los PWM', () => {
    const ws = new Blockly.Workspace();
    const campo = ws.newBlock('ab_led_brillo').getField('PIN') as Blockly.FieldDropdown;
    expect(campo.getOptions().map(([, v]) => v)).toEqual(['3', '5', '6', '9', '10', '11']);
    ws.dispose();
  });

  it('color RGB rojo', () => {
    const rgb = { type: 'ab_led_rgb', fields: { R: '9', G: '10', B: '11', COLOR: '#ff0000' } };
    expect(enSetup(rgb).slice(-3)).toEqual([
      'analogWrite(9, 255);',
      'analogWrite(10, 0);',
      'analogWrite(11, 0);',
    ]);
  });

  it('encender y apagar muestran su texto en español', () => {
    const ws = new Blockly.Workspace();
    expect(ws.newBlock('ab_led').toString()).toBe('encender LED en pin 2');
    ws.dispose();
  });
});

describe('sonido y movimiento', () => {
  it('nota con duración: tone y luego la espera', () => {
    const nota = {
      type: 'ab_tocar_nota',
      fields: { NOTA: '440', PIN: '8' },
      inputs: { S: num(0.5) },
    };
    expect(enSetup(nota).slice(-2)).toEqual(['tone(8, 440, 500);', 'delay(500);']);
  });

  it('el menú de notas tiene dos octavas, con la en 440', () => {
    const ws = new Blockly.Workspace();
    const opciones = (
      ws.newBlock('ab_tocar_nota').getField('NOTA') as Blockly.FieldDropdown
    ).getOptions();
    expect(opciones).toHaveLength(14);
    expect(opciones.slice(0, 8).map(([texto]) => texto)).toEqual([
      'do',
      're',
      'mi',
      'fa',
      'sol',
      'la',
      'si',
      'do agudo',
    ]);
    expect(opciones[5][1]).toBe('440');
    ws.dispose();
  });

  it('silenciar', () => {
    expect(enSetup({ type: 'ab_silenciar', fields: { PIN: '8' } }).at(-1)).toBe('noTone(8);');
  });

  it('servo: el ángulo queda entre 0 y 180', () => {
    const ws = new Blockly.Workspace();
    const angulo = ws.newBlock('ab_angulo');
    angulo.setFieldValue(200, 'ANGULO');
    expect(angulo.getFieldValue('ANGULO')).toBe(180);
    ws.dispose();
  });
});

describe('sensores', () => {
  it('perilla: de 0 a 100', () => {
    expect(expresion({ type: 'ab_perilla', fields: { PIN: 'A0' } })).toBe(
      'map(analogRead(A0), 0, 1023, 0, 100)',
    );
  });

  it('distancia: función auxiliar con pulseIn de 25 ms y 400 sin eco', () => {
    const codigo = sketch([
      alIniciar(porSiempre({ type: 'ab_decir', inputs: { VALOR: distancia } }, esperar(1))),
    ]);
    expect(codigo).toContain('float distanciaCm(int disparo, int eco) {');
    expect(codigo).toContain('pulseIn(eco, HIGH, 25000)');
    expect(codigo).toMatch(/if \(eco_us == 0\) \{\n {4}return 400;/);
    expect(cuerpo(codigo, 'setup')).toEqual([
      'pinMode(7, OUTPUT);',
      'pinMode(6, INPUT);',
      'Serial.begin(9600);',
    ]);
    expect(cuerpo(codigo, 'loop')[0]).toBe('Serial.println(distanciaCm(7, 6));');
  });

  it('temperatura y humedad: un objeto DHT11 por pin, con la librería del curso', () => {
    const dht = (tipo: string, PIN: string): B => ({
      type: 'ab_decir',
      inputs: { VALOR: { block: { type: tipo, fields: { PIN } } } },
    });
    const codigo = sketch([
      alIniciar(dht('ab_temperatura', '2'), dht('ab_humedad', '2'), dht('ab_temperatura', '4')),
    ]);
    expect(codigo.split('\n').slice(1, 6)).toEqual([
      '#include <DHT.h>',
      '',
      'DHT dht2(2, DHT11);',
      'DHT dht4(4, DHT11);',
      '',
    ]);
    expect(cuerpo(codigo, 'setup')).toEqual([
      'Serial.begin(9600);',
      'dht2.begin();',
      'dht4.begin();',
      'Serial.println(dht2.readTemperature());',
      'Serial.println(dht2.readHumidity());',
      'Serial.println(dht4.readTemperature());',
    ]);
  });
});

describe('operadores y variables', () => {
  const op = (type: string, OP: string, A: object, B: object) => ({
    type,
    fields: { OP },
    inputs: { A, B },
  });

  it('aritmética con los paréntesis justos', () => {
    const suma = { block: op('ab_aritmetica', '+', num(1), num(2)) };
    expect(expresion(op('ab_aritmetica', '*', suma, num(3)))).toBe('(1 + 2) * 3');
    expect(
      expresion(
        op('ab_aritmetica', '+', num(1), { block: op('ab_aritmetica', '*', num(2), num(3)) }),
      ),
    ).toBe('1 + 2 * 3');
  });

  it('la división no es entera', () => {
    expect(expresion(op('ab_aritmetica', '/', num(7), num(2)))).toBe('(float)7 / 2');
  });

  it('comparación y lógica', () => {
    const menor = { block: op('ab_comparar', '<', distancia, num(20)) };
    expect(expresion(op('ab_logica', '&&', menor, boton))).toBe(
      'distanciaCm(7, 6) < 20 && digitalRead(2) == LOW',
    );
    expect(expresion(op('ab_comparar', '==', num(1), num(1)))).toBe('1 == 1');
    expect(expresion({ type: 'ab_no', inputs: { A: boton } })).toBe('!(digitalRead(2) == LOW)');
  });

  it('azar incluye el máximo', () => {
    expect(expresion({ type: 'ab_azar', inputs: { A: num(1), B: num(10) } })).toBe('random(1, 11)');
  });

  it('asignar al rango y restringir', () => {
    const entradas = { X: num(50), A: num(0), B: num(100), C: num(0), D: num(180) };
    expect(expresion({ type: 'ab_mapear', inputs: entradas })).toBe('map(50, 0, 100, 0, 180)');
    expect(
      expresion({ type: 'ab_restringir', inputs: { X: num(200), A: num(0), B: num(100) } }),
    ).toBe('constrain(200, 0, 100)');
  });

  it('variable con espacios: global con nombre válido en C++', () => {
    const VAR = { id: 'v1' };
    const codigo = sketch(
      [
        alIniciar(
          { type: 'variables_set', fields: { VAR }, inputs: { VALUE: num(5) } },
          { type: 'math_change', fields: { VAR }, inputs: { DELTA: num(1) } },
          {
            type: 'ab_decir',
            inputs: { VALOR: { block: { type: 'variables_get', fields: { VAR } } } },
          },
        ),
      ],
      [{ name: 'mi cuenta', id: 'v1' }],
    );
    expect(codigo.match(/float mi_cuenta = 0;/g)).toHaveLength(1);
    expect(cuerpo(codigo, 'setup').slice(-3)).toEqual([
      'mi_cuenta = 5;',
      'mi_cuenta += 1;',
      'Serial.println(mi_cuenta);',
    ]);
  });

  it('nombres con tildes o que empiezan con número', () => {
    const get = (id: string) => ({ type: 'variables_get', fields: { VAR: { id } } });
    expect(expresion(get('a'), [{ name: 'número de años', id: 'a' }])).toBe('numero_de_anos');
    expect(expresion(get('b'), [{ name: '2do', id: 'b' }])).toBe('_2do');
  });
});

describe('avanzado', () => {
  it('definir pin 13 en ALTA', () => {
    const pin = { type: 'ab_pin_digital', fields: { PIN: '13', ESTADO: 'HIGH' } };
    expect(enSetup(pin)).toEqual(['pinMode(13, OUTPUT);', 'digitalWrite(13, HIGH);']);
  });

  it('definir pin en 0-255', () => {
    const pwm = { type: 'ab_pin_pwm', fields: { PIN: '9' }, inputs: { VALOR: num(200) } };
    expect(enSetup(pwm)).toEqual(['pinMode(9, OUTPUT);', 'analogWrite(9, 200);']);
  });

  it('leer pin digital y analógico', () => {
    expect(expresion({ type: 'ab_leer_digital', fields: { PIN: '4' } })).toBe('digitalRead(4)');
    expect(expresion({ type: 'ab_leer_analogico', fields: { PIN: 'A1' } })).toBe('analogRead(A1)');
    const leer = {
      type: 'ab_decir',
      inputs: { VALOR: { block: { type: 'ab_leer_digital', fields: { PIN: '4' } } } },
    };
    expect(enSetup(leer)[0]).toBe('pinMode(4, INPUT);');
  });

  it('decir: Serial.begin en setup y println con el valor', () => {
    expect(enSetup({ type: 'ab_decir', inputs: { VALOR: distancia } }).slice(-2)).toEqual([
      'Serial.begin(9600);',
      'Serial.println(distanciaCm(7, 6));',
    ]);
    const texto = { shadow: { type: 'text', fields: { TEXT: 'hola' } } };
    expect(enSetup({ type: 'ab_decir', inputs: { VALOR: texto } }).at(-1)).toBe(
      'Serial.println("hola");',
    );
  });

  it('comentario', () => {
    const comentario = { type: 'ab_comentario', fields: { TEXTO: 'enciende la luz' } };
    expect(enSetup(comentario, [])).toEqual(['// enciende la luz']);
  });
});
