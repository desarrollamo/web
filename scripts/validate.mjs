import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pub = path.join(root, 'public');
const required = [
  'index.html','servicios/index.html','galeria/index.html','manifiesto/index.html',
  'faq/index.html','terms/index.html','privacy/index.html','cookies/index.html',
  'payments/index.html','licenses/index.html','static/desarrollamo-footer.css',
  'static/desarrollamo-brand-horizontal.svg'
];
for (const rel of required) if (!fs.existsSync(path.join(pub, rel))) throw new Error(`Falta ruta pública requerida: ${rel}`);

const files = [];
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
  const full = path.join(dir, entry.name);
  entry.isDirectory() ? walk(full) : files.push(full);
});
walk(pub);
for (const file of files) if (/\.(py|ps1|fish|toml|mts)$/i.test(file)) throw new Error(`Archivo interno expuesto: ${path.relative(pub, file)}`);
if (files.length < 60) throw new Error(`Snapshot incompleto: sólo ${files.length} archivos`);

const htmlFiles = files.filter((file) => file.endsWith('.html'));
const count = (text, needle) => text.split(needle).length - 1;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(pub, file);  if (count(html, '<!-- DESARROLLAMO-FOOTER:START -->') !== 1) throw new Error(`Footer sin inicio único: ${rel}`);
  if (count(html, '<!-- DESARROLLAMO-FOOTER:END -->') !== 1) throw new Error(`Footer sin fin único: ${rel}`);
  if (count(html, 'amo-footer--corporate') !== 1) throw new Error(`Footer corporativo no único: ${rel}`);
  if (count(html, 'data-desarrollamo-footer') !== 1) throw new Error(`CSS de footer no único: ${rel}`);
  if ((html.match(/<footer\b/gi) || []).length !== 1) throw new Error(`Cantidad de footer inválida: ${rel}`);
  if (/<!-- DesarrollAMO Footer -->/i.test(html) || /<style>\s*\.amo-footer\s*\{/i.test(html)) throw new Error(`Restos de footer legado: ${rel}`);
  if (/\bTODO\b\s*:|\bFIXME\b/i.test(html)) throw new Error(`Placeholder público: ${rel}`);
}

const policyFiles = ['faq/index.html','terms/index.html','privacy/index.html','cookies/index.html','payments/index.html','licenses/index.html'];
for (const rel of policyFiles) {
  const text = fs.readFileSync(path.join(pub, rel), 'utf8');
  if (/por confirmar|a confirmar|amoedo7|20-36278837-7|\+34 604 28 28 16/i.test(text)) throw new Error(`Política con dato obsoleto/pendiente: ${rel}`);
}

const footerCss = fs.readFileSync(path.join(pub, 'static/desarrollamo-footer.css'), 'utf8');
for (const token of ['.amo-footer','amo-footer__legal','amo-footer__brand']) if (!footerCss.includes(token)) throw new Error(`Footer CSS incompleto: ${token}`);
if (/\bbody\s*\{/i.test(footerCss)) throw new Error('El footer aislado no puede estilizar body');

console.log(`Web v0.2.0: validación PASS (${files.length} archivos, ${htmlFiles.length} HTML)`);