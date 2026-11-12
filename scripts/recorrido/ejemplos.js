// Ejemplos de frontend/public/ejemplos: abre cada uno con «Abrir», lo simula y
// hace lo que haría el alumno (apretar, mover el sensor, escribir en el monitor
// serie, usar el control). Deja una captura de cada uno en docs/ejemplos/.
await nuevo();
await page.evaluate(() => { window.confirm = () => true; });
const led13 = () => page.evaluate(() => !!document.querySelector('wokwi-arduino-uno').led13);
const serie = () => page.evaluate(() => window.__s.useSimulatorStore.getState().serialOutput.trim().split(/\r?\n/).filter(Boolean));
const enviar = async (texto) => { await page.evaluate((t) => window.__s.useSimulatorStore.getState().serialWrite(t + '\n'), texto); await espera(900); };
const centro = (id) => page.evaluate((id) => { const r = document.getElementById(id).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, id);
const apretar = async (id, ms = 400) => { const c = await centro(id); await page.mouse.move(c.x, c.y); await page.mouse.down(); await espera(ms); };
const soltar = async () => { await page.mouse.up(); await espera(400); };
const perilla = async (id, valor) => { await page.evaluate(({ id, valor }) => { const el = document.getElementById(id); el.value = valor; el.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true })); }, { id, valor }); await espera(700); };
const cambios = async (leer, ms) => { let n = 0; for (let t = 0, a = await leer(); t < ms; t += 80) { await espera(80); const b = await leer(); if (b !== a) n++; a = b; } return n; };
const color = (id) => page.evaluate((id) => window.__s.useSimulatorStore.getState().components.find((c) => c.id === id).properties.color, id);

/** Abre un ejemplo, lo simula, corre su prueba y deja la captura. */
async function ejemplo(nombre, prueba) {
  await page.setInputFiles('input[type=file]', `./frontend/public/ejemplos/${nombre}.bloquino`);
  await espera(2500);
  const ids = await page.evaluate(() => { const o = {}; for (const c of window.__s.useSimulatorStore.getState().components) (o[c.metadataId] ??= []).push(c.id); return o; });
  const r = { cables: await page.evaluate(() => window.__s.useSimulatorStore.getState().wires.filter((w) => !w.bb).length) };
  await espiarAudio();
  if (await simular()) {
    try { await prueba(r, ids); } catch (e) { r.error = String(e.message ?? e).slice(0, 200); }
    await page.mouse.move(8, 760);
    await page.screenshot({ path: `./docs/ejemplos/${nombre}.jpg`, type: 'jpeg', quality: 80, scale: 'css', clip: { x: 0, y: 48, width: 1087, height: 720 } });
    await detener();
  } else r.error = 'no simula';
  R[nombre] = r;
}

await ejemplo('01-parpadeo', async (r) => { r['cambios del LED en 3 s'] = await cambios(led13, 3000); });

await ejemplo('02-semaforo', async (r, ids) => {
  const colores = {};
  for (const id of ids.led) colores[await color(id)] = id;
  const vistos = [];
  for (let t = 0; t < 6500; t += 100) {
    const k = (await Promise.all(Object.entries(colores).map(async ([c, id]) => ((await prop(id, 'value')).value ? c : '')))).filter(Boolean).join('+') || '-';
    if (vistos.at(-1) !== k) vistos.push(k);
    await espera(100);
  }
  r.secuencia = vistos;
});

await ejemplo('03-botones', async (r, ids) => {
  const [l13, l12] = ids.led;
  const [azul, rojo] = ids.pushbutton; // azul en el pin 3, rojo en el pin 2
  const leds = async () => `${(await prop(l13, 'value')).value ? 1 : 0}${(await prop(l12, 'value')).value ? 1 : 0}`;
  r['sueltos (13,12)'] = await leds();
  await apretar(rojo);
  r['rojo apretado'] = await leds();
  await soltar();
  await apretar(azul);
  r['azul apretado'] = await leds();
  await soltar();
  r.monitor = await serie();
});

await ejemplo('04-rockola', async (r, ids) => {
  const [azul, verde] = ids.pushbutton; // azul en el pin 3, verde en el pin 2
  await espera(1200);
  r.saludo = (await notasOidas()).map((n) => n.split(' ')[0]);
  await espiarAudio();
  await apretar(verde, 200); await soltar();
  await espera(1500);
  r['canción de fondo'] = (await notasOidas()).slice(0, 4).map((n) => n.split(' ')[0]);
  r['parpadea con la canción'] = await cambios(led13, 1200);
  await apretar(azul, 200); await soltar();
  await espiarAudio();
  await espera(1200);
  r['notas tras detener'] = (await notasOidas()).length;
  r['LED quieto'] = await cambios(led13, 800);
});

await ejemplo('05-perilla-magica', async (r, ids) => {
  for (const v of [0, 512, 1023]) {
    await perilla(ids.potentiometer[0], v);
    r['perilla ' + v] = { ...(await prop(ids.servo[0], 'angle')), brillo: Math.round((await prop(ids.led[0], 'brightness')).brightness * 100) / 100, dice: (await serie()).at(-1) };
  }
});

await ejemplo('06-barrera', async (r, ids) => {
  const colores = {};
  for (const id of ids.led) colores[await color(id)] = id;
  for (const cm of [100, 8, 100]) {
    const puesto = await deslizar(ids['hc-sr04'][0], cm);
    await espiarAudio();
    await espera(1500);
    r[cm + ' cm' + (r[cm + ' cm'] ? ' (otra vez)' : '')] = { puesto, rojo: (await prop(colores.red, 'value')).value, verde: Math.round((await prop(colores.green, 'brightness')).brightness * 100) / 100, ...(await prop(ids.servo[0], 'angle')), pitos: (await notasOidas()).length };
  }
});

await ejemplo('07-estacion-del-tiempo', async (r, ids) => {
  const filas = () => page.evaluate((id) => { const c = document.getElementById(id).characters; return [0, 16].map((i) => String.fromCharCode(...c.slice(i, i + 16)).trimEnd()); }, ids.lcd1602[0]);
  await espera(800);
  r.saludo = await filas();
  await espera(3500);
  r['25 °C'] = await filas();
  r.puesto = await deslizar(ids.dht11[0], 42);
  await espera(3000);
  r['42 °C'] = await filas();
});

await ejemplo('08-lampara-de-colores', async (r, ids) => {
  const rgb = async () => { const p = await prop(ids['rgb-led'][0], 'ledRed', 'ledGreen', 'ledBlue'); return ['ledRed', 'ledGreen', 'ledBlue'].map((c) => Math.round(p[c] * 100) / 100).join('/'); };
  await espera(600);
  r.inicio = await rgb();
  for (const orden of ['rojo', 'verde', 'azul', 'azar', 'apagar']) { await enviar(orden); r[orden] = await rgb(); }
  r.monitor = await serie();
});

await ejemplo('09-control-y-digito', async (r, ids) => {
  const CIFRAS = { 63: '0', 6: '1', 91: '2', 79: '3', 102: '4', 109: '5', 125: '6', 7: '7', 127: '8', 111: '9', 0: ' ' };
  const digito = () => page.evaluate(({ id, CIFRAS }) => CIFRAS[[...document.getElementById(id).values].slice(0, 7).reduce((b, x, i) => b | (x << i), 0)] ?? '?', { id: ids['7segment'][0], CIFRAS });
  const tecla = async (nombre) => {
    const c = await page.evaluate(({ id, nombre }) => { const q = document.getElementById(id).shadowRoot.querySelector(`.tecla[data-nombre="${nombre}"] circle`).getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, { id: ids['control-remoto'][0], nombre });
    await page.mouse.move(c.x, c.y); await page.mouse.down(); await espera(150); await page.mouse.up(); await espera(700);
  };
  await espera(600);
  await tecla('5'); r['tecla 5'] = await digito();
  await tecla('8'); r['tecla 8'] = await digito();
  await tecla('borrar'); r['borrar'] = await digito();
  await tecla('OK');
  const cuenta = [];
  for (let t = 0; t < 3600; t += 100) { const d = await digito(); if (cuenta.at(-1) !== d) cuenta.push(d); await espera(100); }
  r['OK cuenta'] = cuenta.join('');
  await tecla('3');
  r.monitor = await serie();
});

await ejemplo('10-marcador', async (r, ids) => {
  const CIFRAS = { 63: '0', 6: '1', 91: '2', 79: '3', 102: '4', 109: '5', 125: '6', 7: '7', 127: '8', 111: '9', 0: ' ' };
  const numero = () => page.evaluate(({ id, CIFRAS }) => { const v = [...document.getElementById(id).values]; let t = ''; for (let d = 0; d < v.length / 8; d++) t += CIFRAS[v.slice(d * 8, d * 8 + 7).reduce((b, x, i) => b | (x << i), 0)] ?? '?'; return t; }, { id: ids['display-4'][0], CIFRAS });
  await espera(900);
  r.inicio = await numero();
  await espera(1800);
  await perilla(ids.potentiometer[0], 0);
  r['perilla en 0'] = await numero();
  await perilla(ids.potentiometer[0], 1023);
  r['perilla al máximo'] = await numero();
  await enviar('2025');
  r['escribo 2025'] = await numero();
  r.monitor = await serie();
});

await ejemplo('11-reflejos', async (r, ids) => {
  const luz = async () => (await prop(ids.led[0], 'value')).value;
  for (let t = 0; t < 7000 && !(await luz()); t += 50) await espera(50);
  r['se prendió'] = await luz();
  await apretar(ids.pushbutton[0], 300);
  r['se apagó al apretar'] = !(await luz());
  await soltar();
  r.monitor = await serie();
});

await ejemplo('12-bloques-de-pin', async (r, ids) => {
  r.suelto = await led13();
  await apretar(ids.pushbutton[0]);
  r.apretado = await led13();
  await soltar();
  r.soltado = await led13();
  for (const v of [0, 1023]) { await perilla(ids.potentiometer[0], v); r['brillo con perilla ' + v] = Math.round((await prop(ids.led[0], 'brightness')).brightness * 100) / 100; }
});
