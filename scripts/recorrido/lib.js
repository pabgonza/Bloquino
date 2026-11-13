// Ayudas del recorrido: todo con mouse real salvo el programa de bloques, que
// se carga como JSON (el arrastre de bloques se prueba aparte).
const URL = 'http://localhost:5173/editor?alumno';
const espera = (ms) => page.waitForTimeout(ms);
const log = [];
const nota = (...a) => log.push(a.join(' '));

async function nuevo() {
  await page.goto(URL);
  // La página guarda el proyecto al salir: sin anular setItem volvería el anterior.
  await page.evaluate(() => { localStorage.removeItem('bloquino-proyecto'); Storage.prototype.setItem = () => {}; });
  await page.goto(URL);
  await page.setViewportSize({ width: 1366, height: 768 });
  await espera(3000);
  await page.evaluate(async () => {
    const mod = (n) => import(performance.getEntriesByType('resource').map((e) => e.name).filter((u) => u.includes(n)).pop());
    window.__s = await mod('/store/useSimulatorStore.ts');
    window.__e = await mod('/store/useEditorStore.ts');
  });
}

/** Deja el lienzo solo con la placa. */
async function limpiar() {
  await page.evaluate(() => { const s = window.__s.useSimulatorStore.getState(); s.setWires([]); s.setComponents([]); });
  await espera(300);
}

/** Agrega un componente desde la paleta y devuelve su id. */
async function agregar(nombre) {
  const antes = await page.evaluate(() => window.__s.useSimulatorStore.getState().components.map((c) => c.id));
  await page.locator('.bq-componente').filter({ hasText: nombre }).first().click();
  await espera(500);
  const id = await page.evaluate((antes) => window.__s.useSimulatorStore.getState().components.map((c) => c.id).find((i) => !antes.includes(i)), antes);
  if (!id) throw new Error('no se agregó ' + nombre);
  return id;
}

/** Posición en pantalla de un pin de un componente o de la placa. */
function posPin(id, pin) {
  return page.evaluate(({ id, pin }) => {
    const el = id === 'uno' ? document.querySelector('[data-board-id="arduino-uno"] wokwi-arduino-uno, [data-board-id="arduino-uno"]') : document.getElementById(id);
    const r = el.getBoundingClientRect();
    const zoom = r.width / (el.offsetWidth || r.width);
    const p = el.pinInfo?.find((x) => x.name === pin);
    return p ? { x: r.left + p.x * zoom, y: r.top + p.y * zoom } : null;
  }, { id, pin });
}

/** Punto de un componente del que se lo toma o por el que se le pasa el mouse.
 *  La perilla se toma por una esquina de su dibujo: el dial gira. */
function agarre(id) {
  return page.evaluate((id) => {
    const el = id === 'uno' ? document.querySelector('[data-board-id="arduino-uno"]') : document.getElementById(id);
    const perilla = id.startsWith('potentiometer');
    const r = (perilla ? el.shadowRoot.querySelector('svg') : el).getBoundingClientRect();
    if (perilla) return { x: r.left + 6, y: r.bottom - 14 };
    return id.startsWith('breadboard') ? { x: r.right - 10, y: r.top + r.height / 2 } : { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 14) };
  }, id);
}

/** Arrastra un componente con el mouse hasta que `pin` quede sobre `hoyo` de la protoboard.
 *  Dos pasadas: Velxio gira las resistencias al entrar a la protoboard y la primera queda corrida. */
async function asentar(id, pin, proto, hoyo) {
  for (let pasada = 0; pasada < 4 && (await asientos(id))[pin] !== hoyo; pasada++) {
    const hasta = await posPin(proto, hoyo);
    if (!hasta) throw new Error('sin agujero ' + hoyo);
    const desde = await cuadro(id, pin);
    const a = await agarre(id);
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    await page.mouse.move(a.x + (hasta.x - desde.x) / 2, a.y + (hasta.y - desde.y) / 2, { steps: 6 });
    await page.mouse.move(a.x + hasta.x - desde.x, a.y + hasta.y - desde.y, { steps: 8 });
    await page.mouse.up();
    await espera(400);
  }
  if ((await asientos(id))[pin] !== hoyo) nota(`NO ASENTÓ ${id.split('_')[0]} ${pin} en ${hoyo}`);
  return asientos(id);
}

/** LED con la patita − en `col`, su 220 Ω al riel − y un cable de la patita + al pin de la placa. */
async function ledConResistencia(proto, col, pin) {
  const l = await agregar('LED');
  await asentar(l, 'C', proto, `${col}b.f`);
  const res = await agregar('Resistencia');
  const r = await asentar(res, '1', proto, `${col}b.g`);
  if (!r['2']?.startsWith('bn.')) nota(`RESISTENCIA de la columna ${col} no llegó al riel: ${JSON.stringify(r)}`);
  await cable(proto, `${col + 1}b.j`, 'uno', pin);
  return l;
}

/** Dónde quedó asentada cada patita: { patita: agujero }. */
function asientos(id) {
  return page.evaluate((id) => Object.fromEntries(window.__s.useSimulatorStore.getState().wires.filter((w) => w.bb && w.start.componentId === id).map((w) => [w.start.pinName, w.end.pinName])), id);
}

/** Centro en pantalla del cuadro de un pin. Los cuadros solo existen mientras el mouse está sobre su componente. */
async function cuadro(id, pin) {
  const sobre = await agarre(id);
  await page.mouse.move(sobre.x + 1, sobre.y + 1);
  await page.mouse.move(sobre.x, sobre.y);
  await espera(300);
  const c = await page.evaluate((pin) => {
    const o = [...document.querySelectorAll('[data-pin-overlay]')].find((e) => e.title === pin || e.title.startsWith(pin + ' ('));
    if (!o) return null;
    const r = o.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, pin);
  if (!c) throw new Error('sin cuadro de pin ' + pin + ' en ' + id.split('_')[0]);
  const encima = await page.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return e?.dataset?.pinOverlay ? e.title : (e?.tagName ?? '?'); }, c);
  return { ...c, encima };
}

/** Tiende un cable con dos clics. Devuelve si quedó creado. */
async function cable(a, pinA, b, pinB) {
  const n = () => page.evaluate(() => window.__s.useSimulatorStore.getState().wires.filter((w) => !w.bb).length);
  const antes = await n();
  const ca = await cuadro(a, pinA);
  await page.mouse.click(ca.x, ca.y);
  await espera(200);
  const cb = await cuadro(b, pinB);
  await page.mouse.click(cb.x, cb.y);
  await espera(300);
  const ok = (await n()) === antes + 1;
  if (!ok) { await page.keyboard.press('Escape'); nota(`CABLE FALLÓ ${pinA}→${pinB} (sobre ${ca.encima} / ${cb.encima})`); }
  return ok;
}

/** Carga un programa de bloques y devuelve el sketch generado. */
async function programar(bloques, variables = []) {
  if (!(await page.locator('.bq-programa').count())) { await page.getByRole('button', { name: 'Código', exact: true }).click(); await espera(2500); }
  await page.evaluate(({ bloques, variables }) => {
    const ed = window.__e.useEditorStore.getState();
    const bl = ed.files.find((f) => f.name === 'bloques.json');
    ed.setGroupFileContent(ed.activeGroupId, bl.id, JSON.stringify({ blocks: { blocks: bloques.map((b, i) => ({ x: 30, y: 30 + 260 * i, ...b })) }, variables }));
  }, { bloques, variables });
  await espera(2500);
  const sketch = await page.evaluate(() => window.__e.useEditorStore.getState().files.find((f) => f.name.endsWith('.ino')).content);
  await page.getByRole('button', { name: 'Código', exact: true }).click(); // deja el lienzo completo a la vista
  await espera(600);
  return sketch;
}

async function simular() {
  await page.getByRole('button', { name: 'Iniciar simulación' }).click();
  const ok = await page.getByRole('button', { name: 'Detener simulación' }).waitFor({ timeout: 60000 }).then(() => true, () => false);
  if (!ok) nota('NO ARRANCÓ: ' + ((await page.locator('.bq-error').count()) ? await page.locator('.bq-error').first().innerText() : 'sin mensaje'));
  return ok;
}
async function detener() {
  const b = page.getByRole('button', { name: 'Detener simulación' });
  if (await b.count()) await b.click();
  await espera(300);
}

/** Propiedades visibles de un elemento del lienzo (LED encendido, ángulo del servo, etc.). */
const prop = (id, ...nombres) => page.evaluate(({ id, nombres }) => { const el = document.getElementById(id); return Object.fromEntries(nombres.map((n) => [n, el[n]])); }, { id, nombres });

/** Muestrea una propiedad durante `ms` y devuelve los valores distintos, en orden de aparición. */
async function muestrear(id, nombre, ms, paso = 50) {
  const vistos = [];
  for (let t = 0; t < ms; t += paso) {
    const v = (await prop(id, nombre))[nombre];
    if (vistos.at(-1) !== v) vistos.push(v);
    await espera(paso);
  }
  return vistos;
}

/** Con la simulación corriendo, abre el panel de un sensor (un clic sobre él) y lleva su
 *  deslizador a `valor`: clic en la barra y ajuste fino con las flechas. Devuelve lo que quedó. */
async function deslizar(id, valor, indice = 0) {
  if (!(await page.locator('.sensor-control-panel').count())) {
    const a = await agarre(id);
    await page.mouse.click(a.x, a.y);
    await espera(500);
  }
  const barra = page.locator('.sensor-slider').nth(indice);
  if (!(await barra.count())) throw new Error('sin panel de sensor para ' + id.split('_')[0]);
  const [min, max] = await barra.evaluate((e) => [Number(e.min), Number(e.max)]);
  const c = await barra.boundingBox();
  await page.mouse.click(c.x + 8 + ((valor - min) / (max - min)) * (c.width - 16), c.y + c.height / 2);
  for (let n = 0; n < 60; n++) {
    const falta = valor - Number(await barra.inputValue());
    if (!falta) break;
    await page.keyboard.press(falta > 0 ? 'ArrowRight' : 'ArrowLeft');
  }
  await espera(300);
  return Number(await barra.inputValue());
}

/** Sensor de distancia en la protoboard (VCC en `col`), con TRIG al pin 9, ECHO al 10 y sus cables a los rieles. */
async function sensorDistancia(proto, col) {
  const s = await agregar('Sensor de distancia');
  const a = await asentar(s, 'VCC', proto, `${col}b.f`);
  if (a.GND !== `${col + 3}b.f`) nota('SENSOR mal asentado: ' + JSON.stringify(a));
  await cable(proto, `${col}b.j`, proto, `bp.${col - 4}`);
  await cable(proto, `${col + 1}b.j`, 'uno', '9');
  await cable(proto, `${col + 2}b.j`, 'uno', '10');
  await cable(proto, `${col + 3}b.j`, proto, `bn.${col + 2}`);
  return s;
}

/** Buzzer en la protoboard (patita 1 en `col`) al pin 8 y al riel −. */
async function buzzerEn(proto, col) {
  const b = await agregar('Buzzer');
  const a = await asentar(b, '1', proto, `${col}b.f`);
  if (a['2'] !== `${col + 1}b.f`) nota('BUZZER mal asentado: ' + JSON.stringify(a));
  await cable(proto, `${col}b.j`, 'uno', '8');
  await cable(proto, `${col + 1}b.j`, proto, `bn.${col - 4}`);
  return b;
}

/** Espía del audio: anota cada nota que un buzzer pide al navegador. */
function espiarAudio() {
  return page.evaluate(() => {
    window.__notas = [];
    if (window.__espia) return;
    window.__espia = true;
    const crear = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function () {
      const o = crear.call(this);
      const n = {};
      const [start, stop] = [o.start, o.stop];
      o.start = (t) => { Object.assign(n, { hz: Math.round(o.frequency.value), desde: t, pedida: performance.now() }); window.__notas.push(n); start.call(o, t); };
      o.stop = (t) => { n.dura = Math.round((t - n.desde) * 1000); stop.call(o, t); };
      return o;
    };
  });
}
/** Notas oídas desde espiarAudio(): frecuencia, ms desde la nota anterior (o desde ahora, la primera, en negativo) y duración. */
const notasOidas = () => page.evaluate(() => window.__notas.map((n, i, v) => n.hz + 'Hz ' + (i ? '+' + Math.round((n.desde - v[i - 1].desde) * 1000) : Math.round(n.pedida - performance.now())) + ' ' + (n.dura ? n.dura + 'ms' : 'sigue')));

/** Primeras líneas del sketch, en una sola. */
const resumen = (sketch, n = 12) => sketch.split(/\r?\n/).filter((x) => x.trim()).slice(0, n).map((x) => x.trim()).join(' / ');

// Constructores de bloques
const num = (n) => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
const cadena = (bs) => bs.reduceRight((sig, b) => ({ ...b, ...(sig ? { next: { block: sig } } : {}) }), undefined);
const alIniciar = (...bs) => cadena([{ type: 'ab_al_iniciar' }, ...bs]);
const porSiempre = (...bs) => ({ type: 'ab_por_siempre', inputs: { DO: { block: cadena(bs) } } });
const led = (ESTADO, PIN) => ({ type: 'ab_led', fields: { ESTADO, PIN: String(PIN) } });
const esperarB = (s) => ({ type: 'ab_esperar', inputs: { S: num(s) } });
const siSino = (cond, si, sino) => ({ type: 'ab_si_sino', inputs: { COND: { block: cond }, DO: { block: cadena(si) }, SINO: { block: cadena(sino) } } });
const comparar = (A, OP, B) => ({ type: 'ab_comparar', fields: { OP }, inputs: { A, B } });
const decir = (valor) => ({ type: 'ab_decir', inputs: { VALOR: valor } });

// Programar con el mouse
// Caja del dibujo propio de un bloque (sin sus hijos): en el área de trabajo o en la paleta abierta.
const forma = (clase, n = 0, enPaleta = false) => page.evaluate(({ clase, n, enPaleta }) => {
  const e = [...document.querySelectorAll('.blocklyDraggable.' + clase)].filter((b) => !!b.closest('.blocklyFlyout') === enPaleta)[n];
  const r = e.querySelector(':scope > .blocklyPath').getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}, { clase, n, enPaleta });
const arrastrar = async (desde, hasta) => {
  await page.mouse.move(desde.x, desde.y);
  await page.mouse.down();
  await page.mouse.move(desde.x + 40, desde.y + 30, { steps: 5 });
  await page.mouse.move(hasta.x, hasta.y, { steps: 15 });
  await espera(300);
  await page.mouse.up();
};
/** Centro del campo `n` (menú o número) de un bloque del área de trabajo. */
const campoDe = (clase, n = 0, cual = 0) => page.evaluate(({ clase, n, cual }) => {
  const e = [...document.querySelectorAll('.blocklyDraggable.' + clase)].filter((b) => !b.closest('.blocklyFlyout'))[cual];
  const r = [...e.querySelectorAll(':scope > .blocklyEditableField, :scope > .blocklyEditableText')][n].getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}, { clase, n, cual });
