# Downloadable APK for SpotFinder

Build an Android APK and host it on a **standalone** website so anyone can download and install SpotFinder without the Play Store. This is a **separate site** (e.g. spotfinder-download.netlify.app) — not part of the PepTalk website.

---

## Overview

1. **Build** the APK with **EAS Build** (Expo’s cloud build).
2. **Download** the APK from the Expo dashboard.
3. **Put** the APK in the `website` folder (rename to `SpotFinder.apk`).
4. **Deploy** the `website` folder to Netlify, Cloudflare Pages, or your own host.

---

## Step 1: One-time setup (Expo account + EAS)

1. **Expo account** (free): https://expo.dev/signup  
2. **EAS CLI** (one time):
   ```bash
   npm install -g eas-cli
   eas login
   ```
3. **Link the project** (from the **spotfinder** folder):
   ```bash
   cd spotfinder
   eas init
   ```
   This links the project to your Expo account. The project already has `eas.json` with a **preview** profile that builds an **APK** (not AAB).

---

## Step 2: Build the APK

From the **spotfinder** folder:

```bash
eas build --platform android --profile preview
```

- EAS will build in the cloud (first time may ask for Android keystore — choose “Let EAS create one”).
- When the build finishes, the Expo dashboard will show a **download link** for the APK.

---

## Step 3: Download and add APK to website

1. Open https://expo.dev/accounts/[your-account]/projects/spotfinder/builds  
2. Click the latest **Android** build and **Download** the APK.
3. Rename the file to **`SpotFinder.apk`** (if needed).
4. Put **`SpotFinder.apk`** inside the **`spotfinder/website`** folder, next to `index.html`.

You should have:

- `spotfinder/website/index.html`
- `spotfinder/website/SpotFinder.apk`
- `spotfinder/website/README.md`

---

## Step 4: Deploy the website (like PepTalk)

Deploy the **contents** of the `spotfinder/website` folder.

### Option A: Netlify (easiest)

1. Go to https://app.netlify.com and sign up (free).
2. **Add new site** → **Deploy manually** (or **Drag and drop**).
3. **Drag the entire `website` folder** (with `index.html` and `SpotFinder.apk` inside) into the drop zone.
4. Netlify will give you a URL (e.g. `https://random-name-12345.netlify.app`). You can rename it in Site settings (e.g. `spotfinder-download.netlify.app`).

**Updating the APK:** Drag and drop the `website` folder again with the new `SpotFinder.apk`; Netlify will replace the deploy.

### Option B: Cloudflare Pages

1. Go to https://dash.cloudflare.com → Pages → Create a project → Direct Upload.
2. Upload the **contents** of the `website` folder (so `index.html` and `SpotFinder.apk` are in the root of the upload).

**Note:** Cloudflare has a **25 MB per file** limit. If `SpotFinder.apk` is larger than 25 MB, host the APK elsewhere (e.g. Google Drive, Dropbox, or a file host) and change the download link in `index.html` to that URL (e.g. `href="https://your-file-url/SpotFinder.apk"`).

### Option C: Your own server

Upload the `website` folder via FTP/SFTP so that `index.html` and `SpotFinder.apk` are in the same directory. The “Download APK” button will point to `SpotFinder.apk` in the same folder.

---

## File size notes

- **GitHub:** 100 MB per file limit. If you commit the APK to a repo, keep it under 100 MB.
- **Netlify:** Typically allows large files; check current limits.
- **Cloudflare Pages:** 25 MB per file. If the APK is bigger, host the APK elsewhere and set `href="https://..."` in `index.html`.

---

## Summary

| Step | Command / action |
|------|------------------|
| 1 | `npm install -g eas-cli` → `eas login` → `cd spotfinder` → `eas init` |
| 2 | `eas build --platform android --profile preview` |
| 3 | Download APK from Expo dashboard → rename to `SpotFinder.apk` → put in `spotfinder/website/` |
| 4 | Deploy `website` folder to Netlify (or Cloudflare / your server) |

After that, your **standalone** download page (separate from PepTalk) (e.g. `https://spotfinder-download.netlify.app`) will offer **Download APK**; users install the APK on their Android device (they may need to allow “Install from this source” in settings).

Keep this download site separate from any PepTalk website.
