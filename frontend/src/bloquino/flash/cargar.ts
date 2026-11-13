// Cargar a la placa: elige el puerto, compila, graba y deja el monitor serie
// escuchando a la placa real. El avance queda en `useCarga`.
import { create } from 'zustand';
import { runEditorCommand } from '../../lib/editorCommands';
import { installSerialTxInterceptor } from '../../lib/proHardwareSerial';
import { appendHardwareSerial, useSimulatorStore } from '../../store/useSimulatorStore';
import { collectSketchFilesForBoard, compileBoardForFlash } from '../../utils/boardCompile';
import { hexToUint8Array } from '../../utils/hexParser';
import textos from '../../i18n/locales/es/bloquino.json';
import { conectar } from './serie';
import { ErrorDeCarga, grabar } from './stk500';

export type Carga =
  | { fase: 'compilando' | 'conectando' | 'lista' }
  | { fase: 'grabando' | 'verificando'; pct: number }
  | { fase: 'error'; mensaje: string; detalle: string; enlace?: string };

/** `placaReal`: el monitor serie está escuchando a la placa, no a la simulación. */
export const useCarga = create<{ carga: Carga | null; placaReal: boolean }>(() => ({
  carga: null,
  placaReal: false,
}));

// Fabricantes USB de las placas y sus clones (Arduino, CH340, FTDI, CP210x):
// así el selector no ofrece los puertos Bluetooth del computador.
const FILTROS = [0x2341, 0x2a03, 0x1a86, 0x0403, 0x10c4].map((usbVendorId) => ({ usbVendorId }));

let monitor: { id: string; cerrar(): Promise<void> } | null = null;

/** El monitor serie deja la placa real y el puerto queda libre. */
async function soltarPlaca() {
  const anterior = monitor;
  if (!anterior) return;
  monitor = null;
  installSerialTxInterceptor(anterior.id, null);
  useCarga.setState({ placaReal: false });
  await anterior.cerrar();
}
// Un solo origen en el monitor: al simular, la placa real se suelta.
useSimulatorStore.subscribe((s) => {
  if (monitor && s.boards.some((b) => b.running)) void soltarPlaca();
});
if ('serial' in navigator) navigator.serial.addEventListener('disconnect', () => void soltarPlaca());

export async function cargarALaPlaca() {
  const pasar = (carga: Carga) => useCarga.setState({ carga });
  let puerto: SerialPort | undefined;
  try {
    if (!('serial' in navigator))
      throw new ErrorDeCarga(window.isSecureContext ? 'navegador' : 'sinHttps');
    await soltarPlaca();
    // El selector de puerto solo se abre dentro del clic: va antes de compilar.
    puerto =
      (await navigator.serial.getPorts())[0] ??
      (await navigator.serial.requestPort({ filters: FILTROS }).catch(() => {
        throw new ErrorDeCarga('sinElegir');
      }));

    runEditorCommand('sim.stop');
    pasar({ fase: 'compilando' });
    const sim = useSimulatorStore.getState();
    const placa = sim.boards.find((b) => b.id === sim.activeBoardId)!;
    const salida: string[] = [];
    const compilado = await compileBoardForFlash(placa, (linea) => salida.push(linea));
    if (!compilado.ok)
      throw new ErrorDeCarga('noCompila', salida.slice(1).join('\n') || compilado.error);

    pasar({ fase: 'conectando' });
    const canal = await conectar(puerto, 115200).catch(() => {
      throw new ErrorDeCarga('ocupada');
    });
    try {
      await grabar(canal, hexToUint8Array(compilado.program), (fase, pct) => pasar({ fase, pct }));
    } finally {
      await canal.cerrar();
    }

    // El monitor serie pasa a la placa real, a la velocidad del programa.
    const fuente = collectSketchFilesForBoard(placa)
      .map((archivo) => archivo.content)
      .join('\n');
    const baudios = Number(/Serial\.begin\(\s*(\d+)/.exec(fuente)?.[1] ?? 9600);
    const texto = new TextDecoder();
    sim.clearBoardSerialOutput(placa.id);
    const conexion = await conectar(puerto, baudios, (bytes) =>
      appendHardwareSerial(placa.id, texto.decode(bytes, { stream: true })),
    ).catch(() => null);
    if (conexion) {
      monitor = { id: placa.id, cerrar: conexion.cerrar };
      installSerialTxInterceptor(
        placa.id,
        (escrito) => void conexion.escribir(new TextEncoder().encode(escrito)),
      );
    }
    useCarga.setState({ carga: { fase: 'lista' }, placaReal: !!conexion });
  } catch (error) {
    const motivo = (
      error instanceof ErrorDeCarga ? error.motivo : 'sinRespuesta'
    ) as keyof typeof textos.carga.fallas;
    // Una placa recordada que no responde se olvida: la próxima vez se elige de nuevo.
    if (motivo === 'sinRespuesta') void puerto?.forget?.().catch(() => {});
    pasar({
      fase: 'error',
      mensaje: textos.carga.fallas[motivo],
      detalle: error instanceof ErrorDeCarga ? error.detalle : '',
      enlace:
        motivo === 'sinHttps'
          ? `https://${location.hostname}${location.pathname}${location.search}`
          : undefined,
    });
  }
}
