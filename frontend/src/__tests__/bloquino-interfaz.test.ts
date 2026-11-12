// @vitest-environment jsdom
/**
 * Interfaz de alumno (h3): modo alumno / profe, lista blanca del kit y marca
 * de modo Texto, contra los escenarios de openspec (interfaz/modo-alumno,
 * interfaz/distribucion y bloques/editor).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import metadatos from '../../public/components-metadata.json';
import { leerModo } from '../bloquino/modo';
import { adaptarKit, filtrarKit } from '../bloquino/kit';
import type { ComponentMetadata } from '../types/component-metadata';
import { ARCHIVO_BLOQUES, codigoSoloLectura, esTexto, marcarTexto } from '../blocks/archivo';
import { useEditorStore } from '../store/useEditorStore';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { buildVlxPayload } from '../utils/vlxFile';

describe('modo alumno / profe', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('por defecto es alumno', () => {
    expect(leerModo('')).toBe('alumno');
  });

  it('?profe lo activa y el navegador lo recuerda', () => {
    expect(leerModo('?profe')).toBe('profe');
    expect(leerModo('')).toBe('profe');
  });

  it('?alumno vuelve a modo alumno, también en las visitas siguientes', () => {
    leerModo('?profe');
    expect(leerModo('?alumno')).toBe('alumno');
    expect(leerModo('')).toBe('alumno');
  });

  it('con localStorage bloqueado el modo vale para esa visita', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    expect(leerModo('?profe')).toBe('profe');
    expect(leerModo('')).toBe('alumno');
  });
});

describe('paleta del kit', () => {
  const componentes = metadatos.components as { id: string; name: string }[];

  it('deja solo los componentes del kit, en su orden y con nombre en español', () => {
    expect(filtrarKit(componentes).map((c) => c.nombre)).toEqual([
      'LED',
      'LED RGB',
      'Resistencia',
      'Botón',
      'Buzzer',
      'Servo',
      'Potenciómetro',
      'Sensor de distancia',
      'Temperatura y humedad',
      'Pantalla LCD',
      'Display de 1 dígito',
      'Display de 4 dígitos',
      'Receptor infrarrojo',
      'Control remoto',
      'Protoboard',
      'Protoboard chica',
    ]);
  });

  it('no ofrece placas ni componentes fuera del kit', () => {
    const ids = filtrarKit(componentes).map((c) => c.componente.id);
    expect(ids).not.toContain('dht22');
    expect(ids.some((id) => /esp32|raspberry|arduino/.test(id))).toBe(false);
  });

  it('el buscador filtra por nombre, sin importar tildes ni mayúsculas', () => {
    expect(filtrarKit(componentes, 'serv').map((c) => c.nombre)).toEqual(['Servo']);
    expect(filtrarKit(componentes, 'BOTON').map((c) => c.nombre)).toEqual(['Botón']);
    expect(filtrarKit(componentes, 'xyz')).toEqual([]);
  });

  it('el inspector muestra el kit en español y solo lo que el alumno puede cambiar', () => {
    const copia = structuredClone(metadatos.components) as unknown as ComponentMetadata[];
    adaptarKit(copia);
    const de = (id: string) => copia.find((c) => c.id === id)!;
    const editables = (id: string) =>
      de(id).properties.filter((p) => p.control).map((p) => `${p.name}: ${p.description}`);
    expect(de('pushbutton').name).toBe('Botón');
    expect(de('hc-sr04').name).toBe('Sensor de distancia');
    expect(editables('pushbutton')).toEqual(['color: Color']);
    expect(editables('led')).toEqual(['color: Color']);
    expect(editables('resistor')).toEqual(['value: Resistencia (Ω)']);
    expect(editables('servo')).toEqual([]);
    const color = de('led').properties.find((p) => p.name === 'color')!;
    expect(color.options).toContain('green');
    expect(color.optionLabels?.green).toBe('Verde');
    // Lo que no es del kit queda como estaba.
    expect(de('lcd2004').name).toBe(metadatos.components.find((c) => c.id === 'lcd2004')!.name);
  });
});

describe('modo Texto', () => {
  const BLOQUES = JSON.stringify({ blocks: { blocks: [{ type: 'ab_al_iniciar', x: 1, y: 2 }] } });

  it('la marca se pone y se quita sin tocar los bloques', () => {
    const marcado = marcarTexto(BLOQUES, true);
    expect(esTexto(BLOQUES)).toBe(false);
    expect(esTexto(marcado)).toBe(true);
    expect(JSON.parse(marcado).blocks).toEqual(JSON.parse(BLOQUES).blocks);
    expect(marcarTexto(marcado, false)).toBe(BLOQUES);
  });

  it('un bloques.json corrupto no cuenta como modo Texto', () => {
    expect(esTexto('{ esto no es json')).toBe(false);
  });

  it('el código es de solo lectura solo con bloques y sin la marca', () => {
    const sketch = { name: 'sketch.ino', content: '' };
    expect(codigoSoloLectura([sketch])).toBe(false);
    expect(codigoSoloLectura([sketch, { name: ARCHIVO_BLOQUES, content: BLOQUES }])).toBe(true);
    expect(
      codigoSoloLectura([sketch, { name: ARCHIVO_BLOQUES, content: marcarTexto(BLOQUES, true) }]),
    ).toBe(false);
  });

  it('el modo y el código editado sobreviven a exportar e importar', () => {
    const GRUPO = 'group-arduino-uno';
    const proyecto = {
      boards: [
        { id: 'arduino-uno', boardKind: 'arduino-uno', x: 0, y: 0, activeFileGroupId: GRUPO },
      ] as never,
      fileGroups: {
        [GRUPO]: [
          { name: 'sketch.ino', content: '// escrito a mano\n' },
          { name: ARCHIVO_BLOQUES, content: marcarTexto(BLOQUES, true) },
        ],
      },
      components: [],
      wires: [],
      activeBoardId: 'arduino-uno',
    };
    useSimulatorStore.getState().loadProjectState(proyecto);
    const vlx = JSON.parse(JSON.stringify(buildVlxPayload({ name: 'prueba' })));
    useEditorStore.getState().deleteFileGroup(GRUPO);
    useSimulatorStore.getState().loadProjectState(vlx);

    const archivos = useEditorStore.getState().getGroupFiles(GRUPO);
    expect(archivos.find((a) => a.name === 'sketch.ino')!.content).toBe('// escrito a mano\n');
    expect(esTexto(archivos.find((a) => a.name === ARCHIVO_BLOQUES)!.content)).toBe(true);
    expect(codigoSoloLectura(archivos)).toBe(false);
  });
});
