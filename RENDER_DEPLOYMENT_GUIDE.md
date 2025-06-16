# 🚀 Simple Render Deployment Guide

## Quick Setup Steps

### 1. Push Your Code to GitHub
```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2. Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### 3. Deploy Your Application
1. Click **"New +"** in Render dashboard
2. Select **"Blueprint"**
3. Connect your GitHub repository (`FinMark`)
4. Render will automatically detect the `render.yaml` file
5. Click **"Apply"**

### 4. Wait for Deployment
- Database will be created first
- Backend service will deploy
- Frontend service will deploy
- This takes about 5-10 minutes

### 5. Access Your Application
Your apps will be available at:
- **Frontend**: `https://finmark-frontend.onrender.com`
- **Backend**: `https://finmark-backend.onrender.com`

## What's Included

✅ **PostgreSQL Database** (Free tier - 90 days retention)
✅ **Frontend Service** (Next.js app)
✅ **Backend Service** (User authentication API)
✅ **Automatic HTTPS**
✅ **Environment Variables** (Auto-generated secrets)

## Important Notes

- **Free Tier Limits**: Services sleep after 15 minutes of inactivity
- **Cold Starts**: First request after sleep takes ~30 seconds
- **Database**: 90-day retention on free tier
- **Bandwidth**: Unlimited on free tier

## If You Need Help

1. Check the **Render Dashboard** for build logs
2. Services must be **"Live"** (green status)
3. Database must be **"Available"**

## Environment Variables

The following will be automatically set:
- `DATABASE_URL` - Connected to PostgreSQL
- `JWT_SECRET` - Auto-generated
- `JWT_REFRESH_SECRET` - Auto-generated
- `FRONTEND_URL` - Points to frontend service

That's it! Your FinMark application will be live on Render. 🎉