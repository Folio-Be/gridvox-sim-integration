const fs = require('fs');
const buf = fs.readFileSync('profile-saves/default.championshipeditor.v1.00.sav');
const out = [];
let acc = '';
const flush = () => { if (acc.length >= 4) out.push(acc); acc = ''; };
for (const c of buf) {
  if (c >= 32 && c <= 126) {
    acc += String.fromCharCode(c);
  } else {
    flush();
  }
}
flush();
console.log(out.slice(0, 40));
