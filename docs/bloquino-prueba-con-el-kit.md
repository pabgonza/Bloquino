# Prueba a mano con el kit

Lo que el recorrido automático (`scripts/recorrido/`, sesiones 2 a
10 con mouse real) no puede juzgar: cómo se siente y si coincide con el kit de
verdad. Media hora, con la página de alumno (`/editor?alumno`) y el kit al lado.

## Antes de empezar

- Frontend y backend arriba; página en 100 % de zoom.
- En la simulación, **clic derecho** sobre un componente abre su ficha (color
  del LED, ohmios de la resistencia, Rotar, Eliminar); **clic** lo selecciona,
  y Supr lo elimina. Con la simulación corriendo, **clic** sobre un sensor abre
  su panel de valores.

## Pendiente (2026-11-13)

Lo que falta probar con el kit y en la sala; el detalle de cada punto está
más abajo.

- [ ] Sala: regla de firewall con los puertos 80 y 443 y entrar desde otro
  equipo de la red (`docs/bloquino-dia-de-clase.md`). En este notebook no
  hay regla «Bloquino» y la red figura como Pública.
- [ ] Cargar a la placa real desde otro equipo por `https://<IP>`, con la
  autoridad instalada o aceptando el aviso (desde el mismo notebook ya
  funciona: ver abajo).
- [ ] Control remoto: anotar los códigos reales de las 17 teclas.
- [ ] Displays: ¿cátodo o ánodo común?
- [ ] Pantalla LCD: cableado real.
- [ ] LED RGB: ¿el del kit es de cátodo común?
- [ ] Programas del curso en bloques: oír y ver con los componentes armados
  los que se apartan del `.ino` (tabla de abajo; ya cargan en el clon).

## Probado sin armar nada (2026-11-13)

Con Playwright sobre la sala (`http://localhost`) y con el clon del kit (CH340)
en COM6 por `scripts/puente-serie.ps1`.

| Prueba | Resultado |
| --- | --- |
| Entrar por `https://192.168.18.111` aceptando el aviso | Contexto seguro, Web Serial disponible, simula y «Cargar a la placa» (placa simulada) termina en «¡Listo!». |
| Tiras de la protoboard | Agujero: marca sus 5; riel: sus 50; cada marca a 0,3 px de su agujero. Igual con la protoboard girada. |
| Ocho componentes seguidos | Quedan en fila arriba, sin encimarse ni tapar la placa. La resistencia de ejemplo de Velxio sí quedaba sobre la placa: el proyecto nuevo ya no la trae. |
| LED sin resistencia | «Revisa tu circuito» en español: «Un LED está conectado sin resistencia…», con «Volver a arreglarlo» y «Simular igual». |
| Recargar a mitad del armado | Vuelven los 10 componentes, todos dentro del lienzo. |
| Simulación con la CPU frenada (DevTools, como un notebook lento) | ÷1: 60 cuadros/s, tiempo real. ÷4: 13 cuadros/s y el parpadeo de 1 s corre al ~60 %. ÷6: 9 cuadros/s, ~40 %. Lo mismo con el parpadeo solo que con el marcador o la estación del tiempo: no depende del circuito. Falta medirlo en un notebook de la sala. |
| Varias placas en la sala (`http://localhost`), parpadeo de 1 s en la Placa 1 | Sin frenar: 1 placa, tiempo real; 2 placas, ~90 %; 3 placas, ~60 %. Con la CPU ÷4: 1 o 2 placas, ~60 %; 3 placas, ~25 %. Cada placa es un AVR más: el cable entre ellas no pesa. |
| Los 10 programas del curso de la tabla de abajo | Cargan y se verifican en el clon (2 a 5 KB, 5 a 8 s cada uno). |
| Monitor serie (órdenes por texto, placa real) | Con fin de línea responde en 17–51 ms; sin fin de línea, en 63–70 ms. |

## Por sesión

Armar lo mismo en la pantalla y en la mesa, con el mismo programa de bloques
(los del curso están en sus `.bloquino`).

| Sesión | Qué mirar |
| --- | --- |
| 2 Parpadeo | El LED de la placa parpadea al mismo ritmo en la pantalla y en la mesa (contar 10 parpadeos). |
| 3 Semáforo | Los LED asientan donde se sueltan. Cambiar el color de dos LED a verde y amarillo desde la ficha. La resistencia baja sola al riel −. |
| 4 Botón | El botón sale ya girado y calza a caballo del canal. ¿Coincide con cómo calza el del kit? Apretar con el mouse prende el LED. |
| 5 Buzzer | Las notas suenan con la altura correcta (comparar con el buzzer real) y sin cortes. Conectarlo al revés: debe sonar igual. |
| 6 Servo y perilla | La perilla se gira arrastrando el dial; para moverla de lugar se toma de la base. El servo sigue a la perilla sin saltos. |
| 7 Distancia | El panel «Distancia» responde al tiro. Acercar la mano al sensor real y comparar el umbral de 20 cm. |
| 8 Temperatura | Las patitas del módulo en pantalla (S / + / −) están en el mismo orden que en el del kit. |
| 9 LED RGB | Los colores mezclados (amarillo, violeta) se parecen a los del LED real. ¿El del kit es de cátodo común? |
| 10 Integración | Todo junto, sin que la simulación se ponga lenta en un notebook de la sala. |

## Componentes de h8

| Componente | Qué mirar |
| --- | --- |
| Control remoto | **Los códigos de las teclas están supuestos.** Programa: `cuando llega la tecla cualquiera` → `decir código de la última tecla`; cargar a la placa, apretar cada tecla y anotar su número. Si difieren, se corrigen en `frontend/src/bloquino/componentes/teclas.ts`. Mirar también el orden de las patitas del receptor. |
| Pantalla LCD | Cableado real: además de RS, E y D4 a D7, lleva alimentación, RW a GND, luz de fondo y el potenciómetro de contraste. Las letras con tilde no existen en la pantalla real. |
| Displays | Ver si son de cátodo o de ánodo común (terminan en AS o BS) y elegirlo en el bloque `preparar display`. El de 4 dígitos directo a los pines va con resistencias de 1 kΩ por segmento, no de 220 Ω. |
| Puerto serie | Con la placa real, el monitor debe mandar «Nueva línea»; sin fin de línea las lecturas igual llegan, 50 ms después. |

## Cargar a la placa (h7)

Probado con un Arduino UNO original (chip USB 16U2, Optiboot 4.4) y con el
clon del kit (chip USB CH340), que Pablo cargó desde la página el 2026-11-12:
funciona bien.

- Si una placa falla, probar sin navegador para ver la traza de lo enviado y
  recibido:
  `powershell -File scripts\puente-serie.ps1 COM<n>` en una terminal y, en
  otra, desde `frontend\`,
  `$env:BLOQUINO_PUENTE = 4700; $env:BLOQUES_BACKEND_URL = "http://localhost"; npx vitest run src/__tests__/bloquino-carga.test.ts -t "placa real"`.
- Desde un equipo de alumno: entrar por `https://` más la IP, con la autoridad
  instalada o aceptando el aviso, y cargar desde ahí.

## Programas del curso en bloques

El curso pasa a mostrar cada programa en bloques (`sketches/sesion-NN/<nombre>/<nombre>.bloquino`
en `Curso_Arduino`). Todos compilan y simulan; estos se
apartan del `.ino` porque no hay bloque exacto, y conviene oírlos o verlos en
la placa real:

| Programa | Qué cambia | Qué mirar |
| --- | --- | --- |
| S4 `contador` | Las variables de bloques son decimales | El monitor muestra «1.00, 2.00…»: ¿molesta? |
| S5 `sirena` | 659 Hz en vez de 660 (menú de notas) | Suena igual. |
| S5 `piano` | Nota de 0,1 s mientras se aprieta, en vez de sonar hasta soltar | Sin cortes al mantener apretado; con dos botones, las notas se turnan. |
| S6 `perilla` y `saludo_perilla` | Perilla de 0 a 100 en vez de 0 a 1023 | El servo recorre todo el ángulo. |
| S7 `theremin` | Cuatro notas por tramos de 15 cm en vez de un tono continuo | ¿Sigue siendo divertido? |
| S7 `estacionamiento_pito` | Pitido de 0,1 s en rojo | Suena casi continuo. |
| S8 `fiebre` y `fiebre_aviso` | Nota de 1 s en vez de un tono sin fin | Sobre 30 °C suena seguido. |
| S9 `lampara_humor` | Sin eco el sensor da 400 cm: queda azul, no rojo | Sin mano delante, el color. |

## En cualquier momento

- Pasar el mouse por un agujero de la protoboard marca en verde su tira; por
  un riel, el riel entero. También con la protoboard girada.
- Agregar varios componentes seguidos: ninguno cae encima de otro ni de la placa.
- Armar un LED sin resistencia y simular: aparece «Revisa tu circuito», en
  español y sin códigos raros.
- Arrastrar bloques, cambiar un menú, escribir un número, botar un bloque.
- Canciones (Sonido): `empezar canción` con un parpadeo debajo suena y parpadea
  a la vez; comparar la melodía con el buzzer real y la misma librería.
- Recargar la página a mitad de un armado: vuelve todo, encuadrado.
- Varias piezas a la vez, como en Tinkercad: Shift + clic suma o quita; Ctrl+A
  junta todo; Shift + arrastrar dibuja un rectángulo (también sobre la
  protoboard). Con el grupo: arrastrar, R, Supr, Ctrl+C y Ctrl+V, y Ctrl+Z
  deshace cada cosa de una vez. ¿Se entiende el contorno punteado?
- Varias placas, como en Tinkercad: copiar la placa (Ctrl+C y Ctrl+V) la pega
  con su programa; «Arduino UNO» en la paleta agrega otra con el parpadeo.
  Bajo cada placa sale su número y, en Código, un selector arriba elige cuál
  se programa; Cargar a la placa graba la elegida. Borrar una placa pide
  confirmar, y Ctrl+Z la devuelve con su programa. Ejemplo:
  `13-dos-placas.bloquino`. ¿Se entiende cuál se está programando?
- Mis bloques, como en Scratch: «Crear un bloque» con entradas de número,
  texto y sí/no; arrastrar una entrada desde el sombrero «definir» deja una
  copia; clic derecho → «Editar». Ejemplo: `14-mis-bloques.bloquino` en el
  LED RGB del kit. ¿Se entiende que el «definir» no corre solo? ¿Sirve para
  la sesión 9 (`color (r) (g) (b)`)?

## Decisiones tomadas

- **Botón de la sesión 4**: el curso pasa a armarlo como Bloquino, entre el pin
  y GND con la resistencia interna del pin (apretado = LOW). Se cambia en las
  slides del curso.
- **Slide de la sesión 8**: el curso pasa a dibujar el DHT11 «S / + / −», como
  el módulo del kit y el de la pantalla.
- **Ficha del componente**: se queda con clic derecho. Un clic selecciona;
  Supr elimina lo seleccionado y R lo gira.
- **Proyecto nuevo** (2026-11-13): parte solo con la placa, sin el LED y la
  resistencia de ejemplo de Velxio.
