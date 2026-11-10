# Tasks

Entorno: backend en el contenedor Docker del puerto 3080; frontend con `npx vite` desde `frontend/` (http://localhost:5173/editor). Tests: `npx vitest run <archivo>` desde `frontend/`.

## 1. Estructura del módulo de bloques

- [ ] 1.1 Separar el prototipo `frontend/src/blocks/BlocksPanel.tsx` en: `blockly.ts` (importa Blockly y `blockly/msg/es` entre `amdOff` y `amdOn` y lo reexporta), `catalogo/` (definiciones por categoría), `generador/` (contexto y generadores) y `BlocksPanel.tsx` (solo interfaz). Verificar que el parpadeo del prototipo sigue funcionando en el simulador.
- [ ] 1.2 Implementar el contexto de generación (`includes`, `globales`, `setup`, `tick`, `funciones`, `esperar`, `esperarHasta`) con su variante clásica. Test vitest: dos bloques que piden el mismo `pinMode` producen una sola línea.
- [ ] 1.3 Implementar el armado del sketch (`setup` / `loop`, sin `por siempre`, programa vacío, comentario de origen). Tests vitest con los tres escenarios de `specs/bloques/generador-clasico`.

## 2. Catálogo

- [ ] 2.1 Control: `por siempre`, `esperar`, `repetir`, `repetir mientras`, `contar`, `si`, `si / si no`, `esperar hasta que`, `cronómetro`, `reiniciar cronómetro`. Test vitest por bloque contra el código esperado.
- [ ] 2.2 Luces: LED encender / apagar, brillo en %, color RGB con selector de color. Tests vitest de los escenarios de brillo y color.
- [ ] 2.3 Sonido y movimiento: `tocar nota`, `silenciar`, `mover servo`. Tests vitest: nota con duración y contribuciones del servo.
- [ ] 2.4 Sensores: botón, perilla, distancia (función auxiliar con `pulseIn` y tiempo límite de 25 ms). Tests vitest del código generado.
- [ ] 2.5 Operadores y variables: aritmética, comparación, lógica, azar, `asignar al rango`, `restringir`, variables con nombre saneado. Test vitest: variable `mi cuenta`.
- [ ] 2.6 Avanzado: bloques de pin, `decir`, `comentario`. Tests vitest de los tres escenarios.
- [ ] 2.7 Paleta por categorías con nombre y color, en el orden de la spec. Verificar en el navegador que cada categoría muestra sus bloques.

## 3. Integración con el editor

- [ ] 3.1 Volcar el sketch al agregar la placa aunque el panel de bloques ya esté abierto (suscripción al grupo de archivos activo). Verificar en el navegador: abrir Bloques, agregar el UNO, la vista Código muestra el sketch generado.
- [ ] 3.2 Guardar el espacio de trabajo en `bloques.json` del grupo de la placa, excluido de la compilación, y restaurarlo al cargar. Test vitest: exportar a `.vlx` e importar conserva los bloques. Verificar que `bloques.json` no llega a `POST /api/compile/start`.
- [ ] 3.3 Vista Código de solo lectura cuando el proyecto tiene `bloques.json`. Verificar en el navegador.
- [ ] 3.4 Bloques sin sombrero atenuados y fuera del código. Test vitest y verificación visual.
- [ ] 3.5 Textos de bloques y categorías en `frontend/src/i18n/locales/es/` (espacio `bloques`); menús de Blockly en español. Verificar el menú contextual en el navegador.

## 4. Programas de referencia

- [ ] 4.1 Crear en `frontend/src/__tests__/fixtures/bloques/` los programas de referencia como JSON de bloques: parpadeo, semáforo, botón + LED, sirena, barrido de servo, perilla + servo, alarma de distancia, mezcla RGB. Test vitest que genera cada uno y compara con su `.ino` esperado.
- [ ] 4.2 Test de integración (opcional por variable de entorno, como `RUN_LIBRARY_TESTS`) que compila cada sketch de referencia contra el backend. Verificar que los ocho compilan.
- [ ] 4.3 Probar a mano en el simulador, con su circuito armado: parpadeo, botón + LED, perilla + servo y alarma de distancia. Anotar en este archivo cualquier diferencia entre lo simulado y lo esperado.

## 5. Cierre

- [ ] 5.1 `npx vitest run` completo: los tests existentes de Velxio siguen pasando.
- [ ] 5.2 Confirmar con el módulo KY-016 real si el LED RGB es de cátodo común y ajustar el bloque de color si no.
