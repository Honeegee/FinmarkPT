# Google OAuth Setup for Render Deployment

This guide explains how to set up Google OAuth for your FinMark e-commerce application deployed on Render.

## Prerequisites

- A Google Cloud Console account
- Your Render application URL (e.g., `https://your-app-name.onrender.com`)
- Access to your Render dashboard

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project (if you don't have one)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `finmark-ecommerce`
4. Click "Create"

### 1.2 Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" or "People API"
3. Click on it and press "Enable"

### 1.3 Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - **App name**: FinMark E-commerce
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add scopes (optional for basic setup)
5. Add test users if needed
6. Review and submit

### 1.4 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Configure:
   - **Name**: FinMark Production
   - **Authorized JavaScript origins**: 
     - `https://your-app-name.onrender.com`
   - **Authorized redirect URIs**:
     - `https://your-app-name.onrender.com/api/auth/google/callback`
5. Click "Create"
6. **Important**: Copy the Client ID and Client Secret - you'll need these for Render

## Step 2: Render Environment Variables Setup

### 2.1 Access Your Render Service

1. Go to your [Render Dashboard](https://dashboard.render.com/)
2. Select your FinMark service
3. Go to "Environment" tab

### 2.2 Add Google OAuth Variables

Add the following environment variables:

```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Important**: Replace the values with your actual Google OAuth credentials from Step 1.4.

### 2.3 Update NEXTAUTH_URL (if needed)

Make sure your `NEXTAUTH_URL` environment variable is set to your actual Render URL:

```
NEXTAUTH_URL=https://your-actual-app-name.onrender.com
```

## Step 3: Database Migration

Your application needs the Google OAuth database schema. This will be handled automatically on deployment, but you can also trigger it manually:

### 3.1 Automatic Migration (Recommended)

The migration will run automatically when you deploy. The application includes a migration endpoint that will be called during startup.

### 3.2 Manual Migration (if needed)

If you need to run the migration manually:

1. Access your deployed application
2. Make a POST request to: `https://your-app-name.onrender.com/api/migrate/google-oauth`
3. This will add the necessary Google OAuth columns to your database

## Step 4: Testing the Setup

### 4.1 Deploy Your Application

1. Push your code to your connected Git repository
2. Render will automatically deploy your application
3. Wait for the deployment to complete

### 4.2 Test Google OAuth

1. Visit your deployed application: `https://your-app-name.onrender.com`
2. Go to the login page
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. You should be redirected back to your application and logged in

## Step 5: Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**:
   - Check that your redirect URI in Google Console exactly matches: `https://your-app-name.onrender.com/api/auth/google/callback`
   - Ensure there are no trailing slashes or typos

2. **"auth_verification_failed" error**:
   - This was the original issue - it should be resolved with the database migration
   - Check that the migration ran successfully

3. **Environment variables not loading**:
   - Verify all environment variables are set in Render dashboard
   - Restart your service after adding new environment variables

4. **Database connection issues**:
   - Check that your DATABASE_URL is correctly configured
   - Ensure your database is running and accessible

### Debug Endpoints

Your application includes several debug endpoints:

- `GET /api/test-db` - Test database connection and schema
- `POST /api/migrate/google-oauth` - Run Google OAuth migration
- `GET /api/health` - Health check endpoint

## Security Notes

- Never commit your Google OAuth credentials to version control
- Use environment variables for all sensitive configuration
- Regularly rotate your OAuth secrets
- Monitor your Google Cloud Console for unusual activity
- Consider setting up OAuth consent screen verification for production use

## Support

If you encounter issues:

1. Check the Render logs for error messages
2. Verify all environment variables are correctly set
3. Test the debug endpoints to isolate the issue
4. Check Google Cloud Console for any API quota or permission issues

---

**Last Updated**: January 2025
**Version**: 1.0