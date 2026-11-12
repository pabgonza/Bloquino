// Tira conectada de la protoboard, como en Tinkercad: al pasar el mouse por un
// agujero, o por la patita de un componente asentado en uno, se marcan en verde
// todos los agujeros que están unidos por dentro (los 5 de la columna o el riel
// completo). Es una capa propia sobre el lienzo; no toca la protoboard de Velxio.
import { useSimulatorStore } from '../store/useSimulatorStore';
import { breadboardGroupKey, isBreadboard } from '../utils/breadboardNets';

type Pin = { name: string; x: number; y: number };

/** Instala el resaltado sobre `lienzo`. Devuelve cómo quitarlo. */
export function resaltarTiras(lienzo: HTMLElement) {
  const capa = lienzo.appendChild(document.createElement('div'));
  capa.className = 'bq-tiras';
  const limpiar = () => capa.replaceChildren();

  const alPasar = (e: MouseEvent) => {
    limpiar();
    const pin = (e.target as Element).closest<HTMLElement>('[data-pin-overlay]');
    const id = pin
      ?.closest('.component-interactive-group')
      ?.querySelector<HTMLElement>('[data-component-id]')?.dataset.componentId;
    if (!pin || !id) return;
    const nombre = pin.title.split(' (')[0];
    const { components, wires } = useSimulatorStore.getState();
    const tipo = (cid: string) => components.find((c) => c.id === cid)?.metadataId ?? '';
    // El agujero bajo el mouse, o aquel donde está asentada la patita (Velxio
    // guarda el asiento como un cable `bb` de la patita al agujero).
    const hoyo = isBreadboard(tipo(id))
      ? { componentId: id, pinName: nombre }
      : wires.find((w) => w.bb && w.start.componentId === id && w.start.pinName === nombre)?.end;
    const proto = hoyo && (document.getElementById(hoyo.componentId) as HTMLElement & { pinInfo?: Pin[] });
    const tira = hoyo && breadboardGroupKey(tipo(hoyo.componentId), hoyo.pinName);
    if (!proto?.pinInfo || !tira) return;

    // De coordenadas de la protoboard a coordenadas de la capa: el zoom del
    // lienzo y el giro de la protoboard, que Velxio aplica en torno a su centro.
    const caja = proto.getBoundingClientRect();
    const origen = capa.getBoundingClientRect();
    const zoom = new DOMMatrix(getComputedStyle(lienzo.querySelector('.canvas-world')!).transform).a;
    const giro = components.find((c) => c.id === hoyo.componentId)?.properties.rotation;
    const [cos, sen] = [Math.cos, Math.sin].map((fn) => fn(((Number(giro) || 0) * Math.PI) / 180));
    const centro = {
      x: caja.left + caja.width / 2 - origen.left,
      y: caja.top + caja.height / 2 - origen.top,
    };
    const puntos = proto.pinInfo
      .filter((p) => breadboardGroupKey(tipo(hoyo.componentId), p.name) === tira)
      .map((p) => {
        const dx = (p.x - proto.offsetWidth / 2) * zoom;
        const dy = (p.y - proto.offsetHeight / 2) * zoom;
        return { x: centro.x + dx * cos - dy * sen, y: centro.y + dx * sen + dy * cos };
      });
    const xs = puntos.map((p) => p.x);
    const ys = puntos.map((p) => p.y);
    const marca = (clase: string, x: number, y: number, ancho: number, alto: number) => {
      const el = capa.appendChild(document.createElement('div'));
      el.className = clase;
      Object.assign(el.style, { left: `${x}px`, top: `${y}px`, width: `${ancho}px`, height: `${alto}px` });
    };
    const grosor = 3 * zoom;
    marca(
      'bq-tira-linea',
      Math.min(...xs) - grosor / 2,
      Math.min(...ys) - grosor / 2,
      Math.max(...xs) - Math.min(...xs) + grosor,
      Math.max(...ys) - Math.min(...ys) + grosor,
    );
    const lado = 9 * zoom;
    for (const p of puntos) marca('bq-tira-hoyo', p.x - lado / 2, p.y - lado / 2, lado, lado);
  };

  lienzo.addEventListener('mouseover', alPasar);
  // Al arrastrar o hacer zoom las marcas quedarían corridas.
  lienzo.addEventListener('mousedown', limpiar);
  lienzo.addEventListener('wheel', limpiar, { passive: true });
  lienzo.addEventListener('mouseleave', limpiar);
  return () => {
    lienzo.removeEventListener('mouseover', alPasar);
    lienzo.removeEventListener('mousedown', limpiar);
    lienzo.removeEventListener('wheel', limpiar);
    lienzo.removeEventListener('mouseleave', limpiar);
    capa.remove();
  };
}
