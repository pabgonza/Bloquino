// Capturas de la guía de la clase (docs/guia-de-la-clase/), sobre la imagen de
// la sala. Como sala.js, se corre entero con `browser_run_code_unsafe` del MCP
// de Playwright (parámetro `filename`). Usa http://localhost (contexto seguro,
// deja cargar) y una placa simulada dentro de la página; el aviso de HTTPS se
// captura en la dirección de los alumnos.
async (page) => {
  const SALA = 'http://localhost';
  const IP = 'https://192.168.18.111';
  const RAIZ = 'D:/Second_Brain/Personal/Proyectos/Plataforma_Arduino_Bloques/repo/';
  const IMG = RAIZ + 'docs/guia-de-la-clase/img/';
  const R = {};
  const espera = (ms) => page.waitForTimeout(ms);
  const foto = (nombre) => page.screenshot({ path: IMG + nombre + '.jpg', type: 'jpeg', quality: 80, scale: 'css' });
  const boton = (name) => page.getByRole('button', { name, exact: true });
  const codigo = async (abierto) => {
    if ((await page.locator('.bq-programa').count() > 0) !== abierto) await boton('Código').click();
    await espera(1500);
  };
  await page.setViewportSize({ width: 1280, height: 720 });

  // 1. Lo que ve un equipo nuevo en la dirección https:// (autoridad sin instalar).
  await page.goto(IP).catch(() => {});
  await espera(1500);
  await page.getByRole('button', { name: 'Avanzado' }).click();
  await espera(500);
  await foto('aviso-https-avanzado');

  // 2. Proyecto nuevo.
  await page.goto(SALA);
  await page.evaluate(() => localStorage.clear());
  await page.goto(SALA);
  await espera(3000);
  await page.evaluate(() => { window.confirm = () => true; window.prompt = () => 'semaforo-ana'; });
  await foto('nuevo');
  // Dónde está cada cosa, en % de la captura, para las marcas del HTML.
  R.marcas = await page.evaluate(() => {
    const pos = (el) => { const r = el.getBoundingClientRect(); return [+(100 * (r.x + r.width / 2) / innerWidth).toFixed(1), +(100 * (r.y + r.height / 2) / innerHeight).toFixed(1)]; };
    const M = {};
    for (const b of document.querySelectorAll('.bq-barra button')) M[b.textContent.trim()] = pos(b);
    M.paleta = pos(document.querySelector('.bq-paleta-titulo'));
    M.lienzo = pos(document.querySelector('.bq-lienzo'));
    return M;
  });

  // 3. Abrir un ejemplo repartido por el profesor.
  await page.setInputFiles('input[type=file]', RAIZ + 'frontend/public/ejemplos/02-semaforo.bloquino');
  await espera(3000);
  await foto('ejemplo');

  // 4. Sacar un componente de la paleta.
  await page.locator('.bq-componente').filter({ hasText: 'Buzzer' }).first().click();
  await espera(1000);
  await foto('componente');
  await page.keyboard.press('Control+z');
  await espera(500);

  // 5. Programar con bloques.
  await codigo(true);
  await foto('bloques');

  // 6. Simular.
  await codigo(false);
  await page.getByRole('button', { name: 'Iniciar simulación' }).click();
  R.simula = await page.getByRole('button', { name: 'Detener simulación' }).waitFor({ timeout: 60000 }).then(() => true, () => false);
  await espera(2500);
  await foto('simulando');
  await page.getByRole('button', { name: 'Detener simulación' }).click();
  await espera(500);

  // 7. Cargar a la placa (simulada: habla como el bootloader).
  await page.evaluate(() => {
    const flash = new Uint8Array(32768).fill(0xff);
    let salida, entrada, direccion = 0;
    const decir = (bytes) => { try { salida.enqueue(bytes); } catch { /* cerrado */ } };
    const ok = (datos = []) => decir(Uint8Array.from([0x14, ...datos, 0x10]));
    const puerto = {
      async open({ baudRate }) {
        entrada = [];
        this.readable = new ReadableStream({ start: (c) => { salida = c; } });
        this.writable = new WritableStream({ write: async (trozo) => {
          if (baudRate !== 115200) return;
          entrada.push(...trozo);
          for (;;) {
            const [orden, a, b] = entrada;
            const largo = orden === 0x55 ? 4 : orden === 0x74 ? 5 : orden === 0x64 ? 5 + ((a << 8) | b) : 2;
            if (entrada.length < largo) return;
            const cuerpo = entrada.splice(0, largo);
            if (orden === 0x64) await new Promise((r) => setTimeout(r, 250)); // lenta, para alcanzar a ver el avance
            if (orden === 0x75) ok([0x1e, 0x95, 0x0f]);
            else if (orden === 0x74) ok([...flash.subarray(direccion, direccion + ((a << 8) | b))]);
            else {
              if (orden === 0x55) direccion = (a | (b << 8)) * 2;
              if (orden === 0x64) flash.set(cuerpo.slice(4, -1), direccion);
              ok();
            }
          }
        } });
      },
      async setSignals() {},
      async close() {},
    };
    Object.defineProperty(navigator, 'serial', { configurable: true, value: { getPorts: async () => [puerto], addEventListener() {} } });
  });
  await page.getByRole('button', { name: 'Cargar a la placa' }).click();
  const fase = () => page.evaluate(() => document.querySelector('.bq-carga')?.className.split('bq-carga-')[1] ?? '');
  for (let t = 0; t < 600 && (await fase()) !== 'grabando'; t++) await espera(50);
  await espera(400);
  await foto('cargando');
  for (let t = 0; t < 1200 && !['lista', 'error'].includes(await fase()); t++) await espera(50);
  R.carga = await fase();
  await foto('carga-lista');
  await page.locator('.bq-carga button').click();

  // 8. Descargar para entregar.
  const [descarga] = await Promise.all([page.waitForEvent('download'), boton('Descargar').click()]);
  R.descarga = descarga.suggestedFilename();
  return R;
}
