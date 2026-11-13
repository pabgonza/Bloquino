// @vitest-environment jsdom
/**
 * Cargar a la placa con varias placas (change varias-placas): se carga la
 * placa elegida, el avance la nombra y cada placa recuerda su puerto. La
 * compilación se simula fallida: lo que se prueba es el puerto y el nombre.
 */
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { cargarALaPlaca, useCarga } from '../bloquino/flash/cargar';
import { numerar } from '../bloquino/placas';
import { useSimulatorStore } from '../store/useSimulatorStore';

const compilar = vi.hoisted(() => vi.fn());
vi.mock('../utils/boardCompile', () => ({
  compileBoardForFlash: compilar,
  collectSketchFilesForBoard: () => [],
}));

const pedidos = vi.fn();
const sim = () => useSimulatorStore.getState();

beforeAll(() => {
  Object.defineProperty(navigator, 'serial', {
    configurable: true,
    value: {
      getPorts: async () => [{ id: 'autorizado' }],
      requestPort: async () => {
        pedidos();
        return { id: `elegido-${pedidos.mock.calls.length}` };
      },
      addEventListener: () => {},
    },
  });
  compilar.mockResolvedValue({ ok: false, error: 'no compila' });
});

describe('Cargar con varias placas', () => {
  it('con una placa usa el puerto ya autorizado', async () => {
    await cargarALaPlaca();
    expect(pedidos).not.toHaveBeenCalled();
    expect(useCarga.getState().nombre).toBeUndefined();
    expect(useCarga.getState().carga).toMatchObject({ fase: 'error' });
  });

  it('cada placa pide su puerto una vez y el avance dice cuál se carga', async () => {
    const uno = sim().boards[0].id;
    const dos = sim().addBoard('arduino-uno', 400, 0);
    numerar();
    sim().setActiveBoardId(dos);
    await cargarALaPlaca();
    expect(pedidos).toHaveBeenCalledTimes(1);
    expect(useCarga.getState().nombre).toBe('Placa 2');
    expect(compilar.mock.lastCall![0].id).toBe(dos);
    await cargarALaPlaca();
    expect(pedidos).toHaveBeenCalledTimes(1);
    sim().setActiveBoardId(uno);
    await cargarALaPlaca();
    // La Placa 1 ya tenía el puerto autorizado de cuando era la única.
    expect(pedidos).toHaveBeenCalledTimes(1);
    expect(useCarga.getState().nombre).toBe('Placa 1');
  });
});
