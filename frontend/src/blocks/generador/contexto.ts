// Contexto de generación: lo que cada bloque aporta al sketch además de su
// propia línea. Los conjuntos guardan sin repetidos y en orden de aparición.
// Los bloques no escriben `delay()`: piden la espera al contexto, para que un
// segundo contexto (h2, scripts paralelos) emita la cesión de turno.
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
  esperar(ms: string): string;
  esperarHasta(condicion: string): string;
}

export const contextoClasico = (): Contexto => ({
  includes: new Set(),
  globales: new Set(),
  setup: new Set(),
  tick: new Set(),
  funciones: new Set(),
  esperar: (ms) => `delay(${ms});\n`,
  esperarHasta: (condicion) => `while (!(${condicion})) {}\n`,
});
