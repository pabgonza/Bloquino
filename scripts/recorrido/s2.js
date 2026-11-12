// Sesión 2: parpadeo del LED de la placa (pin 13), sin armar nada.
await nuevo();
await limpiar();
R.sketch = resumen(await programar([alIniciar(porSiempre(led('HIGH', 13), esperarB(1), led('LOW', 13), esperarB(1)))]));
R.simula = await simular();
if (R.simula) {
  // Momentos (ms) en que cambia el LED de la placa: deben separarse 1000 ms.
  const cambios = [];
  let antes;
  const t0 = Date.now();
  while (Date.now() - t0 < 4500) {
    const v = await page.evaluate(() => !!document.querySelector('wokwi-arduino-uno').led13);
    if (v !== antes) { cambios.push((v ? 'on@' : 'off@') + (Date.now() - t0)); antes = v; }
    await espera(20);
  }
  R.cambios = cambios;
  await page.screenshot({ path: './.playwright-mcp/s2-simulando.jpg', type: 'jpeg', quality: 85, scale: 'css' });
  await detener();
}
