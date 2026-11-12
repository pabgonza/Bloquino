# Tasks

## 1. Ejemplos

- [x] 1.1 Armar los doce circuitos con el mouse (paleta, asentar, cablear), ordenar sus cables por carriles, programarlos y guardarlos en `frontend/public/ejemplos/`.
  - Entre 0 y 14 cables cada uno. Ningún cruce, salvo el de RW en la pantalla LCD.
  - Hallazgos al armar: la pantalla LCD y el receptor infrarrojo no asientan en la protoboard; una resistencia no asienta en una columna sin agujero de riel debajo (queda una columna al lado y el LED sin tierra); el LED RGB tapa los agujeros de su columna.

## 2. Verificación

- [x] 2.1 `bloquino-ejemplos.test.ts`: 51 tests (abrir, sketch, cables, cobertura y, con backend, compilación).
  - El test cuenta cruces y cables montados. Que ningún cable pase sobre un componente ajeno se revisó al armar cada circuito y en las capturas, no en el test.
- [x] 2.2 `scripts/recorrido/ejemplos.js` con mouse real: los doce simulan y responden.
  - Semáforo: rojo, verde y tres parpadeos del amarillo. Botones: el monitor cuenta y avisa al soltar. Rockola: saludo de tres notas, canción de fondo con parpadeo y corte. Perilla: servo 0°, 90° y 180°. Barrera: a 8 cm sube a 90° y pita. Estación: `Temp: 25` / `Hum: 50`, y `CALOR` a 42 °C. Lámpara: rojo, verde, azul y colores al azar. Control: 5 y 8 en el display, borrar lo apaga, OK cuenta. Marcador: 1234, la perilla de 0 a 9999 y 2025 por el monitor. Reflejos: `Milisegundos: 216`. Bloques de pin: la resistencia externa de 10 kΩ deja el pin en BAJA.
  - La perilla se mueve por su propiedad y el monitor serie por el store, no con el mouse: esos gestos ya los cubren `s6.js` y `textos.js`.
  - Corregido en el ejemplo 08: el LED RGB del simulador no mezcla intensidades intermedias, así que «azar» elige entre colores plenos.
- [x] 2.3 Batería de tests y reconstrucción de la imagen: los ejemplos responden en `/ejemplos/`.

## 3. Documentación

- [x] 3.1 `docs/bloquino-ejemplos.md` con la tabla y las capturas de `docs/ejemplos/`.
