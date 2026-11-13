// Proyecto del alumno: se guarda solo en el navegador (uno por navegador) y
// viaja como archivo .bloquino, que es el .vlx de Velxio con otra extensión.
import { ARCHIVO_BLOQUES, BLOQUES_INICIALES, marcarTexto } from '../blocks/archivo';
import { useEditorStore } from '../store/useEditorStore';
import { useSimulatorStore } from '../store/useSimulatorStore';
import type { BoardInstance } from '../types/board';
import { buildVlxBlob, buildVlxPayload, parseVlxFile } from '../utils/vlxFile';
import textos from '../i18n/locales/es/bloquino.json';

const CLAVE = 'bloquino-proyecto';
const ESPERA = 1000; // ms sin cambios antes de guardar

export type Guardado = 'guardado' | 'guardando' | 'error';

let nombre = textos.nombrePorDefecto;
export const nombreProyecto = () => nombre;
let pendiente: ReturnType<typeof setTimeout> | undefined;

// Sin la fecha, dos fotos del mismo proyecto son iguales.
const foto = () => JSON.stringify({ ...buildVlxPayload({ name: nombre }), exportedAt: '' });

/** Reemplaza el proyecto en curso por el de un archivo .bloquino o .vlx. */
export async function abrir(archivo: File) {
  const proyecto = await parseVlxFile(archivo).catch(() => {
    throw new Error(textos.archivoInvalido);
  });
  if (proyecto.boards.some((b) => b.boardKind !== 'arduino-uno')) throw new Error(textos.archivoOtraPlaca);
  // Sin bloques, el código se escribió a mano: abre en modo Texto para que el
  // panel de bloques no lo regenere.
  for (const placa of proyecto.boards) {
    const archivos = (proyecto.fileGroups[placa.activeFileGroupId] ??= []);
    if (!archivos.some((a) => a.name === ARCHIVO_BLOQUES))
      archivos.push({ name: ARCHIVO_BLOQUES, content: marcarTexto(BLOQUES_INICIALES, true) });
  }
  nombre = proyecto.name || nombre;
  useSimulatorStore
    .getState()
    .loadProjectState({ ...proyecto, boards: proyecto.boards as unknown as BoardInstance[] });
}

/** Carga el proyecto guardado en el navegador, si lo hay y se puede leer. */
export async function restaurar() {
  let abierto = false;
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado) {
      await abrir(new File([guardado], CLAVE));
      abierto = true;
    }
  } catch {
    // Sin almacenamiento o con un proyecto dañado queda el proyecto inicial.
  }
  // El proyecto inicial es solo la placa: sin el LED y la resistencia de
  // ejemplo que Velxio pone en el pin 13.
  if (!abierto) useSimulatorStore.setState({ components: [], wires: [] });
  // La placa del alumno siempre tiene bloques (no hace nada si ya existen).
  const editor = useEditorStore.getState();
  if (useSimulatorStore.getState().boards.length)
    editor.addFileToGroup(editor.activeGroupId, {
      name: ARCHIVO_BLOQUES,
      content: BLOQUES_INICIALES,
    });
}

/** Guarda el proyecto poco después de cada cambio y al salir de la página. */
export function autoguardar(avisar: (estado: Guardado) => void) {
  let guardada = foto();
  const guardar = () => {
    clearTimeout(pendiente);
    pendiente = undefined;
    guardada = foto();
    try {
      localStorage.setItem(CLAVE, guardada);
      avisar('guardado');
    } catch {
      avisar('error');
    }
  };
  const alCambiar = () => {
    if (foto() === guardada) return;
    avisar('guardando');
    clearTimeout(pendiente);
    pendiente = setTimeout(guardar, ESPERA);
  };
  const alSalir = () => {
    if (pendiente) guardar();
  };
  // Durante la simulación los stores cambian sin que cambie el proyecto.
  const bajas = [
    useSimulatorStore.subscribe((s, antes) => {
      if (s.boards !== antes.boards || s.components !== antes.components || s.wires !== antes.wires)
        alCambiar();
    }),
    useEditorStore.subscribe((s, antes) => {
      if (s.fileGroups !== antes.fileGroups) alCambiar();
    }),
  ];
  window.addEventListener('pagehide', alSalir);
  return () => {
    bajas.forEach((baja) => baja());
    window.removeEventListener('pagehide', alSalir);
    alSalir();
  };
}

/** Descarga el proyecto como `<nombre>.bloquino`. */
export function descargar(conNombre: string) {
  nombre = conNombre;
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(buildVlxBlob({ name: nombre }));
  enlace.download = `${nombre}.bloquino`;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(enlace.href));
}

/** Olvida el proyecto guardado; al recargar la página queda el inicial. */
export function descartar() {
  clearTimeout(pendiente);
  pendiente = undefined;
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // Sin almacenamiento no hay nada que borrar.
  }
}
