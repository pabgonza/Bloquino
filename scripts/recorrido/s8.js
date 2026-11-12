// Sesión 8: DHT11 en el pin 2. Alarma de fiebre: sobre 30 °C prende el LED de
// la placa. La temperatura se cambia en el panel del sensor.
await nuevo();
await limpiar();
const proto = await agregar('Protoboard');
const dht = await agregar('Temperatura y humedad');
R.dht = await asentar(dht, 'S', proto, '20b.f');
R['cable-pin2'] = await cable(proto, '20b.j', 'uno', '2');
R['cable-dht-5v'] = await cable(proto, '21b.j', proto, 'bp.17');
R['cable-dht-gnd'] = await cable(proto, '22b.j', proto, 'bn.20');
R['cable-5v'] = await cable(proto, 'bp.48', 'uno', '5V');
R['cable-gnd'] = await cable(proto, 'bn.45', 'uno', 'GND.2');
await page.mouse.move(700, 720);
await page.screenshot({ path: './.playwright-mcp/s8-armado.jpg', type: 'jpeg', quality: 85, scale: 'css' });

const fiebre = comparar({ ...num(0), block: { type: 'ab_temperatura', fields: { PIN: '2' } } }, '>', num(30));
R.sketch = resumen(await programar([alIniciar(porSiempre(siSino(fiebre, [led('HIGH', 13)], [led('LOW', 13)]), esperarB(0.5)))]), 20);
R.simula = await simular();
if (R.simula) {
  for (const grados of [25, 42, 20]) {
    const puesto = await deslizar(dht, grados);
    await espera(3200); // el DHT11 renueva la lectura cada 2 s
    R[grados + ' °C'] = { puesto, led: await page.evaluate(() => !!document.querySelector('wokwi-arduino-uno').led13) };
  }
  await page.screenshot({ path: './.playwright-mcp/s8-simulando.jpg', type: 'jpeg', quality: 85, scale: 'css' });
  await detener();
}
