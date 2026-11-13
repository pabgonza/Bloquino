# Proposal

## Why

En la prueba sin kit del 2026-11-13, al girar la protoboard del semáforo los
LED y las resistencias asentados se quedaron donde estaban: la protoboard giró
debajo de ellos y sus patitas quedaron lejos de sus agujeros. Velxio ya lleva
lo asentado cuando la protoboard se arrastra, pero no cuando gira. En una
protoboard real (y en Tinkercad) lo que está enchufado gira con ella.

## What Changes

- Girar la protoboard (ficha, tecla R o deshacer/rehacer) gira también cada
  componente asentado en ella, en torno al centro de la protoboard, y lo deja
  en los mismos agujeros.
- Velxio no asentaba nada en una protoboard girada: sus agujeros se calculan
  girados, así lo girado sigue asentado y se puede soltar un componente nuevo
  sobre ella.
- La cuenta va en un módulo propio (`frontend/src/bloquino/giroProtoboard.ts`);
  el store de Velxio solo la llama, con comentario `Bloquino:`.

## Capabilities

### Modified Capabilities
- `interfaz/protoboard`: lo asentado gira con la protoboard.

## Impact

- `frontend/src/store/useSimulatorStore.ts` (`updateComponent` y
  `recordRotate`), `frontend/src/utils/breadboardSnap.ts` (`nearestHole`,
  `indexHoles`, `solvePlacement`), módulo nuevo y su test. Sin giro todo
  queda igual que en Velxio.
