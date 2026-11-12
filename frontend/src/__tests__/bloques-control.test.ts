/**
 * Control remoto (h8): sombrero de tecla y lecturas, contra los escenarios de
 * openspec (bloques/infrarrojo). El comportamiento con el receptor simulado
 * está en bloques-control.integration.
 */
import { describe, expect, it } from 'vitest';
import { Blockly } from '../blocks/blockly';
import { TECLAS } from '../bloquino/componentes/teclas';
import { type B, alIniciar, cadena, cuerpo, led, porSiempre, sketch } from './helpers/bloques';

export const cuandoTecla = (TECLA: string, ...bloques: B[]) =>
  cadena([{ type: 'ab_cuando_tecla', fields: { TECLA, PIN: '10' } }, ...bloques])!;
const ultima = { block: { type: 'ab_tecla_ultima', fields: { PIN: '10' } } };

describe('control remoto', () => {
  it('el menú ofrece cualquiera y las 17 teclas del control, en español', () => {
    const ws = new Blockly.Workspace();
    const menu = ws.newBlock('ab_cuando_tecla').getField('TECLA') as Blockly.FieldDropdown;
    expect(menu.getOptions().map(([texto]) => texto)).toEqual([
      'cualquiera',
      ...['1', '2', '3', '4', '5', '6', '7', '8', '9', 'silencio', '0', 'borrar'],
      ...['función', 'autoprueba', 'OK', 'reinicio', 'volver'],
    ]);
    expect(new Set(TECLAS.map(([, comando]) => comando)).size).toBe(17);
    ws.dispose();
  });

  it('una tecla: receptor por interrupción, lectura en cada vuelta y script que espera esa tecla', () => {
    const codigo = sketch([cuandoTecla('OK', led('HIGH'))]);
    expect(codigo).toContain(
      '#define IR_RECEIVE_PIN 10\n#define NO_LED_FEEDBACK_CODE\n#include <TinyIRReceiver.hpp>\n',
    );
    expect(codigo).toContain('int teclaControl = -1;\nunsigned int teclasRecibidas = 0;\n');
    expect(cuerpo(codigo, 'setup')).toEqual(['pinMode(13, OUTPUT);', 'initPCIInterruptForTinyReceiver();']);
    expect(cuerpo(codigo, 'programa1')).toEqual([
      'static unsigned int vistas = 0;',
      'EMPEZAR();',
      'while (true) {',
      '  ESPERAR_HASTA(teclasRecibidas != vistas);',
      '  vistas = teclasRecibidas;',
      '  if (teclaControl == 28) {',
      '    digitalWrite(13, HIGH);',
      '    vistas = teclasRecibidas;',
      '  }',
      '}',
      'TERMINAR();',
    ]);
    expect(cuerpo(codigo, 'loop')).toEqual([
      'if (TinyReceiverDecode() && TinyIRReceiverData.Flags != IRDATA_FLAGS_IS_REPEAT) {',
      '  teclaControl = TinyIRReceiverData.Command;',
      '  teclasRecibidas++;',
      '}',
      'programa1();',
    ]);
  });

  it('cualquiera corre con todas las teclas', () => {
    expect(cuerpo(sketch([cuandoTecla('*', led('HIGH'))]), 'programa1').slice(4, 7)).toEqual([
      '  vistas = teclasRecibidas;',
      '  digitalWrite(13, HIGH);',
      '  vistas = teclasRecibidas;',
    ]);
  });

  it('última tecla entrega el nombre; el código, el número', () => {
    const decir = (VALOR: object): B => ({ type: 'ab_decir', inputs: { VALOR } });
    const codigo = sketch([
      cuandoTecla('*', decir(ultima), decir({ block: { type: 'ab_tecla_codigo', fields: { PIN: '10' } } })),
    ]);
    expect(codigo).toContain('    case 28: return "OK";\n');
    expect(codigo).toContain('Serial.println(nombreTecla(teclaControl));');
    expect(codigo).toContain('Serial.println(teclaControl);');
  });

  it('en un programa de un solo al iniciar, leer el control pasa a corrutinas', () => {
    const si: B = {
      type: 'ab_si',
      inputs: {
        COND: { block: { type: 'ab_texto_igual', inputs: { A: ultima, B: { block: { type: 'text', fields: { TEXT: 'OK' } } } } } },
        DO: { block: led('HIGH') },
      },
    };
    const codigo = sketch([alIniciar(porSiempre(si))]);
    expect(codigo).toContain('#define ESPERAR(ms)');
    expect(codigo).toContain('if (nombreTecla(teclaControl) == "OK") {');
  });

  it('dos sombreros comparten el receptor: vale el primer pin', () => {
    const otro = cadena([{ type: 'ab_cuando_tecla', fields: { TECLA: '1', PIN: '4' } }, led('LOW')])!;
    const codigo = sketch([cuandoTecla('OK', led('HIGH')), otro]);
    expect(codigo.match(/IR_RECEIVE_PIN \d+/g)).toEqual(['IR_RECEIVE_PIN 10']);
    expect(codigo.match(/TinyReceiverDecode/g)).toHaveLength(1);
  });
});
