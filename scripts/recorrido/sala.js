// Prueba de la imagen de la sala (h9) con mouse real, sobre la página ya
// compilada. El resto del recorrido lee módulos del servidor de desarrollo y
// no sirve ahí: este guion solo usa lo que ve un alumno. Se corre entero con
// `browser_run_code_unsafe` del MCP de Playwright (parámetro `filename`),
// después de poner en DIRECCION la que abren los alumnos (la IP del notebook,
// no localhost: sin HTTPS el navegador desactiva funciones y hay que verlo así).
async (page) => {
  const DIRECCION = 'http://192.168.18.111';
  const PROYECTO = 'D:/Second_Brain/Personal/Proyectos/Plataforma_Arduino_Bloques/repo/scripts/recorrido/sala.bloquino';
  const R = {};
  const espera = (ms) => page.waitForTimeout(ms);
  const led13 = () => page.evaluate(() => !!document.querySelector('wokwi-arduino-uno').led13);
  const cuantos = (etiqueta) => page.evaluate((e) => document.querySelectorAll(e).length, etiqueta);
  const simular = async () => {
    await page.getByRole('button', { name: 'Iniciar simulación' }).click();
    return page.getByRole('button', { name: 'Detener simulación' }).waitFor({ timeout: 60000 }).then(() => true, () => false);
  };
  const detener = async () => { await page.getByRole('button', { name: 'Detener simulación' }).click(); await espera(300); };

  // Pedidos que salen de la sala: no debe haber.
  const afuera = new Set();
  const anotar = (r) => { if (/^https?:/.test(r.url()) && !r.url().startsWith(DIRECCION)) afuera.add(new URL(r.url()).host); };
  page.on('request', anotar);

  // 1. Entra un alumno por primera vez.
  await page.goto(DIRECCION);
  await page.evaluate(() => localStorage.clear());
  await page.goto(DIRECCION);
  await page.setViewportSize({ width: 1366, height: 768 });
  await espera(3000);
  // El MCP corta el guion en cada diálogo del navegador: se responden desde la página.
  await page.evaluate(() => { window.confirm = () => true; window.prompt = () => 'prueba-sala'; });
  R['1 dirección'] = page.url();
  R['1 contexto seguro'] = await page.evaluate(() => isSecureContext);
  R['1 componentes en la paleta'] = await page.locator('.bq-componente').count();

  // 2. El proyecto inicial parpadea.
  R['2 simula'] = await simular();
  let cambios = 0;
  for (let i = 0, antes = await led13(); i < 35; i++) {
    await espera(100);
    const ahora = await led13();
    if (ahora !== antes) cambios++;
    antes = ahora;
  }
  R['2 cambios del LED en 3,5 s'] = cambios;
  await detener();

  // 3. Abre un proyecto guardado y le manda órdenes por el monitor serie.
  await page.setInputFiles('input[type=file]', PROYECTO);
  await espera(2500);
  await page.getByRole('button', { name: 'Código', exact: true }).click();
  await espera(2500);
  R['3 bloques del archivo'] = await cuantos('.blocklyDraggable.ab_cuando_serie');
  if (!(await page.locator('.bq-serie').count())) await page.locator('.bq-serie-titulo').click();
  R['3 simula'] = await simular();
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
  R['3 monitor'] = (await page.locator('.bq-serie pre').first().innerText()).trim().split(/\r?\n/);
  await detener();

  // 4. Descarga el proyecto.
  const [descarga] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Descargar' }).click()]);
  R['4 descarga'] = descarga.suggestedFilename();

  // 5. Recarga: el proyecto sigue ahí.
  await espera(1500);
  await page.reload();
  await espera(3000);
  if (!(await page.locator('.bq-programa').count())) await page.getByRole('button', { name: 'Código', exact: true }).click();
  await espera(2500);
  R['5 vuelve tras recargar'] = (await cuantos('.blocklyDraggable.ab_cuando_serie')) > 0;
  await page.getByRole('button', { name: 'Código', exact: true }).click();
  await espera(600);

  // 6. Saca un componente de la paleta.
  const servos = await cuantos('wokwi-servo');
  await page.locator('.bq-componente').filter({ hasText: 'Servo' }).first().click();
  await espera(800);
  R['6 servo al lienzo'] = (await cuantos('wokwi-servo')) - servos;
  await page.screenshot({ path: './.playwright-mcp/sala.jpg', type: 'jpeg', quality: 85, scale: 'css' });

  page.off('request', anotar);
  R['pedidos fuera de la sala'] = [...afuera];
  return R;
}
