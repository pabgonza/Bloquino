# Proposal

## Why

Los hitos h1 a h5 probaron cada pieza por separado (bloques, generador, simulación en AVR emulado, guardado, DHT11), pero nadie ha hecho todavía lo que hará un alumno: armar en la protoboard el circuito de cada sesión, programarlo con bloques y simularlo, todo con el mouse y sin salir de la página de alumno. Al probar así solo el DHT11 aparecieron tres fallos que ningún test veía (agujeros de la protoboard tapados por el recuadro de un componente, componentes nuevos fuera de la vista y proyecto restaurado sin encuadrar). Es de esperar que haya más, y conviene encontrarlos antes de sumar librerías, carga a la placa y más componentes (h6 a h8).

Además, parte de lo que el alumno ve sigue en inglés: son textos de Velxio fuera de la página propia de Bloquino.

## What Changes

- **Recorrido de las 10 sesiones** en la página de alumno, con mouse real (Playwright): para cada sesión, armar su circuito en la protoboard, programarlo con bloques, simular y comprobar el resultado (LED, LED RGB, botón, buzzer, servo, potenciómetro, HC-SR04, DHT11). Cada fallo se corrige o queda anotado con su causa.
- **Protoboard como en Tinkercad**, que es la referencia del curso. Revisado en Tinkercad el 11-11-2026:
  - al pasar el mouse por un agujero o por la patita de un componente, se marcan en verde todos los agujeros de la misma tira (los 5 de la columna, o el riel completo): el alumno ve qué está conectado con qué. Velxio no marca nada al pasar el mouse; solo resalta todos los agujeros a la vez mientras se tiende un cable;
  - los componentes no llevan su nombre debajo y solo su dibujo tapa agujeros (corregido ya en parte: el recuadro deja pasar el clic);
  - un clic en un agujero empieza un cable y otro clic lo termina, igual que en Velxio; el cable es recto y del color elegido en la barra, en Velxio va en ángulos rectos con color automático;
  - al soltar un componente sobre la protoboard sus patitas calzan en los agujeros, igual que en Velxio.
- **Todo en español** para el alumno: cada texto en inglés que aparezca en el recorrido se traduce (ya vistos: el botón "Cancel" del aviso de cableado, los paneles de sensores de Velxio como el del HC-SR04, el diálogo de revisión del circuito, la barra de acciones del componente seleccionado y el diálogo de propiedades).
- **Lista corta para probar a mano** con el kit: lo que no se puede juzgar desde un navegador automatizado (sonido del buzzer, comodidad del arrastre, parecido de los dibujos con los componentes reales).

Fuera de este hito: componentes que no usan las 10 sesiones (h8), carga a la placa (h7), rediseñar el lienzo de Velxio.

## Capabilities

### New Capabilities
- `interfaz/protoboard`: cómo se asientan, se resaltan y se cablean los componentes en la protoboard.
- `simulacion/kit`: los componentes del kit se comportan en el simulador como en la mesa (tiempo real, botón, buzzer, servo, sensores con valor ajustable). Sale de los fallos que encontró el recorrido.

### Modified Capabilities
- `interfaz/identidad`: todos los textos que ve el alumno están en español.
- `interfaz/distribucion`: dónde aparece un componente nuevo y cómo se encuadra el circuito al abrir un proyecto (ya implementado, falta su spec).

## Impact

- Página de alumno (`frontend/src/bloquino/`) y sus estilos; traducciones en `frontend/src/i18n/locales/es/`.
- El resaltado de la tira conectada toca la capa de pines de Velxio (`components/simulator/PinOverlay.tsx`) o se hace como una capa propia encima; se decide en design.md.
- Herramienta de prueba: el MCP de Playwright (navegador visible, mouse real, 58 fps). El panel Browser de la app no sirve para esto: oculto no avanza la simulación.
- Posible resultado: una prueba automática por sesión que se pueda repetir antes de cada entrega.

## Decisiones abiertas (para design.md)

1. **Resaltado de la tira**: capa propia de Bloquino sobre la protoboard (sin tocar Velxio) frente a modificar `PinOverlay`. Recomendación: capa propia, usando `breadboardGroupKey` de Velxio para saber qué agujeros van juntos.
2. **Nombre bajo cada componente**: quitarlo en la página de alumno, como Tinkercad, o dejarlo. Recomendación: quitarlo de los componentes simples (LED, resistencia, botón) y dejarlo en los módulos.
3. **Pruebas repetibles**: guardar el recorrido como pruebas de Playwright dentro del repo exige instalar `@playwright/test` (pedir permiso) frente a dejarlo como lista de verificación en tasks.md. Recomendación: lista de verificación ahora, y decidir las pruebas automáticas al final del hito.
4. **Circuitos de las sesiones**: tomarlos de las slides del curso (`Curso_Arduino/slides/sesion-NN.html`). La slide de la sesión 8 dibuja el DHT11 como «+ / datos / −» y el módulo del kit es «S / + / −»: avisar a Pablo de cada diferencia entre slides y kit que aparezca.
