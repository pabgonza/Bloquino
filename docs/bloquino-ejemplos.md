# Ejemplos de Bloquino

Quince proyectos listos, uno por tema; el 13 tiene dos placas, el 14 usa Mis bloques y el 15 una espera que se corta. Entre todos usan cada componente del kit
y cada bloque de la paleta. Están en `frontend/public/ejemplos/` y se abren con
el botón **Abrir** de la página. En la sala también se pueden bajar desde
`http://<IP del notebook>/ejemplos/02-semaforo.bloquino`.

| # | Ejemplo | Qué tiene | Qué hacer al simular |
|---|---|---|---|
| 01 | [parpadeo](ejemplos/01-parpadeo.jpg) | Solo la placa. | Mirar la luz «L» de la placa: cambia cada segundo. Probar con 0.2. |
| 02 | [semáforo](ejemplos/02-semaforo.jpg) | LED rojo (13), amarillo (12) y verde (11), cada uno con su resistencia. | Rojo 2 s, verde 2 s y el amarillo parpadea tres veces. |
| 03 | [botones](ejemplos/03-botones.jpg) | Botón rojo (2), botón azul (3), LED rojo (13) y verde (12). | Con cualquier botón prende el verde; con los dos, el rojo. El monitor cuenta las pulsaciones del rojo y avisa al soltar el azul. |
| 04 | [rockola](ejemplos/04-rockola.jpg) | Buzzer (8), botón verde (2) y azul (3). | Saluda con tres notas. El verde empieza una canción de fondo y la luz parpadea mientras suena esa (variable «canción»); el azul la corta, o toca otra entera. |
| 05 | [perilla mágica](ejemplos/05-perilla-magica.jpg) | Potenciómetro (A0), servo (9) y LED (11). | Girar la perilla: el servo va de 0° a 180° y el LED cambia de brillo. El monitor muestra el valor. |
| 06 | [barrera](ejemplos/06-barrera.jpg) | Sensor de distancia (12 y 11), servo (3), LED rojo (9), LED verde (5) y buzzer (8). | Clic en el sensor y mover «Distancia»: bajo 20 cm sube la barrera y pita; el verde brilla más mientras más cerca. |
| 07 | [estación del tiempo](ejemplos/07-estacion-del-tiempo.jpg) | Pantalla LCD (12, 11, 5, 4, 3, 2) y sensor de temperatura y humedad (13). | La pantalla saluda y después muestra temperatura y humedad. Clic en el sensor y subir la temperatura sobre 30: aparece «CALOR». |
| 08 | [lámpara de colores](ejemplos/08-lampara-de-colores.jpg) | LED RGB (11, 10 y 9) con tres resistencias. | Escribir en el monitor serie `rojo`, `verde`, `azul`, `azar` o `apagar`. |
| 09 | [control y dígito](ejemplos/09-control-y-digito.jpg) | Display de 1 dígito (2 a 8), receptor infrarrojo (10), control remoto y protoboard chica. | Clic en las teclas del control: un número lo muestra, «borrar» apaga y «OK» cuenta de 0 a 9. El monitor dice la tecla y su código. |
| 10 | [marcador](ejemplos/10-marcador.jpg) | Display de 4 dígitos (2 a 12) y potenciómetro (A0). | Muestra 1234 y después sigue a la perilla, de 0 a 9999. Escribir un número en el monitor serie lo muestra 3 segundos. |
| 11 | [reflejos](ejemplos/11-reflejos.jpg) | Botón (2), LED verde (12) y buzzer (8). | Apretar el botón apenas prende el LED: el monitor dice cuántos milisegundos tardaste, y pita si fue menos de medio segundo. |
| 12 | [bloques de pin](ejemplos/12-bloques-de-pin.jpg) | Botón entre 5V y el pin 2 con resistencia de 10 kΩ a tierra, LED (9) y potenciómetro (A0). | La luz «L» sigue al botón y el LED a la perilla, con los bloques de Avanzado. |
| 13 | [dos placas](ejemplos/13-dos-placas.jpg) | Placa 1 y Placa 2, cada una con su programa: el pin 13 de la 1 va al pin 2 de la 2, y GND con GND. | La «L» de la Placa 1 parpadea y la de la Placa 2 la sigue. En Código, el selector de arriba cambia de placa. |
| 14 | [mis bloques](ejemplos/14-mis-bloques.jpg) | LED RGB (11, 10 y 9) con tres resistencias, como el 08. | Parpadea blanco 3 veces y después pasa por rojo, verde y azul. En Mis bloques están `color (r) (g) (b)` y `parpadear (veces) veces`; clic derecho → «Editar» en un «definir». |
| 15 | [latido](ejemplos/15-latido.jpg) | LED (13), botón (7) y buzzer (3). | El LED late. Cada pulsación hace el latido más lento (el monitor dice la espera); sobre 3 segundos suena la alarma, al tiro: el latido espera con «esperar … segundos o hasta que espera > 3». |

Las capturas de `docs/ejemplos/` las deja el guion de prueba mientras simula.

## Cómo están armados

- **Cables ordenados**: no se cruzan entre sí ni pasan sobre componentes. Rojo
  es 5V, negro es tierra y cada señal tiene su color. Los que van a los pines
  de arriba de la placa bajan por carriles paralelos; los que van a 5V o a las
  entradas analógicas rodean la placa por un costado.
- **Un cruce que no se puede evitar**: en la pantalla LCD, la patita RW va a
  tierra y está entre RS y E, que van a la placa. Queda como un cruce único.
- **Pines elegidos por posición**: en varios ejemplos los pines no son los del
  bloque recién sacado de la paleta, sino los que dejan los cables paralelos
  (el servo de la barrera va al 3; el display de 4 dígitos reparte sus
  patitas del 2 al 12). Cada programa trae su bloque `preparar` con los pines.

## Diferencias con el kit real

- **Displays de 7 segmentos**: en el simulador van directo a los pines. En la
  placa real cada segmento necesita su resistencia (220 Ω en el de 1 dígito,
  1 kΩ en el de 4).
- **LED RGB**: el simulador muestra cada color encendido o apagado, sin
  intensidades intermedias; por eso «azar» elige entre colores plenos.
- **Control remoto**: los códigos de las teclas son supuestos hasta leerlos del
  control del kit (el ejemplo 09 sirve para eso: muestra el código de cada
  tecla en el monitor).
- **Pantalla LCD**: en la real, además, V0 va a un potenciómetro de contraste y
  A y K a la luz de fondo.

## Cómo se cuidan

- `frontend/src/__tests__/bloquino-ejemplos.test.ts`: cada archivo abre, sus
  bloques generan exactamente el sketch que trae, los cables no se cruzan ni se
  montan, y entre todos usan cada bloque de la paleta y cada componente del
  kit. Con `RUN_BLOQUES_COMPILE=1`, además compilan.
- `scripts/recorrido/ejemplos.js`: abre cada uno con «Abrir», lo simula, hace
  con el mouse lo de la tabla y comprueba el resultado.

Si cambia el generador de código, el test avisa qué ejemplos quedaron con el
sketch viejo: abrirlos en la página, abrir el panel Código, mover cualquier bloque y descargarlos de
nuevo con el mismo nombre. Al agregar un bloque o un componente, el test pide
sumarlo a algún ejemplo.
