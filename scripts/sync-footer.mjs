import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pub = path.join(root, 'public');
const designVersion = 'v0.3.0';
const brandVersion = 'v1.3.0';
const designRaw = 'https://raw.githubusercontent.com/desarrollamo/design-system';
const brandRaw = 'https://raw.githubusercontent.com/desarrollamo/branding';

const fetchText = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`No se pudo descargar ${url}: ${response.status}`);
  return response.text();
};

const [css, corporateHtml, logo] = await Promise.all([
  fetchText(`${designRaw}/${designVersion}/dist/footer.css`),
  fetchText(`${designRaw}/${designVersion}/components/footer/corporate.html`),
  fetchText(`${brandRaw}/${brandVersion}/assets/logo/horizontal.svg`)
]);

const staticDir = path.join(pub, 'static');
await fs.mkdir(staticDir, { recursive: true });
await fs.writeFile(path.join(staticDir, 'desarrollamo-footer.css'), css, 'utf8');await fs.writeFile(path.join(staticDir, 'desarrollamo-brand-horizontal.svg'), logo, 'utf8');

const remoteLogo = `https://cdn.jsdelivr.net/gh/desarrollamo/branding@${brandVersion}/assets/logo/horizontal.svg`;
const currentYear = String(new Date().getFullYear());
const footer = corporateHtml
  .replaceAll(remoteLogo, '/static/desarrollamo-brand-horizontal.svg')
  .replace(/(<span data-amo-year>)\d{4}(<\/span>)/, `$1${currentYear}$2`);

const start = '<!-- DESARROLLAMO-FOOTER:START -->';
const end = '<!-- DESARROLLAMO-FOOTER:END -->';
const cssLink = '<link rel="stylesheet" href="/static/desarrollamo-footer.css" data-desarrollamo-footer />';
const legacyStyle = /<style>\s*\.amo-footer\s*\{[\s\S]*?<\/style>/gi;
const legacyMarkup = /<footer class="amo-footer">[\s\S]*?<\/footer>/gi;
const managedFooter = /<!-- DESARROLLAMO-FOOTER:START -->[\s\S]*?<!-- DESARROLLAMO-FOOTER:END -->/gi;

const htmlFiles = [];
const walk = async (dir) => {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
};
await walk(pub);let changed = 0;
for (const file of htmlFiles) {
  let html = await fs.readFile(file, 'utf8');
  const before = html;
  html = html.replace(managedFooter, '').replace(legacyStyle, '').replace(legacyMarkup, '');
  html = html.replace(/<!-- DesarrollAMO Footer -->\s*/gi, '');
  html = html.replace(/<link[^>]+data-desarrollamo-footer[^>]*>\s*/gi, '');
  if (!html.includes('</head>') || !html.includes('</body>')) throw new Error(`HTML incompleto: ${path.relative(pub, file)}`);
  html = html.replace('</head>', `${cssLink}\n</head>`);
  html = html.replace('</body>', `${start}\n${footer.trim()}\n${end}\n</body>`);
  if (html !== before) {
    await fs.writeFile(file, html, 'utf8');
    changed += 1;
  }
}
console.log(`Footer ${designVersion} sincronizado en ${htmlFiles.length} HTML (${changed} modificados)`);