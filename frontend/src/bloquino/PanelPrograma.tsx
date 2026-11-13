// Panel de programa del alumno: Bloques, Bloques + Texto o Texto, con el
// monitor serie plegable abajo. En Texto el alumno edita el C++ y los bloques
// dejan de regenerarlo; volver a Bloques descarta esos cambios, con aviso.
import { lazy, Suspense, useState } from 'react';
import { CodeEditor } from '../components/editor/CodeEditor';
import { SerialMonitor } from '../components/simulator/SerialMonitor';
import { useEditorStore } from '../store/useEditorStore';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { ARCHIVO_BLOQUES, esTexto, marcarTexto } from '../blocks/archivo';
import textos from '../i18n/locales/es/bloquino.json';
import { useCarga } from './flash/cargar';
import { numeroDe } from './placas';

const BlocksPanel = lazy(() => import('../blocks/BlocksPanel'));

const VISTAS = [
  ['bloques', textos.vistaBloques],
  ['ambos', textos.vistaAmbos],
  ['texto', textos.vistaTexto],
] as const;
type Vista = (typeof VISTAS)[number][0];

export function PanelPrograma() {
  const bloques = useEditorStore((s) => s.files.find((f) => f.name === ARCHIVO_BLOQUES));
  // Texto se guarda en el proyecto; Bloques frente a Bloques + Texto es solo la vista.
  const enTexto = !!bloques && esTexto(bloques.content);
  const [conTexto, setConTexto] = useState(false);
  const [serieAbierta, setSerieAbierta] = useState(false);
  const placaReal = useCarga((s) => s.placaReal);
  const placas = useSimulatorStore((s) => s.boards);
  const elegida = useSimulatorStore((s) => s.activeBoardId);
  const vista: Vista = enTexto ? 'texto' : conTexto ? 'ambos' : 'bloques';
  if (!placas.length) return <p className="bq-programa bq-sin-placas">{textos.sinPlacas}</p>;

  const elegir = (nueva: Vista) => {
    if (nueva === vista) return;
    const marcar = (texto: boolean) => {
      const editor = useEditorStore.getState();
      editor.setGroupFileContent(
        editor.activeGroupId,
        bloques!.id,
        marcarTexto(bloques!.content, texto),
      );
    };
    if (nueva === 'texto') {
      if (bloques) marcar(true);
      return;
    }
    if (enTexto) {
      if (!window.confirm(textos.avisoVolver)) return;
      marcar(false);
    }
    setConTexto(nueva === 'ambos');
  };

  return (
    <div className="bq-programa">
      <div className="bq-vistas" role="tablist">
        {placas.length > 1 && (
          <select
            className="bq-elegir-placa"
            aria-label={textos.elegirPlaca}
            value={elegida ?? ''}
            onChange={(e) => useSimulatorStore.getState().setActiveBoardId(e.target.value)}
          >
            {[...placas]
              .sort((a, b) => numeroDe(a) - numeroDe(b))
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {numeroDe(b)} (Arduino UNO)
                </option>
              ))}
          </select>
        )}
        {VISTAS.map(([id, nombre]) => (
          <button
            key={id}
            role="tab"
            aria-selected={vista === id}
            className={vista === id ? 'bq-vista bq-vista-activa' : 'bq-vista'}
            onClick={() => elegir(id)}
          >
            {nombre}
          </button>
        ))}
      </div>
      <div className="bq-programa-cuerpo">
        {vista !== 'texto' && (
          <div className="bq-programa-bloques">
            <Suspense fallback={null}>
              <BlocksPanel />
            </Suspense>
          </div>
        )}
        {vista !== 'bloques' && (
          <div className="bq-programa-texto">
            <CodeEditor />
          </div>
        )}
      </div>
      <button
        className="bq-serie-titulo"
        aria-expanded={serieAbierta}
        onClick={() => setSerieAbierta((abierta) => !abierta)}
      >
        {serieAbierta ? '▾' : '▸'} {textos.monitorSerie}
        {placaReal && <span className="bq-serie-real">{textos.carga.placaReal}</span>}
      </button>
      {serieAbierta && (
        <div className="bq-serie">
          <SerialMonitor placaReal={placaReal} />
        </div>
      )}
    </div>
  );
}
