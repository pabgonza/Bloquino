# Recorrido de las sesiones con mouse real

Scripts para el MCP de Playwright que arman en la página de alumno el circuito
de cada sesión del curso, lo programan y lo simulan. Todo se hace con el mouse
(paleta, arrastre a la protoboard, cables por clic, Iniciar simulación), salvo
el programa de bloques, que se carga como JSON.

- `lib.js`: ayudas (`nuevo`, `agregar`, `asentar`, `cable`, `programar`,
  `simular`, `prop`, `deslizar` para el panel de un sensor, `espiarAudio` y
  `notasOidas` para el buzzer, constructores de bloques).
- `sN.js`: cuerpo de la sesión N. Deja sus resultados en `R`.
- `bloques.js`: programar con el mouse (arrastrar, menú, número, papelera).
- `conv.mjs`: arma los scripts en `frontend/.recorrido/`.

## Cómo correrlo

Con el frontend (`npx vite`, puerto 5173) y el backend (puerto 3080) arriba:

```
node openspec/changes/h5b-recorrido-kit/recorrido/conv.mjs s2 s3 s4 s5 s6 s7 s8 s9 s10 bloques
```

En el MCP de Playwright, una vez por sesión de trabajo (`browser_run_code_unsafe`):

```js
async (page) => {
  await page.goto('http://localhost:5173/editor?alumno');
  page.__cargar = async (nombre) => {
    const mod = await page.evaluate((n) => fetch('/.recorrido/' + n + '.js?raw&t=' + Date.now()).then((r) => r.text()), nombre);
    const texto = JSON.parse(mod.slice(mod.indexOf('"'), mod.lastIndexOf('"') + 1));
    return (0, eval)('(' + texto + ')')(page);
  };
  return page.__cargar('instalar');
}
```

Y después, cada sesión: `async (page) => page.__cargar('s3')`.

El entorno de ese MCP no tiene `import` ni `require`: por eso los scripts se
piden al servidor de desarrollo y se evalúan. Tras editar `lib.js` hay que
volver a correr `conv.mjs` y `page.__cargar('instalar')`. Al escribir en
`frontend/.recorrido/` el servidor recarga la página: esperar un par de
segundos antes de la llamada siguiente. Las capturas quedan en
`.playwright-mcp/`.

## Qué se aprendió armando

- Velxio gira las resistencias a vertical cuando entran a la protoboard; quedan
  de una fila al riel, como en la slide del semáforo.
- Una resistencia vertical que baja al riel no puede quedar en las columnas sin
  agujero de riel debajo (columna mod 6 = 2): Velxio la corre una columna.
- El botón sale de la paleta girado 90°: así va a caballo del canal, con las
  patitas 1 en una columna (filas c y h) y las 2 dos columnas al lado. Sin
  girar no cruza el canal y en una sola mitad queda en corto.
- La perilla se arrastra tomándola de la base (el dial gira) y la caja de su
  elemento mide mal: usar la del dibujo interno.
- Una resistencia vertical de la fila c de arriba llega a la fila g de abajo:
  sirve para poner una en serie entre el cable del pin y la patita.
- El panel de un sensor se abre con un clic sobre él durante la simulación.
- El servo no se asienta en la protoboard (sus tres pines quedarían en la misma
  columna): se cablea directo.
- Los cuadros de pin solo existen mientras el mouse está sobre su componente.
