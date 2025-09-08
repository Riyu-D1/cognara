# OAuth Troubleshooting Guide for Cognara

## 🔍 Current Issue: "Refused to Connect" Error

The "refused to connect" error after OAuth redirect typically happens due to URL mismatches between your Supabase configuration and your actual deployment URL.

## 🛠 Steps to Fix Google OAuth

### 1. Check Your Current Deployment URL
First, determine what URL your app is actually running on:
- If using Figma Make: Note the exact URL shown in your browser
- Common formats: `https://your-app-name.figma-make.com` or similar

### 2. Update Supabase OAuth Configuration

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project: `boakwacemdiqpayoixfa`

2. **Navigate to Authentication → URL Configuration**
   - Click on "Authentication" in the left sidebar
   - Go to "URL Configuration" tab

3. **Update Site URL**
   - Set "Site URL" to your actual deployment URL
   - Example: `https://your-app-name.figma-make.com`

4. **Update Redirect URLs**
   - Add your deployment URL to "Redirect URLs"
   - Format: `https://your-app-name.figma-make.com`
   - You can add multiple URLs (one per line) for different environments

### 3. Update Google OAuth App Settings

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com
   - Select your project (or create one)

2. **Navigate to APIs & Services → Credentials**
   - Find your OAuth 2.0 Client ID

3. **Update Authorized Redirect URIs**
   - Add: `https://boakwacemdiqpayoixfa.supabase.co/auth/v1/callback`
   - Add: `https://your-actual-deployment-url` (if needed)

4. **Update Authorized JavaScript Origins**
   - Add your deployment URL: `https://your-app-name.figma-make.com`

### 4. Verify Configuration

After updating both Supabase and Google settings:

1. **Wait 5-10 minutes** for changes to propagate
2. **Clear your browser cache** or try in incognito mode
3. **Test the Google OAuth flow again**

## 🐛 Debug Information

The app now shows debug information when OAuth errors occur:

- **Red error box**: Shows the actual error message
- **Blue debug box**: Shows technical details and current URL
- **Console logs**: Check browser developer tools for detailed logs

## 🔧 Common Issues & Solutions

### Issue 1: "redirect_uri_mismatch"
**Solution**: Make sure the redirect URI in Google Cloud Console exactly matches your Supabase auth callback URL

### Issue 2: "unauthorized_client"
**Solution**: Verify your Google OAuth client ID and secret are correctly entered in Supabase

### Issue 3: "access_denied"
**Solution**: User cancelled the OAuth flow or permissions are incorrectly configured

### Issue 4: Page refresh after OAuth
**Solution**: This is normal - the app should handle the OAuth callback and sign you in automatically

## 📧 Email Authentication Still Works

Remember: Email/password authentication works immediately without any OAuth setup:

1. Click "Sign up" at the bottom of the login form
2. Enter email and password (6+ characters)  
3. Click "Create Account"
4. You'll be signed in and can use all Cognara features

## 🔍 Step-by-Step Debugging

1. **Try OAuth login**
2. **Check the debug info** (blue box) that appears if there are issues
3. **Look in browser console** (F12 → Console) for detailed error logs
4. **Verify URLs match** between Supabase, Google Console, and your deployment
5. **Test email auth** as backup to ensure app functionality

## 📞 Need Help?

If you're still having issues:

1. Share the exact error message from the debug box
2. Confirm your actual deployment URL  
3. Check that URLs match in all three places:
   - Your actual app URL
   - Supabase Dashboard → Authentication → URL Configuration
   - Google Cloud Console → Credentials → Your OAuth Client