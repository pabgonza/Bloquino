# Design

## Context

- `esperar` pide al contexto `esperar(ms)`: `delay()` en modo clásico y la
  macro `ESPERAR(ms)` en corrutinas. `esperar hasta que` pide
  `esperarHasta(cond)`: un `while` vacío o `ESPERAR_HASTA(cond)`.
- Las macros del planificador (`PLANIFICADOR` en `generador/index.ts`) van en
  todos los sketches de corrutinas; los programas de referencia y los ejemplos
  comparan el sketch completo, así que agregar una macro ahí cambiaría todos.
- Ya hay un prototipo sin commit (bloque, texto y generador) con el que se
  simuló el programa de Pablo: la alarma empezó ~0,4 s después de apretar, en
  vez de 7,7 s.

## Goals / Non-Goals

**Goals:** una espera con tiempo límite que se corta por una condición, en
los dos modos, sin cambiar los sketches que no la usan.

**Non-Goals:** cortar otras esperas (`tocar nota`, canciones) ni detener
programas desde otro.

## Decisiones

### Bloque y forma

`ab_esperar_o_hasta` en `catalogo/control.ts`, con `S` (número, sombra 1) y
`COND` (sí/no): «esperar [1] segundos o hasta que < >». Va en la paleta debajo
de `esperar hasta que`. Sin condición encajada vale `false`, y el bloque se
comporta como `esperar`.

### Modo clásico

```cpp
for (unsigned long desde = millis(); millis() - desde < (unsigned long)(ms) && !(cond);) {}
```

Una sola instrucción, con su variable local; no puede anidarse en sí misma
(no tiene cuerpo). Se descartó un `while` con una global: ensucia el sketch.

### Modo corrutinas

Macro propia, en una línea por `__LINE__`, como las otras esperas:

```cpp
#define ESPERAR_O_HASTA(ms, condicion) do { despierta = millis() + (unsigned long)(ms); paso = __LINE__; case __LINE__: if (!(condicion) && (long)(millis() - despierta) < 0) return; } while (0)
```

Se agrega a `ctx.globales` solo si el programa usa el bloque (queda después
del planificador y antes de las funciones), así los sketches que no lo usan
no cambian. Usa el `despierta` y el `paso` que declara `EMPEZAR()`.

### La condición se evalúa en cada vuelta

En los dos modos la condición se vuelve a evaluar mientras se espera (una vez
por turno en corrutinas). Una condición que lee algo con efecto, como «leer
número del puerto serie», lo leería muchas veces; pasa igual con `esperar
hasta que`, y no se cubre.

### Dentro de un bloque propio

La condición tiene que mirar la variable (`espera > 3`) dentro del «definir»:
una entrada sí/no se copia al entrar al bloque y no cambiaría durante la
espera. Se explica en el ejemplo.

## Risks / Trade-offs

- [Se aparta de Scratch] → se acepta (decisión de Pablo); el texto del bloque
  se lee solo.
- [Prototipo sin pruebas] → tests del generador, compilación real, AVR
  emulado y recorrido con mouse antes de marcar las tareas.

## Migration Plan

Nada que migrar. Reconstruir la imagen de la sala al cerrar.
