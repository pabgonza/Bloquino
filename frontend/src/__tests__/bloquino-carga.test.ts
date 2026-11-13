/**
 * Carga a la placa (h7): el cliente STK500 y la conexión Web Serial contra un
 * UNO simulado, que habla como Optiboot por un puerto serie de mentira.
 * Con BLOQUINO_PUENTE, además contra una placa real (scripts/puente-serie.ps1).
 */
import { describe, it, expect } from 'vitest';
import { once } from 'node:events';
import net from 'node:net';
import { Readable, Writable } from 'node:stream';
import { conectar } from '../bloquino/flash/serie';
import { grabar } from '../bloquino/flash/stk500';
import { hexToUint8Array } from '../utils/hexParser';
import { compilar } from './helpers/bloques';

interface Rarezas {
  /** Milisegundos que el bootloader no atiende tras cada reinicio (Optiboot 4.4
   *  parpadea casi medio segundo). Mientras tanto solo le caben 3 bytes. */
  ocupada?: number;
  /** El programa que la placa tenía habla por el puerto serie. */
  charla?: boolean;
  /** Primeras órdenes que no contesta. */
  sorda?: number;
  firma?: number[];
  /** Dirección de un byte que queda mal grabado. */
  dañado?: number;
}

function placaSimulada(rarezas: Rarezas = {}) {
  const flash = new Uint8Array(32768).fill(0xff);
  const señales: SerialOutputSignals[] = [];
  const texto = (t: string) => new TextEncoder().encode(t);
  let salida: ReadableStreamDefaultController<Uint8Array>;
  let entrada: number[] = [];
  let enEspera: number[] = [];
  let direccion = 0;
  let ordenes = 0;
  let abiertoA: number | null = null;
  let despierta = 0;
  let enPrograma = false;
  let charla: ReturnType<typeof setInterval> | undefined;
  let arranque: ReturnType<typeof setTimeout> | undefined;

  const mandar = (bytes: Uint8Array) => {
    try {
      salida.enqueue(bytes);
    } catch {
      // puerto ya cerrado
    }
  };
  const contestar = (datos: number[] = []) => {
    const n = ordenes++;
    if (n < (rarezas.sorda ?? 0)) return;
    mandar(Uint8Array.from([0x14, ...datos, 0x10]));
  };
  /** Como Optiboot ante una orden que no termina en 0x20: abandona y corre el programa. */
  const irseAlPrograma = () => {
    enPrograma = true;
    entrada = [];
    if (rarezas.charla) charla = setInterval(mandar, 15, texto('23 grados\r\n'));
  };
  const atender = () => {
    while (!enPrograma && entrada.length) {
      const [orden, a, b] = entrada;
      const largo =
        orden === 0x55 ? 4 : orden === 0x74 ? 5 : orden === 0x64 ? 5 + ((a << 8) | b) : 2;
      if (entrada.length < largo) return;
      const cuerpo = entrada.splice(0, largo);
      if (cuerpo.at(-1) !== 0x20) irseAlPrograma();
      else if (orden === 0x75) contestar(rarezas.firma ?? [0x1e, 0x95, 0x0f]);
      else if (orden === 0x55) {
        direccion = (a | (b << 8)) * 2;
        contestar();
      } else if (orden === 0x64) {
        flash.set(cuerpo.slice(4, -1), direccion);
        const malo = rarezas.dañado ?? -1;
        if (malo >= direccion && malo < direccion + largo - 5) flash[malo] ^= 0x01;
        contestar();
      } else if (orden === 0x74) {
        contestar([...flash.subarray(direccion, direccion + ((a << 8) | b))]);
      } else contestar(); // cualquier otra orden bien terminada, hasta una vacía
    }
  };
  const reiniciar = () => {
    clearInterval(charla);
    clearTimeout(arranque);
    enPrograma = false;
    entrada = [];
    enEspera = [];
    despierta = Date.now() + (rarezas.ocupada ?? 0);
    arranque = setTimeout(() => {
      entrada.push(...enEspera.splice(0));
      atender();
    }, rarezas.ocupada ?? 0);
  };

  const puerto = {
    readable: null as ReadableStream<Uint8Array> | null,
    writable: null as WritableStream<Uint8Array> | null,
    async open({ baudRate }: SerialOptions) {
      abiertoA = baudRate;
      this.readable = new ReadableStream({ start: (c) => void (salida = c) });
      this.writable = new WritableStream({
        write: (trozo) => {
          if (enPrograma) return;
          if (Date.now() < despierta) enEspera.push(...[...trozo].slice(0, 3 - enEspera.length));
          else {
            entrada.push(...trozo);
            atender();
          }
        },
      });
      // Abrir el puerto reinicia la placa; antes llega lo que venía diciendo.
      if (rarezas.charla) mandar(texto('23 grados\r\n23 grados\r\n'));
      reiniciar();
    },
    async setSignals(s: SerialOutputSignals) {
      señales.push(s);
      if (s.dataTerminalReady) reiniciar();
    },
    async close() {
      clearInterval(charla);
      clearTimeout(arranque);
      abiertoA = null;
    },
  };
  return {
    puerto: puerto as unknown as SerialPort,
    flash,
    señales,
    abiertoA: () => abiertoA,
    /** La placa manda texto por su cuenta (un programa que hace Serial.print). */
    decir: (t: string) => mandar(texto(t)),
  };
}

const PROGRAMA = Uint8Array.from({ length: 300 }, (_, i) => (i * 7 + 3) & 0xff);

async function cargar(rarezas?: Rarezas) {
  const placa = placaSimulada(rarezas);
  const avance: string[] = [];
  const canal = await conectar(placa.puerto, 115200);
  const fin = await grabar(canal, PROGRAMA, (fase, pct) => avance.push(`${fase} ${pct}`)).then(
    () => 'lista',
    (e) => e.motivo as string,
  );
  await canal.cerrar();
  return { placa, avance, fin };
}
const grabado = (placa: { flash: Uint8Array }) => [...placa.flash.subarray(0, 300)];

describe('Carga a la placa', () => {
  it('graba el programa, lo comprueba y avisa el avance', async () => {
    const { placa, avance, fin } = await cargar();
    expect(fin).toBe('lista');
    expect(grabado(placa)).toEqual([...PROGRAMA]);
    // Tres páginas de 128: la última se completa con memoria borrada.
    expect([...placa.flash.subarray(300, 384)].every((b) => b === 0xff)).toBe(true);
    expect(avance).toEqual([
      'grabando 33', 'grabando 67', 'grabando 100',
      'verificando 33', 'verificando 67', 'verificando 100',
    ]);
    // Un reinicio por DTR antes de hablarle, y puerto cerrado al terminar.
    expect(placa.señales.map((s) => s.dataTerminalReady)).toEqual([false, true]);
    expect(placa.abiertoA()).toBeNull();
  });

  it('espera al bootloader mientras parpadea, sin desordenarlo', async () => {
    const { placa, fin } = await cargar({ ocupada: 400 });
    expect(fin).toBe('lista');
    expect(grabado(placa)).toEqual([...PROGRAMA]);
  });

  it('no se confunde con lo que decía el programa anterior', async () => {
    const { placa, fin } = await cargar({ ocupada: 400, charla: true });
    expect(fin).toBe('lista');
    expect(grabado(placa)).toEqual([...PROGRAMA]);
  });

  it('reinicia otra vez si la placa no contestó a la primera', async () => {
    const { placa, fin } = await cargar({ sorda: 9 });
    expect(fin).toBe('lista');
    expect(grabado(placa)).toEqual([...PROGRAMA]);
    expect(placa.señales.map((s) => s.dataTerminalReady)).toEqual([false, true, false, true]);
  });

  it('no graba una placa que no es un UNO', async () => {
    const { placa, fin } = await cargar({ firma: [0x1e, 0x98, 0x01] });
    expect(fin).toBe('otraPlaca');
    expect(placa.flash.every((b) => b === 0xff)).toBe(true);
  });

  it('avisa si un byte quedó mal grabado', async () => {
    expect((await cargar({ dañado: 200 })).fin).toBe('malGrabado');
  });

  it('avisa si la placa no responde', async () => {
    expect((await cargar({ sorda: 1000 })).fin).toBe('sinRespuesta');
  });

  it('como monitor, entrega lo que la placa dice y le escribe', async () => {
    const placa = placaSimulada();
    const recibido: string[] = [];
    const texto = new TextDecoder();
    const monitor = await conectar(placa.puerto, 9600, (b) => recibido.push(texto.decode(b)));
    expect(placa.abiertoA()).toBe(9600);
    placa.decir('23 grados\n');
    await new Promise((listo) => setTimeout(listo, 20));
    expect(recibido).toEqual(['23 grados\n']);
    await monitor.escribir(Uint8Array.from([0x30, 0x20]));
    await new Promise((listo) => setTimeout(listo, 20));
    expect(recibido.length).toBe(2); // la placa contestó a lo escrito
    await monitor.cerrar();
    expect(placa.abiertoA()).toBeNull();
  });
});

// Placa real: un UNO conectado por USB y el puente corriendo (ver su cabecera).
const PUENTE = Number(process.env.BLOQUINO_PUENTE);
describe.runIf(PUENTE)('Carga a una placa real', () => {
  it('graba un programa, lo comprueba y la placa lo corre', async () => {
    const sello = `bloquino ${Date.now() % 100000}`;
    const { hex } = await compilar(
      `void setup() { Serial.begin(115200); pinMode(13, OUTPUT); }
void loop() { digitalWrite(13, !digitalRead(13)); Serial.println("${sello}"); delay(150); }
`,
    );
    const enchufe = net.connect(PUENTE, '127.0.0.1');
    await once(enchufe, 'connect');
    const puerto = {
      async open(this: { readable: unknown; writable: unknown }) {
        this.readable = Readable.toWeb(enchufe);
        this.writable = Writable.toWeb(enchufe);
      },
      async setSignals() {}, // el puente reinicia la placa al conectarse
      async close() {
        enchufe.destroy();
      },
    } as unknown as SerialPort;
    const canal = await conectar(puerto, 115200);
    const avance: string[] = [];
    const inicio = Date.now();
    // Traza de lo enviado (>) y lo recibido (<), para entender una falla.
    const traza: string[] = [];
    const anotar = (signo: string, bytes: Uint8Array) =>
      traza.push(`${Date.now() - inicio} ${signo} ${Buffer.from(bytes.subarray(0, 24)).toString("hex")}`);
    enchufe.on("data", (bytes) => anotar("<", bytes));
    const escribir = canal.escribir;
    canal.escribir = (bytes) => (anotar(">", bytes), escribir(bytes));
    await grabar(canal, hexToUint8Array(hex), (fase, pct) => avance.push(`${fase} ${pct}`)).catch(
      (error) => {
        console.log(traza.slice(0, 60).join(' | '));
        throw error;
      },
    );
    console.log(`placa real: ${hexToUint8Array(hex).length} bytes en ${Date.now() - inicio} ms`);
    expect(avance.at(-1)).toBe('verificando 100');
    // El bootloader reinicia la placa y el programa nuevo empieza a hablar.
    const dicho = new TextDecoder().decode(await canal.leer(sello.length * 3, 5000));
    await canal.cerrar();
    expect(dicho).toContain(sello);
  }, 60000);
});
