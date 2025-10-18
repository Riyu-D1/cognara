# 📸 Supabase Storage Bucket Setup Guide

## Quick 2-Minute Setup for Profile Pictures

### Step 1: Create the Storage Bucket
1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click **Storage** in the left sidebar
4. Click **"New bucket"** button (green button on the right)
5. Fill in the form:
   - **Name**: `user-content` (exactly this name!)
   - **Public bucket**: ✅ Check this box (IMPORTANT!)
   - **File size limit**: Leave default or set to 5MB
   - **Allowed MIME types**: Leave empty (allows all image types)
6. Click **"Create bucket"**

### Step 2: Set Up Bucket Policies
After creating the bucket, you need to add policies so users can upload their profile pictures:

1. Stay in **Storage** section
2. Click on the **"user-content"** bucket you just created
3. Go to the **"Policies"** tab at the top
4. Click **"New Policy"** button

#### Policy 1: Allow Public Read (View Images)
- Click **"Create policy"**
- Policy Name: `Public read access`
- Allowed operation: **SELECT** (check this box)
- Policy definition: 
  ```sql
  true
  ```
- Click **"Review"** then **"Save policy"**

#### Policy 2: Allow Authenticated Upload
- Click **"Create policy"** again
- Policy Name: `Authenticated users can upload`
- Allowed operation: **INSERT** (check this box)
- Policy definition:
  ```sql
  (bucket_id = 'user-content'::text)
  ```
- Click **"Review"** then **"Save policy"**

#### Policy 3: Allow Users to Update Their Own Files
- Click **"Create policy"** again
- Policy Name: `Users can update their own files`
- Allowed operation: **UPDATE** (check this box)
- Policy definition:
  ```sql
  (bucket_id = 'user-content'::text) AND (auth.uid() = owner)
  ```
- Click **"Review"** then **"Save policy"**

#### Policy 4: Allow Users to Delete Their Own Files
- Click **"Create policy"** again
- Policy Name: `Users can delete their own files`
- Allowed operation: **DELETE** (check this box)
- Policy definition:
  ```sql
  (bucket_id = 'user-content'::text) AND (auth.uid() = owner)
  ```
- Click **"Review"** then **"Save policy"**

### Step 3: Verify Setup
1. Go back to **Storage** > **user-content** bucket
2. You should see 4 policies listed
3. The bucket should show as **"Public"**

### Step 4: Test Upload
1. Go back to your app
2. Try uploading a profile picture
3. It should now upload successfully! 🎉

---

## ⚡ Even Faster: Use Supabase Policy Templates

Instead of creating policies manually, you can use templates:

1. In the **Policies** tab, click **"New Policy"**
2. Look for these templates:
   - **"Enable read access for all users"** - Use this for Policy 1
   - **"Enable insert for authenticated users only"** - Use this for Policy 2
   - **"Enable update for users based on user_id"** - Modify for Policy 3
   - **"Enable delete for users based on user_id"** - Modify for Policy 4

---

## 🔍 Troubleshooting

### Issue: "Bucket not found" error
**Solution**: Make sure the bucket name is exactly `user-content` (lowercase, with hyphen)

### Issue: "Permission denied" error  
**Solution**: Check that you created all 4 policies, especially the INSERT policy for uploads

### Issue: "Cannot upload files"
**Solution**: Make sure you checked **"Public bucket"** when creating the bucket

### Issue: Images not loading
**Solution**: Verify the SELECT (read) policy is set to `true` for public access

---

## 📝 What This Does

- ✅ Creates a public storage bucket for user-uploaded content
- ✅ Allows anyone to view/download images (for profile pictures)
- ✅ Allows authenticated users to upload images
- ✅ Allows users to update/delete only their own images
- ✅ Stores images efficiently (not as base64 in database)
- ✅ Provides CDN-backed URLs for fast loading

---

## 🎯 After Setup

Once you complete these steps:
1. Profile picture uploads will work properly
2. Images will be stored in Supabase Storage (not database)
3. You'll get proper image URLs (not base64)
4. Images will load faster via Supabase CDN

The base64 fallback will still work if storage isn't set up, but this is the proper production setup! 🚀
