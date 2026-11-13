// h7: carga a la placa. Si el navegador ya tiene permiso sobre el puerto de un
// Arduino UNO conectado, carga a esa placa real (la primera vez, una persona
// pulsa «Cargar a la placa» y la elige: el selector no se puede automatizar).
// Si no, pone en la página una placa simulada que habla como el bootloader y,
// ya cargada, dice «123» y contesta «Recibido: …» a lo que se le escribe.
await nuevo();
await limpiar();
R.placa = (await page.evaluate(async () => (await navigator.serial.getPorts()).length)) ? 'real' : 'simulada';
if (R.placa === 'simulada') await page.evaluate(() => {
  const flash = new Uint8Array(32768).fill(0xff);
  const texto = (t) => new TextEncoder().encode(t);
  let salida, entrada, direccion = 0, reloj;
  const decir = (bytes) => { try { salida.enqueue(bytes); } catch { /* puerto cerrado */ } };
  const ok = (datos = []) => decir(Uint8Array.from([0x14, ...datos, 0x10]));
  const puerto = {
    async open({ baudRate }) {
      entrada = [];
      this.readable = new ReadableStream({ start: (c) => { salida = c; } });
      this.writable = new WritableStream({ write: (trozo) => {
        if (baudRate !== 115200) { decir(texto('Recibido: ' + new TextDecoder().decode(trozo).trim() + '\r\n')); return; }
        entrada.push(...trozo);
        for (;;) {
          const [orden, a, b] = entrada;
          const largo = orden === 0x55 ? 4 : orden === 0x74 ? 5 : orden === 0x64 ? 5 + ((a << 8) | b) : 2;
          if (entrada.length < largo) return;
          const cuerpo = entrada.splice(0, largo);
          if (orden === 0x75) ok([0x1e, 0x95, 0x0f]);
          else if (orden === 0x74) ok([...flash.subarray(direccion, direccion + ((a << 8) | b))]);
          else {
            if (orden === 0x55) direccion = (a | (b << 8)) * 2;
            if (orden === 0x64) flash.set(cuerpo.slice(4, -1), direccion);
            ok();
          }
        }
      } });
      if (baudRate !== 115200) reloj = setInterval(() => decir(texto('123\r\n')), 400);
    },
    async setSignals() {},
    async close() { clearInterval(reloj); },
  };
  window.__flash = flash;
  Object.defineProperty(navigator, 'serial', { configurable: true, value: { getPorts: async () => [puerto], addEventListener() {} } });
});

const cargar = async () => {
  const fases = [];
  const t0 = Date.now();
  await page.getByRole('button', { name: 'Cargar a la placa' }).click();
  for (;;) {
    const f = await page.evaluate(() => document.querySelector('.bq-carga')?.className.split('bq-carga-')[1] ?? null);
    if (f && fases.at(-1) !== f) fases.push(f);
    if (f === 'lista' || f === 'error' || Date.now() - t0 > 60000) break;
    await espera(30);
  }
  return { fases: fases.join(' > '), ms: Date.now() - t0, tarjeta: (await page.locator('.bq-carga').innerText()).replace(/\s+/g, ' ') };
};
const monitor = () => page.evaluate(() => window.__s.useSimulatorStore.getState().serialOutput);

// 1. Un parpadeo que además cuenta por el puerto serie.
R.sketch = resumen(await programar([alIniciar(porSiempre(led('HIGH', 13), esperarB(0.2), led('LOW', 13), esperarB(0.2), decir(num(123))))]));
R['1 carga'] = await cargar();
// La placa simulada deja ver su memoria: tiene que empezar como el programa compilado.
if (R.placa === 'simulada') R['1 grabado'] = await page.evaluate(() => {
  const s = window.__s.useSimulatorStore.getState();
  const hex = s.boards.find((b) => b.id === s.activeBoardId).compiledProgram.split('\n')[0].trim();
  const enPlaca = [...window.__flash.subarray(0, 16)].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return enPlaca === hex.slice(9, 41) && window.__flash.some((b, i) => i > 200 && b !== 0xff);
});
await espera(4000);
R['1 monitor'] = (await monitor()).trim().split(/\r?\n/).slice(-3);
await page.getByRole('button', { name: 'Código', exact: true }).click();
await espera(1500);
R['1 placa real'] = await page.locator('.bq-serie-real').count();
await page.screenshot({ path: './.playwright-mcp/carga-lista.jpg', type: 'jpeg', quality: 85, scale: 'css' });
await page.getByRole('button', { name: 'Código', exact: true }).click();
await page.locator('.bq-carga button').click();

// 2. Segunda carga, sin selector: órdenes escritas en el monitor llegan a la placa.
const orden = { block: { type: 'ab_variable_texto', fields: { VAR: { id: 't' } } } };
const txt = (TEXT) => ({ block: { type: 'text', fields: { TEXT } } });
await programar([cadena([
  { type: 'ab_cuando_serie' },
  { type: 'ab_definir_texto', fields: { VAR: { id: 't' } }, inputs: { VALUE: { block: { type: 'ab_serie_texto' } } } },
  siSino({ type: 'ab_texto_igual', inputs: { A: orden, B: txt('encender') } }, [led('HIGH', 13)], [led('LOW', 13)]),
  decir({ block: { type: 'ab_unir', inputs: { A: txt('Recibido: '), B: orden } } }),
])], [{ name: 'orden', id: 't', type: 'texto' }]);
R['2 carga'] = await cargar();
await page.getByRole('button', { name: 'Código', exact: true }).click();
await espera(1500);
if (!(await page.locator('.bq-serie').count())) await page.locator('.bq-serie-titulo').click();
await espera(2500); // la placa se reinicia al abrirse el monitor
for (const texto of ['encender', 'apagar']) {
  await page.locator('.bq-serie input:not([type=checkbox])').fill(texto);
  await page.keyboard.press('Enter');
  await espera(1200);
}
R['2 monitor'] = (await monitor()).trim().split(/\r?\n/);
await page.screenshot({ path: './.playwright-mcp/carga-monitor.jpg', type: 'jpeg', quality: 85, scale: 'css' });

// 3. Al simular, el monitor deja la placa real.
await page.getByRole('button', { name: 'Código', exact: true }).click();
R.simula = await simular();
await page.getByRole('button', { name: 'Código', exact: true }).click();
await espera(1200);
R['3 placa real'] = await page.locator('.bq-serie-real').count();
await detener();
