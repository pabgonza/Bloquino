/**
 * Diálogo «Crear un bloque» (y «Editar el bloque»), como el de Scratch: el
 * nombre, las entradas y los rótulos en el orden en que se agregan, y una
 * vista previa de su sombrero «definir».
 */
import { useEffect, useRef, useState } from 'react';
import { Blockly } from '../blockly';
import { tema } from '../tema';
import { type Definir, type Parte, nuevaDefinicion } from '../catalogo/misBloques';
import { crear, editar, validar } from '.';

const AGREGAR: [Parte['tipo'], string][] = [
  ['numero', 'AB_DIALOGO_NUMERO'],
  ['texto', 'AB_DIALOGO_TEXTO'],
  ['sino', 'AB_DIALOGO_SINO'],
  ['rotulo', 'AB_DIALOGO_ROTULO'],
];
const TIPO = { numero: 'AB_TIPO_NUMERO', texto: 'AB_TIPO_TEXTO', sino: 'AB_TIPO_SINO', rotulo: 'AB_TIPO_ROTULO' };
const msg = (clave: string) => Blockly.Msg[clave];

interface Props {
  ws: Blockly.WorkspaceSvg;
  definicion?: Definir;
  cerrar: () => void;
}

export default function Dialogo({ ws, definicion, cerrar }: Props) {
  const [partes, setPartes] = useState<Parte[]>(
    () => definicion?.partes.map((p) => ({ ...p })) ?? [{ tipo: 'nombre', texto: '', id: 'nombre' }],
  );
  const vista = useRef<HTMLDivElement>(null);
  const previa = useRef<Blockly.WorkspaceSvg>(null);
  const error = validar(partes, ws, definicion?.definicion);

  useEffect(() => {
    const w = Blockly.inject(vista.current!, {
      readOnly: true,
      renderer: 'zelos',
      theme: tema,
      media: '/blockly-media/',
    });
    previa.current = w;
    return () => w.dispose();
  }, []);
  useEffect(() => {
    const w = previa.current!;
    w.clear();
    Blockly.serialization.blocks.append({ ...nuevaDefinicion('', partes), x: 10, y: 10 }, w);
  }, [partes]);

  const cambiar = (i: number, texto: string) =>
    setPartes(partes.map((p, j) => (j === i ? { ...p, texto } : p)));
  const agregar = (tipo: Parte['tipo']) => {
    // Nombres distintos de partida: número, número2…
    const base = msg(TIPO[tipo as keyof typeof TIPO]);
    const iguales = partes.filter((p) => p.texto === base || p.texto.match(new RegExp(`^${base}\\d+$`))).length;
    const texto = tipo === 'rotulo' || !iguales ? base : `${base}${iguales + 1}`;
    setPartes([...partes, { tipo, texto, id: Blockly.utils.idGenerator.genUid() }]);
  };
  const aceptar = () => {
    if (error) return;
    if (definicion) editar(definicion, partes);
    else crear(ws, partes);
    cerrar();
  };

  return (
    <div className="ab-dialogo-fondo" onMouseDown={(e) => e.target === e.currentTarget && cerrar()}>
      <form
        className="ab-dialogo"
        onSubmit={(e) => (e.preventDefault(), aceptar())}
        onKeyDown={(e) => e.key === 'Escape' && cerrar()}
      >
        <h3>{msg(definicion ? 'AB_DIALOGO_EDITAR' : 'AB_DIALOGO_CREAR')}</h3>
        <div ref={vista} className="ab-dialogo-vista" />
        <label className="ab-dialogo-fila">
          <span>{msg('AB_DIALOGO_NOMBRE')}</span>
          <input autoFocus value={partes[0].texto} onChange={(e) => cambiar(0, e.target.value)} />
        </label>
        {partes.map(
          (p, i) =>
            i > 0 && (
              <div key={p.id} className="ab-dialogo-fila">
                <span>{msg(TIPO[p.tipo as keyof typeof TIPO])}</span>
                <input autoFocus value={p.texto} onChange={(e) => cambiar(i, e.target.value)} />
                <button type="button" onClick={() => setPartes(partes.filter((_, j) => j !== i))}>
                  {msg('AB_DIALOGO_QUITAR')}
                </button>
              </div>
            ),
        )}
        <div className="ab-dialogo-agregar">
          {AGREGAR.map(([tipo, clave]) => (
            <button key={tipo} type="button" onClick={() => agregar(tipo)}>
              {msg(clave)}
            </button>
          ))}
        </div>
        <p className="ab-dialogo-error">{error}</p>
        <div className="blocklyDialogButtonRow">
          <button type="button" onClick={cerrar}>
            {msg('AB_DIALOGO_CANCELAR')}
          </button>
          <button type="submit" className="blocklyDialogConfirmButton" disabled={!!error}>
            {msg('AB_DIALOGO_ACEPTAR')}
          </button>
        </div>
      </form>
    </div>
  );
}
