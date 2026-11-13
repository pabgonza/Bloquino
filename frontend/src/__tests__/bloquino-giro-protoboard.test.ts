import { describe, it, expect } from 'vitest';
import { agujerosGirados, girarConProtoboard } from '../bloquino/giroProtoboard';

// Protoboard de 200×100 en (0, 0) (centro 100, 50); LED de 20×40.
const medio = (id: string) => (id === 'bb' ? { w: 100, h: 50 } : { w: 10, h: 20 });
const bb = { id: 'bb', x: 0, y: 0, properties: {} };
const led = { id: 'led', x: 140, y: 10, properties: {} }; // centro (150, 30)

describe('girarConProtoboard', () => {
  it('90°: el centro de la pieza gira en torno al de la protoboard y la pieza suma el giro', () => {
    // (150, 30) − (100, 50) = (50, −20) → girado 90° = (20, 50) → centro (120, 100)
    expect(girarConProtoboard(bb, led, 90, medio)).toEqual({ x: 110, y: 80, rotation: 90 });
  });

  it('girar y volver deja la pieza donde estaba', () => {
    const ida = girarConProtoboard(bb, led, 90, medio)!;
    const vuelta = girarConProtoboard(bb, { ...led, x: ida.x, y: ida.y, properties: { rotation: ida.rotation } }, -90, medio);
    expect(vuelta).toEqual({ x: 140, y: 10, rotation: 0 });
  });

  it('cuatro giros de 90° dan la vuelta completa', () => {
    let p = { ...led, properties: { rotation: 270 } as Record<string, unknown> };
    for (let i = 0; i < 4; i++) {
      const r = girarConProtoboard(bb, p, 90, medio)!;
      p = { ...p, x: r.x, y: r.y, properties: { rotation: r.rotation } };
    }
    expect(p).toMatchObject({ x: 140, y: 10, properties: { rotation: 270 } });
  });

  it('sin medidas no mueve nada', () => {
    expect(girarConProtoboard(bb, led, 90, () => null)).toBeNull();
  });
});

describe('agujerosGirados', () => {
  // Envoltorio de 200×100: su centro queda en (94, 44) del elemento (6 px adentro).
  const agujeros = [{ name: 'a', x: 104, y: 44 }];
  it('sin giro devuelve los mismos agujeros', () => {
    expect(agujerosGirados({ id: 'bb' }, agujeros, medio)).toBe(agujeros);
  });
  it('girada 90°: cada agujero gira en torno al centro del envoltorio', () => {
    expect(agujerosGirados({ id: 'bb', properties: { rotation: 90 } }, agujeros, medio)).toEqual([{ name: 'a', x: 94, y: 54 }]);
  });
  it('girada y sin medidas: null, como antes', () => {
    expect(agujerosGirados({ id: 'bb', properties: { rotation: 90 } }, agujeros, () => null)).toBeNull();
  });
});
