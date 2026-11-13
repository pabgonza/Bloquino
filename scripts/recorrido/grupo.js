// Selección de varias piezas (change seleccion-multiple) con mouse y teclado
// reales, sobre el semáforo de los ejemplos. Se corre entero con
// `browser_run_code_unsafe` del MCP de Playwright (parámetro `filename`), con el
// servidor de desarrollo arriba (lee el store por la URL del módulo de Vite).
async (page) => {
  const RAIZ = 'D:/Second_Brain/Personal/Proyectos/Plataforma_Arduino_Bloques/repo/';
  const R = {};
  const espera = (ms) => page.waitForTimeout(ms);
  const foto = (n) => page.screenshot({ path: RAIZ + '.playwright-mcp/grupo-' + n + '.jpg', type: 'jpeg', quality: 75, scale: 'css' });
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('http://localhost:5173/editor?alumno');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:5173/editor?alumno');
  await espera(4000);
  await page.evaluate(() => { window.confirm = () => true; window.prompt = () => 'grupo'; });
  await page.setInputFiles('input[type=file]', RAIZ + 'frontend/public/ejemplos/02-semaforo.bloquino');
  await espera(3500);

  // Estado del lienzo: posiciones, giros, asientos, cables y el grupo.
  // Los módulos con la misma URL que usa la página (Vite les agrega ?t=): se
  // leen de los imports de SimulatorCanvas, que sí queda en el registro.
  await page.evaluate(async () => {
    const lienzo = performance.getEntriesByType('resource').map((e) => e.name).find((u) => u.includes('/SimulatorCanvas.tsx'));
    const texto = await fetch(lienzo).then((r) => r.text());
    const url = (n) => texto.match(new RegExp(`["'](/src/${n}[^"']*)["']`))[1];
    window.__grupoPrueba = { store: await import(url('store/useSimulatorStore.ts')), grupo: await import(url('bloquino/seleccion.ts')) };
  });
  const estado = () => page.evaluate(async () => {
    const { useSimulatorStore } = window.__grupoPrueba.store;
    const { useGrupo } = window.__grupoPrueba.grupo;
    const s = useSimulatorStore.getState();
    const corto = (id) => id.split('_')[0] + id.slice(-3);
    return {
      grupo: useGrupo.getState().ids.map(corto),
      piezas: Object.fromEntries(s.components.map((c) => [corto(c.id), [Math.round(c.x), Math.round(c.y), Number(c.properties.rotation) || 0]])),
      placa: s.boards[0] && [Math.round(s.boards[0].x), Math.round(s.boards[0].y), Number(s.boards[0].rotation) || 0],
      asientos: s.wires.filter((w) => w.bb).length,
      asientoMax: +Math.max(0, ...s.wires.filter((w) => w.bb).map((w) => Math.hypot(w.start.x - w.end.x, w.start.y - w.end.y))).toFixed(1),
      cables: s.wires.filter((w) => !w.bb).length,
      contornos: document.querySelectorAll('.bq-en-grupo, .bq-placa-en-grupo').length,
    };
  });
  const centro = async (sel) => { const b = await page.locator(sel).first().boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
  const leds = await page.evaluate(() =>
    window.__grupoPrueba.store.useSimulatorStore.getState().components.filter((c) => c.metadataId === 'led').map((c) => c.id));
  const clicConShift = async (p) => { await page.keyboard.down('Shift'); await page.mouse.click(p.x, p.y); await page.keyboard.up('Shift'); await espera(300); };
  const arrastrar = async (p, dx, dy) => {
    await page.mouse.move(p.x, p.y); await page.mouse.down();
    for (let i = 1; i <= 10; i++) await page.mouse.move(p.x + (dx * i) / 10, p.y + (dy * i) / 10);
    await page.mouse.up(); await espera(600);
  };
  const tecla = async (k) => { await page.mouse.move(700, 600); await page.keyboard.press(k); await espera(700); };
  const inicial = await estado();
  R.inicial = { asientos: inicial.asientos, cables: inicial.cables };

  // 1. Sumar y quitar con Shift.
  const [l1, l2, l3] = await Promise.all(leds.map((id) => centro('#' + id)));
  await page.mouse.click(l1.x, l1.y); await espera(300);
  await clicConShift(l2);
  await clicConShift(l3);
  R['1 tres LED'] = (await estado()).grupo;
  await clicConShift(l1);
  R['1 quitado el primero'] = (await estado()).grupo;
  R['1 contornos'] = (await estado()).contornos;

  // 2. Mover el grupo y deshacer en un paso.
  await arrastrar(l2, 0, 90);
  const movido = await estado();
  R['2 movidos'] = leds.map((id) => movido.piezas['led' + id.slice(-3)]);
  await tecla('Control+z');
  const vuelto = await estado();
  R['2 Ctrl+Z vuelve'] = JSON.stringify(vuelto.piezas) === JSON.stringify(inicial.piezas) && vuelto.asientos === inicial.asientos;

  // 3. Ctrl+A y arrastrar la protoboard: se mueve todo, asentado.
  await tecla('Control+a');
  R['3 Ctrl+A'] = (await estado()).grupo.length;
  const bb = await page.locator('[id^="breadboard_"]').first().boundingBox();
  await arrastrar({ x: bb.x + 8, y: bb.y + 8 }, 60, 40);
  const todo = await estado();
  R['3 todo movido'] = { placa: todo.placa, asientos: todo.asientos, asientoMax: todo.asientoMax };
  await foto('movido');

  // 4. R con todo: gira, la placa incluida, y lo asentado sigue asentado.
  await tecla('r');
  const girado = await estado();
  R['4 girado'] = { placa: girado.placa, asientos: girado.asientos, asientoMax: girado.asientoMax, protoboard: Object.entries(girado.piezas).find(([k]) => k.startsWith('breadboard'))?.[1] };
  await foto('girado');
  await tecla('Control+z');
  await tecla('Control+z');
  const deshecho = await estado();
  R['4 dos Ctrl+Z vuelven al inicio'] = JSON.stringify(deshecho.piezas) === JSON.stringify(inicial.piezas) && JSON.stringify(deshecho.placa) === JSON.stringify(inicial.placa);

  // 5. Rectángulo con Shift alrededor de los tres LED.
  await page.mouse.click(1000, 650); await espera(300);
  const ls = await Promise.all(leds.map((id) => page.locator('#' + id).boundingBox()));
  const caja = { x0: Math.min(...ls.map((b) => b.x)) - 25, y0: Math.min(...ls.map((b) => b.y)) - 25, x1: Math.max(...ls.map((b) => b.x + b.width)) + 25, y1: Math.max(...ls.map((b) => b.y + b.height)) + 25 };
  const antesRect = await estado();
  await page.keyboard.down('Shift');
  await page.mouse.move(caja.x0, caja.y0); await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(caja.x0 + ((caja.x1 - caja.x0) * i) / 10, caja.y0 + ((caja.y1 - caja.y0) * i) / 10);
  await foto('rectangulo');
  await page.mouse.up(); await page.keyboard.up('Shift'); await espera(400);
  const rect = await estado();
  R['5 rectángulo'] = rect.grupo;
  R['5 la vista no se movió'] = JSON.stringify((await page.locator('#' + leds[0]).boundingBox())) === JSON.stringify(ls[0]);

  // 6. Copiar y pegar el grupo.
  await page.mouse.move(700, 500);
  await page.keyboard.press('Control+c');
  await page.keyboard.press('Control+v'); await espera(800);
  const pegado = await estado();
  R['6 pegado'] = { piezasAntes: Object.keys(rect.piezas).length, piezasDespues: Object.keys(pegado.piezas).length, grupo: pegado.grupo.length };
  await foto('pegado');

  // 7. Supr borra el grupo pegado; Ctrl+Z lo devuelve.
  await tecla('Delete');
  R['7 tras Supr'] = Object.keys((await estado()).piezas).length;
  await tecla('Control+z');
  R['7 tras Ctrl+Z'] = Object.keys((await estado()).piezas).length;

  // 8. Ctrl+A y Supr: con la placa pide confirmar; cancelado no borra nada, aceptado
  // borra todo, y Ctrl+Z devuelve todo, la placa con su programa.
  const placas = () => page.evaluate(() => window.__grupoPrueba.store.useSimulatorStore.getState().boards.length);
  await page.evaluate(() => { window.confirm = () => false; });
  await tecla('Control+a');
  await tecla('Delete');
  R['8 cancelado'] = Object.keys((await estado()).piezas).length;
  await page.evaluate(() => { window.confirm = () => true; });
  await tecla('Delete');
  const vacio = await estado();
  R['8 Ctrl+A y Supr'] = { piezas: Object.keys(vacio.piezas).length, placa: !!vacio.placa };
  await tecla('Control+z');
  R['8 Ctrl+Z'] = { piezas: Object.keys((await estado()).piezas).length, placas: await placas() };

  // 8b. Ctrl+A, Ctrl+C y Ctrl+V: una copia del circuito con su placa y sus cables.
  const antesCopia = await estado();
  await tecla('Control+a');
  await tecla('Control+c');
  await tecla('Control+v');
  const copia = await estado();
  R['8b circuito copiado'] = {
    placas: await placas(),
    piezas: `${Object.keys(antesCopia.piezas).length} → ${Object.keys(copia.piezas).length}`,
    cables: `${antesCopia.cables} → ${copia.cables}`,
    asientos: `${antesCopia.asientos} → ${copia.asientos}`,
    grupo: copia.grupo.length,
  };
  await foto('circuito-copiado');
  await tecla('Control+z');
  R['8b Ctrl+Z'] = { placas: await placas(), piezas: Object.keys((await estado()).piezas).length };

  // 9. La placa sola: R la gira; Supr pide confirmar (cancelado, queda).
  await page.mouse.click(1000, 650); await espera(300);
  const placa = await centro('wokwi-arduino-uno');
  await page.mouse.click(placa.x, placa.y + 30); await espera(400);
  await tecla('r');
  R['9 placa girada'] = (await estado()).placa[2];
  await page.evaluate(() => { window.__pregunta = 0; window.confirm = () => (window.__pregunta++, false); });
  await tecla('Delete');
  R['9 Supr pregunta y queda'] = { preguntas: await page.evaluate(() => window.__pregunta), placa: !!(await estado()).placa };
  return R;
}
