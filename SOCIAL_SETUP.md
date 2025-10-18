# Social Features Setup Guide

This guide explains how to set up and use the StudyFlow social features database.

## 🎯 Overview

The social features are inspired by LinkedIn and Instagram, providing:

- **User Profiles** - Extended profiles with bio, badges, streaks
- **Social Feed** - Public posts with likes, comments, shares
- **Following System** - Follow users like Instagram
- **Study Groups** - Collaborative learning spaces
- **Achievements & Badges** - Gamification elements
- **Trending Topics** - Discover popular subjects
- **Notifications** - Real-time updates for social interactions
- **Saved Posts** - Bookmark content like Instagram

## 📋 Database Setup

### Step 1: Run the Migration

1. Open your Supabase Dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `social_migration.sql`
4. Run the SQL script

This will create:
- 14 new tables for social features
- Row Level Security policies
- Automatic triggers and counters
- Indexes for performance
- Views for common queries

### Step 2: Verify Tables

Check that these tables were created:
- `user_profiles`
- `social_posts`
- `post_likes`
- `post_comments`
- `comment_likes`
- `user_followers`
- `study_groups`
- `study_group_members`
- `study_group_posts`
- `user_achievements`
- `study_streaks`
- `trending_topics`
- `user_notifications`
- `saved_posts`

## 🔑 Key Features

### 1. User Profiles (LinkedIn-style)

Extended user profiles with:
- Display name, bio, avatar, banner
- Study streak and total hours
- Badges and achievements
- Subjects of interest
- Education level and school
- Location and website

```typescript
import { userProfileService } from './services/social';

// Get current user profile
const profile = await userProfileService.getCurrentUserProfile();

// Update profile
await userProfileService.updateUserProfile({
  bio: "Passionate about mathematics and physics",
  subjects_of_interest: ["Mathematics", "Physics"],
  education_level: "High School"
});
```

### 2. Social Feed (Instagram/LinkedIn-style)

Posts with rich features:
- Regular posts, achievements, study updates, questions
- Images and text content
- Tags for categorization
- Visibility control (public, followers, private)
- Like, comment, share functionality

```typescript
import { socialPostsService } from './services/social';

// Get feed posts
const posts = await socialPostsService.getFeedPosts();

// Create a post
await socialPostsService.createPost({
  content: "Just completed my calculus study session!",
  post_type: 'study_update',
  tags: ['Mathematics', 'Calculus'],
  visibility: 'public',
  likes_count: 0,
  comments_count: 0,
  shares_count: 0,
  is_pinned: false
});

// Like a post
await socialPostsService.likePost(postId);

// Save a post (Instagram-style)
await socialPostsService.savePost(postId);
```

### 3. Comments System

Nested comments with likes:
- Comment on posts
- Reply to comments (nested)
- Like comments
- View comment author info

```typescript
import { commentsService } from './services/social';

// Get post comments
const comments = await commentsService.getPostComments(postId);

// Add a comment
await commentsService.createComment(postId, "Great study tips!");

// Reply to a comment
await commentsService.createComment(postId, "Thanks!", parentCommentId);
```

### 4. Following System (Instagram-style)

Follow other students:
- Follow/unfollow users
- View followers and following lists
- See following-only feed

```typescript
import { followersService } from './services/social';

// Follow a user
await followersService.followUser(userId);

// Get followers
const followers = await followersService.getFollowers(userId);

// Get following feed (posts from people you follow)
const followingPosts = await socialPostsService.getFollowingFeedPosts();
```

### 5. Study Groups

Collaborative learning spaces:
- Create public or private groups
- Join/leave groups
- Group posts and discussions
- Schedule study sessions
- Member roles (admin, moderator, member)

```typescript
import { studyGroupsService } from './services/social';

// Get all public groups
const groups = await studyGroupsService.getAllGroups();

// Create a group
await studyGroupsService.createGroup({
  name: "AP Calculus Study Group",
  description: "Preparing for AP Calc exam",
  subject: "Mathematics",
  visibility: 'public',
  max_members: 50,
  members_count: 1,
  next_session: "2025-10-20T15:00:00Z"
});

// Join a group
await studyGroupsService.joinGroup(groupId);
```

### 6. Achievements & Streaks (LinkedIn-style)

Gamification features:
- Track study streaks
- Award achievements
- Display badges on profile
- Celebrate milestones

```typescript
import { achievementsService } from './services/social';

// Get user achievements
const achievements = await achievementsService.getUserAchievements(userId);

// Get user streak
const streak = await achievementsService.getUserStreak(userId);

// Update streak (call after study session)
await achievementsService.updateStreak(true);
```

### 7. Trending Topics

Discover popular content:
- Auto-updated trending topics
- Track post counts per topic
- Search by topic

```typescript
import { trendingService } from './services/social';

// Get trending topics
const trending = await trendingService.getTrendingTopics();

// Get posts by tag
const posts = await socialPostsService.getPostsByTag("Mathematics");
```

### 8. Notifications

Stay updated on social interactions:
- Likes, comments, follows
- Group invites
- Achievement unlocks
- Mentions

```typescript
import { notificationsService } from './services/social';

// Get notifications
const notifications = await notificationsService.getMyNotifications();

// Mark as read
await notificationsService.markAsRead(notificationId);

// Mark all as read
await notificationsService.markAllAsRead();
```

## 🔒 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies:

- **User Profiles**: Public read, owner write
- **Posts**: Public posts visible to all, private/followers posts restricted
- **Likes/Comments**: Public read, authenticated write
- **Followers**: Public read, users can manage their own follows
- **Study Groups**: Public groups visible, private groups member-only
- **Notifications**: Private to user

### Automatic Counters

The database automatically maintains:
- Post likes count
- Post comments count
- Comment likes count
- Group members count
- Study streaks

### Triggers

Automatic triggers for:
- Creating user profile on signup
- Updating timestamps
- Maintaining counter accuracy
- Streak calculations

## 📊 Performance Optimizations

### Indexes

Optimized indexes for:
- User lookups
- Feed queries (time-based)
- Tag searches (GIN index)
- Follower relationships
- Group memberships

### Views

Pre-built views for common queries:
- `social_posts_with_user` - Posts with author info and interaction status
- `study_groups_with_info` - Groups with creator info and membership status

## 🎨 UI Integration

The social database is designed to work with:

### Feed View
- Infinite scroll feed
- Filter by following/all
- Search and filter by tags
- Post creation with image upload

### Profile View
- User stats (followers, following, posts)
- Achievement showcase
- Study streak display
- Edit profile functionality

### Groups View
- Browse public groups
- My groups dashboard
- Create/join groups
- Group chat/posts

### Notifications
- Real-time notification badge
- Notification center
- Action links (go to post, profile, etc.)

## 🔄 Data Flow

### Creating a Post
1. User creates post → `social_posts` table
2. Post appears in feed
3. Followers see post in their following feed
4. Tags update trending topics

### Liking a Post
1. User clicks like → `post_likes` table
2. Trigger increments `likes_count` in `social_posts`
3. Notification created for post author
4. Like status shown in feed

### Following a User
1. User clicks follow → `user_followers` table
2. Follower count updated
3. Notification sent to followed user
4. Following feed updates

## 🧪 Testing

Sample data is included in the migration for:
- Trending topics (Mathematics, Biology, etc.)

To test the features:

1. Create a user profile
2. Create some posts
3. Follow users
4. Join study groups
5. Check notifications

## 📱 Mobile Considerations

The database is designed for:
- Offline-first with Supabase sync
- Efficient pagination
- Minimal data transfer
- Real-time subscriptions

## 🚀 Next Steps

1. Run the migration SQL
2. Import the social service in your components
3. Update the SocialPage component to use real data
4. Add real-time subscriptions for live updates
5. Implement image upload for posts and profiles

## 💡 Best Practices

1. **Pagination**: Always use limit/offset for feeds
2. **Real-time**: Subscribe to changes for notifications
3. **Caching**: Cache profile data to reduce queries
4. **Images**: Use Supabase Storage for image uploads
5. **Moderation**: Consider adding content moderation flags
6. **Privacy**: Respect user privacy settings

## 🔧 Troubleshooting

### Posts not appearing
- Check RLS policies
- Verify user authentication
- Check visibility settings

### Counts not updating
- Triggers should handle this automatically
- Verify triggers are enabled
- Check database logs

### Notifications not working
- Check RLS policies on notifications table
- Verify notification creation logic
- Test with simple query first

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
