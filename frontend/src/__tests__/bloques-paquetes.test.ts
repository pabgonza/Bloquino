/**
 * Paquetes de bloques (h6): el paquete BuzzerMusic contra los escenarios de
 * openspec (bloques/paquetes, bloques/buzzermusic y la selección del modo).
 * El comportamiento en un AVR emulado está en bloques-buzzermusic.integration.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Blockly } from '../blocks/blockly';
import { PALETA } from '../blocks/catalogo';
import { PAQUETES } from '../blocks/paquetes';
import {
  type B,
  alIniciar,
  cuandoBoton,
  cuerpo,
  led,
  parpadeo,
  porSiempre,
  sketch,
} from './helpers/bloques';

const cancion = (accion: 'tocar' | 'empezar', CANCION = 'MARIO_BROS', PIN = '8'): B => ({
  type: `ab_${accion}_cancion`,
  fields: { CANCION, PIN },
});
const detener: B = { type: 'ab_detener_cancion', fields: { PIN: '8' } };
const siSonando = (...bloques: B[]): B => ({
  type: 'ab_si',
  inputs: {
    COND: { block: { type: 'ab_cancion_sonando', fields: { PIN: '8' } } },
    DO: { block: bloques[0] },
  },
});

describe('paquete en el catálogo', () => {
  it('los bloques de canciones van al final de Sonido, con el pin 8', () => {
    const categoria = PALETA.contents.find((c) => c.name.includes('SONIDO'))!;
    const sonido = (categoria as { contents: object[] }).contents as {
      type: string;
      fields?: Record<string, string>;
    }[];
    expect(sonido.map((b) => b.type)).toEqual([
      'ab_tocar_nota',
      'ab_silenciar',
      'ab_tocar_cancion',
      'ab_empezar_cancion',
      'ab_detener_cancion',
      'ab_cancion_sonando',
    ]);
    expect(sonido.slice(2).map((b) => b.fields)).toEqual(Array(4).fill({ PIN: '8' }));
  });

  it('el menú ofrece las cuatro canciones y parte en Mario Bros', () => {
    const ws = new Blockly.Workspace();
    const menu = ws.newBlock('ab_tocar_cancion').getField('CANCION') as Blockly.FieldDropdown;
    expect(menu.getOptions().map(([texto]) => texto)).toEqual([
      'Mario Bros',
      'Marcha Imperial',
      'Cumpleaños feliz',
      'Himno de la Alegría',
    ]);
    expect(menu.getValue()).toBe('MARIO_BROS');
    expect(ws.newBlock('ab_cancion_sonando').outputConnection!.getCheck()).toEqual(['Boolean']);
    ws.dispose();
  });

  it('la lista de librerías del kit trae la del paquete, en el commit que declara', () => {
    const lista = readFileSync(path.resolve(__dirname, '../../../scripts/librerias-kit.txt'), 'utf8');
    for (const { libreria } of PAQUETES) {
      expect(lista).toContain(`${libreria.nombre}@${libreria.origen}#${libreria.commit}`);
    }
  });
});

describe('programa simple', () => {
  it('tocar canción genera la llamada bloqueante de las slides', () => {
    const codigo = sketch([alIniciar(cancion('tocar'))]);
    expect(codigo).toContain('#include <BuzzerMusic.h>\n\nBuzzerMusic musica8(8);\n');
    expect(cuerpo(codigo, 'setup')).toEqual(['musica8.marioBros();']);
    expect(codigo).not.toContain('#define');
    expect(codigo).not.toContain('update()');
  });

  it('cada canción llama a su método', () => {
    const codigo = sketch([
      alIniciar(
        cancion('tocar', 'IMPERIAL_MARCH'),
        cancion('tocar', 'HAPPY_BIRTHDAY'),
        cancion('tocar', 'ODE_TO_JOY'),
      ),
    ]);
    expect(cuerpo(codigo, 'setup')).toEqual([
      'musica8.imperialMarch();',
      'musica8.happyBirthday();',
      'musica8.odeToJoy();',
    ]);
  });

  it('varios bloques comparten un objeto y cada pin tiene el suyo', () => {
    const codigo = sketch([alIniciar(cancion('tocar'), detener, cancion('tocar', 'ODE_TO_JOY', '9'))]);
    expect(codigo.match(/#include <BuzzerMusic.h>/g)).toHaveLength(1);
    expect(codigo.match(/^BuzzerMusic .*$/gm)).toEqual([
      'BuzzerMusic musica8(8);',
      'BuzzerMusic musica9(9);',
    ]);
    expect(cuerpo(codigo, 'setup')).toEqual([
      'musica8.marioBros();',
      'musica8.stop();',
      'musica9.odeToJoy();',
    ]);
  });

  it('¿canción sonando? es una condición', () => {
    const codigo = sketch([alIniciar(porSiempre(siSonando(led('HIGH'))))]);
    expect(cuerpo(codigo, 'loop')[0]).toBe('if (musica8.isPlaying()) {');
    expect(codigo).not.toContain('#define');
  });

  it('sin bloques del paquete no se incluye la librería', () => {
    expect(sketch([alIniciar(parpadeo(13, 1))])).not.toContain('BuzzerMusic');
  });

  it('un bloque de fondo suelto, sin sombrero, no cambia el modo', () => {
    const codigo = sketch([alIniciar(parpadeo(13, 1)), cancion('empezar')]);
    expect(codigo).toContain('delay(1000);');
    expect(codigo).not.toContain('BuzzerMusic');
  });
});

describe('con corrutinas', () => {
  it('empezar canción pasa a corrutinas un programa de un solo script', () => {
    const codigo = sketch([alIniciar(cancion('empezar'), parpadeo(13, 0.2))]);
    expect(codigo.split('\n')[0]).toContain('avanzado');
    expect(codigo).not.toContain('delay(');
    expect(cuerpo(codigo, 'programa1').slice(0, 4)).toEqual([
      'EMPEZAR();',
      'musica8.start(BuzzerMusic::MARIO_BROS);',
      'while (true) {',
      '  digitalWrite(13, HIGH);',
    ]);
    expect(cuerpo(codigo, 'loop')).toEqual(['musica8.update();', 'programa1();']);
  });

  it('tocar canción cede el turno hasta que la canción termina', () => {
    const codigo = sketch([
      alIniciar(cancion('tocar', 'ODE_TO_JOY'), led('HIGH', 12)),
      alIniciar(parpadeo(13, 0.2)),
    ]);
    expect(cuerpo(codigo, 'programa1')).toEqual([
      'EMPEZAR();',
      'musica8.start(BuzzerMusic::ODE_TO_JOY);',
      'ESPERAR_HASTA(!musica8.isPlaying());',
      'digitalWrite(12, HIGH);',
      'TERMINAR();',
    ]);
    expect(cuerpo(codigo, 'loop')).toEqual(['musica8.update();', 'programa1();', 'programa2();']);
    expect(codigo).not.toContain('odeToJoy');
  });

  it('dos buzzers avanzan cada uno con su objeto', () => {
    const codigo = sketch([alIniciar(cancion('empezar'), cancion('empezar', 'ODE_TO_JOY', '9'))]);
    expect(cuerpo(codigo, 'loop').slice(0, 2)).toEqual(['musica8.update();', 'musica9.update();']);
  });

  it('detener desde un botón no necesita avanzar la canción', () => {
    const codigo = sketch([cuandoBoton(2, detener)]);
    expect(codigo).toContain('musica8.stop();');
    expect(codigo).not.toContain('update()');
  });
});
