// Servo en una placa AVR: el ángulo sale del ancho del pulso. Los pulsos de
// los extremos (write(0), write(180)) miden unos µs fuera de 544-2400 y el
// servo debe llegar igual a 0° y a 180°. Gira a velocidad constante, como el
// de Tinkercad: 160° por segundo de tiempo de la placa.
import { expect, it } from 'vitest';
import { PartSimulationRegistry } from '../simulation/parts/PartSimulationRegistry';
import '../simulation/parts/ComplexParts';

/** Un servo en `angle` y `pulsos(us, n)`: n pulsos de ese ancho, uno cada 20 ms. */
function armar(angle: number) {
  const servo = { angle };
  let ciclos = 0;
  let pin = (_: number, __: boolean) => {};
  const sim = {
    getCurrentCycles: () => ciclos,
    pinManager: { onPinChange: (_: number, cb: typeof pin) => ((pin = cb), () => {}) },
  };
  const pinDe = (nombre: string) => (nombre === 'PWM' ? 9 : null);
  PartSimulationRegistry.get('servo')!.attachEvents!(servo as any, sim as any, pinDe, 'servo');
  const pulsos = (us: number, n: number) => {
    for (let i = 0; i < n; i++) {
      pin(9, true);
      ciclos += us * 16;
      pin(9, false);
      ciclos += (20000 - us) * 16;
    }
    return servo.angle;
  };
  return pulsos;
}

it('el servo llega a los extremos aunque el pulso mida unos µs de más o de menos', () => {
  const pulsos = armar(90);
  const segundoYMedio = 75;
  expect(pulsos(1472, segundoYMedio)).toBe(90);
  expect(pulsos(540, segundoYMedio)).toBe(0);
  expect(pulsos(2404, segundoYMedio)).toBe(180);
  expect(pulsos(1472, segundoYMedio)).toBe(90);
  expect(pulsos(5000, segundoYMedio)).toBe(90); // no es un pulso de servo: se ignora
});

it('gira a velocidad constante: de 0° a 180° en algo más de un segundo', () => {
  const pulsos = armar(0);
  expect(pulsos(2400, 1)).toBeLessThan(4); // no salta
  const medio = pulsos(2400, 24); // a los 0,5 s: 160°/s × 0,5 s
  expect(medio).toBeGreaterThan(75);
  expect(medio).toBeLessThan(82);
  const casi = pulsos(2400, 25); // al segundo
  expect(casi).toBeGreaterThan(155);
  expect(casi).toBeLessThan(162);
  expect(pulsos(2400, 10)).toBe(180); // a los 1,2 s ya llegó
});

it('otra orden antes de llegar lo devuelve desde donde iba', () => {
  const pulsos = armar(0);
  const ida = pulsos(2400, 15); // 0,3 s hacia 180°
  expect(ida).toBeGreaterThan(40);
  expect(ida).toBeLessThan(55);
  expect(pulsos(544, 5)).toBeCloseTo(ida - 16, 0); // 0,1 s de vuelta
  expect(pulsos(544, 20)).toBe(0);
});
