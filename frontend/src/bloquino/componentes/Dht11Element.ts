// Módulo DHT11 del kit (tipo KY-015): sensor azul sobre una placa negra con
// tres patitas. Mirándolo de frente: S (datos), + (5V) y − (GND).
//
// Medidas en píxeles CSS con la convención de los elementos de Wokwi: 9,6 px
// por cada 0,1 pulgada (96 px por pulgada), para que las patitas calcen en
// columnas vecinas de la protoboard. `pinInfo` da la punta de cada patita
// respecto de la esquina superior izquierda; el sistema de cables lo necesita.
const PASO = 9.6;
const ANCHO = 6 * PASO;
const ALTO = 112;
const PUNTA = ALTO - 2;

const PINES = [
  { name: 'S', x: 2 * PASO, y: PUNTA, number: 1, signals: [] as unknown[] },
  { name: 'VCC', x: 3 * PASO, y: PUNTA, number: 2, signals: [{ type: 'power', signal: 'VCC', voltage: 5 }] },
  { name: 'GND', x: 4 * PASO, y: PUNTA, number: 3, signals: [{ type: 'power', signal: 'GND' }] },
];
const ROTULOS = ['S', '+', '−'];

const rejilla = [0, 1, 2, 3]
  .flatMap((fila) =>
    [0, 1, 2].map(
      (col) =>
        `<rect x="${17.3 + 8.5 * col}" y="${9 + 11 * fila}" width="6" height="5" rx="1" fill="#14507f"/>`,
    ),
  )
  .join('');

const DIBUJO = `
<svg width="${ANCHO}" height="${ALTO}" viewBox="0 0 ${ANCHO} ${ALTO}" xmlns="http://www.w3.org/2000/svg">
  ${PINES.map((p) => `<rect x="${p.x - 1.2}" y="88" width="2.4" height="${ALTO - 88}" fill="#b8bcc2"/>`).join('')}
  <rect x="10.8" y="50" width="36" height="42" rx="2" fill="#1c1c1c"/>
  <circle cx="${3 * PASO}" cy="70" r="4" fill="#f3f5f8" stroke="#8a9099"/>
  ${PINES.map((p, i) => `<text x="${p.x}" y="87" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="700" fill="#fff">${ROTULOS[i]}</text>`).join('')}
  <rect x="8.8" y="1" width="40" height="56" rx="3" fill="#2b8fd6" stroke="#1c6fb0"/>
  ${rejilla}
</svg>`;

class Dht11Element extends HTMLElement {
  readonly pinInfo = PINES;
  // Valores que mueve el panel del sensor durante la simulación.
  temperature?: number;
  humidity?: number;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML =
      `<style>:host { display: inline-block; line-height: 0; }</style>${DIBUJO}`;
  }
}

if (!customElements.get('bloquino-dht11')) customElements.define('bloquino-dht11', Dht11Element);
