// Sesión 7: alarma de distancia. HC-SR04 (TRIG 9, ECHO 10), LED en el 13 y
// buzzer en el 8: a menos de 20 cm prende el LED y pita.
await nuevo();
await limpiar();
const proto = await agregar('Protoboard');
const sensor = await sensorDistancia(proto, 10);
const l = await ledConResistencia(proto, 40, '13');
const buzzer = await buzzerEn(proto, 52);
R['cable-5v'] = await cable(proto, 'bp.48', 'uno', '5V');
R['cable-gnd'] = await cable(proto, 'bn.45', 'uno', 'GND.2');
R.cables = await page.evaluate(() => window.__s.useSimulatorStore.getState().wires.filter((w) => !w.bb).length);
await page.mouse.move(700, 720);
await page.screenshot({ path: './.playwright-mcp/s7-armado.jpg', type: 'jpeg', quality: 85, scale: 'css' });

const cerca = comparar({ ...num(0), block: { type: 'ab_distancia', fields: { DISPARO: '9', ECO: '10' } } }, '<', num(20));
const pito = { type: 'ab_tocar_nota', fields: { NOTA: '880', PIN: '8' }, inputs: { S: num(0.2) } };
R.sketch = resumen(await programar([alIniciar(porSiempre(siSino(cerca, [led('HIGH', 13), pito], [led('LOW', 13)]), esperarB(0.1)))]), 30).slice(-330);
await espiarAudio();
R.simula = await simular();
if (R.simula) {
  for (const cm of [150, 12, 60, 5]) {
    const puesto = await deslizar(sensor, cm);
    await espiarAudio();
    await espera(1200);
    R[cm + ' cm'] = { puesto, led: (await prop(l, 'value')).value, pitos: (await notasOidas()).length };
  }
  await page.screenshot({ path: './.playwright-mcp/s7-simulando.jpg', type: 'jpeg', quality: 85, scale: 'css' });
  await detener();
}
