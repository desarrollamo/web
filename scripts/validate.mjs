import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pub = path.join(root, 'public');
const required = ['index.html','servicios/index.html','galeria/index.html','manifiesto/index.html','faq/index.html','privacy/index.html','cookies/index.html','servicios.html','galeria.html'];
for (const rel of required) {
  if (!fs.existsSync(path.join(pub, rel))) throw new Error(`Falta ruta pública requerida: ${rel}`);
}

const files = [];
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
  const full = path.join(dir, entry.name);
  entry.isDirectory() ? walk(full) : files.push(full);
});
walk(pub);

const forbidden = /\.(py|ps1|fish|toml|mts)$/i;
for (const file of files) {
  if (forbidden.test(file)) throw new Error(`Archivo interno expuesto en public/: ${path.relative(pub, file)}`);
}
if (files.length < 60) throw new Error(`Snapshot incompleto: sólo ${files.length} archivos`);
console.log(`Web baseline: validación PASS (${files.length} archivos publicables)`);
