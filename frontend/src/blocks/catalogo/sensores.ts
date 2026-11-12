import { categoria, LOGICO, NUMERO, pin, pinAnalogico, TEXTO } from './base';

export default categoria(
  'sensores',
  '#5CB1D6',
  {
    ab_boton: { args: [pin()], ...LOGICO },
    ab_perilla: { args: [pinAnalogico()], ...NUMERO },
    ab_distancia: { args: [pin('DISPARO'), pin('ECO')], ...NUMERO },
    ab_temperatura: { args: [pin()], ...NUMERO },
    ab_humedad: { args: [pin()], ...NUMERO },
    ab_tecla_ultima: { args: [pin()], ...TEXTO },
    ab_tecla_codigo: { args: [pin()], ...NUMERO },
  },
  [
    { type: 'ab_boton', fields: { PIN: '2' } },
    'ab_perilla',
    { type: 'ab_distancia', fields: { DISPARO: '7', ECO: '6' } },
    { type: 'ab_temperatura', fields: { PIN: '2' } },
    { type: 'ab_humedad', fields: { PIN: '2' } },
    { type: 'ab_tecla_ultima', fields: { PIN: '10' } },
    { type: 'ab_tecla_codigo', fields: { PIN: '10' } },
  ],
);
