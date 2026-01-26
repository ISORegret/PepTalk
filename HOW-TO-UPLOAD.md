# 📤 How to Upload to GitHub - Step by Step

## Prerequisites
- GitHub account (create one at github.com if needed)
- Git installed on your computer

### Check if Git is installed:
Open Terminal/Command Prompt and type:
```bash
git --version
```

If not installed:
- **Windows**: Download from https://git-scm.com/download/win
- **Mac**: Run `brew install git` or download from https://git-scm.com
- **Linux**: Run `sudo apt-get install git`

---

## Step 1: Create GitHub Repository

1. Go to https://github.com and sign in
2. Click the **+** icon (top right) → **New repository**
3. Fill in:
   - **Repository name**: `health-tracker-app` (or your choice)
   - **Description**: "Personal health tracking app for medications and weight"
   - **Public** or **Private** (your choice)
   - ⚠️ **DO NOT check**: Initialize with README, .gitignore, or license
4. Click **Create repository**
5. **LEAVE THIS PAGE OPEN** - you'll need the URL

---

## Step 2: Upload Your Code

### Option A: Use the Upload Script (Easiest)

**On Mac/Linux:**
1. Open Terminal
2. Navigate to your project folder:
   ```bash
   cd health-tracker-app
   ```
3. Make the script executable:
   ```bash
   chmod +x UPLOAD-TO-GITHUB.sh
   ```
4. Run it:
   ```bash
   ./UPLOAD-TO-GITHUB.sh
   ```
5. Follow the prompts!

**On Windows:**
1. Open Command Prompt
2. Navigate to your project folder:
   ```cmd
   cd health-tracker-app
   ```
3. Run the script:
   ```cmd
   UPLOAD-TO-GITHUB.bat
   ```
4. Follow the prompts!

### Option B: Manual Commands

Open Terminal/Command Prompt in the `health-tracker-app` folder and run these commands one by one:

```bash
# Initialize git
git init

# Add all files (INCLUDING hidden folders like .github)
git add -A

# Create first commit
git commit -m "Initial commit: Health Tracker App"

# Add your GitHub repository
# Replace YOUR_USERNAME and REPO_NAME with your actual values
git remote add origin https://github.com/YOUR_USERNAME/health-tracker-app.git

# Set the main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note**: When prompted for credentials, use your GitHub username and a **Personal Access Token** (not your password).

### Creating a Personal Access Token (if needed):
1. GitHub → Settings (your profile) → Developer settings
2. Personal access tokens → Tokens (classic) → Generate new token
3. Select scopes: `repo` (full control)
4. Generate and **COPY THE TOKEN** (you won't see it again!)
5. Use this token as your password when pushing

---

## Step 3: Enable GitHub Pages

1. Go to your repository: `https://github.com/YOUR_USERNAME/health-tracker-app`
2. Click **Settings** tab
3. Click **Pages** (left sidebar)
4. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions**
5. Wait 2-3 minutes for deployment

---

## Step 4: Access Your Live App

Your app will be live at:
```
https://YOUR_USERNAME.github.io/health-tracker-app
```

Check deployment status:
- Go to **Actions** tab in your repo
- You should see a workflow running
- Green checkmark = deployed successfully!

---

## Troubleshooting

### "Permission denied" error?
- You need to authenticate with a Personal Access Token (see above)

### ".github folder not uploading"?
- The script uses `git add -A` which includes hidden files
- Hidden folders (starting with .) are SUPPOSED to be there
- Check by running: `git status` - you should see `.github/workflows/deploy.yml`

### "Failed to deploy" on GitHub Pages?
1. Check **Actions** tab for error details
2. Make sure **Source** is set to "GitHub Actions" (not "Deploy from branch")
3. Wait 5 minutes and refresh

### App shows blank page?
- Check browser console (F12)
- Make sure you're accessing the correct URL
- Try clearing cache (Ctrl+Shift+R or Cmd+Shift+R)

### Still stuck?
- The `.github` folder MUST be uploaded for auto-deployment to work
- Run `ls -la` (Mac/Linux) or `dir /a` (Windows) to see hidden files
- The folder should be there in your project

---

## Alternative: Use GitHub Desktop (No Command Line!)

1. Download GitHub Desktop: https://desktop.github.com
2. Open GitHub Desktop
3. File → Add Local Repository → Choose your `health-tracker-app` folder
4. Make initial commit (bottom left)
5. Publish repository (top right)
6. Follow Step 3 above to enable Pages

---

## Quick Reference

**Future updates:**
```bash
git add .
git commit -m "Your change description"
git push
```

**Need help?** Open an issue on GitHub or check README.md
