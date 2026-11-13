# Tasks

## 1. Giro

- [x] 1.1 `frontend/src/bloquino/giroProtoboard.ts`: nueva posición y giro de un componente asentado cuando su protoboard gira en torno a su centro.
- [x] 1.2 `updateComponent`: si cambia el giro de una protoboard, mover y girar lo asentado en ella (como ya hace al arrastrarla). `recordRotate` pasa por `updateComponent` para que deshacer y rehacer también lo lleven.
- [x] 1.3 Velxio no asentaba nada en una protoboard girada (`nearestHole` devolvía null): `agujerosGirados` le da los agujeros girados a `nearestHole` y al asiento al soltar (`indexHoles`, `solvePlacement`). Así lo girado sigue asentado y un componente nuevo se asienta en ella.
- [x] 1.4 Test de las cuentas (`bloquino-giro-protoboard.test.ts`); los de `breadboard-*` siguen pasando.

## 2. Cierre

- [x] 2.1 Playwright: girar la protoboard del semáforo armado; los 12 asientos quedan en los mismos agujeros (0,6 px), prenden los tres LED, Ctrl+Z la devuelve exacta y Ctrl+Y la vuelve a girar; un LED nuevo soltado sobre la protoboard girada se asienta. Recorrido `s3` y `seleccion` sin cambios.
- [x] 2.2 `docs/bloquino-prueba-con-el-kit.md`: quitar el pendiente.
- [x] 2.3 Reconstruir la imagen de la sala (en `http://localhost` la protoboard girada conserva lo asentado).
