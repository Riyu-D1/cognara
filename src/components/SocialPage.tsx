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
  Paperclip,
  FileText,
  X,
  Image as ImageIcon,
  Loader2,
  Trash2
} from 'lucide-react';
import { Screen } from '../utils/constants';
import { 
  socialPostsService, 
  postAttachmentsService, 
  fileUploadService,
  type SocialPost as SocialPostType,
  type PostAttachment
} from '../services/social';

interface SocialPageProps {
  onNavigate: (screen: Screen) => void;
}

interface Post {
  id: string;
  user_id?: string;
  author: {
    name: string;
    avatar: string;
    badge?: string;
    isFollowing?: boolean;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  tags?: string[];
  studyStreak?: number;
  achievement?: string;
  attachments?: PostAttachment[];
}

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  members: number;
  isJoined: boolean;
  nextSession?: string;
  description: string;
}

export function SocialPage({ onNavigate }: SocialPageProps) {
  const [activeTab, setActiveTab] = useState('feed');
  const [newPost, setNewPost] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<{
    type: 'note' | 'flashcard' | 'quiz';
    id: string;
    title: string;
  }[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<{
    notes: any[];
    flashcards: any[];
    quizzes: any[];
  }>({ notes: [], flashcards: [], quizzes: [] });
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [postId: string]: any[] }>({});
  const [newComment, setNewComment] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user on mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { supabase } = await import('../utils/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Mock data for posts
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: 'Emma Chen',
        avatar: 'EC',
        badge: 'Math Genius',
        isFollowing: false
      },
      content: 'Just completed my 30-day calculus study streak! 🎉 The key was breaking down complex problems into smaller steps. Anyone else working on derivatives?',
      image: 'https://images.unsplash.com/photo-1648801098849-565ca6939c56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHBlcnNvbiUyMGFjaGlldmVtZW50JTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzU2NzQ0MTc0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false,
      tags: ['Mathematics', 'Calculus'],
      studyStreak: 30,
      achievement: '30-Day Streak'
    },
    {
      id: '2',
      author: {
        name: 'Alex Thompson',
        avatar: 'AT',
        badge: 'Study Leader',
        isFollowing: true
      },
      content: 'Created a new study guide for Biology Chapter 7! Check out my visual breakdown of photosynthesis. Would love feedback from fellow bio students 📚',
      timestamp: '4 hours ago',
      likes: 18,
      comments: 12,
      shares: 7,
      isLiked: true,
      tags: ['Biology', 'Study Guide'],
      studyStreak: 15
    },
    {
      id: '3',
      author: {
        name: 'Sarah Kim',
        avatar: 'SK',
        badge: 'Quiz Master'
      },
      content: 'Study group session was amazing today! We tackled 50 chemistry problems in 2 hours. Sometimes studying with friends makes all the difference 🧪',
      image: 'https://images.unsplash.com/photo-1722912010170-704c382ca530?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWVuYWdlciUyMHN0dWRlbnRzJTIwc3R1ZHlpbmclMjB0b2dldGhlcnxlbnwxfHx8fDE3NTY3NDQxNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      timestamp: '6 hours ago',
      likes: 31,
      comments: 15,
      shares: 5,
      isLiked: false,
      tags: ['Chemistry', 'Study Group'],
      studyStreak: 8
    }
  ]);

  // Mock data for study groups
  const studyGroups: StudyGroup[] = [
    {
      id: '1',
      name: 'AP Calculus Masters',
      subject: 'Mathematics',
      members: 23,
      isJoined: true,
      nextSession: 'Tomorrow at 3:00 PM',
      description: 'Collaborative learning for AP Calculus students preparing for exams'
    },
    {
      id: '2',
      name: 'Biology Study Circle',
      subject: 'Biology',
      members: 18,
      isJoined: false,
      nextSession: 'Friday at 2:00 PM',
      description: 'Weekly biology discussions and practice sessions'
    },
    {
      id: '3',
      name: 'Chemistry Lab Partners',
      subject: 'Chemistry',
      members: 15,
      isJoined: false,
      description: 'Hands-on chemistry problem solving and lab prep'
    }
  ];

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const handleFollow = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            author: { ...post.author, isFollowing: !post.author.isFollowing }
          }
        : post
    ));
  };

  // Load user's study materials when attachment picker opens
  useEffect(() => {
    if (showAttachmentPicker) {
      loadStudyMaterials();
    }
  }, [showAttachmentPicker]);

  const loadStudyMaterials = async () => {
    const materials = await postAttachmentsService.getUserStudyMaterials();
    setAvailableMaterials(materials);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    setIsPosting(true);
    try {
      // Create the post first
      const post = await socialPostsService.createPost({
        content: newPost,
        post_type: selectedMaterials.length > 0 || selectedFiles.length > 0 ? 'resource_share' : 'regular',
        tags: [],
        visibility: 'public',
        is_pinned: false,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0
      });

      if (!post) {
        throw new Error('Failed to create post');
      }

      console.log('📎 Attaching files and materials to post:', post.id);
      console.log('Files to attach:', selectedFiles.length);
      console.log('Materials to attach:', selectedMaterials.length, selectedMaterials);

      // Upload files and attach them
      for (const file of selectedFiles) {
        const uploadedFile = await fileUploadService.uploadFile(file);
        if (uploadedFile) {
          console.log('✅ File uploaded:', uploadedFile.file_name);
          await postAttachmentsService.attachFile(
            post.id!,
            uploadedFile.id!,
            uploadedFile.file_name
          );
        }
      }

      // Attach study materials
      for (const material of selectedMaterials) {
        console.log('✅ Attaching material:', material.title, material.type);
        const attachment = await postAttachmentsService.attachStudyMaterial(
          post.id!,
          material.type,
          material.id,
          material.title
        );
        console.log('Attachment result:', attachment);
      }

      // Fetch the post back with attachments for immediate UI update
      console.log('🔍 Fetching attachments for post:', post.id);
      const attachments = await postAttachmentsService.getPostAttachments(post.id!);
      console.log('📎 Loaded attachments:', attachments);
      
      // Get current user for user_id
      const { supabase } = await import('../utils/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      
      const localPost: Post = {
        id: post.id!,
        user_id: user?.id,
        author: {
          name: 'You',
          avatar: 'Y',
          badge: 'Active Learner'
        },
        content: newPost,
        timestamp: 'Just now',
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        studyStreak: 5,
        attachments: attachments
      };
      setPosts([localPost, ...posts]);

      // Reset form
      setNewPost('');
      setSelectedFiles([]);
      setSelectedMaterials([]);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleFilter = () => {
    console.log('Opening filter options');
    // You could implement a filter modal here
  };

  const handleTrendingTopicClick = (topic: string) => {
    setSearchQuery(topic);
    console.log('Searching for:', topic);
  };

  const handleContinueStreak = () => {
    console.log('Continuing study streak');
    onNavigate('dashboard');
  };

  const handleJoinGroup = (groupId: string) => {
    console.log('Joining group:', groupId);
    // Update the group's joined status
  };

  const handleCreateGroup = () => {
    console.log('Creating new study group');
    // Could open a modal or navigate to group creation page
  };

  const handleViewAllNotes = () => {
    console.log('Viewing all notes');
    // Could filter posts by study materials or navigate to notes
  };

  const handleViewComments = async (postId: string) => {
    console.log('Viewing comments for post:', postId);
    
    // Toggle comments visibility
    if (showComments === postId) {
      setShowComments(null);
    } else {
      setShowComments(postId);
      // Load comments if not already loaded
      if (!comments[postId]) {
        const { commentsService } = await import('../services/social');
        const loadedComments = await commentsService.getPostComments(postId);
        setComments(prev => ({ ...prev, [postId]: loadedComments }));
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!newComment.trim()) return;

    try {
      const { commentsService } = await import('../services/social');
      const comment = await commentsService.createComment(postId, newComment);
      
      if (comment) {
        // Update local comments state
        setComments(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), comment]
        }));
        
        // Update comment count in posts
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, comments: post.comments + 1 }
            : post
        ));
        
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const { socialPostsService } = await import('../services/social');
      const success = await socialPostsService.deletePost(postId);
      
      if (success) {
        // Remove post from local state
        setPosts(posts.filter(post => post.id !== postId));
        console.log('Post deleted successfully');
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handleShare = (postId: string) => {
    console.log('Sharing post:', postId);
    // Could open share options modal
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, shares: post.shares + 1 }
        : post
    ));
  };

  const handleAttachStudyMaterial = () => {
    setShowAttachmentPicker(!showAttachmentPicker);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSelectMaterial = (type: 'note' | 'flashcard' | 'quiz', id: string, title: string) => {
    // Check if already selected
    const exists = selectedMaterials.some(m => m.id === id);
    if (exists) {
      setSelectedMaterials(selectedMaterials.filter(m => m.id !== id));
    } else {
      setSelectedMaterials([...selectedMaterials, { type, id, title }]);
    }
  };

  const handleRemoveMaterial = (id: string) => {
    setSelectedMaterials(selectedMaterials.filter(m => m.id !== id));
  };

  const handleAttachAchievement = () => {
    console.log('Attaching achievement to post');
    // Could open achievement selector
  };

  const handleViewProgress = () => {
    console.log('Viewing user progress');
    // Could navigate to a progress/achievements page
  };

  const handleCheckRankings = () => {
    console.log('Checking leaderboard rankings');
    // Could populate leaderboard data
  };

  // Attachment Picker Component
  const AttachmentPicker = () => (
    <Card className="mt-4 p-4 clay-card border-0">
      <Tabs defaultValue="notes">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="max-h-60 overflow-y-auto space-y-2">
          {availableMaterials.notes.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No notes available</p>
          ) : (
            availableMaterials.notes.map(note => (
              <div
                key={note.id}
                onClick={() => handleSelectMaterial('note', note.id, note.title)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedMaterials.some(m => m.id === note.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 clay-input'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-foreground font-medium">{note.title}</h4>
                    <p className="text-sm text-muted-foreground">{note.subject}</p>
                    {note.word_count && (
                      <p className="text-xs text-muted-foreground mt-1">{note.word_count} words</p>
                    )}
                  </div>
                  {selectedMaterials.some(m => m.id === note.id) && (
                    <Badge className="bg-primary text-white">Selected</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="flashcards" className="max-h-60 overflow-y-auto space-y-2">
          {availableMaterials.flashcards.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No flashcard decks available</p>
          ) : (
            availableMaterials.flashcards.map(deck => (
              <div
                key={deck.id}
                onClick={() => handleSelectMaterial('flashcard', deck.id, deck.title)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedMaterials.some(m => m.id === deck.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 clay-input'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-foreground font-medium">{deck.title}</h4>
                    <p className="text-sm text-muted-foreground">{deck.subject}</p>
                  </div>
                  {selectedMaterials.some(m => m.id === deck.id) && (
                    <Badge className="bg-primary text-white">Selected</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="quizzes" className="max-h-60 overflow-y-auto space-y-2">
          {availableMaterials.quizzes.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No quizzes available</p>
          ) : (
            availableMaterials.quizzes.map(quiz => (
              <div
                key={quiz.id}
                onClick={() => handleSelectMaterial('quiz', quiz.id, quiz.title)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedMaterials.some(m => m.id === quiz.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 clay-input'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-foreground font-medium">{quiz.title}</h4>
                  </div>
                  {selectedMaterials.some(m => m.id === quiz.id) && (
                    <Badge className="bg-primary text-white">Selected</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="files" className="space-y-2">
          <div className="text-center py-4">
            <input
              type="file"
              id="file-upload"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <label htmlFor="file-upload">
              <Button
                type="button"
                variant="outline"
                className="w-full clay-input rounded-xl"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Select Files to Upload
              </Button>
            </label>
            <p className="text-xs text-muted-foreground mt-2">
              Supported: Images, PDFs, Documents
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );

  const PostCard = ({ post }: { post: Post }) => (
    <Card className="p-6 clay-card border-0 hover:clay-glow-subtle transition-all duration-200">
      <div className="flex items-start space-x-4">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-gradient-to-r from-accent-indigo to-accent text-white">
            {post.author.avatar}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h3 className="text-foreground font-medium">{post.author.name}</h3>
              {post.author.badge && (
                <Badge variant="secondary" className="bg-accent-indigo/10 text-accent-indigo">
                  {post.author.badge}
                </Badge>
              )}
              {post.studyStreak && post.studyStreak > 0 && (
                <Badge variant="outline" className="border-accent/30 text-accent">
                  <Target className="w-3 h-3 mr-1" />
                  {post.studyStreak} day streak
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{post.timestamp}</span>
              {post.user_id && post.user_id !== currentUserId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFollow(post.id)}
                  className={`rounded-full ${
                    post.author.isFollowing 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              )}
              {post.user_id && post.user_id === currentUserId && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDeletePost(post.id)}
                  className="rounded-full text-muted-foreground hover:text-destructive"
                  title="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-foreground mb-3 leading-relaxed">{post.content}</p>
          
          {post.tags && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="border-primary/30 text-primary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          
          {post.achievement && (
            <div className="flex items-center space-x-2 mb-3 p-3 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg border border-accent/20 clay-input">
              <Award className="w-5 h-5 text-accent" />
              <span className="text-accent">Achievement Unlocked: {post.achievement}</span>
            </div>
          )}
          
          {post.image && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <ImageWithFallback 
                src={post.image} 
                alt="Post image"
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Display Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-xs text-muted-foreground mb-2">
                📎 {post.attachments.length} attachment{post.attachments.length !== 1 ? 's' : ''}
              </p>
              {post.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{attachment.attachment_title}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">{attachment.attachment_type}</Badge>
                        {attachment.attachment_metadata?.subject && (
                          <span className="text-xs text-muted-foreground">
                            {attachment.attachment_metadata.subject}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80"
                    onClick={() => {
                      // Navigate to the study material
                      console.log('Opening attachment:', attachment);
                      // You can add navigation logic here based on attachment type
                    }}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                className={`flex items-center space-x-2 rounded-full ${
                  post.isLiked ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                <span>{post.likes}</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 rounded-full text-muted-foreground hover:text-primary">
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleShare(post.id)}
                className="flex items-center space-x-2 rounded-full text-muted-foreground hover:text-accent"
              >
                <Share2 className="w-5 h-5" />
                <span>{post.shares}</span>
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleViewComments(post.id)}
              className="text-primary hover:text-primary/80"
            >
              {showComments === post.id ? 'Hide Comments' : 'View Comments'}
            </Button>
          </div>

          {/* Comments Section */}
          {showComments === post.id && (
            <div className="mt-4 pt-4 border-t border-border space-y-4">
              {/* Add Comment Input */}
              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-r from-accent-indigo to-accent text-white text-sm">
                    Y
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="clay-input rounded-xl resize-none mb-2"
                    rows={2}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleAddComment(post.id)}
                      disabled={!newComment.trim()}
                      size="sm"
                      className="clay-button text-white rounded-xl"
                    >
                      <Send className="w-3 h-3 mr-2" />
                      Comment
                    </Button>
                  </div>
                </div>
              </div>

              {/* Display Comments */}
              <div className="space-y-3">
                {comments[post.id]?.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-muted text-foreground text-sm">
                        {comment.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground text-sm">
                          {comment.display_name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-foreground text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
                
                {comments[post.id]?.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  const StudyGroupCard = ({ group }: { group: StudyGroup }) => (
    <Card className="p-6 clay-card border-0 hover:clay-glow-subtle transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
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
            <span>{group.members} members</span>
          </div>
          {group.nextSession && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{group.nextSession}</span>
            </div>
          )}
        </div>
      </div>
      
      <Button 
        onClick={() => handleJoinGroup(group.id)}
        className={`w-full rounded-xl clay-button text-white ${
          group.isJoined 
            ? 'bg-gradient-to-r from-accent to-accent-indigo' 
            : ''
        }`}
      >
        {group.isJoined ? 'Joined' : 'Join Group'}
      </Button>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Beta Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
            <p className="text-amber-800 font-medium">
              🚧 Still in Production - Beta Testing 🚧
            </p>
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-foreground mb-2 font-semibold">
              Social Hub 
              <Badge variant="outline" className="ml-3 border-amber-300 text-amber-700 bg-amber-50">
                Beta
              </Badge>
            </h1>
            <p className="text-muted-foreground">Connect with fellow students and share your study journey (Currently in beta testing)</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search students, posts, groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80 clay-input rounded-xl"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleFilter}
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
                {/* Create Post */}
                <Card className="p-6 clay-card border-0">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-r from-accent-indigo to-accent text-white">
                        Y
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Share your study progress, achievements, or ask for help..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="mb-4 clay-input rounded-xl resize-none"
                        rows={3}
                      />

                      {/* Show selected attachments */}
                      {(selectedMaterials.length > 0 || selectedFiles.length > 0) && (
                        <div className="mb-4 space-y-2">
                          {selectedMaterials.map(material => (
                            <div key={material.id} className="flex items-center justify-between p-2 bg-primary/10 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-primary" />
                                <span className="text-sm text-foreground">{material.title}</span>
                                <Badge variant="outline" className="text-xs">{material.type}</Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMaterial(material.id)}
                                className="h-6 w-6 p-0 rounded-full"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-primary/10 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Paperclip className="w-4 h-4 text-primary" />
                                <span className="text-sm text-foreground">{file.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {(file.size / 1024).toFixed(1)} KB
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFile(index)}
                                className="h-6 w-6 p-0 rounded-full"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Attachment Picker */}
                      {showAttachmentPicker && <AttachmentPicker />}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleAttachStudyMaterial}
                            className={`rounded-full ${showAttachmentPicker ? 'bg-primary/10 text-primary' : ''}`}
                          >
                            <Paperclip className="w-4 h-4 mr-2" />
                            Attach Files
                          </Button>
                          <input
                            type="file"
                            id="quick-file-upload"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx,.txt"
                          />
                          <label htmlFor="quick-file-upload">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              type="button"
                              onClick={() => document.getElementById('quick-file-upload')?.click()}
                              className="rounded-full"
                            >
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Image
                            </Button>
                          </label>
                        </div>
                        <Button 
                          onClick={handleCreatePost}
                          disabled={!newPost.trim() || isPosting}
                          className="clay-button text-white rounded-xl"
                        >
                          {isPosting ? (
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
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {/* Sidebar */}
              <div className="col-span-4 space-y-6">
                {/* Trending Topics */}
                <Card className="p-6 clay-card border-0">
                  <h3 className="text-lg text-foreground mb-4 flex items-center font-medium">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                    Trending Topics
                  </h3>
                  <div className="space-y-3">
                    {['#APCalculus', '#BiologyStudyTips', '#ChemistryHelp', '#MathFormulas', '#StudyMotivation'].map((topic, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span 
                          className="text-primary hover:text-primary/80 cursor-pointer"
                          onClick={() => handleTrendingTopicClick(topic)}
                        >
                          {topic}
                        </span>
                        <span className="text-sm text-muted-foreground">{Math.floor(Math.random() * 100) + 20} posts</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Study Streak */}
                <Card className="p-6 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 clay-card">
                  <h3 className="text-lg text-foreground mb-4 flex items-center font-medium">
                    <Target className="w-5 h-5 mr-2 text-accent" />
                    Your Study Streak
                  </h3>
                  <div className="text-center">
                    <div className="text-3xl text-accent mb-2 font-semibold">5</div>
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
                    {studyGroups.filter(group => group.isJoined).map((group) => (
                      <div key={group.id} className="flex items-center justify-between p-3 bg-muted rounded-lg clay-input">
                        <div>
                          <p className="text-foreground font-medium">{group.name}</p>
                          {group.nextSession && (
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {group.nextSession}
                            </p>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleJoinGroup(group.id)}
                          className="text-primary rounded-lg hover:text-primary/80"
                        >
                          Join
                        </Button>
                      </div>
                    ))}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studyGroups.map((group) => (
                <StudyGroupCard key={group.id} group={group} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card className="p-8 clay-card border-0 text-center">
              <Award className="w-16 h-16 text-accent mx-auto mb-4" />
              <h2 className="text-xl text-foreground mb-2 font-semibold">Achievements Coming Soon</h2>
              <p className="text-muted-foreground mb-6">Track your study milestones and celebrate your progress with achievement badges.</p>
              <Button 
                onClick={handleViewProgress}
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
                onClick={handleCheckRankings}
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