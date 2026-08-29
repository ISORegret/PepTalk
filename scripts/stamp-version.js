import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const appPath = new URL('../src/App.jsx', import.meta.url);
const source = fs.readFileSync(appPath, 'utf8');
const pattern = /const APP_VERSION = '[^']+';/;

if (!pattern.test(source)) {
  throw new Error('APP_VERSION declaration was not found in src/App.jsx');
}

const next = source.replace(pattern, `const APP_VERSION = '${pkg.version}';`);
fs.writeFileSync(appPath, next);
console.log(`Stamped PepTalk ${pkg.version}`);
