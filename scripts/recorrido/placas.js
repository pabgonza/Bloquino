// Varias placas (change varias-placas) con mouse y teclado reales: copiar una
// placa con su programa, el selector del panel de programa, cablear de una
// placa a otra, simular las dos, borrar con confirmación y Ctrl+Z, numeración,
// la placa de la paleta y el circuito sin placas. Arma y guarda de paso el
// ejemplo `13-dos-placas.bloquino`. Se corre entero con
// `browser_run_code_unsafe` del MCP de Playwright (parámetro `filename`), con el
// servidor de desarrollo arriba.
async (page) => {
  const RAIZ = 'D:/Second_Brain/Personal/Proyectos/Plataforma_Arduino_Bloques/repo/';
  const R = {};
  const espera = (ms) => page.waitForTimeout(ms);
  const foto = (n) => page.screenshot({ path: RAIZ + '.playwright-mcp/placas-' + n + '.jpg', type: 'jpeg', quality: 75, scale: 'css' });
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('http://localhost:5173/editor?alumno');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5173/editor?alumno');
  await espera(4000);
  // Diálogos nativos: el MCP se corta con ellos. `respuesta` decide el confirm.
  await page.evaluate(() => {
    window.__respuesta = true;
    window.__avisos = [];
    window.confirm = (m) => (window.__avisos.push(m), window.__respuesta);
    window.alert = (m) => window.__avisos.push(m);
    window.prompt = () => '13-dos-placas';
  });
  await page.evaluate(async () => {
    const lienzo = performance.getEntriesByType('resource').map((e) => e.name).find((u) => u.includes('/SimulatorCanvas.tsx'));
    const texto = await fetch(lienzo).then((r) => r.text());
    const url = (n) => texto.match(new RegExp(`["'](/src/${n}[^"']*)["']`))[1];
    window.__p = { s: await import(url('store/useSimulatorStore.ts')), e: await import(url('store/useEditorStore.ts')) };
  });

  const estado = () => page.evaluate(() => {
    const s = window.__p.s.useSimulatorStore.getState();
    return { placas: s.boards.map((b) => b.name), ids: s.boards.map((b) => b.id), activa: s.boards.find((b) => b.id === s.activeBoardId)?.name ?? null, cables: s.wires.length };
  });
  const sketch = (nombre) => page.evaluate((nombre) => {
    const b = window.__p.s.useSimulatorStore.getState().boards.find((x) => x.name === nombre);
    return window.__p.e.useEditorStore.getState().getGroupFiles(b.activeFileGroupId).find((f) => f.name.endsWith('.ino'))?.content ?? '';
  }, nombre);
  const idDe = (nombre) => page.evaluate((nombre) => window.__p.s.useSimulatorStore.getState().boards.find((b) => b.name === nombre).id, nombre);
  // Un punto de la placa sin pines (sobre el chip).
  const sobre = async (nombre) => {
    const r = await page.locator('#' + (await idDe(nombre))).boundingBox();
    return { x: r.x + r.width * 0.55, y: r.y + r.height * 0.6 };
  };
  const clic = async (p) => { await page.mouse.click(p.x, p.y); await espera(400); };
  const tecla = async (k) => { await page.mouse.move(700, 650); await page.keyboard.press(k); await espera(800); };
  const pin = (nombre, p) => page.evaluate(({ id, p }) => {
    const el = document.getElementById(id);
    const r = el.getBoundingClientRect();
    const zoom = r.width / (el.offsetWidth || r.width);
    const q = el.pinInfo.find((x) => x.name === p);
    return { x: r.left + q.x * zoom, y: r.top + q.y * zoom };
  }, { id: nombre, p });
  // Cable de un pin a otro pasando por `puntos` del lienzo.
  const cable = async (a, pa, b, pb, puntos) => {
    const antes = (await estado()).cables;
    const desde = await pin(await idDe(a), pa);
    await page.mouse.move(desde.x, desde.y); await espera(300);
    await clic(desde);
    for (const p of puntos) await clic(p);
    const hasta = await pin(await idDe(b), pb);
    await page.mouse.move(hasta.x, hasta.y); await espera(300);
    await clic(hasta);
    return (await estado()).cables === antes + 1;
  };
  const programar = (bloques) => page.evaluate((bloques) => {
    const ed = window.__p.e.useEditorStore.getState();
    const bl = ed.files.find((f) => f.name === 'bloques.json');
    ed.setGroupFileContent(ed.activeGroupId, bl.id, JSON.stringify({ blocks: { blocks: [{ x: 30, y: 30, ...bloques }] } }));
  }, bloques);
  const comentario = (TEXTO, next) => ({ type: 'ab_comentario', fields: { TEXTO }, ...(next && { next: { block: next } }) });
  const pinDigital = (PIN, ESTADO, next) => ({ type: 'ab_pin_digital', fields: { PIN, ESTADO }, ...(next && { next: { block: next } }) });
  const esperar = (s, next) => ({ type: 'ab_esperar', inputs: { S: { shadow: { type: 'math_number', fields: { NUM: s } } } }, ...(next && { next: { block: next } }) });
  const programa = (cuerpo) => ({ type: 'ab_al_iniciar', next: { block: { type: 'ab_por_siempre', inputs: { DO: { block: cuerpo } } } } });
  const codigo = () => page.getByRole('button', { name: 'Código', exact: true }).click().then(() => espera(2500));

  // 1. Una sola placa: sin selector ni número.
  await codigo();
  R['1 una placa: selector'] = await page.locator('.bq-elegir-placa').count();
  R['1 una placa: números'] = await page.evaluate(() => [...document.querySelectorAll('.board-dock')].map((d) => getComputedStyle(d, '::before').content));
  await programar(programa(comentario('El pin 13 prende la luz L y le avisa a la Placa 2 por el cable', pinDigital('13', 'HIGH', esperar(1, pinDigital('13', 'LOW', esperar(1)))))));
  await espera(2500);
  await codigo();

  // 2. Copiar y pegar la placa: Placa 2, con el mismo programa, a la derecha.
  await clic(await sobre('Placa 1'));
  await tecla('Control+c');
  await tecla('Control+v');
  const pegado = await estado();
  R['2 pegada'] = { placas: pegado.placas, activa: pegado.activa, mismoPrograma: (await sketch('Placa 1')) === (await sketch('Placa 2')) };

  // 3. Programa propio de la Placa 2 (elegida al pegarla); el de la Placa 1 no cambia.
  const deLaUno = await sketch('Placa 1');
  await codigo();
  await programar(programa(comentario('El pin 2 escucha a la Placa 1 por el cable', {
    type: 'ab_si_sino',
    inputs: {
      COND: { block: { type: 'ab_leer_digital', fields: { PIN: '2' } } },
      DO: { block: pinDigital('13', 'HIGH') },
      SINO: { block: pinDigital('13', 'LOW') },
    },
  })));
  await espera(2500);
  R['3 cada una su programa'] = { uno: (await sketch('Placa 1')) === deLaUno, dos: (await sketch('Placa 2')).includes('digitalRead(2)') };

  // 4. Selector: dos opciones y cada una muestra sus bloques. Con el panel
  // abierto la Placa 2 queda detrás: el clic se prueba en la Placa 1.
  const textosDeBloques = () => page.evaluate(() => [...document.querySelectorAll('.bq-programa .blocklyText')].map((t) => t.textContent).join(' '));
  R['4 opciones'] = await page.locator('.bq-elegir-placa option').allTextContents();
  // La Placa 2 no espera; la 1 sí.
  R['4 la 2 muestra lo suyo'] = !(await textosDeBloques()).includes('esperar');
  await page.locator('.bq-elegir-placa').selectOption({ label: '1 (Arduino UNO)' });
  await espera(1500);
  R['4 elegida la 1'] = { activa: (await estado()).activa, susBloques: (await textosDeBloques()).includes('esperar') };
  await foto('selector');
  await page.locator('.bq-elegir-placa').selectOption({ label: '2 (Arduino UNO)' });
  await espera(1200);
  await clic(await sobre('Placa 1'));
  await espera(1200);
  R['4 clic en la Placa 1'] = { activa: (await estado()).activa, selector: await page.locator('.bq-elegir-placa').evaluate((s) => s.options[s.selectedIndex].text) };
  await codigo();

  // 5. Cables de una placa a otra: 13 → 2 por arriba y GND → GND por abajo.
  const p13 = await pin(await idDe('Placa 1'), '13');
  const p2 = await pin(await idDe('Placa 2'), '2');
  R['5 cable 13 → 2'] = await cable('Placa 1', '13', 'Placa 2', '2', [{ x: p13.x, y: p13.y - 30 }, { x: p2.x, y: p13.y - 30 }]);
  const g1 = await pin(await idDe('Placa 1'), 'GND.2');
  const g2 = await pin(await idDe('Placa 2'), 'GND.2');
  R['5 cable GND → GND'] = await cable('Placa 1', 'GND.2', 'Placa 2', 'GND.2', [{ x: g1.x, y: g1.y + 50 }, { x: g2.x, y: g1.y + 50 }]);
  await page.mouse.click(700, 680); await espera(400);
  await foto('cableadas');

  // 6. Simular: las dos corren y la L de la Placa 2 sigue a la de la Placa 1.
  await page.getByRole('button', { name: 'Iniciar simulación' }).click();
  R['6 arrancó'] = await page.getByRole('button', { name: 'Detener simulación' }).waitFor({ timeout: 90000 }).then(() => true, () => false);
  await espera(1500);
  const muestras = [];
  for (let i = 0; i < 16; i++) {
    muestras.push(await page.evaluate(() => window.__p.s.useSimulatorStore.getState().boards.map((b) => [b.running, document.getElementById(b.id)?.led13])));
    await espera(250);
  }
  R['6 corren las dos'] = muestras.every((m) => m.every(([corre]) => corre));
  R['6 L de la 1'] = [...new Set(muestras.map((m) => m[0][1]))];
  R['6 la 2 sigue a la 1'] = muestras.filter((m) => m[0][1] === m[1][1]).length + '/' + muestras.length;
  await foto('simulando');
  await page.getByRole('button', { name: 'Detener simulación' }).click();
  await espera(800);
  R['6 detenidas'] = await page.evaluate(() => window.__p.s.useSimulatorStore.getState().boards.every((b) => !b.running));

  // 7. Guardar el ejemplo.
  const descarga = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar' }).click();
  await (await descarga).saveAs(RAIZ + 'frontend/public/ejemplos/13-dos-placas.bloquino');

  // 8. Borrar la Placa 2: cancelar la deja; aceptar la quita con sus cables; Ctrl+Z la devuelve.
  const programaDos = await sketch('Placa 2');
  await clic(await sobre('Placa 2'));
  await page.evaluate(() => (window.__respuesta = false));
  await tecla('Delete');
  R['8 cancelado'] = (await estado()).placas;
  await page.evaluate(() => (window.__respuesta = true));
  await tecla('Delete');
  R['8 aviso'] = await page.evaluate(() => window.__avisos.at(-1));
  R['8 borrada'] = await estado();
  await tecla('Control+z');
  const vuelta = await estado();
  R['8 Ctrl+Z'] = { placas: vuelta.placas, cables: vuelta.cables, programa: (await sketch('Placa 2')) === programaDos };

  // 9. Ficha y barra de la placa.
  const s2 = await sobre('Placa 2');
  await page.mouse.click(s2.x, s2.y, { button: 'right' }); await espera(800);
  R['9 ficha'] = await page.locator('.part-inspector-dialog .pid-action-button:visible').allTextContents();
  await page.keyboard.press('Escape'); await espera(300);
  await clic(s2);
  R['9 barra'] = await page.locator('.board-dock-group--edit .board-dock-btn:visible').evaluateAll((bs) => bs.map((b) => b.title));

  // 10. Número libre: con 1, 2 y 3, se borra la 2 y la paleta agrega la 2.
  await tecla('Control+v');
  R['10 tres'] = (await estado()).placas;
  await clic(await sobre('Placa 2'));
  await tecla('Delete');
  await page.locator('.bq-componente', { hasText: 'Arduino UNO' }).click();
  await espera(1500);
  R['10 nueva'] = (await estado()).placas;
  await foto('numeradas');

  // 11. Sin placas: Ctrl+A y Supr; el panel lo dice e Iniciar solo avisa; Ctrl+Z devuelve todo.
  await page.mouse.click(700, 680); await espera(300);
  await tecla('Control+a');
  await tecla('Delete');
  R['11 sin placas'] = (await estado()).placas;
  await codigo();
  R['11 panel'] = await page.locator('.bq-sin-placas').textContent().catch(() => null);
  await page.getByRole('button', { name: 'Iniciar simulación' }).click(); await espera(500);
  R['11 Iniciar avisa'] = await page.evaluate(() => window.__avisos.at(-1));
  await foto('sin-placas');
  await codigo();
  await tecla('Control+z');
  R['11 Ctrl+Z'] = (await estado()).placas;

  // 12. Monitor serie de la placa elegida: cada placa dice su nombre.
  const decir = (TEXT) => programa({ type: 'ab_decir', inputs: { VALOR: { block: { type: 'text', fields: { TEXT } } } }, next: { block: esperar(0.5) } });
  await codigo();
  for (const n of ['1', '2', '3']) {
    await page.locator('.bq-elegir-placa').selectOption({ label: `${n} (Arduino UNO)` });
    await espera(1200);
    await programar(decir('soy la ' + n));
    await espera(2000);
  }
  await page.getByRole('button', { name: 'Iniciar simulación' }).click();
  await page.getByRole('button', { name: 'Detener simulación' }).waitFor({ timeout: 120000 });
  await page.locator('.bq-serie-titulo').click();
  await espera(2500);
  const monitor = () => page.locator('.bq-serie pre').first().innerText().then((t) => [...new Set(t.trim().split(/\r?\n/))]);
  R['12 pestañas visibles'] = await page.locator('.bq-serie button[title^="Placa "]:visible').count();
  R['12 elegida la 3'] = await monitor();
  await page.locator('.bq-elegir-placa').selectOption({ label: '1 (Arduino UNO)' });
  await espera(1500);
  R['12 elegida la 1'] = await monitor();
  await foto('monitor');
  await page.getByRole('button', { name: 'Detener simulación' }).click();
  return R;
}
