# 🎯 Quick Setup Guide - Social Features + File Attachments

## What You Have Now

✅ **Social Database Schema** - `social_setup_clean.sql`
✅ **Social Service Layer** - `src/services/social.ts`  
✅ **Enhanced Social UI** - `src/components/SocialPage.tsx` with file attachments
✅ **AI Migration Complete** - Now using Mistral AI

## 🚀 Setup Steps (5 minutes)

### Step 1: Run Database Migration

1. Open **Supabase Dashboard** → SQL Editor
2. Copy **entire contents** of `social_setup_clean.sql`
3. Paste and click **Run**
4. ✅ You should see 14 tables created

### Step 2: Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

This loads the new Mistral AI key from `.env.local`

### Step 3: Test Everything

1. **Test AI Connection**:
   - Go to AI page
   - Click "Test Connection"
   - Should show "✅ Mistral AI - Connected"

2. **Test Social Features**:
   - Navigate to Social page
   - Try creating a post
   - Click "Attach Files" to add study materials
   - Upload files or select from your notes/flashcards/quizzes

## 🎨 Social Features You Get

### Core Features:
- ✅ Create posts with text, images, and attachments
- ✅ Like & comment on posts
- ✅ Follow/unfollow users
- ✅ Study groups
- ✅ Achievements & streaks
- ✅ Trending topics
- ✅ Notifications
- ✅ Save posts

### NEW: LinkedIn-Style Attachments:
- ✅ Attach your notes to posts
- ✅ Attach flashcard decks
- ✅ Attach quizzes
- ✅ Upload files (PDFs, images, documents)
- ✅ Multiple attachments per post
- ✅ Preview attached materials

## 📁 File Structure

```
social_setup_clean.sql          ← Run this in Supabase
src/services/social.ts           ← All social functions ready
src/components/SocialPage.tsx   ← UI with attachment support
.env.local                       ← Mistral API key configured
```

## 🔑 Environment Variables Check

Your `.env.local` should have:
```env
VITE_MISTRAL_API_KEY=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
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```

Plus your existing Supabase credentials.

## ⚡ Quick Test Checklist

- [ ] Restart dev server
- [ ] Run `social_setup_clean.sql` in Supabase
- [ ] Test AI connection (should show Mistral AI)
- [ ] Create a test post on Social page
- [ ] Try attaching a file to a post
- [ ] Try attaching a note/flashcard/quiz

## 🎯 How to Use Attachments

1. **Create a Post**: Click on Social page
2. **Click "Attach Files"** button
3. **Choose attachment type**:
   - Notes - Select from your existing notes
   - Flashcards - Select flashcard decks
   - Quizzes - Select quizzes
   - Files - Upload new files
4. **Add multiple attachments** if needed
5. **Click "Post"** to share

## 📊 Database Tables Created

```
✅ user_profiles          - Extended user info
✅ social_posts           - Posts with attachment arrays
✅ post_likes             - Like tracking
✅ post_comments          - Comments system
✅ comment_likes          - Comment likes
✅ user_followers         - Follow relationships
✅ study_groups           - Group functionality
✅ study_group_members    - Group membership
✅ study_group_posts      - Group posts
✅ user_achievements      - Achievement badges
✅ study_streaks          - Study tracking
✅ trending_topics        - Popular topics
✅ user_notifications     - Notification system
✅ saved_posts            - Save functionality
```

## 🔒 Security Built-In

- ✅ Row Level Security (RLS) on all tables
- ✅ Users can only attach their own materials
- ✅ Post visibility controls (public/followers/private)
- ✅ Automatic profile creation on signup
- ✅ Secure file uploads

## 💡 Pro Tips

### Attachments:
- You can attach up to multiple notes, flashcards, quizzes, AND files in one post
- Attachments are stored as simple arrays in the `social_posts` table
- Files are uploaded to Supabase Storage (need to create bucket if using files)

### Performance:
- All tables have indexes for fast queries
- Views pre-join common data
- Automatic counters for likes/comments

### User Experience:
- Attachment picker shows in tabs (Notes | Flashcards | Quizzes | Files)
- Selected attachments show with remove buttons
- Loading states for smooth UX

## 🐛 Troubleshooting

### "API key not configured" error:
→ Restart dev server to load new .env.local

### Social page shows "Beta" banner:
→ That's normal! It's still in production

### Can't attach files:
→ Need to create a storage bucket named 'post-files' in Supabase

### Posts not showing:
→ Check that you ran the SQL migration

### AI still showing Google errors:
→ Clear browser cache and hard refresh (Cmd+Shift+R)

## ✅ You're All Set!

Everything is ready to use:
- ✅ AI migrated to Mistral
- ✅ Social database schema ready
- ✅ Attachment system built
- ✅ UI components ready

Just restart the server and you're good to go! 🚀

---

**Questions?** Check the error logs in browser console for detailed info.

**Happy coding! 💻✨**
