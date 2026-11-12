# Design

## Context

- **Kit** (`Curso_Arduino/docs/kit-materiales.md`): LCD 1602 azul sin I2C, displays de 7 segmentos sueltos de 1 y de 4 dígitos (tipo de común sin confirmar), receptor infrarrojo VS1838B y un control de 17 teclas (foto de Pablo: 1 a 9, silencio, 0, borrar y una cruz con OK; las cuatro azules rotuladas en chino).
- **Velxio** ya simula los cuatro componentes: el LCD decodifica HD44780 solo en 4 bits (RS, E, D4 a D7); el display de 7 segmentos asume transistores (segmento y dígito activos en alto) y recibe los cambios de pin por dos vías; el receptor infrarrojo recibe una trama NEC real, con los tiempos del reloj de la placa, que el control emite "al aire" sin cables. El control de Wokwi es otro modelo, con otros códigos.
- **Variables**: hasta aquí todas eran `float`, con los bloques de Blockly.

Decisiones abiertas de proposal.md: 1 (pines del LCD en un bloque `preparar`), 2 y 3 tomadas al implementar; 4 decidida por Pablo el 2026-11-12: **variables de texto**. Sus respuestas del mismo día: instalar `LiquidCrystal` e `IRremote`; displays de cátodo o ánodo común; el de 4 dígitos es la pieza suelta de 12 patitas; los nombres de las teclas en español.

## Goals / Non-Goals

**Goals**
- Que lo que funciona en el simulador funcione igual en la placa con las piezas del kit.
- Textos suficientes para mostrar mensajes y recibir órdenes, sin tipos de C++ a la vista.

**Non-Goals**
- LCD con I2C, caracteres propios o desplazamiento; TM1637; puntos decimales del display; mandar por infrarrojo.
- Operaciones de texto más allá de unir y comparar.

## Decisions

### 1. Estos bloques van en TypeScript, no como paquetes JSON
La propuesta decía "paquetes con el formato de h6". No calzan: necesitan huecos de valor, un bloque `preparar` que configura a los demás, sombreros y código de refresco propio. Van en el catálogo y el generador, como el DHT11. El formato de paquetes queda para librerías que solo llaman métodos.

### 2. Variables de texto con tipo propio y conversión automática
- Tipo de Blockly `texto` para las de texto; las de número siguen sin tipo, como están guardadas desde h1. Los bloques de variable de Blockly listan variables de cualquier tipo: se reemplazan por otros iguales que solo listan las de número, y `ab_definir_texto` / `ab_variable_texto` solo las de texto. Dos botones en la paleta: crear de número y crear de texto.
- En C++, una variable de texto es un `String` global.
- Donde va un texto, un número se convierte con `aTexto()` (entero sin decimales; si no, dos decimales). Un texto en una variable de número se convierte con `toFloat()`. Así ningún programa de bloques deja de compilar por tipos. En los huecos de número un texto no encaja.
- `decir` no cambia: un número suelto sale como lo imprime Arduino (`3.00`), que es lo que muestran las slides.

### 3. Puerto serie por líneas
`leer texto` lee hasta el fin de línea y le quita espacios y retorno de carro; `leer número` es esa línea convertida. Leer con `parseFloat` deja el fin de línea en la cola y la lectura siguiente entrega 0. `Serial.setTimeout(50)` acota la espera cuando no llega fin de línea. El sombrero cede el turno en cada vuelta por si el script no lee.

### 4. LCD con `LiquidCrystal` y un `preparar` opcional
Un solo objeto `lcd`. Los pines salen del bloque `preparar pantalla LCD` que esté bajo un sombrero; sin él, los del ejemplo de la librería (12, 11, 5, 4, 3, 2). Los bloques buscan ese `preparar` en el área de trabajo al generar: no hace falta orden ni estado nuevo en el contexto. Columna y fila se cuentan desde 1.

### 5. Control remoto con `TinyIRReceiver`
Viene dentro de `IRremote`. Decodifica NEC con la interrupción de cambio de pin, sin temporizador: `IRremote` completo usa el Timer2 y no compila junto con `tone()`. Se define `NO_LED_FEEDBACK_CODE`: por defecto la librería usa el LED del pin 13 como aviso y pisa lo que el programa escriba ahí.

En cada vuelta de `loop()` se anota la tecla nueva (`teclaControl`, `teclasRecibidas`); las repeticiones por tecla mantenida se ignoran. Cada sombrero guarda cuántas teclas vio y corre cuando cambia; las que llegan mientras corre se ignoran, igual que con el botón. El receptor es uno por programa: vale el pin del primer bloque.

### 6. El control del kit como componente propio
`bloquino-control` dibuja el control de la foto, con los rótulos en español, y emite `button-press` con su comando: reutiliza la parte de simulación `ir-remote` de Velxio. La tabla tecla → comando (`bloquino/componentes/teclas.ts`) la comparten el dibujo, el menú del sombrero y el generador. **Los comandos son los del control de 17 teclas más común y falta comprobarlos con el control real**; `código de la última tecla` permite leerlos y corregir la tabla.

### 7. Displays sin librería y con el tipo a la vista
- `mostrarCifra()` escribe los 7 segmentos desde una tabla; el de 4 dígitos guarda el número y `refrescarDisplay()` corre en el tick, un dígito cada 2 ms, apagando el anterior antes de cambiar los segmentos. Por el tick, el programa pasa a corrutinas.
- Cátodo o ánodo común se elige en el bloque `preparar`; sin `preparar`, un dígito de cátodo común.
- En el simulador, la propiedad `common` del display (la pone la paleta de Bloquino, editable en la ficha) hace que se comporte como la pieza suelta. Con ella, el display solo atiende los cambios de pin de `attachEvents`: la otra vía del lienzo llega tarde y corrompía los dígitos multiplexados. Sin la propiedad, queda la convención de Velxio.
- El display de 4 dígitos es un componente aparte (`display-4`, el mismo elemento con `digits: 4`): al cambiar los dígitos de uno ya puesto, el lienzo no renueva sus cuadros de pin.

### 8. Arreglos del simulador que aparecieron al probar
- Al reiniciar la placa, el nivel de reposo de las líneas de sensores se fijaba antes de reconstruir el procesador y se perdía: la primera trama (control, DHT11) fallaba.
- El monitor serie mostraba cada byte como un carácter: los textos con tilde (UTF-8) salían mal.

## Risks / Trade-offs

- `String` fragmenta la memoria en programas largos; para el curso alcanza.
- El display de 4 dígitos directo a los pines exige resistencias de 1 kΩ por segmento: con 220 Ω, el pin del dígito pasaría de su corriente máxima. El simulador no lo avisa.
- El LCD real no tiene letras con tilde; el simulado tampoco.
- Un script que retiene el turno (DHT11, distancia) hace parpadear el display de 4 dígitos ese instante.
