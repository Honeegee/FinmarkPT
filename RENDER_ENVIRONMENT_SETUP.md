# Render Environment Variables Configuration Guide

## Required Environment Variables for Production

Follow these steps to configure your environment variables in the Render dashboard:

### 1. Access Render Dashboard
1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Navigate to your FinMark service
3. Click on "Environment" tab

### 2. Add the Following Environment Variables

#### Authentication & JWT Secrets
```
JWT_SECRET=finmark-super-secret-key-2024-production
JWT_REFRESH_SECRET=finmark-refresh-secret-key-2024-production
NEXTAUTH_SECRET=your-nextauth-secret-key-production
```

#### Google OAuth Configuration
```
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

#### Application URLs
```
NEXTAUTH_URL=https://your-render-app-url.onrender.com
```

#### Database Configuration (if not using Render's connected database)
```
DATABASE_URL=your-postgresql-connection-string
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=finmark_db
DB_USER=your-db-user
DB_PASSWORD=your-db-password
```

### 3. Important Notes

#### Security Best Practices:
- **NEVER** use the same secrets in production as in development
- Generate strong, unique secrets for production
- Use different Google OAuth credentials for production

#### JWT Secrets:
- Generate strong random strings (at least 32 characters)
- You can use: `openssl rand -base64 32` to generate secure secrets

#### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your production domain to authorized origins:
   - `https://your-render-app-url.onrender.com`
6. Add callback URL:
   - `https://your-render-app-url.onrender.com/api/auth/google/callback`

### 4. Step-by-Step Render Configuration

1. **Login to Render Dashboard**
   - Go to dashboard.render.com
   - Find your FinMark service

2. **Navigate to Environment Tab**
   - Click on your service
   - Click "Environment" in the left sidebar

3. **Add Each Variable**
   - Click "Add Environment Variable"
   - Enter the key (e.g., `JWT_SECRET`)
   - Enter the value
   - Click "Save Changes"

4. **Redeploy Service**
   - After adding all variables, click "Manual Deploy"
   - Wait for deployment to complete

### 5. Verification Steps

After configuring environment variables:

1. **Check Deployment Logs**
   - Go to "Logs" tab in Render dashboard
   - Look for any environment variable related errors

2. **Test Authentication**
   - Visit your production site
   - Try logging in with Google OAuth
   - Check if `/api/auth/verify` returns 200 instead of 401

3. **Run Database Migration** (if needed)
   - Visit: `https://your-app-url.onrender.com/api/migrate/google-oauth`
   - This ensures the database has the required OAuth columns

### 6. Troubleshooting

If you still get 401 errors:

1. **Check Environment Variables**
   - Ensure all variables are set correctly
   - No typos in variable names
   - Values are properly formatted

2. **Check Google OAuth Configuration**
   - Verify authorized origins include your production domain
   - Callback URL matches exactly

3. **Check Database Connection**
   - Ensure database is accessible from your Render service
   - Run the migration endpoint if needed

### 7. Environment Variables Checklist

- [ ] JWT_SECRET (production value)
- [ ] JWT_REFRESH_SECRET (production value)
- [ ] NEXTAUTH_SECRET (production value)
- [ ] GOOGLE_CLIENT_ID (production OAuth app)
- [ ] GOOGLE_CLIENT_SECRET (production OAuth app)
- [ ] NEXTAUTH_URL (your production URL)
- [ ] Database variables (if using external DB)

### 8. Next Steps After Configuration

1. Redeploy your service
2. Test Google OAuth login
3. Verify `/api/auth/verify` endpoint works
4. Test complete authentication flow

---

**Important**: Replace all placeholder values with your actual production credentials before saving in Render dashboard.