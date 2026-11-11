// Paleta de componentes del alumno: los del kit, con miniatura, nombre y
// buscador. Un clic agrega el componente junto a la placa, igual que el
// selector de Velxio (que en modo alumno queda oculto).
import { createElement, useEffect, useRef, useState } from 'react';
import { ComponentRegistry } from '../services/ComponentRegistry';
import type { ComponentMetadata } from '../types/component-metadata';
import { createComponentFromMetadata } from '../components/DynamicComponent';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { pickDropSlot } from '../utils/dropSlot';
import textos from '../i18n/locales/es/bloquino.json';
import { filtrarKit } from './kit';

const LADO = 56; // px del cuadro de la miniatura

/** El elemento web del componente, reducido para caber en el cuadro. */
function Miniatura({ componente }: { componente: ComponentMetadata }) {
  const ref = useRef<HTMLSpanElement>(null);
  const svg = componente.thumbnail?.trim().startsWith('<svg') ? componente.thumbnail : undefined;
  useEffect(() => {
    const elemento = ref.current?.firstElementChild as HTMLElement | null;
    if (!elemento || svg) return;
    // El elemento se dibuja un instante después de montarse: se mide entonces.
    const id = requestAnimationFrame(() => {
      const { width, height } = elemento.getBoundingClientRect();
      elemento.style.transform = `scale(${Math.min(1, LADO / Math.max(width, height, 1))})`;
    });
    return () => cancelAnimationFrame(id);
  }, [svg]);
  return svg ? (
    <span className="bq-miniatura" dangerouslySetInnerHTML={{ __html: svg }} />
  ) : (
    <span className="bq-miniatura" ref={ref}>
      {createElement(componente.tagName)}
    </span>
  );
}

function agregar(componente: ComponentMetadata) {
  const sim = useSimulatorStore.getState();
  // Primer lugar libre a la derecha de la placa.
  const { x, y } = pickDropSlot({ x: 420, y: 60 }, [...sim.components, ...sim.boards], {
    step: 36,
  });
  const nuevo = createComponentFromMetadata(componente, x, y);
  sim.recordAddComponent(nuevo as Parameters<typeof sim.recordAddComponent>[0]);
}

export function PaletaComponentes({ deshabilitada }: { deshabilitada: boolean }) {
  const [componentes, setComponentes] = useState<ComponentMetadata[]>([]);
  const [busqueda, setBusqueda] = useState('');
  useEffect(() => {
    const registro = ComponentRegistry.getInstance();
    void registro.load().then(() => setComponentes(registro.getAllComponents()));
  }, []);
  const visibles = filtrarKit(componentes, busqueda);

  return (
    <div className="bq-paleta">
      <div className="bq-paleta-titulo">{textos.componentes}</div>
      <input
        className="bq-buscador"
        type="search"
        placeholder={textos.buscar}
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <div className="bq-paleta-lista">
        {visibles.map(({ componente, nombre }) => (
          <button
            key={componente.id}
            className="bq-componente"
            disabled={deshabilitada}
            title={deshabilitada ? textos.detenParaAgregar : nombre}
            onClick={() => agregar(componente)}
          >
            <Miniatura componente={componente} />
            <span>{nombre}</span>
          </button>
        ))}
        {componentes.length > 0 && visibles.length === 0 && (
          <p className="bq-paleta-vacia">{textos.sinResultados}</p>
        )}
      </div>
    </div>
  );
}
