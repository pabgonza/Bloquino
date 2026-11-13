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
import { cargarALaPlaca, useCarga } from './flash/cargar';
import { PaletaComponentes } from './PaletaComponentes';
import { PanelPrograma } from './PanelPrograma';
import {
  abrir,
  autoguardar,
  descargar,
  descartar,
  nombreProyecto,
  restaurar,
  type Guardado,
} from './proyecto';
import { resaltarTiras } from './tiras';
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
  // Los problemas del circuito ('circuit-check') ya los muestra el diálogo de
  // revisión de Velxio: aquí solo van los del programa.
  const errores = logs.filter((l) => l.type === 'error' && l.target?.id !== 'circuit-check');
  const [erroresVistos, setErroresVistos] = useState(logs);
  const [guardado, setGuardado] = useState<Guardado>('guardado');
  const carga = useCarga((s) => s.carga);
  const cargando = !!carga && carga.fase !== 'lista' && carga.fase !== 'error';
  const selector = useRef<HTMLInputElement>(null);
  // Proyectos cargados hasta ahora. El lienzo se monta cuando ya hay uno y se
  // vuelve a montar al abrir un archivo: Velxio encuadra el circuito al montarse.
  const [cargas, setCargas] = useState(0);

  // Proyecto guardado en el navegador: se restaura y, desde ahí, se guarda solo.
  useEffect(() => {
    let parar: (() => void) | undefined;
    let montada = true;
    void restaurar().then(() => {
      if (!montada) return;
      parar = autoguardar(setGuardado);
      setCargas(1);
    });
    return () => {
      montada = false;
      parar?.();
    };
  }, []);

  // Lo que el lienzo necesita de la página de Velxio: la simulación eléctrica
  // y deshacer / rehacer con el teclado.
  useEffect(() => startSimulation(), []);
  // La placa del curso es una sola: si se pega otra (Ctrl+C y Ctrl+V), se quita.
  useEffect(
    () =>
      useSimulatorStore.subscribe((s) => {
        if (s.boards.length > 1) s.removeBoard(s.boards.at(-1)!.id);
      }),
    [],
  );
  const lienzo = useRef<HTMLElement>(null);
  useEffect(() => resaltarTiras(lienzo.current!), []);
  useEffect(() => {
    document.title = textos.marca;
    const alTeclear = (e: KeyboardEvent) => {
      const destino = e.target as HTMLElement | null;
      if (
        destino &&
        (/^(INPUT|TEXTAREA|SELECT)$/.test(destino.tagName) || destino.isContentEditable)
      )
        return;
      // En el panel de programa, Ctrl+Z deshace bloques, no el circuito.
      if (e.composedPath().some((n) => (n as HTMLElement).classList?.contains('bq-programa'))) return;
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
        <button
          className="bq-boton bq-boton-menor"
          onClick={() => {
            if (!window.confirm(textos.avisoNuevo)) return;
            descartar();
            window.location.reload();
          }}
        >
          {textos.nuevo}
        </button>
        <button className="bq-boton bq-boton-menor" onClick={() => selector.current!.click()}>
          {textos.abrir}
        </button>
        <input
          ref={selector}
          type="file"
          accept=".bloquino,.vlx"
          hidden
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            e.target.value = '';
            if (archivo && window.confirm(textos.avisoAbrir))
              abrir(archivo).then(
                () => setCargas((n) => n + 1),
                (error: Error) => window.alert(error.message),
              );
          }}
        />
        <button
          className="bq-boton bq-boton-menor"
          onClick={() => {
            const nombre = window.prompt(textos.nombreArchivo, nombreProyecto())?.trim();
            if (nombre) descargar(nombre);
          }}
        >
          {textos.descargar}
        </button>
        <span className={`bq-guardado bq-guardado-${guardado}`} role="status">
          {textos.guardado[guardado]}
        </span>
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
        <button className="bq-boton" disabled={cargando} onClick={() => void cargarALaPlaca()}>
          {cargando ? textos.carga.cargando : textos.cargar}
        </button>
      </header>

      <div className="bq-cuerpo">
        <main
          className="bq-lienzo"
          ref={lienzo}
          // Al volver al circuito, el teclado deja de ser de los bloques.
          onPointerDownCapture={() => (document.activeElement as HTMLElement | null)?.blur?.()}
        >
          {ranura && cargas > 0 && <SimulatorCanvas key={cargas} headerSlot={ranura} />}
          <CompileProgressCard />
          {carga && (
            <div className={`bq-carga bq-carga-${carga.fase}`} role="status">
              {!cargando && (
                <button onClick={() => useCarga.setState({ carga: null })}>{textos.cerrar}</button>
              )}
              <strong>{textos.carga.fases[carga.fase]}</strong>
              {'pct' in carga && <progress max={100} value={carga.pct} />}
              {carga.fase === 'error' && <p>{carga.mensaje}</p>}
              {carga.fase === 'error' && carga.enlace && <a href={carga.enlace}>{carga.enlace}</a>}
              {carga.fase === 'error' && carga.detalle && <pre>{carga.detalle}</pre>}
            </div>
          )}
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
