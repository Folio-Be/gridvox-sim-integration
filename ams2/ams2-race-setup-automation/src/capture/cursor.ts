import ffi from 'ffi-napi';
import ref from 'ref-napi';
import createStruct from 'ref-struct-di';

const Struct = createStruct(ref);

const POINT = Struct({
  x: 'long',
  y: 'long',
});

const user32 = ffi.Library('user32', {
  GetCursorPos: ['bool', [ref.refType(POINT)]],
});

export interface CursorPosition {
  x: number;
  y: number;
}

export function getCursorPosition(): CursorPosition {
  const point = new POINT();
  const success = user32.GetCursorPos(point.ref());
  if (!success) {
    return { x: -1, y: -1 };
  }
  return { x: point.x, y: point.y };
}
