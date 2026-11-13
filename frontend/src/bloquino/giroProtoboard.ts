// Lo asentado gira con la protoboard. Velxio gira cada pieza en torno al
// centro de su envoltorio (`.dynamic-component-wrapper`, medido sin el giro):
// cuando la protoboard gira `delta` grados, el centro de cada pieza asentada
// gira lo mismo en torno al de la protoboard y la pieza suma ese giro, así sus
// patitas siguen sobre los mismos agujeros.
type Pieza = { id: string; x: number; y: number; properties: Record<string, unknown> };
type Medio = (id: string) => { w: number; h: number } | null;

const medioDelDom: Medio = (id) => {
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

/** Posición y giro de `pieza` cuando `protoboard` gira `delta` grados (null si no se pueden medir). */
export function girarConProtoboard(protoboard: Pieza, pieza: Pieza, delta: number, medio = medioDelDom) {
  const mp = medio(protoboard.id);
  const mc = medio(pieza.id);
  if (!mp || !mc) return null;
  const [cos, sen] = cosSen(delta);
  const cx = protoboard.x + mp.w;
  const cy = protoboard.y + mp.h;
  const dx = pieza.x + mc.w - cx;
  const dy = pieza.y + mc.h - cy;
  return {
    x: cx + dx * cos - dy * sen - mc.w,
    y: cy + dx * sen + dy * cos - mc.h,
    rotation: ((((Number(pieza.properties.rotation) || 0) + delta) % 360) + 360) % 360,
  };
}
