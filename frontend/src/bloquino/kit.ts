// Componentes del kit del curso: lo único que ofrece la paleta del alumno, en
// este orden. El nombre visible sale de i18n (bloquino.json → kit). Cada hito
// que suma un componente lo agrega aquí y allá.
import textos from '../i18n/locales/es/bloquino.json';

const NOMBRES: Record<string, string> = textos.kit;
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
