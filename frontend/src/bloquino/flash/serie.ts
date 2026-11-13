/// <reference types="w3c-web-serial" />
// Conexión con una placa por Web Serial. Sin `alRecibir`, lo que llega queda en
// una cola que se lee con `leer` (así habla el bootloader); con `alRecibir`,
// cada trozo se entrega apenas llega (así se alimenta el monitor serie).
const pausa = (ms: number) => new Promise((listo) => setTimeout(listo, ms));

export async function conectar(
  puerto: SerialPort,
  baudRate: number,
  alRecibir?: (bytes: Uint8Array) => void,
) {
  await puerto.open({ baudRate });
  const lector = puerto.readable!.getReader();
  const escritor = puerto.writable!.getWriter();
  let cola: number[] = [];
  let despertar = () => {};
  const bomba = (async () => {
    try {
      for (;;) {
        const { value, done } = await lector.read();
        if (done) break;
        if (alRecibir) alRecibir(value);
        else cola.push(...value);
        despertar();
      }
    } catch {
      // Placa desconectada: lo nota quien espera una respuesta.
    }
  })();

  return {
    escribir: (datos: Uint8Array) => escritor.write(datos),
    async leer(n: number, ms: number) {
      const limite = performance.now() + ms;
      while (cola.length < n) {
        const falta = limite - performance.now();
        if (falta <= 0) throw new Error('sin respuesta');
        await new Promise<void>((listo) => {
          despertar = listo;
          setTimeout(listo, falta);
        });
      }
      return Uint8Array.from(cola.splice(0, n));
    },
    vaciar() {
      cola = [];
    },
    /** Pulso en DTR: reinicia el UNO y deja escuchando a su bootloader. */
    async reiniciar() {
      await puerto.setSignals({ dataTerminalReady: false, requestToSend: false });
      await pausa(100);
      await puerto.setSignals({ dataTerminalReady: true, requestToSend: true });
    },
    async cerrar() {
      await lector.cancel().catch(() => {});
      await bomba;
      lector.releaseLock();
      escritor.releaseLock();
      await puerto.close().catch(() => {});
    },
  };
}
