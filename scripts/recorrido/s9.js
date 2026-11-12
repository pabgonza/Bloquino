// Sesión 9: LED RGB (R 3, G 5, B 6, patita común a GND). Cada color lleva su
// 220 Ω a caballo del canal: el cable del pin llega arriba y la resistencia
// baja hasta la columna de la patita.
await nuevo();
await limpiar();
const proto = await agregar('Protoboard');
const rgb = await agregar('LED RGB');
R.rgb = await asentar(rgb, 'R', proto, '30b.f');
for (const [patita, pin] of [['R', '3'], ['G', '5'], ['B', '6']]) {
  const col = Number(R.rgb[patita]?.match(/^\d+/)?.[0]);
  const res = await agregar('Resistencia');
  R['res-' + patita] = await asentar(res, '1', proto, `${col}t.c`);
  R['cable-' + patita] = await cable(proto, `${col}t.a`, 'uno', pin);
}
R['cable-comun'] = await cable(proto, R.rgb.COM.replace(/\w$/, 'j'), proto, 'bn.24');
R['cable-gnd'] = await cable(proto, 'bn.45', 'uno', 'GND.2');
await page.mouse.move(700, 720);
await page.screenshot({ path: './.playwright-mcp/s9-armado.jpg', type: 'jpeg', quality: 85, scale: 'css' });

const color = (COLOR) => ({ type: 'ab_led_rgb', fields: { R: '3', G: '5', B: '6', COLOR } });
R.sketch = resumen(await programar([alIniciar(porSiempre(color('#ff0000'), esperarB(0.5), color('#00ff00'), esperarB(0.5), color('#0000ff'), esperarB(0.5), color('#ffff00'), esperarB(0.5)))]), 12).slice(-200);
R.simula = await simular();
if (R.simula) {
  await espera(300);
  const vistos = [];
  for (let t = 0; t < 2600; t += 80) {
    const p = await prop(rgb, 'ledRed', 'ledGreen', 'ledBlue');
    const k = ['ledRed', 'ledGreen', 'ledBlue'].map((c) => Math.round(p[c] * 100) / 100).join('/');
    if (vistos.at(-1) !== k) vistos.push(k);
    await espera(80);
  }
  R['rojo/verde/azul'] = vistos;
  await page.screenshot({ path: './.playwright-mcp/s9-simulando.jpg', type: 'jpeg', quality: 85, scale: 'css' });
  await detener();
}
