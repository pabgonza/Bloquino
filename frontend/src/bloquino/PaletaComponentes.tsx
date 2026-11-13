// Paleta de componentes del alumno: los del kit, con miniatura, nombre y
// buscador. Un clic agrega el componente junto a la placa, igual que el
// selector de Velxio (que en modo alumno queda oculto).
import { createElement, useEffect, useRef, useState } from 'react';
import { ComponentRegistry } from '../services/ComponentRegistry';
import type { ComponentMetadata } from '../types/component-metadata';
import { createComponentFromMetadata } from '../components/DynamicComponent';
import { useEditorStore } from '../store/useEditorStore';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { ARCHIVO_BLOQUES, BLOQUES_INICIALES } from '../blocks/archivo';
import { isBreadboard } from '../utils/breadboardNets';
import { pickDropSlot } from '../utils/dropSlot';
import textos from '../i18n/locales/es/bloquino.json';
import { adaptarKit, filtrarKit } from './kit';
import * as grupo from './seleccion';

const LADO = 56; // px del cuadro de la miniatura
// Cómo sale cada componente del kit cuando difiere de Velxio: la resistencia
// del curso es de 220 Ω (Velxio: 1 kΩ) y el botón sale girado, que es como
// calza a caballo del canal de la protoboard. La pantalla del kit es azul. El
// display sale como pieza suelta de cátodo común (ver ChipParts, «common»).
const AJUSTES: Record<string, object> = {
  resistor: { value: '220' },
  pushbutton: { rotation: 90 },
  lcd1602: { background: 'blue', color: 'white' },
  '7segment': { common: 'cathode' },
  'display-4': { common: 'cathode' },
};

/** El elemento web del componente, reducido para caber en el cuadro. */
function Miniatura({ componente }: { componente: ComponentMetadata }) {
  const ref = useRef<HTMLSpanElement>(null);
  // La miniatura de los metadatos solo para las protoboard, cuyo elemento es
  // enorme: las demás están hechas para el selector oscuro de Velxio.
  const svg =
    isBreadboard(componente.id) && componente.thumbnail?.trim().startsWith('<svg')
      ? componente.thumbnail
      : undefined;
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

/** Agrega un componente del kit, o una placa con el programa inicial. */
function agregar(componente: ComponentMetadata) {
  const sim = useSimulatorStore.getState();
  // Primer lugar libre desde la esquina visible del lienzo, como el selector de
  // Velxio: el paneo y el zoom salen de la transformación de su "mundo".
  const mundo = document.querySelector('.canvas-world');
  const { a: zoom, e: panX, f: panY } = new DOMMatrix(mundo ? getComputedStyle(mundo).transform : '');
  const MARGEN = 60; // px de pantalla desde la esquina
  const { x, y } = pickDropSlot(
    { x: (MARGEN - panX) / zoom, y: (MARGEN - panY) / zoom },
    [...sim.components, ...sim.boards],
    { step: 36 / zoom },
  );
  let nuevo: { id: string; x: number; y: number };
  let mover: (x: number, y: number) => void;
  if (componente.id === 'arduino-uno') {
    const antes = grupo.foto();
    const id = sim.addBoard('arduino-uno', x, y);
    const editor = useEditorStore.getState();
    editor.addFileToGroup(`group-${id}`, { name: ARCHIVO_BLOQUES, content: BLOQUES_INICIALES });
    sim.setActiveBoardId(id);
    grupo.registrar('Agregar placa', antes);
    nuevo = { id, x, y };
    mover = (nx, ny) => useSimulatorStore.getState().setBoardPosition({ x: nx, y: ny }, id);
  } else {
    const pieza = createComponentFromMetadata(componente, x, y);
    Object.assign(pieza.properties, AJUSTES[componente.id]);
    sim.recordAddComponent(pieza as Parameters<typeof sim.recordAddComponent>[0]);
    nuevo = pieza;
    mover = (nx, ny) => useSimulatorStore.getState().updateComponent(pieza.id, { x: nx, y: ny });
  }
  // Ya dibujado se conoce su tamaño: si tapa a otro componente o a una placa,
  // pasa al primer lugar libre del lienzo a la vista, de arriba abajo.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      // La caja del elemento no siempre es la de su dibujo (la perilla mide
      // de menos): se toma la mayor entre la suya y las de sus dibujos.
      const caja = (el: Element | null) =>
        el &&
        [el, ...(el.shadowRoot?.querySelectorAll('svg') ?? [])]
          .map((e) => e.getBoundingClientRect())
          .reduce((a, b) => (b.width * b.height > a.width * a.height ? b : a));
      const mio = caja(document.getElementById(nuevo.id));
      const lienzo = mundo?.parentElement?.getBoundingClientRect();
      if (!mio || !lienzo) return;
      const otros = [
        ...sim.boards.map((b) => document.querySelector(`[data-board-id="${b.id}"]`)),
        ...sim.components.map((c) => document.getElementById(c.id)),
      ].flatMap((el) => caja(el) ?? []);
      const SEPARACION = 12;
      const libre = (px: number, py: number) =>
        otros.every(
          (o) =>
            px > o.right + SEPARACION ||
            px + mio.width < o.left - SEPARACION ||
            py > o.bottom + SEPARACION ||
            py + mio.height < o.top - SEPARACION,
        );
      if (libre(mio.left, mio.top)) return;
      for (let py = lienzo.top + 24; py + mio.height < lienzo.bottom; py += 24)
        for (let px = lienzo.left + 24; px + mio.width < lienzo.right; px += 24)
          if (libre(px, py))
            return mover(nuevo.x + (px - mio.left) / zoom, nuevo.y + (py - mio.top) / zoom);
    }),
  );
}

export function PaletaComponentes({ deshabilitada }: { deshabilitada: boolean }) {
  const [componentes, setComponentes] = useState<ComponentMetadata[]>([]);
  const [busqueda, setBusqueda] = useState('');
  useEffect(() => {
    const registro = ComponentRegistry.getInstance();
    void registro.load().then(() => {
      adaptarKit(registro.getAllComponents());
      setComponentes(registro.getAllComponents());
    });
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
