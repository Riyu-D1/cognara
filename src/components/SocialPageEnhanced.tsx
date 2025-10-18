import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus, 
  Search,
  Filter,
  TrendingUp,
  Award,
  Users,
  Calendar,
  BookOpen,
  Target,
  Star,
  Clock,
  Send,
  UserPlus,
  MoreHorizontal,
  Bookmark,
  BookmarkCheck,
  Loader2
} from 'lucide-react';
import { Screen } from '../utils/constants';
import {
  socialPostsService,
  userProfileService,
  commentsService,
  followersService,
  studyGroupsService,
  trendingService,
  achievementsService,
  type SocialPost,
  type StudyGroup as DBStudyGroup,
  type TrendingTopic,
  type UserProfile
} from '../services/social';

interface SocialPageEnhancedProps {
  onNavigate: (screen: Screen) => void;
}

export function SocialPageEnhanced({ onNavigate }: SocialPageEnhancedProps) {
  const [activeTab, setActiveTab] = useState('feed');
  const [newPost, setNewPost] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedType, setFeedType] = useState<'all' | 'following'>('all');
  
  // Data states
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [studyGroups, setStudyGroups] = useState<DBStudyGroup[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStreak, setUserStreak] = useState<number>(0);
  
  // Loading states
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // Load initial data
  useEffect(() => {
    loadUserProfile();
    loadFeedPosts();
    loadTrendingTopics();
  }, []);

  useEffect(() => {
    loadFeedPosts();
  }, [feedType]);

  useEffect(() => {
    if (activeTab === 'groups') {
      loadStudyGroups();
    }
  }, [activeTab]);

  const loadUserProfile = async () => {
    const profile = await userProfileService.getCurrentUserProfile();
    if (profile) {
      setUserProfile(profile);
      const streak = await achievementsService.getUserStreak(profile.user_id!);
      if (streak) {
        setUserStreak(streak.current_streak);
      }
    }
  };

  const loadFeedPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const fetchedPosts = feedType === 'all' 
        ? await socialPostsService.getFeedPosts(20)
        : await socialPostsService.getFollowingFeedPosts(20);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const loadStudyGroups = async () => {
    setIsLoadingGroups(true);
    try {
      const [allGroups, myGroups] = await Promise.all([
        studyGroupsService.getAllGroups(20),
        studyGroupsService.getMyGroups()
      ]);
      // Merge and deduplicate
      const groupMap = new Map();
      [...myGroups, ...allGroups].forEach(group => {
        if (!groupMap.has(group.id)) {
          groupMap.set(group.id, group);
        }
      });
      setStudyGroups(Array.from(groupMap.values()));
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const loadTrendingTopics = async () => {
    setIsLoadingTrending(true);
    try {
      const topics = await trendingService.getTrendingTopics(5);
      setTrendingTopics(topics);
    } catch (error) {
      console.error('Error loading trending topics:', error);
    } finally {
      setIsLoadingTrending(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    
    setIsCreatingPost(true);
    try {
      const createdPost = await socialPostsService.createPost({
        content: newPost,
        post_type: 'regular',
        tags: extractTags(newPost),
        visibility: 'public',
        is_pinned: false,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0
      });

      if (createdPost) {
        setNewPost('');
        await loadFeedPosts(); // Reload feed to show new post
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const extractTags = (content: string): string[] => {
    const tagRegex = /#(\w+)/g;
    const matches = content.matchAll(tagRegex);
    return Array.from(matches, m => m[1]);
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await socialPostsService.unlikePost(postId);
      } else {
        await socialPostsService.likePost(postId);
      }
      
      // Optimistically update UI
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked_by_me: !isLiked,
              likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1
            }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSavePost = async (postId: string, isSaved: boolean) => {
    try {
      if (isSaved) {
        await socialPostsService.unsavePost(postId);
      } else {
        await socialPostsService.savePost(postId);
      }
      
      // Update UI
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, is_saved_by_me: !isSaved }
          : post
      ));
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleFollow = async (userId: string, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await followersService.unfollowUser(userId);
      } else {
        await followersService.followUser(userId);
      }
      
      // Update UI
      setPosts(posts.map(post => 
        post.user_id === userId 
          ? { ...post, is_following: !isFollowing }
          : post
      ));
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleJoinGroup = async (groupId: string, isMember: boolean) => {
    try {
      if (isMember) {
        await studyGroupsService.leaveGroup(groupId);
      } else {
        await studyGroupsService.joinGroup(groupId);
      }
      
      // Reload groups to update membership status
      await loadStudyGroups();
    } catch (error) {
      console.error('Error toggling group membership:', error);
    }
  };

  const handleTrendingTopicClick = async (topicName: string) => {
    setSearchQuery(topicName);
    setIsLoadingPosts(true);
    try {
      const topicPosts = await socialPostsService.getPostsByTag(topicName);
      setPosts(topicPosts);
    } catch (error) {
      console.error('Error loading topic posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleContinueStreak = () => {
    onNavigate('dashboard');
  };

  const handleCreateGroup = () => {
    // This would open a modal or form to create a new group
    console.log('Create group modal would open here');
  };

  const handleViewComments = (postId: string) => {
    // This would open a comments modal or expand comments inline
    console.log('View comments for:', postId);
  };

  const handleShare = (postId: string) => {
    // Copy link to clipboard or open share modal
    if (navigator.share) {
      navigator.share({
        title: 'StudyFlow Post',
        url: `${window.location.origin}/post/${postId}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
      // Show toast notification
      console.log('Link copied to clipboard');
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const PostCard = ({ post }: { post: SocialPost }) => (
    <Card className="p-6 clay-card border-0 hover:clay-glow-subtle transition-all duration-200">
      <div className="flex items-start space-x-4">
        <Avatar className="w-12 h-12">
          {post.avatar_url ? (
            <img src={post.avatar_url} alt={post.display_name} className="w-full h-full object-cover" />
          ) : (
            <AvatarFallback className="bg-gradient-to-r from-accent-indigo to-accent text-white">
              {getInitials(post.display_name || 'U')}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h3 className="text-foreground font-medium">{post.display_name || 'Anonymous'}</h3>
              {post.badges && post.badges.length > 0 && (
                <Badge variant="secondary" className="bg-accent-indigo/10 text-accent-indigo">
                  {post.badges[0]}
                </Badge>
              )}
              {post.study_streak && post.study_streak > 0 && (
                <Badge variant="outline" className="border-accent/30 text-accent">
                  <Target className="w-3 h-3 mr-1" />
                  {post.study_streak} day streak
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {post.created_at ? formatTimestamp(post.created_at) : 'Just now'}
              </span>
              {post.user_id !== userProfile?.user_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFollow(post.user_id!, post.is_following || false)}
                  className={`rounded-full ${
                    post.is_following 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-foreground mb-3 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="border-primary/30 text-primary cursor-pointer hover:bg-primary/10"
                  onClick={() => handleTrendingTopicClick(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          
          {post.post_type === 'achievement' && (
            <div className="flex items-center space-x-2 mb-3 p-3 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg border border-accent/20 clay-input">
              <Award className="w-5 h-5 text-accent" />
              <span className="text-accent">Achievement Post</span>
            </div>
          )}
          
          {post.image_url && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <ImageWithFallback 
                src={post.image_url} 
                alt="Post image"
                className="w-full h-64 object-cover"
              />
            </div>
          )}
          
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id!, post.is_liked_by_me || false)}
                className={`flex items-center space-x-2 rounded-full ${
                  post.is_liked_by_me ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.is_liked_by_me ? 'fill-current' : ''}`} />
                <span>{post.likes_count}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleViewComments(post.id!)}
                className="flex items-center space-x-2 rounded-full text-muted-foreground hover:text-primary"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments_count}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleShare(post.id!)}
                className="flex items-center space-x-2 rounded-full text-muted-foreground hover:text-accent"
              >
                <Share2 className="w-5 h-5" />
                <span>{post.shares_count}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSavePost(post.id!, post.is_saved_by_me || false)}
                className={`rounded-full ${
                  post.is_saved_by_me ? 'text-accent' : 'text-muted-foreground hover:text-accent'
                }`}
              >
                {post.is_saved_by_me ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const StudyGroupCard = ({ group }: { group: DBStudyGroup }) => (
    <Card className="p-6 clay-card border-0 hover:clay-glow-subtle transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg text-foreground mb-1 font-medium">{group.name}</h3>
          <Badge variant="outline" className="border-primary/30 text-primary mb-2">
            {group.subject}
          </Badge>
          <p className="text-muted-foreground text-sm">{group.description}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{group.members_count} members</span>
          </div>
          {group.next_session && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(group.next_session).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
      
      <Button 
        onClick={() => handleJoinGroup(group.id!, group.is_member || false)}
        className={`w-full rounded-xl clay-button text-white ${
          group.is_member 
            ? 'bg-gradient-to-r from-accent to-accent-indigo' 
            : ''
        }`}
      >
        {group.is_member ? 'Joined' : 'Join Group'}
      </Button>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-foreground mb-2 font-semibold">Social Hub</h1>
            <p className="text-muted-foreground">Connect with fellow students and share your study journey</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search posts, users, groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80 clay-input rounded-xl"
              />
            </div>
            <Button 
              variant="outline"
              className="rounded-xl clay-input"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card/80 backdrop-blur-sm rounded-xl p-1 clay-nav">
            <TabsTrigger value="feed" className="rounded-lg">
              <TrendingUp className="w-4 h-4 mr-2" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="groups" className="rounded-lg">
              <Users className="w-4 h-4 mr-2" />
              Study Groups
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-lg">
              <Award className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="rounded-lg">
              <Star className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Main Feed */}
              <div className="col-span-8 space-y-6">
                {/* Feed Type Toggle */}
                <div className="flex items-center space-x-2 justify-center">
                  <Button
                    variant={feedType === 'all' ? 'default' : 'ghost'}
                    onClick={() => setFeedType('all')}
                    className="rounded-xl"
                  >
                    For You
                  </Button>
                  <Button
                    variant={feedType === 'following' ? 'default' : 'ghost'}
                    onClick={() => setFeedType('following')}
                    className="rounded-xl"
                  >
                    Following
                  </Button>
                </div>

                {/* Create Post */}
                <Card className="p-6 clay-card border-0">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12">
                      {userProfile?.avatar_url ? (
                        <img src={userProfile.avatar_url} alt={userProfile.display_name} className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-r from-accent-indigo to-accent text-white">
                          {userProfile ? getInitials(userProfile.display_name) : 'Y'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Share your study progress, achievements, or ask for help... Use #tags to categorize!"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="mb-4 clay-input rounded-xl resize-none"
                        rows={3}
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="rounded-full"
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Study Material
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="rounded-full"
                          >
                            <Award className="w-4 h-4 mr-2" />
                            Achievement
                          </Button>
                        </div>
                        <Button 
                          onClick={handleCreatePost}
                          disabled={!newPost.trim() || isCreatingPost}
                          className="clay-button text-white rounded-xl"
                        >
                          {isCreatingPost ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Posting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Post
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Posts */}
                {isLoadingPosts ? (
                  <Card className="p-8 clay-card border-0 text-center">
                    <Loader2 className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
                    <p className="text-muted-foreground">Loading posts...</p>
                  </Card>
                ) : posts.length === 0 ? (
                  <Card className="p-8 clay-card border-0 text-center">
                    <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg text-foreground mb-2 font-medium">No posts yet</h3>
                    <p className="text-muted-foreground mb-4">
                      {feedType === 'following' 
                        ? "Follow other students to see their posts here" 
                        : "Be the first to share your study journey!"}
                    </p>
                  </Card>
                ) : (
                  posts.map((post) => <PostCard key={post.id} post={post} />)
                )}
              </div>

              {/* Sidebar */}
              <div className="col-span-4 space-y-6">
                {/* Trending Topics */}
                <Card className="p-6 clay-card border-0">
                  <h3 className="text-lg text-foreground mb-4 flex items-center font-medium">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    Trending Topics
                  </h3>
                  {isLoadingTrending ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 text-primary mx-auto animate-spin" />
                    </div>
                  ) : trendingTopics.length > 0 ? (
                    <div className="space-y-3">
                      {trendingTopics.map((topic) => (
                        <div key={topic.id} className="flex items-center justify-between">
                          <span 
                            className="text-primary hover:text-primary/80 cursor-pointer"
                            onClick={() => handleTrendingTopicClick(topic.topic_name)}
                          >
                            #{topic.topic_name}
                          </span>
                          <span className="text-sm text-muted-foreground">{topic.post_count} posts</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">No trending topics yet</p>
                  )}
                </Card>

                {/* Study Streak */}
                <Card className="p-6 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 clay-card">
                  <h3 className="text-lg text-foreground mb-4 flex items-center font-medium">
                    <Target className="w-5 h-5 mr-2 text-accent" />
                    Your Study Streak
                  </h3>
                  <div className="text-center">
                    <div className="text-3xl text-accent mb-2 font-semibold">{userStreak}</div>
                    <p className="text-muted-foreground mb-4">Days in a row!</p>
                    <Button 
                      onClick={handleContinueStreak}
                      className="w-full bg-gradient-to-r from-accent to-accent-indigo text-white rounded-xl clay-button"
                    >
                      Continue Streak
                    </Button>
                  </div>
                </Card>

                {/* Quick Study Groups */}
                <Card className="p-6 clay-card border-0">
                  <h3 className="text-lg text-foreground mb-4 flex items-center font-medium">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    Your Study Groups
                  </h3>
                  <div className="space-y-3">
                    {studyGroups.filter(g => g.is_member).slice(0, 3).map((group) => (
                      <div key={group.id} className="flex items-center justify-between p-3 bg-muted rounded-lg clay-input">
                        <div>
                          <p className="text-foreground font-medium text-sm">{group.name}</p>
                          {group.next_session && (
                            <p className="text-xs text-muted-foreground flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(group.next_session).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {studyGroups.filter(g => g.is_member).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Join a study group to start collaborating!
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-foreground font-semibold">Study Groups</h2>
              <Button 
                onClick={handleCreateGroup}
                className="clay-button text-white rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>
            
            {isLoadingGroups ? (
              <Card className="p-8 clay-card border-0 text-center">
                <Loader2 className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading study groups...</p>
              </Card>
            ) : studyGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {studyGroups.map((group) => (
                  <StudyGroupCard key={group.id} group={group} />
                ))}
              </div>
            ) : (
              <Card className="p-8 clay-card border-0 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg text-foreground mb-2 font-medium">No study groups yet</h3>
                <p className="text-muted-foreground mb-4">Create the first study group and start collaborating!</p>
                <Button onClick={handleCreateGroup} className="clay-button text-white rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card className="p-8 clay-card border-0 text-center">
              <Award className="w-16 h-16 text-accent mx-auto mb-4" />
              <h2 className="text-xl text-foreground mb-2 font-semibold">Achievements Coming Soon</h2>
              <p className="text-muted-foreground mb-6">Track your study milestones and celebrate your progress with achievement badges.</p>
              <Button 
                onClick={handleContinueStreak}
                className="clay-button text-white rounded-xl"
              >
                View Your Progress
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="p-8 clay-card border-0 text-center">
              <Star className="w-16 h-16 text-accent mx-auto mb-4" />
              <h2 className="text-xl text-foreground mb-2 font-semibold">Leaderboard Coming Soon</h2>
              <p className="text-muted-foreground mb-6">Compete with fellow students and see who's leading in study streaks and achievements.</p>
              <Button 
                className="clay-button text-white rounded-xl"
              >
                Check Rankings
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
