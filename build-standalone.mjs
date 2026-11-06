// Genera una versión autónoma del juego en un único archivo HTML.
// Se puede abrir con doble clic (file://), sin servidor ni conexión.
import { build } from 'esbuild';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const tmp = path.join(root, '.tmp-standalone');
const outDir = path.join(root, 'descarga');
const outFile = path.join(outDir, 'Consejo-de-Seguridad.html');

await rm(tmp, { recursive: true, force: true });
await mkdir(tmp, { recursive: true });
await mkdir(outDir, { recursive: true });

await build({
  entryPoints: [path.join(root, 'src/main.js')],
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  minify: true,
  legalComments: 'none',
  outdir: tmp,
  loader: { '.css': 'css' },
  logLevel: 'warning',
});

const js = (await readFile(path.join(tmp, 'main.js'), 'utf8')).replace(/<\/script/gi, '<\\/script');
const css = (await readFile(path.join(tmp, 'main.css'), 'utf8')).replace(/<\/style/gi, '<\\/style');
let html = await readFile(path.join(root, 'index.html'), 'utf8');

const scriptTag = '<script type="module" src="/src/main.js"></script>';
if (!html.includes(scriptTag)) {
  throw new Error('No se encontró la etiqueta del módulo en index.html');
}

// Reemplazos con función: el JS minificado contiene secuencias como `$&`
// que String.replace interpretaría como patrones especiales.
html = html.replace(scriptTag, () => `<script>\n${js}\n</script>`);
html = html.replace('</head>', () => `  <style>\n${css}\n</style>\n</head>`);

await writeFile(outFile, html, 'utf8');
await rm(tmp, { recursive: true, force: true });

const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`HTML autónomo generado: ${path.relative(root, outFile)} (${kb} kB)`);
