// h8: displays de 7 segmentos cableados directo a la placa con el mouse: el de
// 1 dígito (cátodo común, común a GND) y el de 4 dígitos, multiplexado.
await nuevo();
await limpiar();
let display = await agregar('Display de 1 dígito');
const CIFRAS = { 0: ' ', 63: '0', 6: '1', 91: '2', 79: '3', 102: '4', 109: '5', 125: '6', 7: '7', 127: '8', 111: '9' };
// Lo que se lee en el display y el tiempo de la placa (ms) en ese momento.
const leer = () => page.evaluate(({ id, CIFRAS }) => {
  const v = [...document.getElementById(id).values];
  let texto = '';
  for (let d = 0; d < v.length / 8; d++) texto += CIFRAS[v.slice(d * 8, d * 8 + 7).reduce((b, x, i) => b | (x << i), 0)] ?? '?';
  const s = window.__s.useSimulatorStore.getState();
  return { texto, ms: Math.round(window.__s.getBoardSimulator(s.boards[0].id).cpu.cycles / 16000) };
}, { id: display, CIFRAS });
// Espera a que el tiempo de la placa, dentro de un ciclo de `periodo` ms, llegue a `fase`.
const enFase = async (periodo, fase) => { for (let i = 0; i < 80; i++) { const { texto, ms } = await leer(); if (Math.abs((ms % periodo) - fase) < 150) return texto; await espera(60); } return 'sin fase'; };
const SEG = { A: '2', B: '3', C: '4', D: '5', E: '6', F: '7', G: '8' };
for (const [s, p] of Object.entries(SEG)) R['cable-' + s] = await cable(display, s, 'uno', p);
R['cable-COM'] = await cable(display, 'COM.1', 'uno', 'GND.2');
const mostrar = (NUMERO) => ({ type: 'ab_display_mostrar', inputs: { NUMERO } });
R.sketch1 = resumen(await programar([alIniciar(porSiempre(mostrar(num(7)), esperarB(1), mostrar(num(4)), esperarB(1)))]), 2);
if (await simular()) {
  R['1 dígito'] = [await enFase(2000, 500), await enFase(2000, 1500)];
  await page.mouse.move(700, 740);
  await page.screenshot({ path: './.playwright-mcp/display-1.jpg', type: 'jpeg', quality: 85, scale: 'css' });
  await detener();
}

// Ficha del componente (clic derecho): solo el tipo, en español.
const caja = await page.evaluate((id) => { const r = document.getElementById(id).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.4 }; }, display);
for (let i = 0; i < 3 && !(await page.locator('.pid-header').count()); i++) { await page.mouse.click(caja.x, caja.y, { button: 'right' }); await espera(900); }
const ficha = page.locator('.pid-header').locator('xpath=..');
R.ficha = [...(await ficha.locator('label').allInnerTexts()), ...(await ficha.locator('select option').allInnerTexts())];
await page.keyboard.press('Escape');
await espera(500);

// Display de 4 dígitos: segmentos a los pines 2 a 8 y dígitos a los pines 9 a 12.
await limpiar();
display = await agregar('Display de 4 dígitos');
R.pines4 = await page.evaluate((id) => document.getElementById(id).pinInfo.map((p) => p.name).join(' '), display);
for (const [s, p] of Object.entries(SEG)) R['cable4-' + s] = await cable(display, s, 'uno', p);
for (const [d, p] of Object.entries({ DIG1: '9', DIG2: '10', DIG3: '11', DIG4: '12' })) R['cable4-' + d] = await cable(display, d, 'uno', p);
const preparar4 = { type: 'ab_display4_preparar', fields: { COMUN: 'catodo', ...SEG, D1: '9', D2: '10', D3: '11', D4: '12' } };
const cuenta = { block: { type: 'variables_get', fields: { VAR: { id: 'n' } } } };
R.sketch4 = resumen(await programar([alIniciar(preparar4, mostrar(num(1234)), esperarB(2), porSiempre(mostrar(cuenta), { type: 'math_change', fields: { VAR: { id: 'n' } }, inputs: { DELTA: num(7) } }, esperarB(0.5)))], [{ name: 'cuenta', id: 'n' }]), 2);
if (await simular()) {
  await espera(900);
  R['4 dígitos'] = [(await leer()).texto];
  await page.mouse.move(700, 740);
  await page.screenshot({ path: './.playwright-mcp/display-4.jpg', type: 'jpeg', quality: 85, scale: 'css' });
  await espera(2600);
  R['4 dígitos'].push((await leer()).texto);
  await espera(1500);
  R['4 dígitos'].push((await leer()).texto);
  await detener();
}
