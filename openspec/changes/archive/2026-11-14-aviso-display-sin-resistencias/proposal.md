# Proposal

## Why

Un display de 7 segmentos es solo LED: no trae resistencias adentro. Los
ejemplos 09 y 10 lo traían cableado directo a los pines y la revisión previa a
simular no decía nada, porque solo conoce el LED suelto. Pablo lo notó al
revisar los circuitos (2026-11-14); los ejemplos ya llevan sus resistencias,
pero un alumno que arme el display sin ellas sigue sin aviso.

## What Changes

- La revisión previa a simular avisa, como problema, de un display de 7
  segmentos (de 1 o de 4 dígitos) con algún segmento y algún pin común unidos
  a la placa sin ninguna resistencia en el camino.
- No avisa si cada segmento lleva su resistencia, ni si la resistencia está
  del lado del común (limita la corriente, aunque el brillo cambie).

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `interfaz/identidad`: «Revisión del circuito en español» suma el aviso del
  display sin resistencias.

## Impact

- Nuevo `frontend/src/bloquino/revisionDisplay.ts`; una llamada en
  `simulation/verify/verifyFromStore.ts` y un código en `circuitVerifier.ts`.
- Texto en `i18n/locales/es/common2.json`.
- Los ejemplos de Velxio con displays directos (ocultos en Bloquino) también
  muestran el aviso; se puede simular igual.
