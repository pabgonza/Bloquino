// Ayudas del recorrido: todo con mouse real salvo el programa de bloques, que
// se carga como JSON (el arrastre de bloques se prueba aparte).
const URL = 'http://localhost:5173/editor?alumno';
const espera = (ms) => page.waitForTimeout(ms);
const log = [];
const nota = (...a) => log.push(a.join(' '));

async function nuevo() {
  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('bloquino-proyecto'));
  await page.goto(URL);
  await page.setViewportSize({ width: 1366, height: 768 });
  await espera(3000);
  await page.evaluate(async () => {
    const mod = (n) => import(performance.getEntriesByType('resource').map((e) => e.name).filter((u) => u.includes(n)).pop());
    window.__s = await mod('/store/useSimulatorStore.ts');
    window.__e = await mod('/store/useEditorStore.ts');
  });
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

/** Arrastra un componente con el mouse hasta que `pin` quede sobre `hoyo` de la protoboard.
 *  Dos pasadas: Velxio gira las resistencias al entrar a la protoboard y la primera queda corrida. */
async function asentar(id, pin, proto, hoyo) {
  for (let pasada = 0; pasada < 4 && (await asientos(id))[pin] !== hoyo; pasada++) {
    const hasta = await posPin(proto, hoyo);
    if (!hasta) throw new Error('sin agujero ' + hoyo);
    const desde = await cuadro(id, pin);
        const agarre = await page.evaluate((id) => { const r = document.getElementById(id).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 14) }; }, id);
    await page.mouse.move(agarre.x, agarre.y);
    await page.mouse.down();
    await page.mouse.move(agarre.x + (hasta.x - desde.x) / 2, agarre.y + (hasta.y - desde.y) / 2, { steps: 6 });
    await page.mouse.move(agarre.x + hasta.x - desde.x, agarre.y + hasta.y - desde.y, { steps: 8 });
    await page.mouse.up();
    await espera(400);
  }
  return asientos(id);
}

/** Dónde quedó asentada cada patita: { patita: agujero }. */
function asientos(id) {
  return page.evaluate((id) => Object.fromEntries(window.__s.useSimulatorStore.getState().wires.filter((w) => w.bb && w.start.componentId === id).map((w) => [w.start.pinName, w.end.pinName])), id);
}

/** Centro en pantalla del cuadro de un pin. Los cuadros solo existen mientras el mouse está sobre su componente. */
async function cuadro(id, pin) {
  const sobre = await page.evaluate((id) => {
    const el = id === 'uno' ? document.querySelector('[data-board-id="arduino-uno"]') : document.getElementById(id);
    const r = el.getBoundingClientRect();
    return id.startsWith('breadboard') ? { x: r.right - 10, y: r.top + r.height / 2 } : { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 14) };
  }, id);
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
  const error = await page.locator('.bq-error').innerText().catch(() => null);
  if (!ok) nota('NO ARRANCÓ: ' + (error ?? 'sin mensaje'));
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
