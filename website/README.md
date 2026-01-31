# PepTalk Download Page

A simple landing page to download the PepTalk Android APK.

## Setup

1. **Add your APK**  
   Copy `PepTalk.apk` (from `android/app/build/outputs/apk/release/`) into this `website` folder so it sits next to `index.html`.  
   The download link points to `PepTalk.apk` in the same directory.

2. **Optional: different APK name or URL**  
   Edit `index.html` and change the button link:
   - Same folder: `href="PepTalk.apk"`
   - Or a full URL: `href="https://yoursite.com/files/PepTalk.apk"`

## Deploy

Deploy the **contents** of the `website` folder (including `index.html` and `PepTalk.apk`):

- **GitHub Pages** — push this folder to a repo and enable Pages (e.g. from `main` / `docs` or a `gh-pages` branch).
- **Netlify** — drag the `website` folder into Netlify, or connect the repo and set publish directory to `website`.
- **Vercel** — same idea: set root or publish directory to `website`.
- **Your own server** — upload the folder via FTP/SFTP so `index.html` and `PepTalk.apk` are in the same directory.

After each new build, replace `PepTalk.apk` in the deployed folder with your latest APK.
