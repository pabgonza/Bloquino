// Varias placas, como en Tinkercad Circuits: cada una con su programa y un
// número que la nombra («Placa 1», «Placa 2»…) y no se repite.
import { useSimulatorStore } from '../store/useSimulatorStore';

const NOMBRE = /^Placa (\d+)$/;
const numero = (nombre?: string) => Number(NOMBRE.exec(nombre ?? '')?.[1] ?? 0);

/** Número de la placa en el selector: «1». */
export const numeroDe = (b: { name?: string }) => numero(b.name);

/** Pone «Placa N» a las placas sin número o con uno repetido: el menor libre. */
export function numerar() {
  const { boards } = useSimulatorStore.getState();
  const usados = new Set<number>();
  const faltan = boards.filter((b) => {
    const n = numero(b.name);
    if (!n || usados.has(n)) return true;
    usados.add(n);
    return false;
  });
  if (!faltan.length) return;
  let n = 1;
  const nombres = new Map(
    faltan.map((b) => {
      while (usados.has(n)) n++;
      usados.add(n);
      return [b.id, `Placa ${n}`];
    }),
  );
  useSimulatorStore.setState({
    boards: boards.map((b) => (nombres.has(b.id) ? { ...b, name: nombres.get(b.id) } : b)),
  });
}
