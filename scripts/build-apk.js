#!/usr/bin/env node
/**
 * Build APK: bump version, Gradle debug build, copy android/.../PepTalk-debug.apk → website/PepTalk.apk,
 * refresh website/index.html version strings.
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const isWin = process.platform === 'win32';
const gradleCmd = isWin ? 'gradlew.bat' : './gradlew';

const noBump = process.argv.includes('--no-bump');

// 1. Bump version (skip in CI — use committed package.json / App.jsx / build.gradle)
if (!noBump) {
  execSync('node scripts/bump-version.js', { cwd: root, stdio: 'inherit' });
} else {
  console.log('Skipping version bump (--no-bump). Using versions already in the repo.\n');
}

// 2. Build web + sync to Android
execSync('npm run build:android', { cwd: root, stdio: 'inherit' });

// 3. Build APK
execSync(`${gradleCmd} assembleDebug`, { cwd: path.join(root, 'android'), stdio: 'inherit' });

// 4. Copy debug APK → website/PepTalk.apk (no manual move; this is the file GitHub Pages serves)
const apkSrc = path.join(root, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'PepTalk-debug.apk');
const apkDest = path.join(root, 'website', 'PepTalk.apk');
if (!fs.existsSync(apkSrc)) {
  console.error(`APK not found at ${apkSrc} — run Gradle build first (step 3).`);
  process.exit(1);
}
fs.mkdirSync(path.dirname(apkDest), { recursive: true });
fs.copyFileSync(apkSrc, apkDest);
console.log(`Copied ${path.relative(root, apkSrc)} → ${path.relative(root, apkDest)}`);

// 5. Update version in website/index.html (placeholders + any vX.Y.Z in meta / .version lines)
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version;
const indexPath = path.join(root, 'website', 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');
indexHtml = indexHtml.replace(/__APK_VERSION__/g, version);
indexHtml = indexHtml.replace(/PepTalk v\d+\.\d+\.\d+ —/g, `PepTalk v${version} —`);
indexHtml = indexHtml.replace(/<p class="version">v\d+\.\d+\.\d+<\/p>/g, `<p class="version">v${version}</p>`);
fs.writeFileSync(indexPath, indexHtml);

console.log(`\nwebsite/index.html updated for v${version}. Commit website/PepTalk.apk + push to deploy.`);
