// LED RGB de ánodo común (el del kit): cada color prende en bajo.
import { describe, it, expect } from 'vitest';
import { PartSimulationRegistry } from '../simulation/parts/PartSimulationRegistry';
import '../simulation/parts/ComplexParts';

const PINES: Record<string, number> = { R: 9, G: 10, B: 11 };

/** Un LED RGB con sus pines en 9, 10 y 11; devuelve el elemento y cómo mover los pines. */
function armar(common?: string) {
  const digital: Record<number, (pin: number, estado: boolean) => void> = {};
  const pwm: Record<number, (pin: number, dc: number) => void> = {};
  const pinManager = {
    onPinChange: (p: number, cb: (pin: number, estado: boolean) => void) => ((digital[p] = cb), () => {}),
    onPwmChange: (p: number, cb: (pin: number, dc: number) => void) => ((pwm[p] = cb), () => {}),
  };
  const el = { common, ledRed: 0, ledGreen: 0, ledBlue: 0 } as Record<string, unknown>;
  PartSimulationRegistry.get('rgb-led')!.attachEvents!(
    el as unknown as HTMLElement,
    { pinManager } as never,
    (nombre: string) => PINES[nombre] ?? null,
  );
  const color = () => [el.ledRed, el.ledGreen, el.ledBlue];
  return { digital, pwm, color };
}

describe('LED RGB de ánodo común', () => {
  it('rojo en bajo y los otros en alto: se ve solo el rojo', () => {
    const { digital, color } = armar('anode');
    digital[9](9, false);
    digital[10](10, true);
    digital[11](11, true);
    expect(color()).toEqual([255, 0, 0]);
  });

  it('con PWM brilla según 255 - valor', () => {
    const { pwm, color } = armar('anode');
    pwm[9](9, 0);
    pwm[10](10, 1);
    pwm[11](11, 0.5);
    expect(color()).toEqual([255, 0, 127]);
  });

  it('sin la propiedad es de cátodo común', () => {
    const { digital, pwm, color } = armar();
    digital[9](9, true);
    pwm[10](10, 0);
    pwm[11](11, 1);
    expect(color()).toEqual([255, 0, 255]);
  });
});
