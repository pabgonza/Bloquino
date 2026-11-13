// Cliente del bootloader del Arduino UNO (Optiboot, protocolo STK500v1) sobre
// un canal de bytes cualquiera: el puerto serie del navegador o, en los tests,
// un bootloader simulado.

export interface Canal {
  escribir(datos: Uint8Array): Promise<void>;
  /** Entrega exactamente `n` bytes, o falla si no llegan en `ms`. */
  leer(n: number, ms: number): Promise<Uint8Array>;
  /** Descarta lo recibido y no leído. */
  vaciar(): void;
  /** Reinicia la placa: su bootloader queda escuchando cerca de un segundo. */
  reiniciar(): Promise<void>;
}

/** Falla de una carga. `motivo` es la clave de su mensaje en bloquino.json. */
export class ErrorDeCarga extends Error {
  motivo: string;
  detalle: string;
  constructor(motivo: string, detalle = '') {
    super(motivo);
    this.motivo = motivo;
    this.detalle = detalle;
  }
}

const PAGINA = 128;
const FIRMA_ATMEGA328P = [0x1e, 0x95, 0x0f];
const pausa = (ms: number) => new Promise((listo) => setTimeout(listo, ms));

/** Manda una orden y devuelve los `n` bytes de datos de su respuesta. */
async function orden(canal: Canal, bytes: number[], n = 0, ms = 1000) {
  await canal.escribir(Uint8Array.from([...bytes, 0x20]));
  const r = await canal.leer(n + 2, ms).catch(() => null);
  if (!r || r[0] !== 0x14 || r[n + 1] !== 0x10) throw new ErrorDeCarga('sinRespuesta');
  return r.subarray(1, n + 1);
}

/** Reinicia la placa, graba `programa` desde la dirección 0 y lo lee de vuelta
 *  para comprobarlo. */
export async function grabar(
  canal: Canal,
  programa: Uint8Array,
  alAvanzar: (fase: 'grabando' | 'verificando', pct: number) => void,
) {
  // Sincronizar. Optiboot no atiende mientras parpadea al arrancar (casi medio
  // segundo) y en ese rato solo retiene 3 bytes: una orden que llega cortada
  // lo desordena y lo hace saltar al programa. Por eso se sondea con un solo
  // byte, el de fin de orden (0x20), cada 100 ms: dos seguidos son una orden
  // vacía, que contesta «14 10», y perder alguno no rompe nada. Mientras
  // tanto se deja pasar lo que todavía llega del programa anterior. Si en un
  // segundo y medio no contesta, se reinicia otra vez.
  const fin = Uint8Array.of(0x20);
  let responde = false;
  for (let i = 0, previo = 0; i < 30 && !responde; i++) {
    if (i % 15 === 0) {
      await canal.reiniciar();
      canal.vaciar();
    }
    await canal.escribir(fin);
    const limite = performance.now() + 100;
    while (!responde && performance.now() < limite) {
      const b = await canal.leer(1, limite - performance.now()).catch(() => null);
      if (!b) break;
      responde = previo === 0x14 && b[0] === 0x10;
      previo = b[0];
    }
  }
  if (!responde) throw new ErrorDeCarga('sinRespuesta');
  // Se deja llegar lo que venía en camino. El bootloader puede haber quedado
  // con medio sondeo recibido: un byte más lo completa (y contesta); si no
  // contesta, era el primero de un par y el siguiente sí lo hace.
  await pausa(60);
  canal.vaciar();
  const contesta = async (ms: number) => {
    await canal.escribir(fin);
    const r = await canal.leer(2, ms).catch(() => null);
    return !!r && r[0] === 0x14 && r[1] === 0x10;
  };
  if (!(await contesta(150)) && !(await contesta(500))) throw new ErrorDeCarga('sinRespuesta');
  await orden(canal, [0x30]);

  const firma = await orden(canal, [0x75], 3);
  if (FIRMA_ATMEGA328P.some((b, i) => firma[i] !== b)) throw new ErrorDeCarga('otraPlaca');
  await orden(canal, [0x50]);

  // Páginas completas: la última se rellena con 0xFF (memoria borrada).
  const paginas = Math.ceil(programa.length / PAGINA);
  const imagen = new Uint8Array(paginas * PAGINA).fill(0xff);
  imagen.set(programa);
  // La dirección se da en palabras de 2 bytes.
  const ir = (p: number) => orden(canal, [0x55, (p * PAGINA >> 1) & 0xff, (p * PAGINA >> 9) & 0xff]);

  for (let p = 0; p < paginas; p++) {
    await ir(p);
    await orden(canal, [0x64, 0, PAGINA, 0x46, ...imagen.subarray(p * PAGINA, (p + 1) * PAGINA)]);
    alAvanzar('grabando', Math.round(((p + 1) * 100) / paginas));
  }
  for (let p = 0; p < paginas; p++) {
    await ir(p);
    const leido = await orden(canal, [0x74, 0, PAGINA, 0x46], PAGINA);
    if (leido.some((b, i) => b !== imagen[p * PAGINA + i])) throw new ErrorDeCarga('malGrabado');
    alAvanzar('verificando', Math.round(((p + 1) * 100) / paginas));
  }
  // Al salir, el bootloader reinicia la placa y arranca el programa.
  await orden(canal, [0x51]);
}
