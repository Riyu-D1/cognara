import { supabase } from '../utils/supabase/client';

// ============================================
// TYPES
// ============================================

export interface UserProfile {
  id?: string;
  user_id?: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  study_streak: number;
  total_study_hours: number;
  badges: string[];
  subjects_of_interest: string[];
  education_level?: string;
  school?: string;
  location?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
}

export interface SocialPost {
  id?: string;
  user_id?: string;
  content: string;
  image_url?: string;
  post_type: 'regular' | 'achievement' | 'study_update' | 'question' | 'resource_share';
  tags: string[];
  visibility: 'public' | 'followers' | 'private';
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at?: string;
  updated_at?: string;
  // Extended fields from view
  display_name?: string;
  avatar_url?: string;
  badges?: string[];
  study_streak?: number;
  is_liked_by_me?: boolean;
  is_saved_by_me?: boolean;
  is_following?: boolean;
  attachments?: PostAttachment[];
}

export interface PostComment {
  id?: string;
  post_id: string;
  user_id?: string;
  parent_comment_id?: string;
  content: string;
  likes_count: number;
  created_at?: string;
  updated_at?: string;
  display_name?: string;
  avatar_url?: string;
  is_liked_by_me?: boolean;
}

export interface StudyGroup {
  id?: string;
  creator_id?: string;
  name: string;
  description?: string;
  subject: string;
  image_url?: string;
  visibility: 'public' | 'private';
  max_members?: number;
  members_count: number;
  next_session?: string;
  session_link?: string;
  created_at?: string;
  updated_at?: string;
  creator_name?: string;
  creator_avatar?: string;
  is_member?: boolean;
}

export interface UserAchievement {
  id?: string;
  user_id?: string;
  achievement_type: string;
  achievement_title: string;
  achievement_description?: string;
  badge_icon?: string;
  achieved_at?: string;
  is_displayed: boolean;
}

export interface StudyStreak {
  id?: string;
  user_id?: string;
  current_streak: number;
  longest_streak: number;
  last_study_date?: string;
  total_study_days: number;
  updated_at?: string;
}

export interface TrendingTopic {
  id?: string;
  topic_name: string;
  post_count: number;
  last_updated?: string;
}

export interface UserNotification {
  id?: string;
  user_id?: string;
  actor_id?: string;
  notification_type: 'like' | 'comment' | 'follow' | 'group_invite' | 'achievement' | 'mention';
  entity_id?: string;
  entity_type?: string;
  content?: string;
  is_read: boolean;
  created_at?: string;
  actor_name?: string;
  actor_avatar?: string;
}

export interface PostAttachment {
  id?: string;
  post_id: string;
  attachment_type: 'note' | 'flashcard' | 'quiz' | 'file';
  attachment_id: string;
  attachment_title: string;
  attachment_preview?: string;
  attachment_metadata?: Record<string, any>;
  created_at?: string;
  // Extended details
  details?: AttachmentDetails;
}

export interface AttachmentDetails {
  id: string;
  title?: string;
  content?: string;
  subject?: string;
  word_count?: number;
  card_count?: number;
  question_count?: number;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  file_url?: string;
  created_at?: string;
}

export interface PostFile {
  id?: string;
  user_id?: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  storage_path: string;
  created_at?: string;
}

// ============================================
// USER PROFILE SERVICES
// ============================================

export const userProfileService = {
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Get follower/following counts
      const [followersResult, followingResult] = await Promise.all([
        supabase.from('user_followers').select('id', { count: 'exact' }).eq('following_id', userId),
        supabase.from('user_followers').select('id', { count: 'exact' }).eq('follower_id', userId)
      ]);

      return {
        ...data,
        followers_count: followersResult.count || 0,
        following_count: followingResult.count || 0
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!existingProfile) {
        console.log('Profile does not exist, creating new profile...');
        // Create new profile with default values
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([{
            user_id: user.id,
            display_name: user.email?.split('@')[0] || 'User',
            bio: '',
            study_streak: 0,
            total_study_hours: 0,
            badges: [],
            subjects_of_interest: [],
            ...updates
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }
        
        console.log('Profile created successfully:', newProfile);
        return newProfile;
      }

      // Profile exists, update it
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  },

  async searchUsers(query: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .ilike('display_name', `%${query}%`)
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
};

// ============================================
// SOCIAL POSTS SERVICES
// ============================================

export const socialPostsService = {
  async getFeedPosts(limit = 20, offset = 0): Promise<SocialPost[]> {
    try {
      const { data, error } = await supabase
        .from('social_posts_with_user')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Check if current user is following each post author
      const { data: { user } } = await supabase.auth.getUser();
      if (user && data) {
        const userIds = data.map(post => post.user_id);
        const { data: followingData } = await supabase
          .from('user_followers')
          .select('following_id')
          .eq('follower_id', user.id)
          .in('following_id', userIds);

        const followingSet = new Set(followingData?.map(f => f.following_id) || []);

        // Load attachments for all posts
        const postsWithAttachments = await Promise.all(
          data.map(async (post) => {
            const attachments = await postAttachmentsService.getPostAttachments(post.id || '');
            return {
              ...post,
              is_following: followingSet.has(post.user_id || ''),
              attachments: attachments
            };
          })
        );

        return postsWithAttachments;
      }

      // If no user, still load attachments
      if (data) {
        const postsWithAttachments = await Promise.all(
          data.map(async (post) => {
            const attachments = await postAttachmentsService.getPostAttachments(post.id || '');
            return {
              ...post,
              attachments: attachments
            };
          })
        );
        return postsWithAttachments;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching feed posts:', error);
      return [];
    }
  },

  async getFollowingFeedPosts(limit = 20, offset = 0): Promise<SocialPost[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get list of users current user is following
      const { data: following } = await supabase
        .from('user_followers')
        .select('following_id')
        .eq('follower_id', user.id);

      if (!following || following.length === 0) return [];

      const followingIds = following.map(f => f.following_id);

      const { data, error } = await supabase
        .from('social_posts_with_user')
        .select('*')
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return (data || []).map(post => ({ ...post, is_following: true }));
    } catch (error) {
      console.error('Error fetching following feed:', error);
      return [];
    }
  },

  async getUserPosts(userId: string, limit = 20): Promise<SocialPost[]> {
    try {
      const { data, error } = await supabase
        .from('social_posts_with_user')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  },

  async getPostsByTag(tag: string, limit = 20): Promise<SocialPost[]> {
    try {
      const { data, error } = await supabase
        .from('social_posts_with_user')
        .select('*')
        .contains('tags', [tag])
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching posts by tag:', error);
      return [];
    }
  },

  async createPost(post: Omit<SocialPost, 'id' | 'created_at' | 'updated_at'>): Promise<SocialPost | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('social_posts')
        .insert([{
          user_id: user.id,
          content: post.content,
          image_url: post.image_url,
          post_type: post.post_type || 'regular',
          tags: post.tags || [],
          visibility: post.visibility || 'public',
          is_pinned: post.is_pinned || false
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  },

  async updatePost(postId: string, updates: Partial<SocialPost>): Promise<SocialPost | null> {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .update(updates)
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating post:', error);
      return null;
    }
  },

  async deletePost(postId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  },

  async likePost(postId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('post_likes')
        .insert([{ post_id: postId, user_id: user.id }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error liking post:', error);
      return false;
    }
  },

  async unlikePost(postId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unliking post:', error);
      return false;
    }
  },

  async savePost(postId: string, collectionName = 'Saved'): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('saved_posts')
        .insert([{ post_id: postId, user_id: user.id, collection_name: collectionName }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving post:', error);
      return false;
    }
  },

  async unsavePost(postId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unsaving post:', error);
      return false;
    }
  },

  async getSavedPosts(): Promise<SocialPost[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('saved_posts')
        .select('post_id')
        .eq('user_id', user.id);

      if (error || !data || data.length === 0) return [];

      const postIds = data.map(sp => sp.post_id);

      const { data: posts, error: postsError } = await supabase
        .from('social_posts_with_user')
        .select('*')
        .in('id', postIds)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      return posts || [];
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      return [];
    }
  }
};

// ============================================
// COMMENTS SERVICES
// ============================================

export const commentsService = {
  async getPostComments(postId: string): Promise<PostComment[]> {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          user_profiles!post_comments_user_id_fkey(display_name, avatar_url)
        `)
        .eq('post_id', postId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user && data) {
        const commentIds = data.map(c => c.id);
        const { data: likes } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);

        const likedSet = new Set(likes?.map(l => l.comment_id) || []);

        return data.map(comment => ({
          ...comment,
          display_name: comment.user_profiles?.display_name,
          avatar_url: comment.user_profiles?.avatar_url,
          is_liked_by_me: likedSet.has(comment.id)
        }));
      }

      return data?.map(comment => ({
        ...comment,
        display_name: comment.user_profiles?.display_name,
        avatar_url: comment.user_profiles?.avatar_url
      })) || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  async createComment(postId: string, content: string, parentCommentId?: string): Promise<PostComment | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('post_comments')
        .insert([{
          post_id: postId,
          user_id: user.id,
          content,
          parent_comment_id: parentCommentId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      return null;
    }
  },

  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  },

  async likeComment(commentId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('comment_likes')
        .insert([{ comment_id: commentId, user_id: user.id }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error liking comment:', error);
      return false;
    }
  },

  async unlikeComment(commentId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unliking comment:', error);
      return false;
    }
  }
};

// ============================================
// FOLLOWERS SERVICES
// ============================================

export const followersService = {
  async followUser(userId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_followers')
        .insert([{ follower_id: user.id, following_id: userId }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    }
  },

  async unfollowUser(userId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  },

  async getFollowers(userId: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_followers')
        .select('follower_id, user_profiles!user_followers_follower_id_fkey(*)')
        .eq('following_id', userId);

      if (error) throw error;
      return data?.map(f => f.user_profiles as unknown as UserProfile) || [];
    } catch (error) {
      console.error('Error fetching followers:', error);
      return [];
    }
  },

  async getFollowing(userId: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_followers')
        .select('following_id, user_profiles!user_followers_following_id_fkey(*)')
        .eq('follower_id', userId);

      if (error) throw error;
      return data?.map(f => f.user_profiles as unknown as UserProfile) || [];
    } catch (error) {
      console.error('Error fetching following:', error);
      return [];
    }
  },

  async isFollowing(userId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_followers')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      return !!data && !error;
    } catch (error) {
      return false;
    }
  }
};

// ============================================
// STUDY GROUPS SERVICES
// ============================================

export const studyGroupsService = {
  async getAllGroups(limit = 20): Promise<StudyGroup[]> {
    try {
      const { data, error } = await supabase
        .from('study_groups_with_info')
        .select('*')
        .eq('visibility', 'public')
        .order('members_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching study groups:', error);
      return [];
    }
  },

  async getMyGroups(): Promise<StudyGroup[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: memberships } = await supabase
        .from('study_group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (!memberships || memberships.length === 0) return [];

      const groupIds = memberships.map(m => m.group_id);

      const { data, error } = await supabase
        .from('study_groups_with_info')
        .select('*')
        .in('id', groupIds);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching my groups:', error);
      return [];
    }
  },

  async createGroup(group: Omit<StudyGroup, 'id' | 'created_at' | 'updated_at'>): Promise<StudyGroup | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('study_groups')
        .insert([{
          creator_id: user.id,
          name: group.name,
          description: group.description,
          subject: group.subject,
          image_url: group.image_url,
          visibility: group.visibility || 'public',
          max_members: group.max_members,
          next_session: group.next_session,
          session_link: group.session_link
        }])
        .select()
        .single();

      if (error) throw error;

      // Automatically add creator as admin member
      if (data) {
        await supabase
          .from('study_group_members')
          .insert([{
            group_id: data.id,
            user_id: user.id,
            role: 'admin'
          }]);
      }

      return data;
    } catch (error) {
      console.error('Error creating group:', error);
      return null;
    }
  },

  async joinGroup(groupId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('study_group_members')
        .insert([{ group_id: groupId, user_id: user.id, role: 'member' }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error joining group:', error);
      return false;
    }
  },

  async leaveGroup(groupId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      return false;
    }
  }
};

// ============================================
// TRENDING TOPICS SERVICES
// ============================================

export const trendingService = {
  async getTrendingTopics(limit = 10): Promise<TrendingTopic[]> {
    try {
      const { data, error } = await supabase
        .from('trending_topics')
        .select('*')
        .order('post_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      return [];
    }
  }
};

// ============================================
// NOTIFICATIONS SERVICES
// ============================================

export const notificationsService = {
  async getMyNotifications(limit = 50): Promise<UserNotification[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_notifications')
        .select(`
          *,
          user_profiles!user_notifications_actor_id_fkey(display_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(notification => ({
        ...notification,
        actor_name: notification.user_profiles?.display_name,
        actor_avatar: notification.user_profiles?.avatar_url
      })) || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  async markAllAsRead(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
};

// ============================================
// ACHIEVEMENTS & STREAKS SERVICES
// ============================================

export const achievementsService = {
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('is_displayed', true)
        .order('achieved_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  },

  async getUserStreak(userId: string): Promise<StudyStreak | null> {
    try {
      const { data, error } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching study streak:', error);
      return null;
    }
  },

  async updateStreak(studyCompleted: boolean): Promise<StudyStreak | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const today = new Date().toISOString().split('T')[0];
      
      const { data: currentStreak } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!currentStreak) {
        // Create new streak
        const { data, error } = await supabase
          .from('study_streaks')
          .insert([{
            user_id: user.id,
            current_streak: studyCompleted ? 1 : 0,
            longest_streak: studyCompleted ? 1 : 0,
            last_study_date: studyCompleted ? today : null,
            total_study_days: studyCompleted ? 1 : 0
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Update existing streak
      const lastDate = currentStreak.last_study_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = currentStreak.current_streak;
      
      if (studyCompleted && lastDate !== today) {
        if (lastDate === yesterdayStr) {
          newStreak += 1;
        } else if (lastDate !== today) {
          newStreak = 1;
        }
      }

      const { data, error } = await supabase
        .from('study_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, currentStreak.longest_streak),
          last_study_date: studyCompleted ? today : lastDate,
          total_study_days: studyCompleted && lastDate !== today 
            ? currentStreak.total_study_days + 1 
            : currentStreak.total_study_days
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating streak:', error);
      return null;
    }
  }
};

// ============================================
// POST ATTACHMENTS SERVICES (LinkedIn-style)
// ============================================

export const postAttachmentsService = {
  async attachStudyMaterial(
    postId: string, 
    materialType: 'note' | 'flashcard' | 'quiz',
    materialId: string,
    title: string,
    preview?: string,
    metadata?: Record<string, any>
  ): Promise<PostAttachment | null> {
    try {
      const { data, error } = await supabase
        .from('post_attachments')
        .insert([{
          post_id: postId,
          attachment_type: materialType,
          attachment_id: materialId,
          attachment_title: title,
          attachment_preview: preview,
          attachment_metadata: metadata || {}
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error attaching study material:', error);
      return null;
    }
  },

  async attachFile(
    postId: string,
    fileId: string,
    fileName: string,
    preview?: string
  ): Promise<PostAttachment | null> {
    try {
      const { data, error } = await supabase
        .from('post_attachments')
        .insert([{
          post_id: postId,
          attachment_type: 'file',
          attachment_id: fileId,
          attachment_title: fileName,
          attachment_preview: preview
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error attaching file:', error);
      return null;
    }
  },

  async getPostAttachments(postId: string): Promise<PostAttachment[]> {
    try {
      const { data, error } = await supabase
        .from('post_attachments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching post attachments:', error);
      return [];
    }
  },

  async getAttachmentDetails(attachmentId: string): Promise<AttachmentDetails | null> {
    try {
      // Get the attachment to determine its type
      const { data: attachment, error: attachError } = await supabase
        .from('post_attachments')
        .select('*')
        .eq('id', attachmentId)
        .single();

      if (attachError || !attachment) throw attachError;

      // Fetch details based on type
      let details: AttachmentDetails | null = null;

      switch (attachment.attachment_type) {
        case 'note': {
          const { data } = await supabase
            .from('user_notes')
            .select('*')
            .eq('id', attachment.attachment_id)
            .single();
          
          if (data) {
            details = {
              id: data.id,
              title: data.title,
              content: data.content.substring(0, 200),
              subject: data.subject,
              word_count: data.word_count,
              created_at: data.created_at
            };
          }
          break;
        }

        case 'flashcard': {
          const { data: deck } = await supabase
            .from('user_flashcards')
            .select('*')
            .eq('id', attachment.attachment_id)
            .single();

          if (deck) {
            const { count } = await supabase
              .from('flashcard_cards')
              .select('*', { count: 'exact', head: true })
              .eq('deck_id', deck.id);

            details = {
              id: deck.id,
              title: deck.title,
              subject: deck.subject,
              card_count: count || 0,
              created_at: deck.created_at
            };
          }
          break;
        }

        case 'quiz': {
          const { data: quiz } = await supabase
            .from('user_quizzes')
            .select('*')
            .eq('id', attachment.attachment_id)
            .single();

          if (quiz) {
            const { count } = await supabase
              .from('quiz_questions')
              .select('*', { count: 'exact', head: true })
              .eq('quiz_id', quiz.id);

            details = {
              id: quiz.id,
              title: quiz.title,
              question_count: count || 0,
              created_at: quiz.created_at
            };
          }
          break;
        }

        case 'file': {
          const { data: file } = await supabase
            .from('post_files')
            .select('*')
            .eq('id', attachment.attachment_id)
            .single();

          if (file) {
            details = {
              id: file.id,
              file_name: file.file_name,
              file_type: file.file_type,
              file_size: file.file_size,
              file_url: file.file_url,
              created_at: file.created_at
            };
          }
          break;
        }
      }

      return details;
    } catch (error) {
      console.error('Error fetching attachment details:', error);
      return null;
    }
  },

  async removeAttachment(attachmentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('post_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing attachment:', error);
      return false;
    }
  },

  async getUserStudyMaterials(): Promise<{
    notes: any[];
    flashcards: any[];
    quizzes: any[];
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { notes: [], flashcards: [], quizzes: [] };

      const [notesResult, flashcardsResult, quizzesResult] = await Promise.all([
        supabase
          .from('user_notes')
          .select('id, title, subject, word_count, created_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(20),
        
        supabase
          .from('user_flashcards')
          .select('id, title, subject, created_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(20),
        
        supabase
          .from('user_quizzes')
          .select('id, title, created_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(20)
      ]);

      return {
        notes: notesResult.data || [],
        flashcards: flashcardsResult.data || [],
        quizzes: quizzesResult.data || []
      };
    } catch (error) {
      console.error('Error fetching user study materials:', error);
      return { notes: [], flashcards: [], quizzes: [] };
    }
  }
};

// ============================================
// FILE UPLOAD SERVICES
// ============================================

export const fileUploadService = {
  async uploadFile(file: File): Promise<PostFile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('post-files')
        .getPublicUrl(fileName);

      // Save file metadata to database
      const { data, error } = await supabase
        .from('post_files')
        .insert([{
          user_id: user.id,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: urlData.publicUrl,
          storage_path: fileName
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  },

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      // Get file info
      const { data: file } = await supabase
        .from('post_files')
        .select('storage_path')
        .eq('id', fileId)
        .single();

      if (!file) return false;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('post-files')
        .remove([file.storage_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('post_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
};
