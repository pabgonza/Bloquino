// Variables con el mouse: crear una, sacar «fijar» (que trae su número),
// escribirle un valor y usar la variable donde C++ espera un entero.
await nuevo();
await limpiar();
await page.getByRole('button', { name: 'Código', exact: true }).click();
await espera(3000);
const leer = async () => { await espera(2500); return page.evaluate(() => window.__e.useEditorStore.getState().files.find((f) => f.name.endsWith('.ino')).content); };
const abrirVariables = async () => { await page.locator('.blocklyToolboxCategory').filter({ hasText: 'Variables' }).first().click(); await espera(600); };

// 1. Crear la variable «veces».
await abrirVariables();
await page.locator('.blocklyFlyoutButton').first().click();
await espera(500);
R.dialogo = await page.evaluate(() => { const r = document.querySelector('dialog.blocklyDialog[open]').getBoundingClientRect(); return Math.round(r.left + r.width / 2) + ',' + Math.round(r.top + r.height / 2); });
await page.screenshot({ path: './.playwright-mcp/variables-dialogo.jpg', type: 'jpeg', quality: 85, scale: 'css' });
await page.keyboard.type('veces');
await page.locator('.blocklyDialogConfirmButton').click();
await espera(800);
if (!(await page.locator('.blocklyFlyout .blocklyDraggable.variables_set').count())) await abrirVariables();
R['1 definir trae número'] = await page.evaluate(() => !!document.querySelector('.blocklyFlyout .blocklyDraggable.variables_set .blocklyDraggable.math_number'));

// 2. «fijar veces en 0» bajo «al iniciar» y escribirle un 3.
const def = await forma('variables_set', 0, true);
const ini = await forma('ab_al_iniciar');
await arrastrar({ x: def.x + 14, y: def.y + 30 }, { x: ini.x + 14, y: ini.y + ini.h + 26 });
const n = await page.evaluate(() => { const r = [...document.querySelectorAll('.blocklyDraggable.variables_set .blocklyDraggable.math_number')].find((b) => !b.closest('.blocklyFlyout')).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
await page.mouse.click(n.x, n.y);
await espera(300);
await page.keyboard.press('Control+a');
await page.keyboard.type('3');
await page.keyboard.press('Enter');
const sketch = await leer();
R['2 valor'] = sketch.includes('float veces = 0;') && /void setup\(\) \{\s+pinMode\(13, OUTPUT\);\s+veces = 3;/.test(sketch);
await page.mouse.move(700, 720);
await page.screenshot({ path: './.playwright-mcp/variables.jpg', type: 'jpeg', quality: 85, scale: 'css' });

// 3. La variable donde se espera un entero: veces de «repetir», ángulo del servo,
// brillo, tope del azar y segundos de una espera. Debe compilar y repetir 3 veces.
const veces = { block: { type: 'variables_get', fields: { VAR: { id: 'v' } } } };
R.sketch = resumen(await programar([alIniciar(
  { type: 'variables_set', fields: { VAR: { id: 'v' } }, inputs: { VALUE: num(3) } },
  { type: 'ab_servo', fields: { PIN: '9' }, inputs: { ANGULO: veces } },
  { type: 'ab_led_brillo', fields: { PIN: '5' }, inputs: { BRILLO: veces } },
  { type: 'ab_decir', inputs: { VALOR: { block: { type: 'ab_azar', inputs: { A: num(1), B: veces } } } } },
  { type: 'ab_repetir', inputs: { VECES: veces, DO: { block: cadena([led('HIGH', 13), { type: 'ab_esperar', inputs: { S: { block: { type: 'ab_aritmetica', fields: { OP: '/' }, inputs: { A: veces, B: num(10) } } } } }, led('LOW', 13), esperarB(0.3)]) } } },
)], [{ name: 'veces', id: 'v' }]), 20);
R.simula = await simular();
if (R.simula) {
  let encendidos = 0;
  let antes = false;
  const t0 = Date.now();
  while (Date.now() - t0 < 3500) {
    const v = await page.evaluate(() => !!document.querySelector('wokwi-arduino-uno').led13);
    if (v && !antes) encendidos++;
    antes = v;
    await espera(20);
  }
  R['3 repite veces'] = encendidos;
  await detener();
}
