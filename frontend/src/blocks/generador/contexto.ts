// Contexto de generación: lo que cada bloque aporta al sketch además de su
// propia línea. Los conjuntos guardan sin repetidos y en orden de aparición.
// Los bloques no escriben `delay()` ni declaran contadores: se lo piden al
// contexto, y así el mismo catálogo sirve para los dos modos de generación.
export interface Contexto {
  /** `#include <Servo.h>` */
  includes: Set<string>;
  /** Objetos y variables globales */
  globales: Set<string>;
  /** Líneas de inicialización: `pinMode`, `attach`, `Serial.begin` */
  setup: Set<string>;
  /** Código que corre en cada vuelta de `loop()` */
  tick: Set<string>;
  /** Funciones auxiliares completas */
  funciones: Set<string>;
  /** Declaraciones del script en curso que deben sobrevivir a una cesión de turno */
  locales: Set<string>;
  /** El programa se genera con corrutinas: las esperas ceden el turno */
  paralelo: boolean;
  /** Bloques propios que se están generando, del más externo al actual (ver bloques.ts) */
  dentroDe: string[];
  esperar(ms: string): string;
  esperarHasta(condicion: string): string;
  /** Lo que va en el `for` para declarar el contador de un bucle */
  contador(nombre: string): string;
  /** Lo que va al final de cada vuelta de un bucle que puede no terminar */
  vuelta(): string;
}

/** Un solo script: `delay()` y contadores locales, como en las slides del curso. */
export const contextoClasico = (): Contexto => ({
  includes: new Set(),
  globales: new Set(),
  setup: new Set(),
  tick: new Set(),
  funciones: new Set(),
  locales: new Set(),
  paralelo: false,
  dentroDe: [],
  esperar: (ms) => `delay(${ms});\n`,
  esperarHasta: (condicion) => `while (!(${condicion})) {}\n`,
  contador: (nombre) => `int ${nombre}`,
  vuelta: () => '',
});

/**
 * Varios scripts: cada espera cede el turno (macros de index.ts). Una
 * corrutina sin pila pierde sus variables locales al ceder, así que los
 * contadores son `static` del script.
 */
export function contextoCorrutinas(): Contexto {
  const ctx: Contexto = {
    ...contextoClasico(),
    paralelo: true,
    esperar: (ms) => `ESPERAR(${ms});\n`,
    esperarHasta: (condicion) => `ESPERAR_HASTA(${condicion});\n`,
    contador: (nombre) => {
      ctx.locales.add(`static int ${nombre};`);
      return nombre;
    },
    vuelta: () => 'CEDER();\n',
  };
  return ctx;
}
