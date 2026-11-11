import { Blockly } from '../blockly';
import { categoria, INSTRUCCION, menu, num, pin, pinPwm, valor } from './base';

// Blockly 13 ya no trae campo de color en el núcleo: este muestra el color
// elegido y abre una grilla con los que un LED RGB puede dar.
const COLORES = [
  '#ff0000', // rojo
  '#ff8000', // naranja
  '#ffff00', // amarillo
  '#00ff00', // verde
  '#00ffff', // celeste
  '#0000ff', // azul
  '#8000ff', // morado
  '#ff00ff', // rosado
  '#ffffff', // blanco
  '#000000', // apagado
];

class CampoColor extends Blockly.Field<string> {
  override SERIALIZABLE = true;

  static override fromJson() {
    return new this(COLORES[0]);
  }

  protected override initView() {
    const c = this.getConstants()!;
    this.size_ = new Blockly.utils.Size(
      c.FIELD_COLOUR_DEFAULT_WIDTH,
      c.FIELD_COLOUR_DEFAULT_HEIGHT,
    );
    this.createBorderRect_();
    this.borderRect_!.style.fillOpacity = '1';
    this.borderRect_!.style.cursor = 'pointer';
    this.borderRect_!.setAttribute('stroke', '#fff');
  }

  protected override render_() {
    this.borderRect_!.style.fill = this.getValue()!;
    this.positionBorderRect_();
  }

  protected override showEditor_() {
    const grilla = document.createElement('div');
    grilla.style.cssText = 'display:grid;grid-template-columns:repeat(5,auto);gap:6px;padding:8px';
    for (const color of COLORES) {
      const boton = document.createElement('button');
      boton.style.cssText = `width:28px;height:28px;border:1px solid #888;border-radius:50%;cursor:pointer;background:${color}`;
      boton.onclick = () => {
        this.setValue(color);
        Blockly.DropDownDiv.hideIfOwner(this);
      };
      grilla.appendChild(boton);
    }
    Blockly.DropDownDiv.getContentDiv().appendChild(grilla);
    Blockly.DropDownDiv.showPositionedByField(this);
  }
}
Blockly.fieldRegistry.register('ab_campo_color', CampoColor);

export default categoria(
  'luces',
  '#9966FF',
  {
    ab_led: {
      args: [
        menu('ESTADO', [
          ['%{BKY_AB_ENCENDER}', 'HIGH'],
          ['%{BKY_AB_APAGAR}', 'LOW'],
        ]),
        pin(),
      ],
      ...INSTRUCCION,
    },
    ab_led_brillo: { args: [pinPwm(), valor('BRILLO', 'Number')], ...INSTRUCCION },
    ab_led_rgb: {
      args: [pinPwm('R'), pinPwm('G'), pinPwm('B'), { type: 'ab_campo_color', name: 'COLOR' }],
      ...INSTRUCCION,
    },
  },
  [
    { type: 'ab_led', fields: { ESTADO: 'HIGH', PIN: '13' } },
    { type: 'ab_led', fields: { ESTADO: 'LOW', PIN: '13' } },
    { type: 'ab_led_brillo', fields: { PIN: '9' }, inputs: { BRILLO: num(50) } },
    { type: 'ab_led_rgb', fields: { R: '9', G: '10', B: '11' } },
  ],
);
