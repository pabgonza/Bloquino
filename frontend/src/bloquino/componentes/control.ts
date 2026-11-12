// Control remoto infrarrojo del kit: 17 teclas (números, silencio, borrar y
// una cruz con OK al centro). No tiene patitas: transmite al aire y lo oye el
// receptor infrarrojo del lienzo. Al apretar una tecla emite `button-press`
// con su comando NEC, igual que el control de Wokwi, y así sirve la misma
// parte de simulación de Velxio (trama NEC real y repetición al mantener).
import { PartSimulationRegistry } from '../../simulation/parts/PartSimulationRegistry';
import '../../simulation/parts/ProtocolParts';
import { TECLAS } from './teclas';

const ANCHO = 120;
const ALTO = 270;
const R = 14;
// Centro de cada tecla, en el orden de TECLAS: cuatro filas de tres y la cruz.
const CENTROS = [
  ...[30, 66, 102, 138].flatMap((y) => [28, 60, 92].map((x) => [x, y])),
  [60, 168],
  [28, 200],
  [60, 200],
  [92, 200],
  [60, 232],
];
const ROJAS = ['silencio', 'borrar', 'OK'];
const AZULES = ['función', 'autoprueba', 'reinicio', 'volver'];
const ICONOS: Record<string, string> = {
  // Parlante tachado y tecla de retroceso, como en el control.
  silencio:
    '<path d="M-7 -2.5h3.5l4 -3.5v12l-4 -3.5h-3.5z" fill="#fff"/><path d="M3 -5l6 10M9 -5l-6 10" stroke="#fff" stroke-width="1.6"/>',
  borrar:
    '<path d="M-8 0l5 -5.5h10v11h-10z" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M-1 -2.5l5 5M4 -2.5l-5 5" stroke="#fff" stroke-width="1.5"/>',
};

const tecla = ([nombre, comando]: (typeof TECLAS)[number], i: number) => {
  const [x, y] = CENTROS[i];
  const color = ROJAS.includes(nombre) ? '#d5202a' : AZULES.includes(nombre) ? '#1f2f8f' : '#f4f4f2';
  const claro = color !== '#f4f4f2';
  // Las palabras largas van en dos líneas para que se lean dentro de la tecla.
  const lineas = nombre === 'autoprueba' ? ['auto', 'prueba'] : [nombre];
  const texto =
    ICONOS[nombre] ??
    lineas
      .map(
        (l, n) =>
          `<text y="${(n - (lineas.length - 1) / 2) * 6.5}" dy="0.36em" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="${nombre.length > 2 ? 5.6 : 13}" fill="${claro ? '#fff' : '#222'}">${l}</text>`,
      )
      .join('');
  return `<g class="tecla" data-comando="${comando}" data-nombre="${nombre}" transform="translate(${x} ${y})">
    <title>${nombre}</title>
    <circle r="${R}" fill="${color}" stroke="${claro ? '#fff' : '#333'}" stroke-width="1.6"/>${texto}
  </g>`;
};

const DIBUJO = `
<svg width="${ANCHO}" height="${ALTO}" viewBox="0 0 ${ANCHO} ${ALTO}" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="${ANCHO - 2}" height="${ALTO - 2}" rx="13" fill="#17171a" stroke="#3a3a40" stroke-width="2"/>
  <path d="M43 152h34v31h32v34h-32v31h-34v-31h-32v-34h32z" fill="#f4f4f2" stroke-linejoin="round" stroke="#f4f4f2" stroke-width="8"/>
  ${TECLAS.map(tecla).join('')}
</svg>`;

class ControlElement extends HTMLElement {
  readonly pinInfo = [];

  constructor() {
    super();
    const raiz = this.attachShadow({ mode: 'open' });
    raiz.innerHTML = `<style>
      :host { display: inline-block; line-height: 0; }
      .tecla { cursor: pointer; }
      .tecla.apretada circle { filter: brightness(0.7); }
    </style>${DIBUJO}`;
    const soltar = () => {
      raiz.querySelector('.apretada')?.classList.remove('apretada');
      this.dispatchEvent(new CustomEvent('button-release'));
    };
    raiz.addEventListener('pointerdown', (e) => {
      const g = (e.target as Element).closest<SVGGElement>('.tecla');
      if (!g) return;
      g.classList.add('apretada');
      this.dispatchEvent(
        new CustomEvent('button-press', {
          detail: { key: g.dataset.nombre, irCode: Number(g.dataset.comando) },
        }),
      );
    });
    raiz.addEventListener('pointerup', soltar);
    raiz.addEventListener('pointerleave', soltar);
  }
}

if (!customElements.get('bloquino-control')) customElements.define('bloquino-control', ControlElement);
PartSimulationRegistry.register('control-remoto', PartSimulationRegistry.get('ir-remote')!);
