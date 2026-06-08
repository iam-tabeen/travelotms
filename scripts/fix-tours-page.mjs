import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const target = path.join(path.dirname(fileURLToPath(import.meta.url)), '../app/tours/page.tsx');
let s = fs.readFileSync(target, 'utf8');

const bad = '</' + 'motion-fallback />';
while (s.includes(bad)) {
  s = s.replace(bad, '</div>');
}
s = s.replace(/\n      \)\}\n      \)\}/, '\n      )}');
fs.writeFileSync(target, s);
