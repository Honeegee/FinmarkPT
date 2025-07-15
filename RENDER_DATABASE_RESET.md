# Reset Production Database in Render

## Option 1: Delete and Create New Database (Recommended for Development)

### Steps in Render Dashboard:
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Navigate to your PostgreSQL database service
3. Click on the database service (not your web service)
4. Go to "Settings" tab
5. Scroll down to "Danger Zone"
6. Click "Delete Database"
7. Confirm deletion

### Create New Database:
1. Click "New +" → "PostgreSQL"
2. Choose same region as your web service
3. Use same database name: `finmark_db`
4. Choose free tier or paid tier as needed
5. Click "Create Database"

### Connect to Web Service:
1. Go to your web service → "Environment" tab
2. Update `DATABASE_URL` with the new connection string
3. Or connect via Render's database connection feature

### Initialize New Database:
1. After deployment, visit: `https://your-app-url.onrender.com/api/init-db` (GET or POST)
2. This will create all tables including the new Google OAuth columns (`name`, `profile_picture`, `google_id`)
3. You should see: `{"message": "Database initialized successfully", "status": "initialized"}`
4. If already initialized, you'll see: `{"message": "Database already initialized", "status": "ready"}`

## Option 2: Keep Existing Database and Run Migration

If you prefer to keep existing data:
1. Configure environment variables first
2. Deploy your service
3. Visit: `https://your-app-url.onrender.com/api/migrate/google-oauth`
4. This adds the missing columns without losing data

## Recommendation

**For development/testing**: Use Option 1 (delete and recreate)
- Faster and cleaner
- No risk of migration issues
- Fresh start with all required columns

**For production with real users**: Use Option 2 (migration)
- Preserves existing user data
- Safer for live applications

Since you're still in development phase, I recommend **Option 1** - it's simpler and ensures everything is set up correctly from the start.