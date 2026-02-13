#!/usr/bin/env node
/**
 * Bump app version before APK build.
 * 1.0.2 → 1.0.3 → ... → 1.0.10 → 1.2.0 (patch 10 → minor+2, patch reset)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const appPath = path.join(root, 'src', 'App.jsx');
const gradlePath = path.join(root, 'android', 'app', 'build.gradle');

// Read current version from App.jsx (source of truth for display)
const appContent = fs.readFileSync(appPath, 'utf8');
const match = appContent.match(/APP_VERSION = '([^']+)'/);
if (!match) {
  console.error('Could not find APP_VERSION in App.jsx');
  process.exit(1);
}
const current = match[1];
const parts = current.split('.').map(Number);
let [major, minor, patch] = parts;

// Bump: patch++; when patch hits 10 → minor += 2, patch = 0
patch += 1;
if (patch >= 10) {
  minor += 2;
  patch = 0;
}
const next = `${major}.${minor}.${patch}`;

// versionCode: read current, increment (Android requires it to increase each release)
let versionCode = 1;
const gradleContent = fs.readFileSync(gradlePath, 'utf8');
const codeMatch = gradleContent.match(/versionCode (\d+)/);
if (codeMatch) versionCode = parseInt(codeMatch[1], 10) + 1;

console.log(`Bumping version: ${current} → ${next} (versionCode: ${versionCode})`);

// Update package.json
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.version = next;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

// Update App.jsx
fs.writeFileSync(appPath, appContent.replace(
  /APP_VERSION = '[^']+'/,
  `APP_VERSION = '${next}'`
));

// Update android/app/build.gradle
let gradleUpdated = gradleContent.replace(/versionCode \d+/, `versionCode ${versionCode}`);
gradleUpdated = gradleUpdated.replace(/versionName "[^"]+"/, `versionName "${next}"`);
fs.writeFileSync(gradlePath, gradleUpdated);

console.log('Updated: package.json, src/App.jsx, android/app/build.gradle');
