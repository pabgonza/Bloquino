// Modo alumno (por defecto) o modo profe. `?profe` y `?alumno` en la URL lo
// fijan y el navegador lo recuerda; el modo profe es el editor completo de Velxio.
export type Modo = 'alumno' | 'profe';

const CLAVE = 'bloquino-modo';

export function leerModo(search = window.location.search): Modo {
  const parametros = new URLSearchParams(search);
  const pedido: Modo | null = parametros.has('profe')
    ? 'profe'
    : parametros.has('alumno')
      ? 'alumno'
      : null;
  try {
    if (pedido) localStorage.setItem(CLAVE, pedido);
    return pedido ?? (localStorage.getItem(CLAVE) === 'profe' ? 'profe' : 'alumno');
  } catch {
    // El navegador niega localStorage: el modo vale solo para esta visita.
    return pedido ?? 'alumno';
  }
}
