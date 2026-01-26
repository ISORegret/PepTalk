#!/bin/bash

echo "🚀 Health Tracker - GitHub Upload Script"
echo "========================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first:"
    echo "   - Windows: https://git-scm.com/download/win"
    echo "   - Mac: brew install git"
    echo "   - Linux: sudo apt-get install git"
    exit 1
fi

# Get GitHub username and repo name
read -p "Enter your GitHub username: " USERNAME
read -p "Enter repository name (default: health-tracker-app): " REPO_NAME
REPO_NAME=${REPO_NAME:-health-tracker-app}

echo ""
echo "📝 Summary:"
echo "   Username: $USERNAME"
echo "   Repository: $REPO_NAME"
echo "   URL: https://github.com/$USERNAME/$REPO_NAME"
echo ""
read -p "Is this correct? (y/n): " CONFIRM

if [[ $CONFIRM != "y" ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "📦 Initializing git repository..."
git init

echo "📄 Adding all files (including hidden folders)..."
git add -A

echo "💾 Creating first commit..."
git commit -m "Initial commit: Health Tracker App"

echo "🔗 Adding remote repository..."
git remote add origin "https://github.com/$USERNAME/$REPO_NAME.git"

echo "🌿 Setting main branch..."
git branch -M main

echo "📤 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Done! Your code is now on GitHub!"
echo ""
echo "🌐 Next Steps:"
echo "1. Go to: https://github.com/$USERNAME/$REPO_NAME"
echo "2. Click Settings → Pages"
echo "3. Under 'Source', select: GitHub Actions"
echo "4. Your app will be live at: https://$USERNAME.github.io/$REPO_NAME"
echo ""
