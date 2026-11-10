const w = window as unknown as { define?: unknown; __amdDefine?: unknown };
w.define = w.__amdDefine;
