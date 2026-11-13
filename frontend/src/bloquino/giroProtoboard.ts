// Lo asentado gira con la protoboard. Velxio gira cada pieza en torno al
// centro de su envoltorio (`.dynamic-component-wrapper`, medido sin el giro):
// cuando la protoboard gira `delta` grados, el centro de cada pieza asentada
// gira lo mismo en torno al de la protoboard y la pieza suma ese giro, así sus
// patitas siguen sobre los mismos agujeros.
type Pieza = { id: string; x: number; y: number; properties: Record<string, unknown> };
type Medio = (id: string) => { w: number; h: number } | null;

export const medioDelDom: Medio = (id) => {
  const caja = globalThis.document?.getElementById(id)?.closest<HTMLElement>('.dynamic-component-wrapper');
  return caja ? { w: caja.offsetWidth / 2, h: caja.offsetHeight / 2 } : null;
};

const cosSen = (grados: number) => {
  const t = (grados * Math.PI) / 180;
  // Redondeados: en giros de 90° el seno y el coseno son exactos.
  return [Math.round(Math.cos(t) * 1e9) / 1e9, Math.round(Math.sin(t) * 1e9) / 1e9];
};

const girados = new Map<string, readonly { x: number; y: number }[]>();

/**
 * Agujeros de una protoboard girada, en coordenadas de su elemento: Velxio los
 * da sin girar y por eso no asentaba nada en una protoboard girada. Se giran en
 * torno al centro del envoltorio (el elemento está 6 px adentro). Sin giro
 * devuelve los mismos; null si la protoboard no se puede medir.
 */
export function agujerosGirados<H extends { x: number; y: number }>(
  bb: { id: string; properties?: Record<string, unknown> },
  agujeros: readonly H[] | null,
  medio = medioDelDom,
): readonly H[] | null {
  const giro = Number(bb.properties?.rotation) || 0;
  if (!agujeros || !giro) return agujeros;
  const m = medio(bb.id);
  if (!m) return null;
  const [cx, cy] = [m.w - 6, m.h - 6];
  const clave = `${agujeros.length}|${giro}|${cx}|${cy}`;
  if (!girados.has(clave)) {
    const [cos, sen] = cosSen(giro);
    girados.set(
      clave,
      agujeros.map((h) => ({
        ...h,
        x: cx + (h.x - cx) * cos - (h.y - cy) * sen,
        y: cy + (h.x - cx) * sen + (h.y - cy) * cos,
      })),
    );
  }
  return girados.get(clave) as readonly H[];
}

/** Un punto girado `delta` grados en torno a `c`. */
export function girarPunto(c: { x: number; y: number }, p: { x: number; y: number }, delta: number) {
  const [cos, sen] = cosSen(delta);
  const [dx, dy] = [p.x - c.x, p.y - c.y];
  return { x: c.x + dx * cos - dy * sen, y: c.y + dx * sen + dy * cos };
}

/** Posición y giro de `pieza` cuando gira `delta` grados en torno al punto `c` (null si no se puede medir). */
export function girarEnTorno(c: { x: number; y: number }, pieza: Pieza, delta: number, medio = medioDelDom) {
  const m = medio(pieza.id);
  if (!m) return null;
  const centro = girarPunto(c, { x: pieza.x + m.w, y: pieza.y + m.h }, delta);
  return {
    x: centro.x - m.w,
    y: centro.y - m.h,
    rotation: ((((Number(pieza.properties.rotation) || 0) + delta) % 360) + 360) % 360,
  };
}

/** Posición y giro de `pieza` cuando `protoboard` gira `delta` grados (null si no se pueden medir). */
export function girarConProtoboard(protoboard: Pieza, pieza: Pieza, delta: number, medio = medioDelDom) {
  const mp = medio(protoboard.id);
  if (!mp) return null;
  return girarEnTorno({ x: protoboard.x + mp.w, y: protoboard.y + mp.h }, pieza, delta, medio);
}
