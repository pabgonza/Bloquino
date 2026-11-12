// Paquetes de bloques: cada JSON de esta carpeta suma al catálogo los bloques
// de una librería de Arduino. Importarlo define esos bloques; el catálogo los
// pone en la paleta y el generador les da su código. Formato y pasos en
// docs/bloquino-agregar-libreria.md.
import { Blockly } from '../blockly';
import { INSTRUCCION, LOGICO, menu, pin } from '../catalogo/base';

interface Opcion {
  texto: string;
  valor: string;
  /** Datos extra de la opción, para las plantillas (`{CAMPO.dato}`). */
  [dato: string]: string;
}

export interface Paquete {
  /** Librería que debe estar en el backend (scripts/instalar-librerias.sh). */
  libreria: { nombre: string; version: string; origen: string; commit?: string };
  /** Categoría de la paleta donde van los bloques. */
  categoria: string;
  include: string;
  /** Objeto global; con `{PIN}` en el nombre queda uno por pin usado. */
  global: string;
  /** Código de cada vuelta de `loop()`, para los bloques con `tick`. */
  tick?: string;
  /** Valor de cada campo en la paleta. */
  porDefecto?: Record<string, string>;
  menus?: Record<string, Opcion[]>;
  bloques: {
    tipo: string;
    /** Texto del bloque, con %1, %2… en el orden de `campos`. */
    texto: string;
    /** `PIN` es el menú de pines; los demás nombres son menús del paquete. */
    campos: string[];
    /** Bloque de valor verdadero/falso; sin esto, una instrucción. */
    forma?: 'logico';
    codigo: string;
    tick?: boolean;
    /** Condición que el bloque espera después de su código. */
    esperarHasta?: string;
    /** Código en un programa simple, en lugar de todo lo anterior. */
    bloqueante?: string;
  }[];
}

export const PAQUETES = Object.values(
  import.meta.glob<Paquete>('./*.json', { eager: true, import: 'default' }),
);

for (const p of PAQUETES)
  Blockly.defineBlocksWithJsonArray(
    p.bloques.map((b) => ({
      type: b.tipo,
      message0: b.texto,
      args0: b.campos.map((c) =>
        c === 'PIN'
          ? pin()
          : menu(
              c,
              p.menus![c].map((o) => [o.texto, o.valor]),
            ),
      ),
      style: p.categoria,
      inputsInline: true,
      ...(b.forma === 'logico' ? LOGICO : INSTRUCCION),
    })),
  );

/** Reemplaza `{CAMPO}` y `{CAMPO.dato}` de una plantilla con lo elegido en el bloque. */
export const llenar = (p: Paquete, b: Blockly.Block, plantilla: string) =>
  plantilla.replace(/\{(\w+)(?:\.(\w+))?\}/g, (_, campo: string, dato?: string) => {
    const valor = String(b.getFieldValue(campo));
    return dato ? p.menus![campo].find((o) => o.valor === valor)![dato] : valor;
  });
