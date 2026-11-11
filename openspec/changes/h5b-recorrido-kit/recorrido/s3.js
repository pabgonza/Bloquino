// Sesión 3: semáforo, armado como en la slide: el cable del pin llega a la
// columna de la patita + del LED, y la patita − baja con su 220 Ω al riel −.
await nuevo();
await limpiar();
const proto = await agregar('Protoboard');
const leds = {};
for (const [color, pin, col] of [['rojo', '13', 10], ['verde', '12', 24], ['amarillo', '11', 40]]) leds[color] = await ledConResistencia(proto, col, pin);
R['cable-gnd'] = await cable(proto, 'bn.45', 'uno', 'GND.2');
R.resistencia = await page.evaluate(() => window.__s.useSimulatorStore.getState().components.filter((c) => c.metadataId === 'resistor').map((c) => c.properties.value + 'Ω/' + c.properties.rotation));
await page.mouse.move(700, 720);
await page.screenshot({ path: './.playwright-mcp/s3-armado.jpg', type: 'jpeg', quality: 85, scale: 'css' });

R.sketch = resumen(await programar([
  alIniciar(porSiempre(led('HIGH', 13), esperarB(0.6), led('LOW', 13), led('HIGH', 12), esperarB(0.6), led('LOW', 12), led('HIGH', 11), esperarB(0.3), led('LOW', 11))),
]));
R.simula = await simular();
if (R.simula) {
  await espera(500);
  const orden = [];
  for (let t = 0; t < 3600; t += 100) {
    const e = [];
    for (const c of ['rojo', 'verde', 'amarillo']) if ((await prop(leds[c], 'value')).value) e.push(c);
    const k = e.join('+') || 'ninguno';
    if (orden.at(-1) !== k) orden.push(k);
    await espera(100);
  }
  R.secuencia = orden;
  R.brillo = await prop(leds.rojo, 'brightness');
  await page.screenshot({ path: './.playwright-mcp/s3-simulando.jpg', type: 'jpeg', quality: 85, scale: 'css' });
  await detener();
}
