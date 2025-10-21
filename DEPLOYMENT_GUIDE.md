# 🚀 Deployment Guide - Environment Variables Setup

## Problem
Your app works locally but API keys fail on the deployed version because `.env` files are not pushed to GitHub and therefore not available in production.

## Solution
You need to add environment variables to your hosting platform.

---

## Netlify Deployment

### Step 1: Add Environment Variables
1. Go to https://app.netlify.com
2. Select your **StudyNet** site
3. Click **Site settings** in the top navigation
4. In the left sidebar, click **Environment variables**
5. Click **Add a variable** button

### Step 2: Add These Variables One by One

**Variable 1: Mistral AI / OpenRouter API Key**
- Key: `VITE_MISTRAL_API_KEY`
- Value: `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`
- Scopes: All (Production, Deploy Previews, Branch deploys)

**Variable 2: Google AI Backup Key**
- Key: `VITE_GOOGLE_AI_KEY`
- Value: `AIzaSyBMmRv9y-ZdqDRdcPoGErYsXdcBAg0ZEKg`
- Scopes: All

**Variable 3: YouTube API Key**
- Key: `VITE_YOUTUBE_API_KEY`
- Value: `AIzaSyBQPe014hsgMViSzah-93_p24d30_I7a64`
- Scopes: All

**Variable 4: Supabase URL**
- Key: `VITE_SUPABASE_URL`
- Value: `https://boakwacemdiqpayoixfa.supabase.co`
- Scopes: All

**Variable 5: Supabase Anon Key**
- Key: `VITE_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvYWt3YWNlbWRpcXBheW9peGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTkyOTAsImV4cCI6MjA3MjIzNTI5MH0.MStSGJVf3OlK1SZzxvAzOA-ypytfb0jOf0nnchbU2r`
- Scopes: All

### Step 3: Trigger Redeploy
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Wait for the build to complete (2-3 minutes)
4. Test your site - APIs should now work! ✅

---

## Vercel Deployment

### Step 1: Add Environment Variables
1. Go to https://vercel.com/dashboard
2. Select your **StudyNet** project
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Add each variable:

### Step 2: Add Variables

For each variable, add:
- **Name**: The key name (e.g., `VITE_MISTRAL_API_KEY`)
- **Value**: The value from above
- **Environments**: Select all (Production, Preview, Development)
- Click **Save**

Use the same keys and values as listed in the Netlify section above.

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **three dots (...)** → **Redeploy**
4. Wait for deployment to complete
5. Test your site ✅

---

## Important Notes

### ⚠️ Security
- Never commit `.env` files to GitHub
- Keep your API keys secret
- Rotate keys if they get exposed

### 🔄 Updating Variables
- If you change API keys in your local `.env`, remember to update them in your hosting platform too
- Any time you update environment variables, you need to redeploy

### 🧪 Testing After Deployment
1. Go to your deployed site
2. Navigate to the AI page
3. Click "Test Connection" button
4. Both Mistral AI and YouTube API should show "Connected" ✅

---

## Quick Copy-Paste for Netlify CLI (Alternative Method)

If you have Netlify CLI installed, you can also add variables via command line:

```bash
netlify env:set VITE_MISTRAL_API_KEY "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"
netlify env:set VITE_GOOGLE_AI_KEY "AIzaSyBMmRv9y-ZdqDRdcPoGErYsXdcBAg0ZEKg"
netlify env:set VITE_YOUTUBE_API_KEY "AIzaSyBQPe014hsgMViSzah-93_p24d30_I7a64"
netlify env:set VITE_SUPABASE_URL "https://boakwacemdiqpayoixfa.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvYWt3YWNlbWRpcXBheW9peGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTkyOTAsImV4cCI6MjA3MjIzNTI5MH0.MStSGJVf3OlK1SZzxvAzOA-ypytfb0jOf0nnchbU2r"
```

Then trigger a redeploy.

---

## Troubleshooting

### Problem: Variables not working after adding
**Solution**: Make sure you:
1. Spelled the variable names EXACTLY as shown (including `VITE_` prefix)
2. Clicked "Save" for each variable
3. Triggered a NEW deployment (old deployments won't have the variables)

### Problem: Still getting "API key not configured"
**Solution**: 
1. Check browser console for the actual error
2. Verify the variable names match exactly
3. Make sure Vite variables start with `VITE_`
4. Clear browser cache and try again

### Problem: Works locally but not in production
**Solution**: This confirms it's an environment variable issue - follow the steps above carefully

---

## After Setup ✅

Once you've added all environment variables and redeployed:
- ✅ AI Chat should work
- ✅ YouTube video analysis should work
- ✅ Profile pictures should upload
- ✅ All Supabase features should work

Your deployed app will now have the same functionality as your local development version! 🎉
