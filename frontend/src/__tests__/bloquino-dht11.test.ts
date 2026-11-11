/**
 * DHT11 (h5): trama del sensor y parte de simulación, contra los escenarios de
 * openspec (componentes/dht11). La lectura con la librería real está en
 * bloques-dht11.integration.test.ts.
 */
import { describe, expect, it } from 'vitest';
import { tramaDht11 } from '../bloquino/componentes/dht11';
import { AVRSimulator } from '../simulation/AVRSimulator';
import { PinManager } from '../simulation/PinManager';
import { PartSimulationRegistry } from '../simulation/parts/PartSimulationRegistry';
import { dispatchSensorUpdate } from '../simulation/SensorUpdateRegistry';
import { getSensorControl } from '../simulation/sensorControlConfig';
import { SINGLE_WIRE_SENSOR_MODELS } from '../simulation/sensorModels';

const parte = PartSimulationRegistry.get('dht11')!;
const conectar = (pin: number | null, elemento = {}) => {
  const sim = new AVRSimulator(new PinManager());
  const soltar = parte.attachEvents!(elemento as never, sim as never, () => pin, 'dht-prueba');
  return { sim, soltar };
};

describe('DHT11', () => {
  it('la trama lleva humedad y temperatura enteras y su suma', () => {
    expect([...tramaDht11(23, 61)]).toEqual([61, 0, 23, 0, 84]);
    expect([...tramaDht11(31.4, 76.6)]).toEqual([77, 0, 31, 0, 108]);
  });

  it('con la patita S cableada, la placa aloja el sensor en ese pin', () => {
    const { sim, soltar } = conectar(2);
    expect(sim.lineHub().size).toBe(1);
    expect(sim.ownsPin(2)).toBe(true);
    soltar();
    expect(sim.lineHub().size).toBe(0);
  });

  it('sin cable de datos no registra nada y la simulación sigue', () => {
    const { sim, soltar } = conectar(null);
    expect(sim.lineHub().size).toBe(0);
    expect(() => soltar()).not.toThrow();
  });

  it('el panel mueve temperatura y humedad dentro de los rangos del sensor real', () => {
    const controles = getSensorControl('dht11')!.controls.map((c) =>
      c.type === 'slider' ? [c.label, c.min, c.max, c.unit, c.defaultValue] : [],
    );
    expect(controles).toEqual([
      ['Temperatura', 0, 50, '°C', 25],
      ['Humedad', 20, 90, '%', 50],
    ]);
    const elemento: { temperature?: number; humidity?: number } = {};
    const { soltar } = conectar(2, elemento);
    dispatchSensorUpdate('dht-prueba', { temperature: 31 });
    expect(elemento.temperature).toBe(31);
    soltar();
  });

  it('está declarado como dueño de su línea, con S como patita de datos', () => {
    expect(SINGLE_WIRE_SENSOR_MODELS.dht11).toMatchObject({ sensorType: 'dht11', dataPinName: 'S' });
  });
});
