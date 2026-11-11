// @vitest-environment jsdom
/**
 * Proyecto del alumno (h4): guardado automático en el navegador, restauración
 * y archivo .bloquino, contra los escenarios de openspec (proyecto/autosave-local
 * y proyecto/archivo).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ARCHIVO_BLOQUES, BLOQUES_INICIALES, esTexto, marcarTexto } from '../blocks/archivo';
import {
  abrir,
  autoguardar,
  descargar,
  descartar,
  restaurar,
  type Guardado,
} from '../bloquino/proyecto';
import { useEditorStore } from '../store/useEditorStore';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { buildVlxPayload, parseVlxFile } from '../utils/vlxFile';

const CLAVE = 'bloquino-proyecto';
// El proyecto con que parte la página: UNO, LED del pin 13 y sketch de parpadeo.
const INICIAL = JSON.stringify(buildVlxPayload());
const GRUPO = 'group-arduino-uno';

const cargar = (json: string) => useSimulatorStore.getState().loadProjectState(JSON.parse(json));
const proyecto = () => {
  const { exportedAt: _fecha, name: _nombre, ...resto } = buildVlxPayload();
  return resto;
};
const archivoDe = (nombre: string) => useEditorStore.getState().files.find((a) => a.name === nombre)!;
const agregarLed = () => {
  const sim = useSimulatorStore.getState();
  sim.setComponents([
    ...sim.components,
    { id: 'led-prueba', metadataId: 'led', x: 300, y: 80, properties: { color: 'red' } },
  ]);
};
const tieneLed = () =>
  useSimulatorStore.getState().components.some((c) => c.id === 'led-prueba');
const archivo = (contenido: unknown, nombre = 'proyecto.bloquino') =>
  new File([typeof contenido === 'string' ? contenido : JSON.stringify(contenido)], nombre);
const salir = () => window.dispatchEvent(new Event('pagehide'));

beforeEach(() => {
  localStorage.clear();
  cargar(INICIAL);
});
afterEach(() => {
  descartar();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('guardado automático', () => {
  let estados: Guardado[];
  let parar: () => void;
  beforeEach(() => {
    vi.useFakeTimers();
    estados = [];
    parar = autoguardar((estado) => estados.push(estado));
  });
  afterEach(() => parar());

  it('guarda un segundo después del último cambio', () => {
    agregarLed();
    expect(estados).toEqual(['guardando']);
    expect(localStorage.getItem(CLAVE)).toBeNull();
    vi.advanceTimersByTime(1000);
    expect(estados).toEqual(['guardando', 'guardado']);
    const guardado = JSON.parse(localStorage.getItem(CLAVE)!);
    expect(guardado.components.map((c: { id: string }) => c.id)).toContain('led-prueba');
  });

  it('un cambio de código también se guarda', () => {
    useEditorStore.getState().setFileContent(archivoDe('sketch.ino').id, '// otro\n');
    vi.advanceTimersByTime(1000);
    expect(JSON.parse(localStorage.getItem(CLAVE)!).fileGroups[GRUPO][0].content).toBe('// otro\n');
  });

  it('lo que cambia en el store sin cambiar el proyecto no guarda', () => {
    const sim = useSimulatorStore.getState();
    useSimulatorStore.setState({ serialOutput: 'hola', boards: [...sim.boards] });
    vi.advanceTimersByTime(5000);
    expect(estados).toEqual([]);
    expect(localStorage.getItem(CLAVE)).toBeNull();
  });

  it('al salir de la página guarda lo pendiente', () => {
    agregarLed();
    salir();
    expect(localStorage.getItem(CLAVE)).toContain('led-prueba');
    expect(estados.at(-1)).toBe('guardado');
  });

  it('con el almacenamiento bloqueado avisa y no lanza', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    agregarLed();
    vi.advanceTimersByTime(1000);
    expect(estados.at(-1)).toBe('error');
  });

  it('tras descartar el proyecto, salir no vuelve a guardarlo', () => {
    agregarLed();
    vi.advanceTimersByTime(1000);
    agregarLed();
    descartar();
    salir();
    expect(localStorage.getItem(CLAVE)).toBeNull();
  });
});

describe('restaurar al abrir', () => {
  it('sin nada guardado queda el proyecto inicial, con sus bloques', async () => {
    const antes = useSimulatorStore.getState().components;
    await restaurar();
    expect(useSimulatorStore.getState().components).toEqual(antes);
    expect(archivoDe(ARCHIVO_BLOQUES).content).toBe(BLOQUES_INICIALES);
  });

  it('devuelve el proyecto guardado, con su modo Texto', async () => {
    await restaurar();
    const parar = autoguardar(() => {});
    agregarLed();
    const editor = useEditorStore.getState();
    editor.setFileContent(archivoDe('sketch.ino').id, '// escrito a mano\n');
    editor.setGroupFileContent(
      GRUPO,
      archivoDe(ARCHIVO_BLOQUES).id,
      marcarTexto(BLOQUES_INICIALES, true),
    );
    parar(); // como al cerrar la página: guarda lo pendiente

    cargar(INICIAL);
    expect(tieneLed()).toBe(false);
    await restaurar();
    expect(tieneLed()).toBe(true);
    expect(archivoDe('sketch.ino').content).toBe('// escrito a mano\n');
    expect(esTexto(archivoDe(ARCHIVO_BLOQUES).content)).toBe(true);
  });

  it.each([
    ['JSON roto', '{ esto no es json'],
    ['otro JSON', '{"hola":1}'],
    ['proyecto sin placa', JSON.stringify({ ...JSON.parse(INICIAL), boards: [] })],
  ])('con %s guardado abre el proyecto inicial', async (_caso, guardado) => {
    localStorage.setItem(CLAVE, guardado);
    await expect(restaurar()).resolves.toBeUndefined();
    expect(useSimulatorStore.getState().boards.map((b) => b.boardKind)).toEqual(['arduino-uno']);
    expect(esTexto(archivoDe(ARCHIVO_BLOQUES).content)).toBe(false);
  });

  it('con el almacenamiento bloqueado abre el proyecto inicial', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    await expect(restaurar()).resolves.toBeUndefined();
    expect(useSimulatorStore.getState().boards).toHaveLength(1);
  });
});

describe('archivo de proyecto', () => {
  it('rechaza lo que no es un proyecto y deja intacto el actual', async () => {
    agregarLed();
    const antes = proyecto();
    await expect(abrir(archivo('una foto', 'foto.png'))).rejects.toThrow(
      'no es un proyecto de Bloquino',
    );
    await expect(abrir(archivo({ hola: 1 }))).rejects.toThrow('no es un proyecto de Bloquino');
    expect(proyecto()).toEqual(antes);
  });

  it('rechaza un proyecto que no es para un solo Arduino UNO', async () => {
    agregarLed();
    const antes = proyecto();
    const base = JSON.parse(INICIAL);
    const esp32 = { ...base, boards: [{ ...base.boards[0], boardKind: 'esp32' }] };
    await expect(abrir(archivo(esp32, 'otro.vlx'))).rejects.toThrow('Arduino UNO');
    await expect(abrir(archivo({ ...base, boards: [] }))).rejects.toThrow('Arduino UNO');
    expect(proyecto()).toEqual(antes);
  });

  it('un .vlx sin bloques abre en modo Texto con su código intacto', async () => {
    const vlx = JSON.parse(INICIAL);
    vlx.fileGroups[GRUPO] = [{ name: 'sketch.ino', content: '// de Velxio\n' }];
    await abrir(archivo(vlx, 'velxio.vlx'));
    expect(archivoDe('sketch.ino').content).toBe('// de Velxio\n');
    expect(esTexto(archivoDe(ARCHIVO_BLOQUES).content)).toBe(true);
  });

  it('lo descargado es un .vlx válido y vuelve a abrirse igual', async () => {
    let blob!: Blob;
    let nombreDescarga = '';
    URL.createObjectURL = (b) => ((blob = b as Blob), 'blob:prueba');
    URL.revokeObjectURL = () => {};
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      nombreDescarga = this.download;
    });

    await restaurar();
    agregarLed();
    const antes = proyecto();
    descargar('semaforo');
    expect(nombreDescarga).toBe('semaforo.bloquino');

    const descargado = new File([blob], nombreDescarga);
    expect((await parseVlxFile(descargado)).name).toBe('semaforo');
    cargar(INICIAL);
    await abrir(descargado);
    expect(proyecto()).toEqual(antes);
  });
});
