# Design

## Context

h1 dejó un generador con contexto de contribuciones (`frontend/src/blocks/generador/`): los bloques no escriben `delay()`, piden la espera al contexto. El armado clásico toma un solo `al iniciar` y reparte entre `setup()` y `loop()`. El panel limita el área de trabajo a un `al iniciar`.

Un UNO tiene 2 KB de RAM y no hay sistema operativo: los scripts paralelos tienen que ser corrutinas cooperativas sin pila propia. Las "Decisiones abiertas" de proposal.md se resuelven aquí con la recomendación que la propuesta ya traía.

## Goals / Non-Goals

**Goals**
- Varios scripts que avanzan a la vez, con el mismo catálogo de h1 y sin duplicar generadores.
- C++ de corrutinas legible y autocontenido: se ve en la vista Código y compila sin librerías.
- El programa de un solo script sigue generando exactamente el C++ de h1.

**Non-Goals**
- Mensajes entre scripts, prioridades, "Mis bloques".
- Hacer cooperativa la medición del HC-SR04.
- Marcar el modo avanzado en la interfaz (el sketch lo dice en su primera línea; la interfaz es h3).

## Decisions

### 1. Corrutinas con macros propias, al estilo protothreads
Cada script es una función `programaN()` cuyo cuerpo vive dentro de un `switch (paso)`. Cada punto de espera guarda en `paso` su número de línea (`__LINE__`), devuelve el control y deja una etiqueta `case` para retomar ahí. Cinco macros, emitidas al comienzo del sketch: `EMPEZAR()`, `TERMINAR()`, `CEDER()`, `ESPERAR(ms)` y `ESPERAR_HASTA(condicion)`.

- `ESPERAR(ms)` anota la hora de despertar con `millis()` y vuelve a ceder mientras no llegue (comparación con resta, a prueba del desborde de `millis()`).
- `TERMINAR()` deja `paso` en un valor sin etiqueta: el script no vuelve a correr.
- El generador emite una instrucción por línea, así `__LINE__` es único dentro de cada función.

Alternativa descartada: AceRoutine u otra librería. Obliga a instalarla en el backend y el código visible deja de ser autocontenido.

### 2. Contadores estáticos por script
Una corrutina sin pila pierde sus variables locales al ceder, y C++ no deja saltar con `case` por encima de una declaración inicializada. Los contadores de `repetir` y `contar` se declaran `static` al comienzo de la función del script y el `for` solo los asigna.

Para no duplicar generadores, el contexto gana tres piezas:
- `contador(nombre)`: devuelve lo que va en el `for` (`int vez` en clásico; `vez` en corrutinas, anotando `static int vez;` en `locales`).
- `locales`: declaraciones del script en curso; el armado las vacía entre scripts.
- `vuelta()`: lo que va al final de cada vuelta de `por siempre` y `repetir mientras` (nada en clásico, `CEDER();` en corrutinas).

Ceder siempre al final de la vuelta, tenga o no esperas el cuerpo, evita analizar el cuerpo y cuesta una pasada del planificador (microsegundos).

### 3. Selección del modo
`generar` cuenta los sombreros habilitados. Ninguno, o uno solo que sea `al iniciar`: armado clásico de h1. En cualquier otro caso: corrutinas. En corrutinas `al iniciar` no reparte entre `setup()` y `loop()`: todo su script es el cuerpo de la función, y `por siempre` es un `while (true)` que cede en cada vuelta.

`loop()` corre primero el "tick" de los bloques y luego llama a cada `programaN()` en orden de posición (arriba hacia abajo).

### 4. Sombrero de botón: script que se repite por pulsación
El script de `cuando se presiona botón en pin [p]` se envuelve en un `while (true)`:

1. `ESPERAR_HASTA` que el pin esté en bajo (se presiona).
2. `ESPERAR(20)`: antirrebote.
3. Cuerpo del script.
4. `ESPERAR_HASTA` que el pin esté en alto (se suelta).
5. `ESPERAR(20)`: antirrebote.

Una pulsación durante el cuerpo se ignora sola: el script no vuelve a mirar el botón hasta el paso 4. Mantener presionado no repite, porque el paso 4 espera a que se suelte. Alternativa descartada: reiniciar el script como Scratch; exige cancelar una corrutina a medio camino y sorprende más de lo que ayuda.

### 5. Bloques que tardan
- `tocar nota`: ya pide su espera al contexto; en corrutinas sale `tone()` + `ESPERAR(ms)` sin tocar el bloque.
- `distancia en cm`: `pulseIn` retiene el turno hasta 25 ms. Se acepta: un parpadeo se atrasa a lo más ese tiempo.

### 6. Tope de 8 scripts
El tope es de sombreros en total, no por tipo, y `maxInstances` de Blockly es por tipo. El panel recalcula `maxInstances` en cada cambio: para cada tipo de sombrero, los que ya hay más los cupos que quedan. Blockly deshabilita solo los bloques de la paleta que ya no caben, y también bloquea pegar.

### 7. Memoria
Cada script gasta 6 bytes de RAM (`paso` y `despierta`) más 2 por contador. Medido con el programa de referencia de 8 scripts (`ocho-scripts`): 57 bytes de RAM (2 % de 2048) y 2558 bytes de flash (7 % de 32256). El tope de 8 no lo fija la memoria sino la legibilidad del programa.

## Risks / Trade-offs

- **Un bloque que no cede frena a todos**: `repetir n veces` sin esperas corre de corrido. Con los `n` de un curso son microsegundos; no se cede ahí para no ensuciar el código.
- **El modo cambia el código entero**: agregar un segundo sombrero transforma un sketch de `delay()` en uno de corrutinas. Es deliberado (proposal.md) y la primera línea lo avisa.
- **`__LINE__` depende de una instrucción por línea**: lo garantiza el generador; la vista Código es de solo lectura.
- **Pulsación más corta que una vuelta del planificador**: si otro script retiene el turno (HC-SR04, 25 ms), una pulsación más breve se pierde. Una pulsación humana dura más de 50 ms.
