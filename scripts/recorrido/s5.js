// Sesión 5: buzzer en el pin 8 y timbre con el botón del pin 2. El sonido se
// comprueba por las frecuencias que el buzzer pide al navegador.
await nuevo();
await limpiar();
const proto = await agregar('Protoboard');
const buzzer = await agregar('Buzzer');
R.buzzer = await asentar(buzzer, '1', proto, '30b.f');
R['cable-pin8'] = await cable(proto, '30b.j', 'uno', '8');
R['cable-buzzer-gnd'] = await cable(proto, '31b.j', proto, 'bn.28');
const boton = await agregar('Botón');
R.boton = await asentar(boton, '1.l', proto, '14t.c');
R['cable-pin2'] = await cable(proto, '14t.a', 'uno', '2');
R['cable-boton-gnd'] = await cable(proto, '12b.j', proto, 'bn.10');
R['cable-gnd'] = await cable(proto, 'bn.45', 'uno', 'GND.2');
await page.mouse.move(700, 720);
await page.screenshot({ path: './.playwright-mcp/s5-armado.jpg', type: 'jpeg', quality: 85, scale: 'css' });

const nota_ = (NOTA) => ({ type: 'ab_tocar_nota', fields: { NOTA: String(NOTA), PIN: '8' }, inputs: { S: num(0.3) } });
R.sketch = resumen(await programar([alIniciar(porSiempre(siSino({ type: 'ab_boton', fields: { PIN: '2' } }, [nota_(440), nota_(659)], [{ type: 'ab_silenciar', fields: { PIN: '8' } }])))]), 16);
await espiarAudio();
R.simula = await simular();
if (R.simula) {
  await espera(800);
  R['suelto'] = await notasOidas();
  const c = await page.evaluate((id) => { const r = document.getElementById(id).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, boton);
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  await espera(2500);
  R['apretado'] = await notasOidas();
  await page.mouse.up();
  await espera(1000);
  R['soltado'] = await notasOidas();
  await detener();
}
