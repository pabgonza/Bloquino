// h8: control remoto. Receptor infrarrojo en el pin 10 y el control del kit
// (17 teclas) en el lienzo; las teclas se aprietan con el mouse.
await nuevo();
await limpiar();
const receptor = await agregar('Receptor infrarrojo');
R['cable-DAT'] = await cable(receptor, 'DAT', 'uno', '10');
R['cable-VCC'] = await cable(receptor, 'VCC', 'uno', '5V');
R['cable-GND'] = await cable(receptor, 'GND', 'uno', 'GND.2');
const control = await agregar('Control remoto');
R.teclas = await page.evaluate((id) => document.getElementById(id).shadowRoot.querySelectorAll('.tecla').length, control);

const txt = (TEXT) => ({ block: { type: 'text', fields: { TEXT } } });
const cuandoTecla = (TECLA, ...bs) => cadena([{ type: 'ab_cuando_tecla', fields: { TECLA, PIN: '10' } }, ...bs]);
const valor = (type) => ({ block: { type, fields: { PIN: '10' } } });
R.sketch = resumen(await programar([
  cuandoTecla('*', decir({ block: { type: 'ab_unir', inputs: { A: valor('ab_tecla_ultima'), B: { block: { type: 'ab_unir', inputs: { A: txt(' '), B: valor('ab_tecla_codigo') } } } } } })),
  cuandoTecla('OK', led('HIGH', 13)),
  cuandoTecla('borrar', led('LOW', 13)),
]), 4);
await page.getByRole('button', { name: 'Código', exact: true }).click();
await espera(1500);
if (!(await page.locator('.bq-serie').count())) await page.locator('.bq-serie-titulo').click();
await espera(500);
R.simula = await simular();
if (R.simula) {
  const led13 = () => page.evaluate(() => !!document.querySelector('wokwi-arduino-uno').led13);
  // Centro de una tecla del control, por su nombre.
  const apretar = async (nombre, ms = 150) => {
    const c = await page.evaluate(({ id, nombre }) => { const r = document.getElementById(id).shadowRoot.querySelector(`.tecla[data-nombre="${nombre}"] circle`).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, { id: control, nombre });
    await page.mouse.move(c.x, c.y);
    await page.mouse.down();
    await espera(ms);
    await page.mouse.up();
    await espera(500);
  };
  await espera(600);
  await apretar('OK');
  R['OK enciende'] = await led13();
  await apretar('7', 600); // mantenida: cuenta una vez
  await apretar('borrar');
  R['borrar apaga'] = !(await led13());
  await apretar('función');
  R.monitor = (await page.locator('.bq-serie pre').first().innerText()).trim().split(/\r?\n/);
  await page.mouse.move(700, 740);
  await page.screenshot({ path: './.playwright-mcp/control-simulando.jpg', type: 'jpeg', quality: 85, scale: 'css' });
  await detener();
}
