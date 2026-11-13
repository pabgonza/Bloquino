// Mis bloques con el mouse: crear con el diálogo, arrastrar entradas desde el
// sombrero, usar el bloque, editarlo, deshacer, borrar con y sin usos,
// recursión, simular y recargar.
await nuevo();
await limpiar();
await programar([alIniciar()]);
await page.getByRole('button', { name: 'Código', exact: true }).click();
await espera(2500);
const leer = async () => { await espera(2500); return page.evaluate(() => window.__e.useEditorStore.getState().files.find((f) => f.name.endsWith('.ino')).content); };
const categoria = async (nombre) => { await page.locator('.blocklyToolboxCategory').filter({ hasText: nombre }).first().click(); await espera(600); };
const cuantos = (clase, enPaleta = false) => page.evaluate(({ clase, enPaleta }) => [...document.querySelectorAll('.blocklyDraggable.' + clase)].filter((b) => !!b.closest('.blocklyFlyout') === enPaleta).length, { clase, enPaleta });
const centro = (r, dx = 0) => ({ x: r.x + (dx || r.w / 2), y: r.y + r.h / 2 });
/** Texto visible de un bloque del área de trabajo (con los de sus hijos). */
const textoDe = (clase, n = 0) => page.evaluate(({ clase, n }) => [...document.querySelectorAll('.blocklyDraggable.' + clase)].filter((b) => !b.closest('.blocklyFlyout'))[n].textContent.replace(/\s+/g, ' ').trim(), { clase, n });
const dialogo = () => page.locator('.ab-dialogo');

// 1. Categoría vacía: solo el botón.
await categoria('Mis bloques');
R['1 solo el botón'] = (await page.locator('.blocklyFlyout .blocklyFlyoutButton').count()) === 1 && (await cuantos('ab_mi_bloque', true)) === 0;
await page.screenshot({ path: './.playwright-mcp/mis-bloques-paleta-vacia.jpg', type: 'jpeg', quality: 85, scale: 'css' });

// 2. Crear «color (r) (g) (b)» con el diálogo.
await page.locator('.blocklyFlyout .blocklyFlyoutButton').first().click();
await espera(500);
R['2 diálogo abierto'] = await dialogo().isVisible();
R['2 avisa sin nombre'] = await page.locator('.ab-dialogo-error').innerText();
await page.keyboard.type('color');
for (const letra of ['r', 'g', 'b']) {
  await page.getByRole('button', { name: 'Agregar entrada de número' }).click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type(letra);
}
await espera(400);
await page.screenshot({ path: './.playwright-mcp/mis-bloques-dialogo.jpg', type: 'jpeg', quality: 85, scale: 'css' });
await page.getByRole('button', { name: 'Aceptar' }).click();
await espera(800);
R['2 definir a la vista'] = await page.evaluate(() => {
  const d = document.querySelector('.blocklyDraggable.ab_definir').getBoundingClientRect();
  const p = document.querySelector('.injectionDiv').getBoundingClientRect();
  return d.left >= p.left && d.right <= p.right && d.top >= p.top && d.bottom <= p.bottom;
});
R['2 texto'] = await textoDe('ab_definir');
R['2 en la paleta'] = await cuantos('ab_mi_bloque', true);

// 3. «fijar pin 9 en ( )» bajo la definición y la entrada r arrastrada a su hueco.
await categoria('Avanzado');
const pwm = await forma('ab_pin_pwm', 0, true);
const def = await forma('ab_definir');
await arrastrar({ x: pwm.x + 10, y: pwm.y + pwm.h / 2 }, { x: def.x + 10, y: def.y + def.h + pwm.h / 2 + 4 });
await espera(500);
const r = await forma('ab_entrada', 0);
const hueco = await page.evaluate(() => { const b = [...document.querySelectorAll('.blocklyDraggable.ab_pin_pwm')].find((e) => !e.closest('.blocklyFlyout')); const x = b.querySelector('.math_number > .blocklyPath').getBoundingClientRect(); return { x: x.left, y: x.top, w: x.width, h: x.height }; });
await arrastrar(centro(r, 8), centro(hueco, 8));
await espera(500);
R['3 entradas'] = await cuantos('ab_entrada'); // 3 fijas y la copia
R['3 sombrero intacto'] = await textoDe('ab_definir', 0);
R['3 sketch'] = resumen(await leer(), 20);
await page.screenshot({ path: './.playwright-mcp/mis-bloques-entrada.jpg', type: 'jpeg', quality: 85, scale: 'css' });

// 4. Usar «color» bajo «al iniciar» y darle 255 a la primera entrada.
await categoria('Mis bloques');
R['4 en la paleta'] = await cuantos('ab_mi_bloque', true);
const enPaleta = await forma('ab_mi_bloque', 0, true);
const ini = await forma('ab_al_iniciar');
await arrastrar({ x: enPaleta.x + 14, y: enPaleta.y + 20 }, { x: ini.x + 14, y: ini.y + ini.h + 20 });
const numeroDe = (clase, n) => page.evaluate(({ clase, n }) => { const b = [...document.querySelectorAll('.blocklyDraggable.' + clase)].find((e) => !e.closest('.blocklyFlyout')); const r = b.querySelectorAll('.math_number > .blocklyPath')[n].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, { clase, n });
await page.mouse.click(...Object.values(await numeroDe('ab_mi_bloque', 0)));
await espera(300);
await page.keyboard.press('Control+a');
await page.keyboard.type('255');
await page.keyboard.press('Enter');
let sketch = await leer();
R['4 función'] = sketch.includes('void color(float r, float g, float b) {\n  analogWrite(9, r);\n}');
R['4 llamada'] = sketch.includes('color(255, 0, 0);');

// 5. Editar desde el uso: agregar la entrada «brillo»; el 255 queda en su lugar.
const uso = await forma('ab_mi_bloque');
await page.mouse.click(uso.x + 20, uso.y + uso.h / 2, { button: 'right' });
await espera(400);
await page.locator('.blocklyMenuItem').filter({ hasText: 'Editar' }).click();
await espera(500);
R['5 diálogo con lo actual'] = await page.locator('.ab-dialogo input').evaluateAll((es) => es.map((e) => e.value).join(','));
await page.getByRole('button', { name: 'Agregar entrada de número' }).click();
await page.keyboard.press('Control+a');
await page.keyboard.type('brillo');
await page.screenshot({ path: './.playwright-mcp/mis-bloques-editar.jpg', type: 'jpeg', quality: 85, scale: 'css' });
await page.getByRole('button', { name: 'Aceptar' }).click();
sketch = await leer();
R['5 uso con 4'] = sketch.includes('color(255, 0, 0, 0);');
R['5 sombrero'] = await page.evaluate(() => [...document.querySelectorAll('.blocklyDraggable.ab_definir > .blocklyDraggable.ab_entrada')].map((e) => e.textContent).join(','));

// 6. Ctrl+Z deshace la edición de una vez.
const panel = await page.evaluate(() => { const r = document.querySelector('.injectionDiv').getBoundingClientRect(); return { x: r.right - 200, y: r.bottom - 60 }; });
await page.mouse.click(panel.x, panel.y);
await page.keyboard.press('Control+z');
sketch = await leer();
R['6 deshecho'] = sketch.includes('color(255, 0, 0);') && sketch.includes('void color(float r, float g, float b)');

// 7. Una definición con usos no se borra: aviso y vuelve a su lugar.
const papelera = await page.evaluate(() => { const r = document.querySelector('.blocklyTrash').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
let d = await forma('ab_definir');
await arrastrar({ x: d.x + 30, y: d.y + 20 }, papelera);
await espera(800);
R['7 aviso'] = await page.evaluate(() => document.querySelector('dialog.blocklyDialog[open]')?.textContent ?? '');
await page.screenshot({ path: './.playwright-mcp/mis-bloques-borrar.jpg', type: 'jpeg', quality: 85, scale: 'css' });
await page.locator('dialog.blocklyDialog[open] button').last().click();
await espera(400);
const d2 = await forma('ab_definir');
R['7 sigue en su lugar'] = Math.abs(d2.x - d.x) < 2 && Math.abs(d2.y - d.y) < 2 && (await cuantos('ab_entrada')) === 4;
if (!R['7 sigue en su lugar']) nota('7:', JSON.stringify(d), JSON.stringify(d2), await cuantos('ab_entrada'));
R['7 sketch igual'] = (await leer()).includes('color(255, 0, 0);');

// 8. Recursión: «color» dentro de su definición queda atenuado y fuera del código.
await categoria('Mis bloques');
const p8 = await forma('ab_mi_bloque', 0, true);
const fijar = await forma('ab_pin_pwm');
await arrastrar({ x: p8.x + 14, y: p8.y + 20 }, { x: fijar.x + 14, y: fijar.y + fijar.h + 16 });
await espera(600);
R['8 atenuado'] = await page.evaluate(() => { const u = [...document.querySelectorAll('.blocklyDraggable.ab_mi_bloque')].filter((e) => !e.closest('.blocklyFlyout') && e.closest('.ab_definir')); return u.map((e) => e.getAttribute('class')).join(' | '); });
sketch = await leer();
R['8 fuera del código'] = !/\{\n  analogWrite\(9, r\);\n  color\(/.test(sketch) && sketch.includes('color(255, 0, 0);');
await page.screenshot({ path: './.playwright-mcp/mis-bloques-recursion.jpg', type: 'jpeg', quality: 85, scale: 'css' });
const rec = await page.evaluate(() => { const u = [...document.querySelectorAll('.blocklyDraggable.ab_mi_bloque')].find((e) => !e.closest('.blocklyFlyout') && e.closest('.ab_definir')); const r = u.querySelector(':scope > .blocklyPath').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
await arrastrar({ x: rec.x + 14, y: rec.y + 12 }, papelera);
await espera(600);

// 9. Sin usos sí se borra y sale de la paleta.
await categoria('Mis bloques');
await page.locator('.blocklyFlyout .blocklyFlyoutButton').first().click();
await espera(400);
await page.keyboard.type('nada');
await page.getByRole('button', { name: 'Aceptar' }).click();
await espera(800);
R['9 dos definiciones'] = await cuantos('ab_definir');
d = await forma('ab_definir', 1);
await arrastrar({ x: d.x + 30, y: d.y + 20 }, papelera);
await espera(800);
R['9 sin aviso'] = !(await page.locator('dialog.blocklyDialog[open]').count());
await categoria('Mis bloques');
R['9 paleta'] = await cuantos('ab_mi_bloque', true);

// 10. Simular y recargar la página: todo vuelve igual.
await page.getByRole('button', { name: 'Código', exact: true }).click();
await espera(600);
R['10 simula'] = await simular();
if (R['10 simula']) await detener();
const antes = await page.evaluate(() => window.__e.useEditorStore.getState().files.find((f) => f.name === 'bloques.json').content);
await page.reload();
await espera(3000);
await page.evaluate(async () => {
  const mod = (n) => import(performance.getEntriesByType('resource').map((e) => e.name).filter((u) => u.includes(n)).pop());
  window.__e = await mod('/store/useEditorStore.ts');
  window.__s = await mod('/store/useSimulatorStore.ts');
});
await page.getByRole('button', { name: 'Código', exact: true }).click();
await espera(2500);
const despues = await page.evaluate(() => window.__e.useEditorStore.getState().files.find((f) => f.name === 'bloques.json').content);
R['10 recargado igual'] = antes === despues;
await categoria('Mis bloques');
R['10 paleta'] = await cuantos('ab_mi_bloque', true);
R['10 texto'] = await textoDe('ab_mi_bloque');
await page.screenshot({ path: './.playwright-mcp/mis-bloques.jpg', type: 'jpeg', quality: 85, scale: 'css' });

// 11. Ejemplo 14: la lámpara del 08 con «color (r) (g) (b)» y «parpadear (veces)».
// Abre el 08, le pone el programa, lo simula y lo guarda con «Descargar».
await page.evaluate(() => { window.confirm = () => true; window.prompt = () => '14-mis-bloques'; });
await page.setInputFiles('input[type=file]', './frontend/public/ejemplos/08-lampara-de-colores.bloquino');
await espera(2500);
const COLOR = [{ tipo: 'nombre', texto: 'color', id: 'n' }, ...['r', 'g', 'b'].map((e) => ({ tipo: 'numero', texto: e, id: e }))];
const PARPADEAR = [{ tipo: 'nombre', texto: 'parpadear', id: 'n' }, { tipo: 'numero', texto: 'veces', id: 'veces' }, { tipo: 'rotulo', texto: 'veces', id: 'rotulo' }];
const fija = (def, p) => ({ block: { type: 'ab_entrada', deletable: false, extraState: { definicion: def, entrada: p.id, tipo: p.tipo, texto: p.texto } } });
const copia = (def, id) => ({ block: { type: 'ab_entrada', extraState: { definicion: def, entrada: id, tipo: 'numero', texto: id } } });
const definirB = (id, partes, ...hace) => ({ type: 'ab_definir', extraState: { id, partes }, inputs: Object.fromEntries(partes.filter((p) => p.tipo === 'numero').map((p) => [p.id, fija(id, p)])), next: { block: cadena(hace) } });
const colorB = (r, g, b) => ({ type: 'ab_mi_bloque', extraState: { definicion: 'color', partes: COLOR }, inputs: { r: num(r), g: num(g), b: num(b) } });
const pwmB = (pin, e) => ({ type: 'ab_pin_pwm', fields: { PIN: String(pin) }, inputs: { VALOR: copia('color', e) } });
R['11 sketch'] = resumen(await programar([
  alIniciar({ type: 'ab_mi_bloque', extraState: { definicion: 'parpadear', partes: PARPADEAR }, inputs: { veces: num(3) } },
    porSiempre(colorB(255, 0, 0), esperarB(1), colorB(0, 255, 0), esperarB(1), colorB(0, 0, 255), esperarB(1))),
  definirB('color', COLOR, pwmB(11, 'r'), pwmB(10, 'g'), pwmB(9, 'b')),
  definirB('parpadear', PARPADEAR, { type: 'ab_repetir', inputs: { VECES: copia('parpadear', 'veces'), DO: { block: cadena([colorB(255, 255, 255), esperarB(0.2), colorB(0, 0, 0), esperarB(0.2)]) } } }),
]), 30);
const rgbId = await page.evaluate(() => window.__s.useSimulatorStore.getState().components.find((c) => c.metadataId === 'rgb-led').id);
const rgb = async () => { const p = await prop(rgbId, 'ledRed', 'ledGreen', 'ledBlue'); return ['ledRed', 'ledGreen', 'ledBlue'].map((c) => Math.round(p[c] * 100) / 100).join('/'); };
if (await simular()) {
  const vistos = [];
  for (let t = 0; t < 4500; t += 100) { const v = await rgb(); if (vistos.at(-1) !== v) vistos.push(v); await espera(100); }
  R['11 colores'] = vistos.join(' → ');
  await detener();
}
const descarga = page.waitForEvent('download');
await page.getByRole('button', { name: 'Descargar' }).click();
await (await descarga).saveAs('./frontend/public/ejemplos/14-mis-bloques.bloquino');
R['11 guardado'] = true;
