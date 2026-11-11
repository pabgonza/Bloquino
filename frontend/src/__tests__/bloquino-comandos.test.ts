// @vitest-environment jsdom
/**
 * Los botones Iniciar / Detener simulación de la página de alumno (h3) no
 * tienen lógica propia: llaman los comandos que registra el toolbar de Velxio
 * al montarse. Si Velxio los renombra, este test avisa.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import '../i18n';
import { EditorToolbar } from '../components/editor/EditorToolbar';
import { hasEditorCommand } from '../lib/editorCommands';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let raiz: Root | undefined;
afterEach(() => act(() => raiz?.unmount()));

describe('comandos de simulación', () => {
  it('el toolbar de Velxio registra sim.run y sim.stop al montarse', async () => {
    expect(hasEditorCommand('sim.run')).toBe(false);
    raiz = createRoot(document.body.appendChild(document.createElement('div')));
    await act(async () => {
      raiz!.render(
        createElement(
          MemoryRouter,
          null,
          createElement(EditorToolbar, {
            consoleOpen: false,
            setConsoleOpen: () => {},
            compileLogs: [],
            setCompileLogs: () => {},
          }),
        ),
      );
    });
    expect(hasEditorCommand('sim.run')).toBe(true);
    expect(hasEditorCommand('sim.stop')).toBe(true);
  });
});
