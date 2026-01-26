# Setup Guide: Upload to GitHub & Deploy

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon in the top right → **New repository**
3. Name it `health-tracker-app` (or whatever you prefer)
4. Make it **Public** or **Private** (your choice)
5. **Do NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**

## Step 2: Upload Your Code

Open your terminal in the `health-tracker-app` folder and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Health tracker app"

# Add your GitHub repository as remote
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/health-tracker-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to GitHub Pages (Automatic)

### Enable GitHub Pages:

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Source**, select **GitHub Actions**
4. That's it! The app will automatically deploy when you push changes

### Your app will be live at:
```
https://YOUR_USERNAME.github.io/health-tracker-app
```

The GitHub Actions workflow will automatically build and deploy your app whenever you push to the `main` branch.

## Step 4: Make Updates

Whenever you make changes:

```bash
git add .
git commit -m "Description of your changes"
git push
```

The app will automatically redeploy!

## Alternative: Deploy to Vercel (Easier!)

If you prefer Vercel (easier and faster):

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New** → **Project**
3. Import your `health-tracker-app` repository
4. Click **Deploy**
5. Done! Your app is live at `https://your-app.vercel.app`

Vercel automatically redeploys when you push to GitHub.

## Alternative: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **Add new site** → **Import an existing project**
3. Connect to GitHub and select your repository
4. Build settings should auto-detect (Vite)
5. Click **Deploy**

Or use Netlify Drop (easiest):
1. Run `npm run build` locally
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag and drop the `dist/` folder
4. Done!

## Troubleshooting

### "Failed to deploy" on GitHub Pages?
- Make sure you selected **GitHub Actions** as the source in Settings → Pages
- Check the **Actions** tab to see if the workflow ran successfully

### App shows blank page?
- Check browser console for errors (F12)
- Make sure `base: './'` is set in `vite.config.js`

### Data not saving?
- Data is stored in browser localStorage
- Try a different browser or clear cache and reload

## Need Help?

Open an issue on GitHub or check the README.md for more details.
