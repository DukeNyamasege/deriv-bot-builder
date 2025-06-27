# 🚀 Deployment Instructions

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click the "+" icon → "New repository"
3. Repository name: `deriv-bot-builder` (or your preferred name)
4. Description: `Deriv Trading Bot Builder - Create automated trading strategies without coding`
5. Make it **Public**
6. **Don't** initialize with README, .gitignore, or license
7. Click "Create repository"

## Step 2: Push to GitHub

After creating the repository, run these commands in your terminal:

```bash
# Add GitHub remote (replace with your actual GitHub username and repo name)
git remote add origin https://github.com/YOURUSERNAME/YOURREPONAME.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Deploy to Netlify

### Option A: Connect GitHub Repository (Recommended)

1. Go to [Netlify.com](https://netlify.com)
2. Sign up/Login (you can use your GitHub account)
3. Click "New site from Git"
4. Choose "GitHub" as your Git provider
5. Select your repository
6. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18` (add environment variable: `NODE_VERSION=18`)
7. Click "Deploy site"

### Option B: Manual Deploy

1. Go to [Netlify.com](https://netlify.com)
2. Drag and drop your `dist` folder to the deploy area
3. Your site will be deployed instantly

## Step 4: Configure Custom Domain (Optional)

1. In Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions

## Step 5: Environment Variables (If needed)

If your app requires environment variables:
1. Go to Site settings → Environment variables
2. Add your variables:
   - `NODE_VERSION=18`
   - Any API keys or configuration needed

## 🎉 Your Site is Live!

Your Deriv Trading Bot Builder will be available at:
- Netlify URL: `https://your-site-name.netlify.app`
- Custom domain (if configured): `https://yourdomain.com`

## 📝 Next Steps

1. Update the README.md with your actual deployment URL
2. Test all features on the live site
3. Share your amazing trading bot builder with the world!

## 🔧 Troubleshooting

### Build Fails
- Check Node.js version (should be 18.x)
- Verify build command: `npm run build`
- Check for any missing environment variables

### Site Not Loading
- Verify publish directory is set to `dist`
- Check browser console for errors
- Ensure all assets are properly built

### Need Help?
- Check Netlify documentation
- Review build logs in Netlify dashboard
- Contact support if needed
