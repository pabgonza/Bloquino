// node scripts/prueba-carga.mjs [url] [cuántos]
// Un curso entero pulsando «Iniciar simulación» a la vez: manda a compilar
// N programas distintos (con servo, para que haya una librería) y mide cuánto
// espera cada alumno. Por defecto, 15 contra http://localhost.
const [url = 'http://localhost', cuantos = '15'] = process.argv.slice(2);
const sello = Date.now();

const tiempos = await Promise.all(
  Array.from({ length: Number(cuantos) }, async (_, i) => {
    const inicio = performance.now();
    const content = `// ${sello}-${i}
#include <Servo.h>
Servo servo;
void setup() { servo.attach(9); pinMode(13, OUTPUT); }
void loop() { digitalWrite(13, HIGH); delay(${100 + i}); digitalWrite(13, LOW); delay(${100 + i}); servo.write(${i}); }
`;
    const { job_id } = await (
      await fetch(`${url}/api/compile/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: [{ name: 'sketch.ino', content }], board_fqbn: 'arduino:avr:uno' }),
      })
    ).json();
    let trabajo;
    do {
      await new Promise((r) => setTimeout(r, 200));
      trabajo = await (await fetch(`${url}/api/compile/status/${job_id}`)).json();
    } while (trabajo.state === 'pending' || trabajo.state === 'running');
    if (!trabajo.result?.success) throw new Error(trabajo.result?.stderr ?? trabajo.error);
    return (performance.now() - inicio) / 1000;
  }),
);

tiempos.sort((a, b) => a - b);
const s = (t) => `${t.toFixed(1)} s`;
console.log(`${tiempos.length} compilaciones a la vez: la primera ${s(tiempos[0])}, la del medio ${s(tiempos[tiempos.length >> 1])}, la última ${s(tiempos.at(-1))}`);
