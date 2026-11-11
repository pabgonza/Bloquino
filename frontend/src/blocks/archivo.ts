// Los bloques son la fuente de verdad del programa: viajan con el proyecto en
// este archivo del grupo de la placa. Se declara "solo proyecto"
// (utils/projectOnlyFiles) para que nunca llegue al compilador.
export const ARCHIVO_BLOQUES = 'bloques.json';

(
  globalThis as { __velxio_project_only_file__?: (nombre: string) => boolean }
).__velxio_project_only_file__ = (nombre) => nombre === ARCHIVO_BLOQUES;
