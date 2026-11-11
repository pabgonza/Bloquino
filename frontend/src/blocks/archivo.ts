// Los bloques son la fuente de verdad del programa: viajan con el proyecto en
// este archivo del grupo de la placa. Se declara "solo proyecto"
// (utils/projectOnlyFiles) para que nunca llegue al compilador.
export const ARCHIVO_BLOQUES = 'bloques.json';

(
  globalThis as { __velxio_project_only_file__?: (nombre: string) => boolean }
).__velxio_project_only_file__ = (nombre) => nombre === ARCHIVO_BLOQUES;

// Modo Texto: el alumno edita el C++ a mano y los bloques dejan de regenerarlo.
// Se guarda como una marca dentro del mismo archivo (Blockly ignora las claves
// que no conoce), así el proyecto recuerda el modo y los bloques no se pierden.

/** ¿El contenido de bloques.json tiene la marca de modo Texto? */
export function esTexto(contenido: string): boolean {
  try {
    return JSON.parse(contenido).texto === true;
  } catch {
    return false;
  }
}

/** El contenido de bloques.json con la marca de modo Texto puesta o quitada. */
export function marcarTexto(contenido: string, texto: boolean): string {
  const { texto: _anterior, ...bloques } = JSON.parse(contenido);
  return JSON.stringify(texto ? { ...bloques, texto: true } : bloques);
}

/** El código se genera y no se edita: proyecto de bloques que no está en modo Texto. */
export function codigoSoloLectura(archivos: readonly { name: string; content: string }[]): boolean {
  const bloques = archivos.find((a) => a.name === ARCHIVO_BLOQUES);
  return !!bloques && !esTexto(bloques.content);
}
