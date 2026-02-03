# SpotFinder download website

A **standalone** landing page for the **SpotFinder Android APK** — deploy this folder as its own site (e.g. Netlify, Cloudflare). Do not add it to the PepTalk website.

## 1. Add your APK

After building the APK (see `../docs/DOWNLOADABLE-APK.md`):

1. Download the APK from the EAS Build dashboard (or from your local build).
2. Rename it to **`SpotFinder.apk`** (if needed).
3. Put **`SpotFinder.apk`** in this folder, next to `index.html`.

You should have: `website/index.html`, `website/README.md`, `website/SpotFinder.apk`.

## 2. Deploy

Deploy the **contents** of this folder (including `index.html` and `SpotFinder.apk`):

- **Netlify** — Drag and drop this folder at [app.netlify.com](https://app.netlify.com) → Deploy manually.
- **Cloudflare Pages** — Upload the folder (note: Cloudflare has a **25 MB per file** limit; if the APK is larger, host the APK elsewhere and set the download link in `index.html` to that URL).
- **Vercel** — Import the project or drag this folder.
- **Your own server** — Upload the folder so `index.html` and `SpotFinder.apk` are in the same directory.

After each new build, replace `SpotFinder.apk` in the deployed folder with your latest APK.

## 3. Optional: different APK name or URL

- If the file is in the same folder: `href="SpotFinder.apk"` (already set in `index.html`).
- If the APK is hosted elsewhere: set `href="https://yoursite.com/files/SpotFinder.apk"` in `index.html`.
