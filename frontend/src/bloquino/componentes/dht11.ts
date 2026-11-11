// Simulación del DHT11 del kit. Es el DHT22 de Velxio (mismo protocolo de un
// hilo y mismos tiempos) con la codificación de datos del DHT11: un byte entero
// de humedad y uno de temperatura, sin decimales ni negativos.
import { PartSimulationRegistry } from '../../simulation/parts/PartSimulationRegistry';
import { assertedLow, releasedLow } from '../../simulation/line/padEvent';
import { numberField, registerLineModel } from '../../simulation/line/lineModels';
import { dht22Frame } from '../../simulation/line/models/dht22';
import { releaseLineGap, requestLine } from '../../simulation/line/requestLine';
import { registerSensorUpdate, unregisterSensorUpdate } from '../../simulation/SensorUpdateRegistry';
import { registerSensorControls } from '../../simulation/sensorControlConfig';

const TEMPERATURA = 25; // °C al empezar
const HUMEDAD = 50; // % al empezar

/** Los 5 bytes que envía un DHT11: humedad, 0, temperatura, 0 y suma. */
export function tramaDht11(temperatura: number, humedad: number) {
  const h = Math.round(humedad);
  const t = Math.round(temperatura);
  return new Uint8Array([h, 0, t, 0, (h + t) & 0xff]);
}

// Modelo de línea: responde con la trama cuando la placa baja la línea y la suelta.
registerLineModel('dht11', (rec) => {
  const pin = rec.pin;
  let temperatura = numberField(rec.temperature, TEMPERATURA);
  let humedad = numberField(rec.humidity, HUMEDAD);
  let estuvoBaja = false;
  let ocupadoHasta = -Infinity; // mientras responde, el sensor no escucha
  return {
    listens: [pin],
    drives: [pin],
    rest: () => [{ pin, level: true, driven: false }],
    onPad(e, reloj) {
      const ahora = reloj.now();
      if (ahora < ocupadoHasta) return null;
      if (assertedLow(e)) {
        estuvoBaja = true;
        return null;
      }
      if (!releasedLow(e) || !estuvoBaja) return null;
      estuvoBaja = false;
      const trama = dht22Frame(pin, ahora, tramaDht11(temperatura, humedad), reloj.us);
      ocupadoHasta = trama.releaseAtCycle ?? trama.edges[trama.edges.length - 1].atCycle;
      return trama;
    },
    update(props) {
      if ('temperature' in props) temperatura = numberField(props.temperature, temperatura);
      if ('humidity' in props) humedad = numberField(props.humidity, humedad);
    },
    reset() {
      estuvoBaja = false;
      ocupadoHasta = -Infinity;
    },
  };
});

// Controles que el alumno mueve durante la simulación (rangos del DHT11 real).
registerSensorControls({
  dht11: {
    title: 'DHT11',
    controls: [
      {
        type: 'slider',
        key: 'temperature',
        label: 'Temperatura',
        min: 0,
        max: 50,
        step: 1,
        unit: '°C',
        defaultValue: TEMPERATURA,
      },
      {
        type: 'slider',
        key: 'humidity',
        label: 'Humedad',
        min: 20,
        max: 90,
        step: 1,
        unit: '%',
        defaultValue: HUMEDAD,
      },
    ],
    defaultValues: { temperature: TEMPERATURA, humidity: HUMEDAD },
  },
});

// Parte: une el componente del lienzo con el modelo, en la placa a la que está cableado.
PartSimulationRegistry.register('dht11', {
  attachEvents: (elemento, simulador, pinDe, id) => {
    const pin = pinDe('S');
    if (pin === null) return () => {};
    const el = elemento as { temperature?: number; humidity?: number };
    const valores = () => ({
      temperature: el.temperature ?? TEMPERATURA,
      humidity: el.humidity ?? HUMEDAD,
    });
    const linea = requestLine(
      simulador,
      { sensor_type: 'dht11', pin, ...valores() },
      { componentId: id },
    );
    registerSensorUpdate(id, (nuevos) => {
      if ('temperature' in nuevos) el.temperature = nuevos.temperature as number;
      if ('humidity' in nuevos) el.humidity = nuevos.humidity as number;
      if (linea.mode !== 'none') linea.update(valores());
    });
    return () => {
      if (linea.mode !== 'none') linea.release();
      else releaseLineGap(id);
      unregisterSensorUpdate(id);
    };
  },
});
