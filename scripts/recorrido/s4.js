// Sesión 4: botón en el pin 2 y LED en el 13. El botón va a caballo del canal,
// entre el pin y GND (el bloque de botón usa la resistencia interna del pin).
await nuevo();
await limpiar();
const proto = await agregar('Protoboard');
const l = await ledConResistencia(proto, 40, '13');
const boton = await agregar('Botón');
// Girado, el botón deja las patitas 1 en la columna 14 y las 2 en la 12.
R.boton = await asentar(boton, '1.l', proto, '14t.c');
R['cable-pin2'] = await cable(proto, '14t.a', 'uno', '2');
R['cable-boton-gnd'] = await cable(proto, '12b.j', proto, 'bn.10');
R['cable-gnd'] = await cable(proto, 'bn.45', 'uno', 'GND.2');
await page.mouse.move(700, 720);
await page.screenshot({ path: './.playwright-mcp/s4-armado.jpg', type: 'jpeg', quality: 85, scale: 'css' });

R.sketch = resumen(await programar([alIniciar(porSiempre(siSino({ type: 'ab_boton', fields: { PIN: '2' } }, [led('HIGH', 13)], [led('LOW', 13)])))]));
R.simula = await simular();
if (R.simula) {
  await espera(500);
  R.suelto = (await prop(l, 'value')).value;
  const c = await page.evaluate((id) => { const r = document.getElementById(id).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, boton);
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  await espera(400);
  R.apretado = (await prop(l, 'value')).value;
  await page.screenshot({ path: './.playwright-mcp/s4-apretado.jpg', type: 'jpeg', quality: 85, scale: 'css' });
  await page.mouse.up();
  await espera(400);
  R.soltado = (await prop(l, 'value')).value;
  await detener();
}
