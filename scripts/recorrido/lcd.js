// h8: pantalla LCD 16x2 cableada a la placa (RS, E, D4 a D7 y alimentación)
// con el mouse. El programa escribe dos filas y un contador.
await nuevo();
await limpiar();
const lcd = await agregar('Pantalla LCD');
R.caja = await page.evaluate((id) => { const r = document.getElementById(id).getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round).join(' '); }, lcd);
const PINES = { RS: '12', E: '11', D4: '5', D5: '4', D6: '3', D7: '2' };
for (const [pin, uno] of Object.entries(PINES)) R['cable-' + pin] = await cable(lcd, pin, 'uno', uno);
R['cable-VSS'] = await cable(lcd, 'VSS', 'uno', 'GND.2');
R['cable-VDD'] = await cable(lcd, 'VDD', 'uno', '5V');
R['cable-RW'] = await cable(lcd, 'RW', 'uno', 'GND.3');
await page.mouse.move(700, 720);
await page.screenshot({ path: './.playwright-mcp/lcd-armado.jpg', type: 'jpeg', quality: 85, scale: 'css' });

const txt = (TEXT) => ({ block: { type: 'text', fields: { TEXT } } });
const escribir = (VALOR) => ({ type: 'ab_lcd_escribir', inputs: { VALOR } });
const cursor = (c, f) => ({ type: 'ab_lcd_cursor', inputs: { COLUMNA: num(c), FILA: num(f) } });
const cuenta = { block: { type: 'variables_get', fields: { VAR: { id: 'n' } } } };
R.sketch = resumen(await programar([alIniciar(
  escribir(txt('Hola Bloquino')),
  porSiempre(cursor(1, 2), escribir({ block: { type: 'ab_unir', inputs: { A: txt('Vueltas: '), B: cuenta } } }), { type: 'math_change', fields: { VAR: { id: 'n' } }, inputs: { DELTA: num(1) } }, esperarB(0.5)),
)], [{ name: 'vueltas', id: 'n' }]), 8);
R.simula = await simular();
if (R.simula) {
  const filas = () => page.evaluate((id) => { const c = document.getElementById(id).characters; return [0, 16].map((i) => String.fromCharCode(...c.slice(i, i + 16)).trimEnd()); }, lcd);
  await espera(1300);
  R['pantalla 1'] = await filas();
  await espera(1500);
  R['pantalla 2'] = await filas();
  await page.screenshot({ path: './.playwright-mcp/lcd-simulando.jpg', type: 'jpeg', quality: 85, scale: 'css' });
  await detener();
}
