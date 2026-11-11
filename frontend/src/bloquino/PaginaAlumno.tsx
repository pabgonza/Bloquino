// Página del alumno: lienzo al centro, paleta de componentes o panel de
// programa a la derecha y tres botones arriba. Monta los componentes de
// Velxio sin editarlos; lo que el alumno no necesita simplemente no se monta.
import { useEffect, useRef, useState } from 'react';
import { SimulatorCanvas } from '../components/simulator/SimulatorCanvas';
import { EditorToolbar } from '../components/editor/EditorToolbar';
import { CompileProgressCard } from '../components/editor/CompileProgressCard';
import { runEditorCommand } from '../lib/editorCommands';
import { startSimulation } from '../simulation/spice/start';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { useCompileLogsStore } from '../store/useCompileLogsStore';
import textos from '../i18n/locales/es/bloquino.json';
import { PaletaComponentes } from './PaletaComponentes';
import { PanelPrograma } from './PanelPrograma';
import './alumno.css';

const VELXIO = 'https://github.com/davidmonterocrespo24/velxio';
const FUENTE = 'https://github.com/pabgonza/Bloquino';
const ANCHO_PALETA = 280;

export function PaginaAlumno() {
  const [codigoAbierto, setCodigoAbierto] = useState(false);
  const [anchoPrograma, setAnchoPrograma] = useState(() => Math.round(window.innerWidth * 0.5));
  // La cabecera del lienzo de Velxio (selector de placa, Serial, Scope, Add)
  // se "portaliza" a esta ranura, que no se muestra.
  const [ranura, setRanura] = useState<HTMLDivElement | null>(null);
  const corriendo = useSimulatorStore(
    (s) => s.boards.find((b) => b.id === s.activeBoardId)?.running ?? false,
  );
  const logs = useCompileLogsStore((s) => s.logs);
  const setLogs = useCompileLogsStore((s) => s.setLogs);
  const errores = logs.filter((l) => l.type === 'error');
  const [erroresVistos, setErroresVistos] = useState(logs);

  // Lo que el lienzo necesita de la página de Velxio: la simulación eléctrica
  // y deshacer / rehacer con el teclado.
  useEffect(() => startSimulation(), []);
  useEffect(() => {
    document.title = textos.marca;
    const alTeclear = (e: KeyboardEvent) => {
      const destino = e.target as HTMLElement | null;
      if (
        destino &&
        (/^(INPUT|TEXTAREA|SELECT)$/.test(destino.tagName) || destino.isContentEditable)
      )
        return;
      if (!(e.ctrlKey || e.metaKey)) return;
      const tecla = e.key.toLowerCase();
      const sim = useSimulatorStore.getState();
      if (tecla === 'z' && !e.shiftKey) sim.undo();
      else if (tecla === 'y' || (tecla === 'z' && e.shiftKey)) sim.redo();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, []);

  // Divisor entre el lienzo y el panel de programa.
  const arrastre = useRef<(e: PointerEvent) => void>(undefined);
  const empezarArrastre = (e: React.PointerEvent) => {
    e.preventDefault();
    arrastre.current = (ev) =>
      setAnchoPrograma(
        Math.min(window.innerWidth * 0.7, Math.max(420, window.innerWidth - ev.clientX)),
      );
    const soltar = () => {
      window.removeEventListener('pointermove', arrastre.current!);
      window.removeEventListener('pointerup', soltar);
    };
    window.addEventListener('pointermove', arrastre.current);
    window.addEventListener('pointerup', soltar);
  };

  return (
    <div className="bq-pagina">
      <header className="bq-barra">
        <span className="bq-marca">{textos.marca}</span>
        <a className="bq-credito" href={VELXIO} target="_blank" rel="noreferrer">
          {textos.credito}
        </a>
        <a className="bq-credito" href={FUENTE} target="_blank" rel="noreferrer">
          {textos.codigoFuente}
        </a>
        <span className="bq-espacio" />
        <button
          className={codigoAbierto ? 'bq-boton bq-boton-activo' : 'bq-boton'}
          aria-pressed={codigoAbierto}
          onClick={() => setCodigoAbierto((abierto) => !abierto)}
        >
          {textos.codigo}
        </button>
        <button
          className={corriendo ? 'bq-boton bq-boton-detener' : 'bq-boton bq-boton-iniciar'}
          onClick={() => runEditorCommand(corriendo ? 'sim.stop' : 'sim.run')}
        >
          {corriendo ? textos.detener : textos.iniciar}
        </button>
        <button className="bq-boton" disabled title={textos.cargarPronto}>
          {textos.cargar}
        </button>
      </header>

      <div className="bq-cuerpo">
        <main className="bq-lienzo">
          {ranura && <SimulatorCanvas headerSlot={ranura} />}
          <CompileProgressCard />
          {errores.length > 0 && erroresVistos !== logs && (
            <div className="bq-error" role="alert">
              <strong>{textos.errorCompilar}</strong>
              <button onClick={() => setErroresVistos(logs)}>{textos.cerrar}</button>
              <pre>{errores.map((l) => l.message).join('\n')}</pre>
            </div>
          )}
        </main>
        {codigoAbierto && <div className="bq-divisor" onPointerDown={empezarArrastre} />}
        <aside
          className="bq-lateral"
          style={{ width: codigoAbierto ? anchoPrograma : ANCHO_PALETA }}
        >
          {codigoAbierto ? <PanelPrograma /> : <PaletaComponentes deshabilitada={corriendo} />}
        </aside>
      </div>

      {/* Fuera de la vista, no oculto: sus diálogos de posición fija (revisión
          del circuito) tienen que seguir viéndose. Aporta compilar y simular. */}
      <div className="bq-fuera-de-vista" aria-hidden>
        <div ref={setRanura} />
        <EditorToolbar
          consoleOpen={false}
          setConsoleOpen={() => {}}
          compileLogs={logs}
          setCompileLogs={setLogs}
        />
      </div>
    </div>
  );
}
