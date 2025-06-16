# 🆓 Render Manual Free Deployment Guide

Skip the render.yaml to avoid payment requirements. Deploy each service manually:

## Step 1: Create Free PostgreSQL Database

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **"New +"** → **"PostgreSQL"**
3. Fill out:
   - **Name**: `finmark-database`
   - **Database**: `finmark`
   - **User**: `finmark_user`
   - **Region**: Oregon (US-West)
   - **PostgreSQL Version**: 15
   - **Plan**: **FREE** (important!)
4. Click **"Create Database"**
5. **Save the connection details** from the dashboard

## Step 2: Deploy Backend Service (User Service)

1. Click **"New +"** → **"Web Service"**
2. Connect your **GitHub repository** (`FinmarkPT`)
3. Fill out:
   - **Name**: `finmark-backend`
   - **Region**: Oregon (US-West)
   - **Branch**: `master`
   - **Root Directory**: `user-service`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **FREE** (512MB RAM)

4. **Environment Variables** (Add these):
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<copy from database dashboard>
   JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random
   JWT_REFRESH_SECRET=your-different-refresh-secret-key
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   BCRYPT_ROUNDS=12
   FRONTEND_URL=https://finmark-frontend.onrender.com
   ENABLE_CORS=true
   TRUST_PROXY=true
   ```

5. Click **"Create Web Service"**

## Step 3: Deploy Frontend Service (Next.js)

1. Click **"New +"** → **"Web Service"**
2. Connect your **GitHub repository** (`FinmarkPT`)
3. Fill out:
   - **Name**: `finmark-frontend`
   - **Region**: Oregon (US-West)
   - **Branch**: `master`
   - **Root Directory**: `finmark-ecommerce`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: **FREE** (512MB RAM)

4. **Environment Variables** (Add these):
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<copy from database dashboard>
   NEXT_PUBLIC_API_URL=https://finmark-backend.onrender.com
   ```

5. Click **"Create Web Service"**

## Step 4: Wait for Deployment

- **Database**: ~2 minutes
- **Backend**: ~5 minutes
- **Frontend**: ~5 minutes

## Step 5: Test Your Application

Your services will be available at:
- **Frontend**: `https://finmark-frontend.onrender.com`
- **Backend**: `https://finmark-backend.onrender.com`
- **Health Checks**: 
  - `https://finmark-backend.onrender.com/health`
  - `https://finmark-frontend.onrender.com/api/health`

## Important Notes

✅ **Completely FREE** - No credit card required
✅ **512MB RAM** per service on free tier
✅ **PostgreSQL** with 90-day retention
✅ **Automatic HTTPS** and custom domains
⚠️ **Services sleep** after 15 minutes of inactivity
⚠️ **Cold start** takes ~30 seconds after sleep

## Troubleshooting

**If services fail to start:**
1. Check **"Logs"** tab in Render dashboard
2. Ensure **environment variables** are set correctly
3. Verify **database connection string** is correct
4. Make sure **build commands** complete successfully

**Database Connection:**
- Copy the **full DATABASE_URL** from your database dashboard
- Paste it exactly in both services' environment variables

That's it! Your FinMark application will be live on Render's free tier! 🎉