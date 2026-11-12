// Selección con el mouse: un clic elige un componente o un cable, nunca los
// dos, y Supr y R actúan sobre lo elegido.
await nuevo();
await limpiar();
const proto = await agregar('Protoboard');
const buzzer = await agregar('Buzzer');
R.cable = await cable(proto, '5t.a', proto, '20t.a');

const estado = () => page.evaluate(() => {
  const s = window.__s.useSimulatorStore.getState();
  return { componentes: s.components.map((c) => c.id.split('_')[0]).sort().join(' '), cables: s.wires.filter((w) => !w.bb).length };
});
const centro = (id) => page.evaluate((id) => { const r = document.getElementById(id).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, id);
const clic = async (p) => { await page.mouse.click(p.x, p.y); await espera(300); };
const tecla = async (t) => { await page.keyboard.press(t); await espera(400); };
// Un punto del fondo del lienzo, sin componentes ni placa.
const fondo = await page.evaluate(() => {
  const r = document.querySelector('.bq-lienzo').getBoundingClientRect();
  for (let y = r.bottom - 60; y > r.top; y -= 40)
    for (let x = r.left + 40; x < r.right - 40; x += 40) {
      const e = document.elementFromPoint(x, y);
      if (e && !e.closest('.component-interactive-group, [data-board-id], button')) return { x, y };
    }
});
// El cable va recto por la fila a: su punto medio queda sobre la protoboard.
const a = await posPin(proto, '5t.a');
const b = await posPin(proto, '20t.a');
const sobreCable = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

R.inicial = await estado();
await clic(await centro(buzzer));
await tecla('Delete');
R.clicYSupr = await estado();
await tecla('Control+z');
R.deshacer = await estado();

await clic(await centro(buzzer));
await clic(fondo);
await tecla('Delete');
R.clicFondoYSupr = await estado();

await clic(await centro(buzzer));
await tecla('r');
R.giro = await page.evaluate((id) => window.__s.useSimulatorStore.getState().components.find((c) => c.id === id).properties.rotation, buzzer);

await clic(await centro(buzzer));
await clic(sobreCable);
await tecla('Delete');
R.componenteCableYSupr = await estado();
await tecla('Control+z');
R.deshacerCable = await estado();

await clic(sobreCable);
await clic(await centro(buzzer));
await tecla('Delete');
R.cableComponenteYSupr = await estado();
