const fs = require('fs');
const zlib = require('zlib');
const path = 'profile-saves/default.championshipeditor.v1.00.sav';
const buf = fs.readFileSync(path);
console.log('File bytes:', buf.length);
console.log('Header:', buf.slice(0, 16).toString('hex'));
console.log('ASCII header guess:', buf.slice(0, 32).toString());
const methods = {
  gunzip: () => zlib.gunzipSync(buf),
  inflate: () => zlib.inflateSync(buf),
  inflateRaw: () => zlib.inflateRawSync(buf),
  brotli: () => zlib.brotliDecompressSync(buf)
};
for (const [name, fn] of Object.entries(methods)) {
  try {
    const out = fn();
    console.log(`${name}: success, ${out.length} bytes`);
  } catch (err) {
    console.log(`${name}: fail -> ${err.message}`);
  }
}
