import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(root, 'public', 'index.html');
const index = await readFile(indexPath);
assertAscii(index, indexPath);
const html = index.toString('ascii');
const sources = [...html.matchAll(/<script defer src="([^"]+)"/g)].map((match) => match[1]);
const requiredPrefix = ['/ui/dom-1.js', '/ui/dom-2.js', '/ui/api.js', '/ui/open-form.js', '/ui/app-core.js'];
if (
  sources.length < 10 ||
  sources.at(-1) !== '/ui/app-start.js' ||
  sources.includes('/app.js') ||
  !sources.includes('/ui/product-development.js') ||
  requiredPrefix.some((source, index) => sources[index] !== source)
) {
  console.error('Standalone UI script order is invalid.');
  process.exit(1);
}
const compiled = [];
for (const source of sources) {
  if (!source.startsWith('/ui/')) throw new Error(`Unexpected script path: ${source}`);
  const file = path.join(root, 'public', 'modules', path.basename(source));
  const bytes = await readFile(file);
  assertAscii(bytes, file);
  compiled.push({ source, script: new vm.Script(bytes.toString('ascii'), { filename: file }) });
}
const context = vm.createContext({
  console,
  Date,
  Intl,
  URL,
  setTimeout: () => 0,
  clearTimeout: () => {},
  sessionStorage: { getItem: () => '', setItem: () => {}, removeItem: () => {} },
  document: { querySelector: () => ({}) },
});
for (const item of compiled) {
  if (item.source === '/ui/app-start.js') continue;
  item.script.runInContext(context);
}
console.log(`Standalone UI contract OK (${sources.length} scripts checked and ${compiled.length - 1} executed).`);

function assertAscii(buffer, file) {
  if ([...buffer].some((byte) => byte > 127)) {
    console.error(`Non-ASCII source detected: ${path.relative(root, file)}`);
    process.exit(1);
  }
}
