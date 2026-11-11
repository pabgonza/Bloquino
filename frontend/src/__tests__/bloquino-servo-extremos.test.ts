// Servo en una placa AVR: el ángulo sale del ancho del pulso. Los pulsos de
// los extremos (write(0), write(180)) miden unos µs fuera de 544-2400 y el
// servo debe llegar igual a 0° y a 180°.
import { expect, it } from 'vitest';
import { PartSimulationRegistry } from '../simulation/parts/PartSimulationRegistry';
import '../simulation/parts/ComplexParts';

it('el servo llega a los extremos aunque el pulso mida unos µs de más o de menos', () => {
  const servo = { angle: 90 };
  let ciclos = 0;
  let pin = (_: number, __: boolean) => {};
  const sim = {
    getCurrentCycles: () => ciclos,
    pinManager: { onPinChange: (_: number, cb: typeof pin) => ((pin = cb), () => {}) },
  };
  PartSimulationRegistry.get('servo')!.attachEvents!(servo as any, sim as any, (nombre: string) =>
    nombre === 'PWM' ? 9 : null,
  );
  const pulso = (us: number) => {
    pin(9, true);
    ciclos += us * 16;
    pin(9, false);
    ciclos += (20000 - us) * 16;
    return servo.angle;
  };
  expect(pulso(1472)).toBe(90);
  expect(pulso(540)).toBe(0);
  expect(pulso(2404)).toBe(180);
  expect(pulso(1472)).toBe(90);
  expect(pulso(5000)).toBe(90); // no es un pulso de servo: se ignora
});
