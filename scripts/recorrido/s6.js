// Sesión 6: perilla mágica. Potenciómetro en A0 (en la protoboard, con los
// rieles de 5 V y GND) y servo en el pin 9, cableado directo.
await nuevo();
await limpiar();
const proto = await agregar('Protoboard');
const pote = await agregar('Potenciómetro');
R.pote = await asentar(pote, 'SIG', proto, '20b.f');
R['cable-a0'] = await cable(proto, '20b.j', 'uno', 'A0');
R['cable-pote-gnd'] = await cable(proto, '19b.i', proto, 'bn.15');
R['cable-pote-5v'] = await cable(proto, '21b.i', proto, 'bp.19');
const servo = await agregar('Servo');
R['cable-servo-pin9'] = await cable(servo, 'PWM', 'uno', '9');
R['cable-servo-5v'] = await cable(servo, 'V+', proto, 'bp.40');
R['cable-servo-gnd'] = await cable(servo, 'GND', proto, 'bn.40');
R['cable-5v'] = await cable(proto, 'bp.48', 'uno', '5V');
R['cable-gnd'] = await cable(proto, 'bn.45', 'uno', 'GND.2');
await page.mouse.move(700, 720);
await page.screenshot({ path: './.playwright-mcp/s6-armado.jpg', type: 'jpeg', quality: 85, scale: 'css' });

const mapear = { type: 'ab_mapear', inputs: { X: { ...num(50), block: { type: 'ab_perilla', fields: { PIN: 'A0' } } }, A: num(0), B: num(100), C: num(0), D: num(180) } };
R.sketch = resumen(await programar([alIniciar(porSiempre({ type: 'ab_servo', fields: { PIN: '9' }, inputs: { ANGULO: { shadow: { type: 'ab_angulo' }, block: mapear } } }))]), 14);
R.simula = await simular();
if (R.simula) {
  await espera(600);
  R.inicio = { ...(await prop(pote, 'value')), ...(await prop(servo, 'angle')) };
  // Gira la perilla con el mouse: se toma del borde y se lleva al ángulo (0° = arriba).
  const centro = await page.evaluate((id) => { const r = document.getElementById(id).shadowRoot.querySelector('svg').getBoundingClientRect(); const z = r.width / 75.6; return { x: r.left + 37.6 * z, y: r.top + 30.5 * z, r: 16 * z }; }, pote);
  const punto = (g) => [centro.x + centro.r * Math.sin((g * Math.PI) / 180), centro.y - centro.r * Math.cos((g * Math.PI) / 180)];
  let actual = 0;
  for (const g of [-135, 0, 135]) {
    await page.mouse.move(...punto(actual));
    await page.mouse.down();
    for (let a = actual; g < actual ? a >= g : a <= g; a += g < actual ? -15 : 15) await page.mouse.move(...punto(a));
    await page.mouse.move(...punto(g));
    await page.mouse.up();
    actual = g;
    await espera(1500); // el servo tarda en llegar
    R['perilla ' + g] = { ...(await prop(pote, 'value')), ...(await prop(servo, 'angle')) };
  }
  await page.screenshot({ path: './.playwright-mcp/s6-simulando.jpg', type: 'jpeg', quality: 85, scale: 'css' });
  await detener();
}
