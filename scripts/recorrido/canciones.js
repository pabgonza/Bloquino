// h6: canciones de BuzzerMusic. Buzzer en el pin 8 y botón en el pin 2, como
// en la sesión 5. El programa se arma con el mouse sobre el parpadeo inicial:
// «empezar canción» bajo «al iniciar», su menú de canción y un segundo
// programa «cuando se presiona botón» → «detener canción». Al final, «tocar
// canción» sola (la de las slides).
await nuevo();
await limpiar();
const proto = await agregar('Protoboard');
await buzzerEn(proto, 30);
const boton = await agregar('Botón');
R.boton = await asentar(boton, '1.l', proto, '14t.c');
R['cable-pin2'] = await cable(proto, '14t.a', 'uno', '2');
R['cable-boton-gnd'] = await cable(proto, '12b.j', proto, 'bn.10');
R['cable-gnd'] = await cable(proto, 'bn.45', 'uno', 'GND.2');

await page.getByRole('button', { name: 'Código', exact: true }).click();
await espera(3000);
const leer = async () => { await espera(2500); return page.evaluate(() => window.__e.useEditorStore.getState().files.find((f) => f.name.endsWith('.ino')).content); };
const categoria = async (nombre) => { await page.locator('.blocklyToolboxCategory').filter({ hasText: nombre }).first().click(); await espera(600); };
const debajoDe = (b) => ({ x: b.x + 14, y: b.y + b.h + 26 });

// 1. «empezar canción» entre «al iniciar» y «por siempre».
await categoria('Sonido');
R.paleta = await page.evaluate(() => [...document.querySelectorAll('.blocklyFlyout .blocklyDraggable')].map((b) => [...b.classList].find((c) => c.startsWith('ab_'))));
let en = await forma('ab_empezar_cancion', 0, true);
await arrastrar({ x: en.x + 14, y: en.y + 30 }, debajoDe(await forma('ab_al_iniciar')));
R['1 empezar'] = /programa1\(\) \{\s+EMPEZAR\(\);\s+musica8\.start\(BuzzerMusic::MARIO_BROS\);\s+while \(true\)/.test(await leer());

// 2. Menú de la canción: Mario Bros → Himno de la Alegría.
const menu = await campoDe('ab_empezar_cancion', 0);
await page.mouse.click(menu.x, menu.y);
await espera(400);
R.canciones = await page.locator('.blocklyDropDownDiv .blocklyMenuItem').allInnerTexts();
await page.locator('.blocklyDropDownDiv .blocklyMenuItem').filter({ hasText: 'Himno de la Alegría' }).first().click();
R['2 menú'] = (await leer()).includes('musica8.start(BuzzerMusic::ODE_TO_JOY);');

// 3. Segundo programa, debajo del primero: «cuando se presiona botón» → «detener canción».
const base = await forma('ab_por_siempre');
await categoria('Eventos');
en = await forma('ab_cuando_boton', 0, true);
await arrastrar({ x: en.x + 14, y: en.y + 30 }, { x: base.x + 14, y: base.y + base.h + 70 });
await categoria('Sonido');
en = await forma('ab_detener_cancion', 0, true);
await arrastrar({ x: en.x + 14, y: en.y + 30 }, debajoDe(await forma('ab_cuando_boton')));
const sketch = await leer();
R['3 detener'] = /ESPERAR_HASTA\(digitalRead\(2\) == LOW\);\s+ESPERAR\(20\);\s+musica8\.stop\(\);/.test(sketch);
R.loop = resumen(sketch.slice(sketch.indexOf('void loop')), 5);
await page.mouse.move(700, 720);
await page.screenshot({ path: './.playwright-mcp/canciones-bloques.jpg', type: 'jpeg', quality: 85, scale: 'css' });
await page.getByRole('button', { name: 'Código', exact: true }).click();
await espera(600);

// 4. Simular: las notas del himno suenan mientras el LED de la placa parpadea.
await espiarAudio();
R.simula = await simular();
if (R.simula) {
  const cambios = [];
  let antes;
  const t0 = Date.now();
  while (Date.now() - t0 < 3300) {
    const v = await page.evaluate(() => !!document.querySelector('wokwi-arduino-uno').led13);
    if (v !== antes) { cambios.push((v ? 'on@' : 'off@') + (Date.now() - t0)); antes = v; }
    await espera(20);
  }
  R.parpadeo = cambios;
  R['de fondo'] = await notasOidas();
  await page.screenshot({ path: './.playwright-mcp/canciones-simulando.jpg', type: 'jpeg', quality: 85, scale: 'css' });
  // 5. El botón detiene la canción.
  const c = await page.evaluate((id) => { const r = document.getElementById(id).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, boton);
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  await espera(300);
  await page.mouse.up();
  const alDetener = (await notasOidas()).length;
  await espera(2000);
  const despues = await notasOidas();
  R['5 detenida'] = despues.length - alDetener <= 1 && !despues.at(-1).endsWith('sigue');
  await detener();
}

// 6. Programa simple: «tocar canción Mario Bros», con la llamada de las slides.
R.simple = resumen(await programar([alIniciar({ type: 'ab_tocar_cancion', fields: { CANCION: 'MARIO_BROS', PIN: '8' } })]), 8);
await espiarAudio();
if (await simular()) {
  await espera(1500);
  R['mario'] = await notasOidas();
  await detener();
}
