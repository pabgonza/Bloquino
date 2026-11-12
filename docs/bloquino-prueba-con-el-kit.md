# Prueba a mano con el kit

Lo que el recorrido automático (`scripts/recorrido/`, sesiones 2 a
10 con mouse real) no puede juzgar: cómo se siente y si coincide con el kit de
verdad. Media hora, con la página de alumno (`/editor?alumno`) y el kit al lado.

## Antes de empezar

- Frontend y backend arriba; página en 100 % de zoom.
- En la simulación, **clic derecho** sobre un componente abre su ficha (color
  del LED, ohmios de la resistencia, Rotar, Eliminar). Con la simulación
  corriendo, **clic** sobre un sensor abre su panel de valores.

## Por sesión

Armar lo mismo en la pantalla y en la mesa, con el mismo programa de bloques.

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

## Decisiones que siguen abiertas

- **Botón de la sesión 4**: el curso lo arma con resistencia de 10 kΩ a GND
  (apretado = HIGH); el bloque «botón apretado» usa la resistencia interna del
  pin (botón entre el pin y GND). En Bloquino funciona lo segundo.
- **Slide de la sesión 8**: dibuja el DHT11 «+ / datos / −»; el módulo del kit
  y el de la pantalla son «S / + / −».
- **Proyecto nuevo**: hoy parte con el LED y la resistencia de ejemplo de
  Velxio junto a la placa. ¿Mejor solo la placa?
- **Ficha del componente con clic derecho**: Tinkercad la abre con un clic.
