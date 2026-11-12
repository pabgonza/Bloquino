// h8: variables de texto y puerto serie. Crear una variable de texto con el
// mouse, darle un valor, y con el monitor serie mandar órdenes que prenden y
// apagan el LED de la placa.
await nuevo();
await limpiar();
await page.getByRole('button', { name: 'Código', exact: true }).click();
await espera(3000);
const leer = async () => { await espera(2500); return page.evaluate(() => window.__e.useEditorStore.getState().files.find((f) => f.name.endsWith('.ino')).content); };
const abrir = async (nombre) => { await page.locator('.blocklyToolboxCategory').filter({ hasText: nombre }).first().click(); await espera(600); };
const enPaleta = (sel) => page.evaluate((sel) => !!document.querySelector('.blocklyFlyout ' + sel), sel);

// 1. Variables ofrece crear de número y de texto; se crea «orden», de texto.
await abrir('Variables');
R.botones = await page.locator('.blocklyFlyoutButton').allTextContents();
await page.locator('.blocklyFlyoutButton').nth(1).click();
await espera(500);
await page.keyboard.type('orden');
await page.locator('.blocklyDialogConfirmButton').click();
await espera(800);
if (!(await enPaleta('.ab_definir_texto'))) await abrir('Variables');
R['1 bloques de texto'] = (await enPaleta('.ab_definir_texto .blocklyDraggable.text')) && (await enPaleta('.ab_variable_texto')) && !(await enPaleta('.variables_set'));

// 2. «fijar orden en [hola]» bajo «al iniciar» y cambiarle el texto.
const def = await forma('ab_definir_texto', 0, true);
const ini = await forma('ab_al_iniciar');
await arrastrar({ x: def.x + 14, y: def.y + 30 }, { x: ini.x + 14, y: ini.y + ini.h + 26 });
const hueco = await page.evaluate(() => { const r = [...document.querySelectorAll('.blocklyDraggable.ab_definir_texto .blocklyDraggable.text')].find((b) => !b.closest('.blocklyFlyout')).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
await page.mouse.click(hueco.x, hueco.y);
await espera(300);
await page.keyboard.press('Control+a');
await page.keyboard.type('listo');
await page.keyboard.press('Enter');
const sketch = await leer();
R['2 texto'] = sketch.includes('String orden = "";') && sketch.includes('orden = "listo";');
await page.mouse.move(700, 720);
await page.screenshot({ path: './.playwright-mcp/textos.jpg', type: 'jpeg', quality: 85, scale: 'css' });

// 3. Órdenes por el monitor serie.
const orden = { block: { type: 'ab_variable_texto', fields: { VAR: { id: 't' } } } };
const txt = (TEXT) => ({ block: { type: 'text', fields: { TEXT } } });
R.sketch = resumen(await programar([cadena([
  { type: 'ab_cuando_serie' },
  { type: 'ab_definir_texto', fields: { VAR: { id: 't' } }, inputs: { VALUE: { block: { type: 'ab_serie_texto' } } } },
  siSino({ type: 'ab_texto_igual', inputs: { A: orden, B: txt('encender') } }, [led('HIGH', 13)], [led('LOW', 13)]),
  decir({ block: { type: 'ab_unir', inputs: { A: txt('Recibido: '), B: orden } } }),
])], [{ name: 'orden', id: 't', type: 'texto' }]), 40).split(' / ').slice(-14).join(' / ');
await page.getByRole('button', { name: 'Código', exact: true }).click();
await espera(1500);
if (!(await page.locator('.bq-serie').count())) await page.locator('.bq-serie-titulo').click();
await espera(500);
R.simula = await simular();
if (R.simula) {
  const led13 = () => page.evaluate(() => !!document.querySelector('wokwi-arduino-uno').led13);
  const enviar = async (texto) => {
    await page.locator('.bq-serie input:not([type=checkbox])').fill(texto);
    await page.keyboard.press('Enter');
    await espera(900);
  };
  await espera(600);
  await enviar('encender');
  R['3 encender'] = await led13();
  await enviar('apagar');
  R['3 apagar'] = !(await led13());
  R.monitor = (await page.locator('.bq-serie pre').first().innerText()).trim().split(/\r?\n/);
  await page.screenshot({ path: './.playwright-mcp/textos-serie.jpg', type: 'jpeg', quality: 85, scale: 'css' });
  await detener();
}
