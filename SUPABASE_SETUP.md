# Supabase Setup Guide

## Getting Supabase API Keys

Supabase provides the database and authentication backend for the StudyFlow application. Here's how to get your keys:

### Step 1: Create a Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign up with GitHub, Google, or email

### Step 2: Create a New Project
1. Click "New Project" in your dashboard
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: StudyFlow (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
4. Click "Create new project"
5. Wait 2-3 minutes for project setup

### Step 3: Get Your API Keys
1. In your project dashboard, go to **Settings** → **API**
2. You'll find two important keys:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: `eyJ...` (long string starting with eyJ)

### Step 4: Update Your .env File
Add these lines to your `.env` file:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 5: Set Up Database Tables (Optional)
The app will work with basic functionality, but for full features:
1. Go to **SQL Editor** in your Supabase dashboard
2. Run the SQL script from `database_migration.sql` in the project root

## Quick Alternative: Skip Supabase for Now

If you want to test AI features immediately without database setup:
1. The app will use local storage for data persistence
2. All AI chat, notes, flashcards, and quizzes will work
3. Data won't sync across devices (local only)

## Free Tier Limits
- 500MB database storage
- 2GB bandwidth per month
- 50MB file uploads
- Perfect for testing and personal use!

## Need Help?
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com/)