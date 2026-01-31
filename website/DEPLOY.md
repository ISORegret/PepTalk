# How to Deploy the PepTalk Download Website (Free)

## Option 1: Netlify (easiest — no account setup beyond signup)

1. **Get your files ready**
   - Put `PepTalk.apk` inside the `website` folder (next to `index.html`).
   - You should have: `website/index.html`, `website/README.md`, `website/PepTalk.apk`.

2. **Go to Netlify**
   - Open https://app.netlify.com in your browser.
   - Sign up free (email, or “Sign up with GitHub” if you use GitHub).

3. **Deploy**
   - On the Netlify dashboard, find **“Add new site”** → **“Deploy manually”** (or “Drag and drop”).
   - **Drag your entire `website` folder** (the folder that contains `index.html` and `PepTalk.apk`) into the drop zone.
   - Wait for the upload to finish.

4. **Get your URL**
   - Netlify will show a link like `https://random-name-12345.netlify.app`.
   - That’s your live download site. You can change the name in **Site settings** → **Domain management** → **Edit site name** (e.g. `peptalk-download.netlify.app`).

**Updating the APK later:** Drag and drop the `website` folder again with the new `PepTalk.apk` inside it; Netlify will replace the old deploy.

---

## Option 2: GitHub Pages (good if you already use GitHub)

1. **Create a new repo** (e.g. `peptalk-download`) on GitHub. Don’t add a README.

2. **Put the site in that repo**
   - In the repo, the **contents** of your `website` folder must be at the **root** of the repo (so `index.html` and `PepTalk.apk` in the root).
   - Either:
     - Create the repo, clone it, then copy `index.html` and `PepTalk.apk` into the clone’s root, commit, and push; or
     - Use GitHub’s web interface: “uploading an existing file” and add `index.html` and `PepTalk.apk`.

3. **Turn on GitHub Pages**
   - Repo → **Settings** → **Pages**.
   - Under “Source” choose **Deploy from a branch**.
   - Branch: **main** (or **master**), folder: **/ (root)**.
   - Save.

4. **Your URL** will be: `https://YOUR_USERNAME.github.io/peptalk-download` (replace with your GitHub username and repo name).

**Note:** GitHub has a **100 MB per file** limit. If `PepTalk.apk` is larger, use Netlify instead (also 100 MB per file on free tier, but sometimes more forgiving) or host the APK elsewhere and change the button in `index.html` to point to that URL.

---

## Option 3: Vercel

1. Go to https://vercel.com and sign up (free).
2. **Add New** → **Project** → **Import** and connect your Git repo, **or** use the Vercel CLI and run `vercel` in your project folder.
3. Set **Root Directory** to `website` (so only the website folder is deployed).
4. Deploy. Your site will get a URL like `https://your-project.vercel.app`.

If you don’t use Git: use **Netlify** with drag-and-drop; it’s the simplest.

---

## Summary

| Host        | Best for              | Easiest? |
|------------|------------------------|----------|
| **Netlify** | Anyone; drag & drop   | Yes      |
| GitHub Pages | Already using GitHub  | Medium   |
| Vercel     | Already using Git/Vercel | Medium   |

**Recommendation:** Use **Netlify** and “Deploy manually” by dragging the `website` folder. No Git or command line required.
