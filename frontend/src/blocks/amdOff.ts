// Blockly se distribuye como UMD. Monaco deja un `define` AMD global, y con él
// presente Blockly se registra en ese cargador en vez de exportar. Se oculta
// `define` mientras se evalúa Blockly (ver amdOn.ts).
const w = window as unknown as { define?: unknown; __amdDefine?: unknown };
w.__amdDefine = w.define;
w.define = undefined;
