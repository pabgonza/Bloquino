// Generador de cada bloque del catálogo: devuelve su código Arduino y declara
// sus contribuciones en `gen.ctx`.
import { Blockly } from '../blockly';
import { SOMBREROS } from '../catalogo';
import { LCD_PINES } from '../catalogo/pantallas';
import { PAQUETES, llenar } from '../paquetes';
import { contextoClasico } from './contexto';

export const gen = Object.assign(new Blockly.CodeGenerator('Arduino'), { ctx: contextoClasico() });

// Encadena cada instrucción con la que le sigue.
gen.scrub_ = (bloque, codigo, soloEste) => {
  const sig = bloque.nextConnection?.targetBlock();
  return codigo + (sig && !soloEste ? gen.blockToCode(sig) : '');
};

// Precedencia de C++ (menor = liga más fuerte), para poner solo los paréntesis necesarios.
const ORDEN = {
  ATOMO: 0,
  UNARIO: 3,
  MULT: 5,
  SUMA: 6,
  RELACION: 8,
  IGUAL: 9,
  Y: 13,
  O: 14,
  NADA: 99,
};
const ORDEN_OP: Record<string, number> = {
  '*': ORDEN.MULT,
  '/': ORDEN.MULT,
  '+': ORDEN.SUMA,
  '-': ORDEN.SUMA,
  '<': ORDEN.RELACION,
  '>': ORDEN.RELACION,
  '==': ORDEN.IGUAL,
  '&&': ORDEN.Y,
  '||': ORDEN.O,
};

type Bloque = Blockly.Block;
const campo = (b: Bloque, nombre: string) => String(b.getFieldValue(nombre));
const valor = (b: Bloque, nombre: string, orden = ORDEN.NADA, vacio = '0') =>
  gen.valueToCode(b, nombre, orden) || vacio;
const valores = (b: Bloque, ...nombres: string[]) => nombres.map((n) => valor(b, n)).join(', ');
const cuerpo = (b: Bloque, nombre = 'DO') => gen.statementToCode(b, nombre);
const condicion = (b: Bloque) => valor(b, 'COND', ORDEN.NADA, 'false');
const esNumero = (codigo: string) => !isNaN(Number(codigo));

/** Pide el `pinMode` del pin elegido en el bloque y devuelve el pin. */
const pin = (b: Bloque, modo: string, nombre = 'PIN') => {
  const p = campo(b, nombre);
  gen.ctx.setup.add(`pinMode(${p}, ${modo});`);
  return p;
};

/** Segundos de una entrada → milisegundos, ya calculados si es un número. */
const milis = (b: Bloque) => {
  const s = valor(b, 'S', ORDEN.MULT);
  return esNumero(s) ? String(Math.round(Number(s) * 1000)) : `${s} * 1000`;
};

/** Nombre de la variable del bloque, válido en C++ (`mi cuenta` → `mi_cuenta`). */
const nombreVariable = (b: Bloque) =>
  b
    .getField('VAR')!
    .getText()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\W/g, '_')
    .replace(/^(\d)/, '_$1');

/** Variable usada por el bloque: global, salvo que sea el contador de un `contar` que lo rodea. */
const variable = (b: Bloque) => {
  const v = nombreVariable(b);
  let p = b.getSurroundParent();
  while (p && !(p.type === 'ab_contar' && nombreVariable(p) === v)) p = p.getSurroundParent();
  if (!p) gen.ctx.globales.add(`float ${v} = 0;`);
  return v;
};

/** Cesión de turno al final de cada vuelta de un bucle que puede no terminar (nada en modo clásico). */
const finDeVuelta = () => gen.ctx.vuelta() && gen.INDENT + gen.ctx.vuelta();

const G = gen.forBlock;

// ── Eventos y control ───────────────────────────────────────────────────────
G.ab_al_iniciar = () => '';
// En modo clásico solo llega aquí el `por siempre` anidado: el del script es loop() (ver index.ts).
G.ab_por_siempre = (b) => `while (true) {\n${cuerpo(b)}${finDeVuelta()}}\n`;
G.ab_esperar = (b) => gen.ctx.esperar(milis(b));
G.ab_repetir = (b) => {
  let nivel = 1;
  for (let p = b.getSurroundParent(); p; p = p.getSurroundParent()) if (p.type === b.type) nivel++;
  const v = nivel > 1 ? `vez${nivel}` : 'vez';
  return `for (${gen.ctx.contador(v)} = 0; ${v} < ${valor(b, 'VECES', ORDEN.RELACION)}; ${v}++) {\n${cuerpo(b)}}\n`;
};
G.ab_mientras = (b) => `while (${condicion(b)}) {\n${cuerpo(b)}${finDeVuelta()}}\n`;
G.ab_contar = (b) => {
  const v = nombreVariable(b);
  return `for (${gen.ctx.contador(v)} = ${valor(b, 'DESDE')}; ${v} <= ${valor(b, 'HASTA', ORDEN.RELACION)}; ${v}++) {\n${cuerpo(b)}}\n`;
};
G.ab_si = (b) => `if (${condicion(b)}) {\n${cuerpo(b)}}\n`;
G.ab_si_sino = (b) => `if (${condicion(b)}) {\n${cuerpo(b)}} else {\n${cuerpo(b, 'SINO')}}\n`;
G.ab_esperar_hasta = (b) => gen.ctx.esperarHasta(condicion(b));

const CRONOMETRO = 'unsigned long cronometro = 0;';
G.ab_cronometro = () => {
  gen.ctx.globales.add(CRONOMETRO);
  return ['(millis() - cronometro) / 1000.0', ORDEN.MULT];
};
G.ab_reiniciar_cronometro = () => {
  gen.ctx.globales.add(CRONOMETRO);
  return 'cronometro = millis();\n';
};

// ── Luces ───────────────────────────────────────────────────────────────────
G.ab_led = G.ab_pin_digital = (b) => `digitalWrite(${pin(b, 'OUTPUT')}, ${campo(b, 'ESTADO')});\n`;
G.ab_led_brillo = (b) => {
  const n = valor(b, 'BRILLO');
  const pwm = esNumero(n)
    ? Math.round(Math.min(100, Math.max(0, Number(n))) * 2.55)
    : `map(${n}, 0, 100, 0, 255)`;
  return `analogWrite(${pin(b, 'OUTPUT')}, ${pwm});\n`;
};
// Cátodo común: nivel alto = encendido.
G.ab_led_rgb = (b) =>
  ['R', 'G', 'B']
    .map(
      (canal, i) =>
        `analogWrite(${pin(b, 'OUTPUT', canal)}, ${parseInt(campo(b, 'COLOR').slice(1 + 2 * i, 3 + 2 * i), 16)});\n`,
    )
    .join('');

// ── Sonido y movimiento ─────────────────────────────────────────────────────
// tone() con duración no bloquea: la espera hace que la nota suene completa
// antes del bloque siguiente.
G.ab_tocar_nota = (b) => {
  const ms = milis(b);
  return `tone(${pin(b, 'OUTPUT')}, ${campo(b, 'NOTA')}, ${ms});\n${gen.ctx.esperar(ms)}`;
};
G.ab_silenciar = (b) => `noTone(${pin(b, 'OUTPUT')});\n`;
G.ab_servo = (b) => {
  const p = campo(b, 'PIN');
  gen.ctx.includes.add('#include <Servo.h>');
  gen.ctx.globales.add(`Servo servo${p};`);
  gen.ctx.setup.add(`servo${p}.attach(${p});`);
  return `servo${p}.write(${valor(b, 'ANGULO')});\n`;
};
G.ab_angulo = (b) => [campo(b, 'ANGULO'), ORDEN.ATOMO];

// ── Sensores ────────────────────────────────────────────────────────────────
G.ab_boton = (b) => [`digitalRead(${pin(b, 'INPUT_PULLUP')}) == LOW`, ORDEN.IGUAL];
G.ab_perilla = (b) => [`map(analogRead(${campo(b, 'PIN')}), 0, 1023, 0, 100)`, ORDEN.ATOMO];
// HC-SR04: tiempo límite de 25 ms (unos 4 m). Sin eco pulseIn da 0 y se
// devuelve 400 para que "lejos" no parezca "pegado".
const DISTANCIA = `float distanciaCm(int disparo, int eco) {
  digitalWrite(disparo, LOW);
  delayMicroseconds(2);
  digitalWrite(disparo, HIGH);
  delayMicroseconds(10);
  digitalWrite(disparo, LOW);
  unsigned long eco_us = pulseIn(eco, HIGH, 25000);
  if (eco_us == 0) {
    return 400;
  }
  return eco_us / 58.0;
}`;
G.ab_distancia = (b) => {
  gen.ctx.funciones.add(DISTANCIA);
  return [`distanciaCm(${pin(b, 'OUTPUT', 'DISPARO')}, ${pin(b, 'INPUT', 'ECO')})`, ORDEN.ATOMO];
};
// DHT11 con la librería del curso. La librería guarda la última lectura y la
// renueva como máximo cada 2 s: leer seguido no frena los otros programas.
const dht = (b: Blockly.Block) => {
  const p = campo(b, 'PIN');
  gen.ctx.includes.add('#include <DHT.h>');
  gen.ctx.globales.add(`DHT dht${p}(${p}, DHT11);`);
  gen.ctx.setup.add(`dht${p}.begin();`);
  return `dht${p}`;
};
G.ab_temperatura = (b) => [`${dht(b)}.readTemperature()`, ORDEN.ATOMO];
G.ab_humedad = (b) => [`${dht(b)}.readHumidity()`, ORDEN.ATOMO];

// ── Operadores y variables ──────────────────────────────────────────────────
G.ab_aritmetica =
  G.ab_comparar =
  G.ab_logica =
    (b) => {
      const op = campo(b, 'OP');
      const orden = ORDEN_OP[op];
      const vacio = orden >= ORDEN.Y ? 'false' : '0';
      // (float) para que 7 ÷ 2 dé 3.5 y no la división entera de C++.
      return [
        `${op === '/' ? '(float)' : ''}${valor(b, 'A', orden, vacio)} ${op} ${valor(b, 'B', orden, vacio)}`,
        orden,
      ];
    };
G.ab_no = (b) => [`!${valor(b, 'A', ORDEN.UNARIO, 'false')}`, ORDEN.UNARIO];
// random(a, b) de Arduino excluye b: se suma 1 para que el máximo pueda salir.
G.ab_azar = (b) => {
  const desde = valor(b, 'A');
  const hasta = valor(b, 'B', ORDEN.SUMA);
  return [`random(${desde}, ${esNumero(hasta) ? Number(hasta) + 1 : `${hasta} + 1`})`, ORDEN.ATOMO];
};
G.ab_mapear = (b) => [`map(${valores(b, 'X', 'A', 'B', 'C', 'D')})`, ORDEN.ATOMO];
G.ab_restringir = (b) => [`constrain(${valores(b, 'X', 'A', 'B')})`, ORDEN.ATOMO];
G.math_number = (b) => {
  const n = Number(b.getFieldValue('NUM'));
  return [String(n), n < 0 ? ORDEN.UNARIO : ORDEN.ATOMO];
};
G.variables_get = (b) => [variable(b), ORDEN.ATOMO];
// Un texto en una variable de número se convierte ("12" → 12; "hola" → 0).
G.variables_set = (b) =>
  `${variable(b)} = ${esTexto(b, 'VALUE') ? `String(${valor(b, 'VALUE')}).toFloat()` : valor(b, 'VALUE')};\n`;
G.math_change = (b) => `${variable(b)} += ${valor(b, 'DELTA')};\n`;

// ── Avanzado ────────────────────────────────────────────────────────────────
G.ab_pin_pwm = (b) => `analogWrite(${pin(b, 'OUTPUT')}, ${valor(b, 'VALOR')});\n`;
G.ab_leer_digital = (b) => [`digitalRead(${pin(b, 'INPUT')})`, ORDEN.ATOMO];
G.ab_leer_analogico = (b) => [`analogRead(${campo(b, 'PIN')})`, ORDEN.ATOMO];
// ── Texto ───────────────────────────────────────────────────────────────────
// Un número pasa a texto sin decimales si es entero: "3" y no "3.00".
const A_TEXTO = `String aTexto(float n) {
  return n == (long)n ? String((long)n) : String(n);
}`;
function esTexto(b: Bloque, nombre: string) {
  return !!b.getInputTargetBlock(nombre)?.outputConnection?.getCheck()?.includes('String');
}
/** Entrada como texto de C++: tal cual si ya es un texto, convertida si es un número. */
const texto = (b: Bloque, nombre: string, orden = ORDEN.NADA) => {
  if (!b.getInputTargetBlock(nombre)) return '""';
  if (esTexto(b, nombre)) return valor(b, nombre, orden);
  gen.ctx.funciones.add(A_TEXTO);
  return `aTexto(${valor(b, nombre)})`;
};
/** Un literal ("hola") no se puede unir ni comparar en C++: se envuelve en String. */
const objeto = (t: string) => (t.startsWith('"') ? `String(${t})` : t);
const variableTexto = (b: Bloque) => {
  const v = nombreVariable(b);
  gen.ctx.globales.add(`String ${v} = "";`);
  return v;
};
G.text = (b) => [JSON.stringify(b.getFieldValue('TEXT')), ORDEN.ATOMO];
G.ab_unir = (b) => [
  `${objeto(texto(b, 'A', ORDEN.SUMA))} + ${texto(b, 'B', ORDEN.SUMA)}`,
  ORDEN.SUMA,
];
G.ab_texto_igual = (b) => [
  `${objeto(texto(b, 'A', ORDEN.IGUAL))} == ${texto(b, 'B', ORDEN.IGUAL)}`,
  ORDEN.IGUAL,
];
G.ab_variable_texto = (b) => [variableTexto(b), ORDEN.ATOMO];
G.ab_definir_texto = (b) => `${variableTexto(b)} = ${texto(b, 'VALUE')};\n`;

// ── Pantallas ───────────────────────────────────────────────────────────────
// LCD 16x2 en paralelo (4 bits) con LiquidCrystal. Los pines salen del bloque
// «preparar pantalla» del programa; sin él, los del ejemplo de la librería.
const lcd = (b: Bloque) => {
  const preparar = b.workspace
    .getBlocksByType('ab_lcd_preparar', false)
    .find((p) => p.isEnabled() && SOMBREROS.includes(p.getRootBlock().type));
  const pines = Object.entries(LCD_PINES).map(([c, p]) => (preparar ? campo(preparar, c) : p));
  gen.ctx.includes.add('#include <LiquidCrystal.h>');
  gen.ctx.globales.add(`LiquidCrystal lcd(${pines.join(', ')});`);
  gen.ctx.setup.add('lcd.begin(16, 2);');
  return 'lcd';
};
/** Posición que el alumno cuenta desde 1 → índice desde 0. */
const desdeCero = (b: Bloque, nombre: string) => {
  const n = valor(b, nombre, ORDEN.SUMA);
  return esNumero(n) ? String(Number(n) - 1) : `${n} - 1`;
};
G.ab_lcd_preparar = (b) => (lcd(b), '');
G.ab_lcd_escribir = (b) => `${lcd(b)}.print(${texto(b, 'VALOR')});\n`;
G.ab_lcd_cursor = (b) =>
  `${lcd(b)}.setCursor(${desdeCero(b, 'COLUMNA')}, ${desdeCero(b, 'FILA')});\n`;
G.ab_lcd_borrar = (b) => `${lcd(b)}.clear();\n`;

// ── Puerto serie ────────────────────────────────────────────────────────────
// Se lee por líneas: el número es la línea convertida, así no queda un fin de
// línea suelto que la lectura siguiente tomaría por un 0. Sin fin de línea, la
// lectura espera a lo más 50 ms.
const LEER_TEXTO = `String leerTexto() {
  String linea = Serial.readStringUntil('\\n');
  linea.trim();
  return linea;
}`;
const leerTexto = () => {
  gen.ctx.setup.add('Serial.begin(9600);');
  gen.ctx.setup.add('Serial.setTimeout(50);');
  gen.ctx.funciones.add(LEER_TEXTO);
  return 'leerTexto()';
};
G.ab_decir = G.ab_decir_seguido = (b) => {
  gen.ctx.setup.add('Serial.begin(9600);');
  return `Serial.${b.type === 'ab_decir' ? 'println' : 'print'}(${valor(b, 'VALOR', ORDEN.NADA, '""')});\n`;
};
G.ab_serie_hay = () => {
  gen.ctx.setup.add('Serial.begin(9600);');
  return ['Serial.available() > 0', ORDEN.RELACION];
};
G.ab_serie_numero = () => [`${leerTexto()}.toFloat()`, ORDEN.ATOMO];
G.ab_serie_texto = () => [leerTexto(), ORDEN.ATOMO];
G.ab_comentario = (b) => `// ${campo(b, 'TEXTO')}\n`;

// ── Paquetes de librerías ───────────────────────────────────────────────────
// Cada bloque aporta el include y el objeto global de su librería y devuelve
// su plantilla con los campos elegidos. En un programa simple un bloque puede
// tener una variante bloqueante, que no necesita avanzar en cada vuelta.
for (const p of PAQUETES)
  for (const d of p.bloques)
    G[d.tipo] = (b) => {
      const t = (plantilla: string) => llenar(p, b, plantilla);
      gen.ctx.includes.add(p.include);
      gen.ctx.globales.add(t(p.global));
      if (d.forma === 'logico') return [t(d.codigo), ORDEN.ATOMO];
      if (d.bloqueante && !gen.ctx.paralelo) return t(d.bloqueante) + '\n';
      if (d.tick) gen.ctx.tick.add(t(p.tick!));
      return `${t(d.codigo)}\n${d.esperarHasta ? gen.ctx.esperarHasta(t(d.esperarHasta)) : ''}`;
    };
