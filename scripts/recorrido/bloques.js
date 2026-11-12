// Programar con el mouse sobre el programa inicial (parpadeo): sacar un bloque
// de la paleta y encajarlo, cambiar un menú, escribir un número y botar un
// bloque a la papelera. Cada paso se comprueba en el sketch generado.
await nuevo();
await limpiar();
await page.getByRole('button', { name: 'Código', exact: true }).click();
await espera(3000);
const sketch = async () => { await espera(2500); return resumen(await page.evaluate(() => window.__e.useEditorStore.getState().files.find((f) => f.name.endsWith('.ino')).content), 20); };

// 1. «tocar nota» de la paleta Sonido al final del «por siempre».
await page.locator('.blocklyToolboxCategory').filter({ hasText: 'Sonido' }).first().click();
await espera(600);
const enPaleta = await forma('ab_tocar_nota', 0, true);
const ultimo = await forma('ab_esperar', 1);
await arrastrar({ x: enPaleta.x + 14, y: enPaleta.y + 30 }, { x: ultimo.x + 14, y: ultimo.y + ultimo.h + 26 });
R['1 encajar'] = /delay\(1000\); \/ tone\(8, 262, 500\);/.test(await sketch());

// 2. Menú del pin del primer LED: 13 → 12.
const ledB = await forma('ab_led', 0);
await page.mouse.click(ledB.x + ledB.w - 35, ledB.y + 26);
await espera(400);
await page.locator('.blocklyDropDownDiv .blocklyMenuItem').filter({ hasText: /^\W*12$/ }).first().click();
R['2 menú'] = /digitalWrite\(12, HIGH\)/.test(await sketch());

// 3. Número del primer «esperar»: 1 → 0.2.
const esp = await forma('ab_esperar', 0);
await page.mouse.click(esp.x + 82, esp.y + 24);
await espera(300);
await page.keyboard.press('Control+a');
await page.keyboard.type('0.2');
await page.keyboard.press('Enter');
R['3 número'] = /digitalWrite\(12, HIGH\); \/ delay\(200\);/.test(await sketch());

// 4. El bloque de nota, a la papelera.
const nota_ = await forma('ab_tocar_nota', 0);
const papelera = await page.evaluate(() => { const r = document.querySelector('.blocklyTrash').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
await arrastrar({ x: nota_.x + 10, y: nota_.y + 30 }, papelera);
R.sketch = await sketch();
R['4 papelera'] = !R.sketch.includes('tone(');
await page.screenshot({ path: './.playwright-mcp/bloques.jpg', type: 'jpeg', quality: 85, scale: 'css' });
