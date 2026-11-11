// Sesión 10: integración, una barrera automática. Si el sensor de distancia
// (TRIG 9, ECHO 10) ve algo a menos de 20 cm, el servo (pin 3) sube, prende el
// LED de paso (12) y pita el buzzer (8); si no, barrera abajo y LED de alto (13).
await nuevo();
await limpiar();
const proto = await agregar('Protoboard');
const sensor = await sensorDistancia(proto, 10);
const alto = await ledConResistencia(proto, 34, '13');
const paso = await ledConResistencia(proto, 40, '12');
await buzzerEn(proto, 52);
const servo = await agregar('Servo');
R['cable-servo-pin3'] = await cable(servo, 'PWM', 'uno', '3');
R['cable-servo-5v'] = await cable(servo, 'V+', proto, 'bp.30');
R['cable-servo-gnd'] = await cable(servo, 'GND', proto, 'bn.30');
R['cable-5v'] = await cable(proto, 'bp.48', 'uno', '5V');
R['cable-gnd'] = await cable(proto, 'bn.45', 'uno', 'GND.2');
R.cables = await page.evaluate(() => window.__s.useSimulatorStore.getState().wires.filter((w) => !w.bb).length);
await page.mouse.move(700, 720);
await page.screenshot({ path: './.playwright-mcp/s10-armado.jpg', type: 'jpeg', quality: 85, scale: 'css' });

const cerca = comparar({ ...num(0), block: { type: 'ab_distancia', fields: { DISPARO: '9', ECO: '10' } } }, '<', num(20));
const barrera = (grados) => ({ type: 'ab_servo', fields: { PIN: '3' }, inputs: { ANGULO: { shadow: { type: 'ab_angulo', fields: { ANGULO: grados } } } } });
const pito = { type: 'ab_tocar_nota', fields: { NOTA: '880', PIN: '8' }, inputs: { S: num(0.2) } };
R.sketch = resumen(await programar([alIniciar(porSiempre(siSino(cerca, [barrera(90), led('LOW', 13), led('HIGH', 12), pito], [barrera(0), led('LOW', 12), led('HIGH', 13)]), esperarB(0.1)))]), 40).slice(-420);
await espiarAudio();
R.simula = await simular();
if (R.simula) {
  for (const cm of [100, 8, 100]) {
    const puesto = await deslizar(sensor, cm);
    await espiarAudio();
    await espera(1500);
    R[cm + ' cm' + (R[cm + ' cm'] ? ' (otra vez)' : '')] = { puesto, alto: (await prop(alto, 'value')).value, paso: (await prop(paso, 'value')).value, ...(await prop(servo, 'angle')), pitos: (await notasOidas()).length };
  }
  await page.screenshot({ path: './.playwright-mcp/s10-simulando.jpg', type: 'jpeg', quality: 85, scale: 'css' });
  await detener();
}
