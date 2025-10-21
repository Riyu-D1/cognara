# 📸 Profile Picture Setup Guide

## ✅ Easy Setup (No SQL Required!)

### Step 1: Create Storage Bucket in Supabase Dashboard

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Sign in if needed
   - Select your project: **StudyNet** or your project name

2. **Navigate to Storage:**
   - Click **"Storage"** in the left sidebar
   - You'll see the Storage page

3. **Create New Bucket:**
   - Click the **"New bucket"** button (green button, top right)
   - Fill in the form:
     - **Name:** `user-content`
     - **Public bucket:** ✅ **CHECK THIS BOX** (Very important!)
     - **File size limit:** 50MB (default is fine)
     - **Allowed MIME types:** Leave empty (allows all)
   - Click **"Create bucket"**

4. **Verify Bucket is Created:**
   - You should see `user-content` in the list of buckets
   - It should show as "Public" in the list

### Step 2: Set Bucket Policies (Using Dashboard UI)

1. **Click on your `user-content` bucket**

2. **Go to Policies:**
   - Click the **"Policies"** tab at the top
   - You'll see "No policies created yet"

3. **Add Upload Policy:**
   - Click **"New Policy"** button
   - Select **"For full customization"**
   - Or click **"Create a new policy from scratch"**
   
   **Policy Details:**
   - **Policy name:** `Allow authenticated users to upload avatars`
   - **Allowed operation:** `INSERT`
   - **Target roles:** `authenticated`
   - **USING expression:**
     ```sql
     (bucket_id = 'user-content'::text) AND (auth.role() = 'authenticated'::text)
     ```
   - Click **"Review"** then **"Save policy"**

4. **Add Read Policy (Public Access):**
   - Click **"New Policy"** again
   - **Policy name:** `Allow public to view avatars`
   - **Allowed operation:** `SELECT`
   - **Target roles:** `public`
   - **USING expression:**
     ```sql
     (bucket_id = 'user-content'::text)
     ```
   - Click **"Review"** then **"Save policy"**

5. **Add Update Policy:**
   - Click **"New Policy"** again
   - **Policy name:** `Allow users to update their avatars`
   - **Allowed operation:** `UPDATE`
   - **Target roles:** `authenticated`
   - **USING expression:**
     ```sql
     (bucket_id = 'user-content'::text) AND (auth.role() = 'authenticated'::text)
     ```
   - Click **"Review"** then **"Save policy"**

6. **Add Delete Policy:**
   - Click **"New Policy"** again
   - **Policy name:** `Allow users to delete their avatars`
   - **Allowed operation:** `DELETE`
   - **Target roles:** `authenticated`
   - **USING expression:**
     ```sql
     (bucket_id = 'user-content'::text) AND (auth.role() = 'authenticated'::text)
     ```
   - Click **"Review"** then **"Save policy"**

---

## 🚀 Quick Alternative: Use Template Policies

Supabase has built-in policy templates that are easier:

1. In the **Policies** tab, look for policy templates
2. Select **"Enable read access for all users"** → Save
3. Select **"Enable insert access for authenticated users"** → Save
4. Select **"Enable update access for authenticated users"** → Save
5. Select **"Enable delete access for authenticated users"** → Save

---

## ✅ Verification

After setup, test the upload:

1. Go to Settings page in your app
2. Click the Edit button on your avatar
3. Select an image (< 2MB recommended)
4. Watch the browser console (F12) for logs:
   ```
   ✅ "Available storage buckets:" [Array with user-content]
   ✅ "Upload successful:"
   ✅ "Avatar uploaded successfully:"
   ```

---

## 🔍 Troubleshooting

### "Failed to upload" Error

**Check Console Logs:**
Open browser console (F12) and look for:

1. **"Available storage buckets:"**
   - If `user-content` is NOT in the list → Bucket not created
   - If empty array → No buckets exist

2. **"Permission denied"**
   - Policies not set correctly
   - Go back to Policies tab and add them

3. **"Bucket not found"**
   - Bucket name is wrong
   - Make sure it's exactly: `user-content` (lowercase, with dash)

### Using Base64 Fallback (Temporary)

If you can't set up storage right now:
- The app will automatically use base64 encoding
- You'll see: "Profile picture updated! (Using temporary storage)"
- Images stored in database (not ideal for long-term)
- Set up storage later for better performance

---

## 📋 Summary Checklist

- [ ] Created `user-content` bucket
- [ ] Made bucket **Public**
- [ ] Added INSERT policy (authenticated users)
- [ ] Added SELECT policy (public)
- [ ] Added UPDATE policy (authenticated users)
- [ ] Added DELETE policy (authenticated users)
- [ ] Tested upload in app
- [ ] Saw success message

---

## 💡 Pro Tips

1. **Keep images small:** Under 500KB is ideal for profile pictures
2. **Use square images:** They look best as circular avatars
3. **Check bucket size:** Supabase free tier has storage limits
4. **Monitor usage:** Check Storage dashboard for usage stats

---

## 🆘 Still Having Issues?

If setup doesn't work:

1. **Check your Supabase plan:** Free tier should work fine
2. **Verify project is active:** Check dashboard
3. **Try base64 fallback:** Works without storage setup
4. **Check browser console:** Look for specific error messages
5. **Contact support:** Share console logs for help

---

## 🎉 Success!

Once working, your profile picture will:
- ✅ Upload to Supabase Storage
- ✅ Show everywhere in the app
- ✅ Persist across sessions
- ✅ Be publicly accessible
- ✅ Load fast from CDN

Enjoy your new profile picture feature! 📸
