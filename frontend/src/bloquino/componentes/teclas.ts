// Teclas del control remoto del kit (17 teclas, protocolo NEC, dirección 0) y
// el comando que manda cada una, en el orden en que están en el control. Las
// cuatro azules dicen, en chino, función, autoprueba, reinicio y volver.
//
// Los comandos son los del control de 17 teclas más común en estos kits:
// FALTA comprobarlos con el control real. Para leerlos: un programa con
// «cuando llega la tecla cualquiera» → «decir código de la última tecla».
export const TECLAS: [nombre: string, comando: number][] = [
  ['1', 0x45],
  ['2', 0x46],
  ['3', 0x47],
  ['4', 0x44],
  ['5', 0x40],
  ['6', 0x43],
  ['7', 0x07],
  ['8', 0x15],
  ['9', 0x09],
  ['silencio', 0x16],
  ['0', 0x19],
  ['borrar', 0x0d],
  ['función', 0x18],
  ['autoprueba', 0x08],
  ['OK', 0x1c],
  ['reinicio', 0x5a],
  ['volver', 0x52],
];
