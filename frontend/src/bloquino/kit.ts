// Componentes del kit del curso: lo único que ofrece la paleta del alumno, en
// este orden. El nombre visible sale de i18n (bloquino.json → kit). Cada hito
// que suma un componente lo agrega aquí y allá.
import textos from '../i18n/locales/es/bloquino.json';
import type { ComponentMetadata } from '../types/component-metadata';

const NOMBRES: Record<string, string> = textos.kit;
// Lo que el alumno puede cambiar de cada componente en el inspector.
const PROPIEDADES: Record<
  string,
  Record<string, { nombre: string; opciones?: Record<string, string> }>
> = textos.propiedades;
const sinTildes = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** Los componentes del kit cuyo nombre contiene la búsqueda, con su nombre en español. */
export function filtrarKit<T extends { id: string }>(componentes: readonly T[], busqueda = '') {
  const buscado = sinTildes(busqueda.trim());
  return Object.keys(NOMBRES).flatMap((id) => {
    const componente = componentes.find((c) => c.id === id);
    return componente && sinTildes(NOMBRES[id]).includes(buscado)
      ? [{ componente, nombre: NOMBRES[id] }]
      : [];
  });
}

/** Deja los metadatos del kit como los ve el alumno en el inspector: el nombre
 *  en español y, editables, solo las propiedades de PROPIEDADES. */
export function adaptarKit(componentes: readonly ComponentMetadata[]) {
  for (const c of componentes) {
    if (!NOMBRES[c.id]) continue;
    c.name = NOMBRES[c.id];
    // Propiedades que agrega Bloquino y Velxio no tiene (el tipo del display).
    for (const [name, { opciones }] of Object.entries(PROPIEDADES[c.id] ?? {}))
      if (!c.properties.some((p) => p.name === name))
        c.properties.push({ name, type: 'string', defaultValue: Object.keys(opciones ?? {})[0] ?? '' });
    for (const p of c.properties) {
      const propia = PROPIEDADES[c.id]?.[p.name];
      p.control = propia ? (propia.opciones ? 'select' : 'text') : undefined;
      if (!propia) continue;
      p.description = propia.nombre;
      if (propia.opciones) Object.assign(p, { options: Object.keys(propia.opciones), optionLabels: propia.opciones });
    }
  }
}
