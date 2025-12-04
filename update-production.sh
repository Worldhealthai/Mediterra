#!/bin/bash

# Mediterra Admin Panel - Production Update Helper Script
# This script helps you deploy changes made in the admin panel to production

echo "🚀 Mediterra Production Update Helper"
echo "======================================"
echo ""

# Check if site-data.json exists
if [ ! -f "site-data.json" ]; then
    echo "❌ Error: site-data.json not found!"
    echo ""
    echo "Please make sure you:"
    echo "1. Opened the admin panel (admin.html)"
    echo "2. Made your changes"
    echo "3. Clicked 'Save Changes'"
    echo "4. Downloaded the site-data.json file"
    echo "5. Moved it to this project folder"
    echo ""
    exit 1
fi

echo "✓ Found site-data.json"
echo ""

# Show what will be committed
echo "📝 Changes to be committed:"
echo "   - site-data.json (images and content updates)"
echo ""

# Ask for confirmation
read -p "Do you want to commit and push these changes? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled."
    exit 1
fi

# Get the current branch
BRANCH=$(git branch --show-current)
echo ""
echo "📌 Current branch: $BRANCH"
echo ""

# Add, commit, and push
echo "⏳ Adding changes..."
git add site-data.json

echo "⏳ Committing changes..."
git commit -m "Update site images and content via admin panel"

echo "⏳ Pushing to remote..."
git push -u origin "$BRANCH"

echo ""
echo "✅ Success! Your changes have been pushed."
echo ""
echo "🌐 Your production site will be updated after deployment completes."
echo "   Check your hosting platform (Vercel/Netlify) for deployment status."
echo ""
