import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ContentInputOptions } from './ContentInputOptions';
import { AIConnectionTest } from './AIConnectionTest';
import { hybridSyncService } from '../services/hybridSync';
import { aiChatsService } from '../services/database';
import { 
  Bot, 
  MessageCircle, 
  Send,
  Plus,
  History,
  Clock,
  User,
  Sparkles,
  Youtube,
  FileText,
  Brain,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'chat' | 'youtube' | 'file';
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export default function AITest() {
  const [viewMode, setViewMode] = useState<'chat' | 'youtube' | 'history' | 'test'>('chat');
  const [currentMessage, setCurrentMessage] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentChat, setCurrentChat] = useState<Chat>({
    id: '1',
    title: 'New Chat',
    messages: [
      {
        id: '1',
        text: "Hi! I'm your AI study assistant. I can help you with studying, explain concepts, answer questions, and provide study tips. You can also ask me to analyze YouTube videos or upload documents. How can I help you today?",
        sender: 'ai',
        timestamp: new Date()
      }
    ],
    createdAt: new Date()
  });
  // Wait for component to be ready before loading chats from localStorage
  const [savedChats, setSavedChats] = useState<Chat[]>([]);
  const [chatsReady, setChatsReady] = useState(false);

  useEffect(() => {
    // Wait for hybridSync to be ready before loading chats
    if (hybridSyncService.isReady()) {
      loadChatsFromStorage();
    } else {
      hybridSyncService.onReady(() => {
        loadChatsFromStorage();
      });
    }
  }, []);

  const loadChatsFromStorage = () => {
    try {
      console.log('📱 AITest: Loading chats from storage...');
      const storedChats = localStorage.getItem('studyflow-ai-chats');
      if (storedChats) {
        setSavedChats(JSON.parse(storedChats, (key, value) => {
          if (key === 'timestamp' || key === 'createdAt') {
            return new Date(value);
          }
          return value;
        }));
      } else {
        setSavedChats([]);
      }
    } catch (error) {
      console.error('Error loading AI chats from localStorage:', error);
      setSavedChats([]);
    }
    setChatsReady(true);
  };

  // Save AI chats using hybrid sync service
  useEffect(() => {
    if (chatsReady && savedChats.length > 0) {
      try {
        console.log('💾 AITest: Saving chats to hybrid sync:', savedChats.length, 'chats');
        hybridSyncService.saveData('studyflow-ai-chats', savedChats);
      } catch (error) {
        console.error('Error saving AI chats:', error);
      }
    }
  }, [savedChats, chatsReady]);

  // Auto-save current chat when messages are added (but not the initial AI greeting)
  useEffect(() => {
    if (currentChat.messages.length > 1) {
      // Update chat title with first user message if it's still "New Chat"
      const updatedChat = { ...currentChat };
      if (updatedChat.title === 'New Chat') {
        const firstUserMessage = updatedChat.messages.find(msg => msg.sender === 'user');
        if (firstUserMessage) {
          updatedChat.title = firstUserMessage.text.substring(0, 50) + (firstUserMessage.text.length > 50 ? '...' : '');
        }
      }

      setSavedChats(prev => {
        // Check if this chat already exists in saved chats
        const existingIndex = prev.findIndex(chat => chat.id === updatedChat.id);
        if (existingIndex !== -1) {
          // Update existing chat
          const updatedChats = [...prev];
          updatedChats[existingIndex] = updatedChat;
          return updatedChats;
        } else {
          // Add new chat to the beginning
          return [updatedChat, ...prev];
        }
      });
    }
  }, [currentChat.messages.length, currentChat.id]);

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'chat'
    };

    setCurrentChat(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));
    setCurrentMessage('');
    setLoading(true);

    try {
      console.log('Sending message to AI:', userMessage.text);
      
      // Use the OpenRouter-based AI service
      const { chatWithAI } = await import('../services/ai');
      const text = await chatWithAI(userMessage.text);
      
      console.log('AI response received:', text.substring(0, 100) + '...');

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: text,
        sender: 'ai',
        timestamp: new Date(),
        type: 'chat'
      };

      setCurrentChat(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage]
      }));
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the API connection test for more details.`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'chat'
      };
      setCurrentChat(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }));
    } finally {
      setLoading(false);
    }
  };

  const processYouTubeVideo = async () => {
    if (!youtubeUrl.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: `Analyze this YouTube video: ${youtubeUrl}`,
      sender: 'user',
      timestamp: new Date(),
      type: 'youtube'
    };

    setCurrentChat(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));
    setYoutubeUrl('');
    setLoading(true);

    try {
      console.log('Processing YouTube video:', youtubeUrl);
      
      // Extract video ID from URL
      const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (!videoId) {
        throw new Error('Invalid YouTube URL format');
      }

      let videoTitle = 'YouTube Video';
      let videoDescription = '';

      // Try to get video info from YouTube API if key is available
      const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (youtubeApiKey && youtubeApiKey !== 'your_youtube_api_key_here') {
        try {
          console.log('Fetching video metadata from YouTube API');
          const ytResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${youtubeApiKey}`
          );
          
          if (ytResponse.ok) {
            const ytData = await ytResponse.json();
            const video = ytData.items?.[0];
            
            if (video) {
              videoTitle = video.snippet.title;
              videoDescription = video.snippet.description;
              console.log('Video metadata retrieved:', videoTitle);
            }
          } else {
            console.warn('YouTube API request failed:', await ytResponse.text());
          }
        } catch (ytError) {
          console.warn('YouTube API failed, proceeding with AI analysis anyway:', ytError);
        }
      }

      // Use OpenRouter AI to analyze video
      const { chatWithAI } = await import('../services/ai');
      
      const prompt = `Analyze this YouTube video and create comprehensive study content:

Video URL: ${youtubeUrl}
Title: ${videoTitle}
${videoDescription ? `Description: ${videoDescription}` : ''}

Since I don't have access to the actual video content, please provide general study guidance for analyzing YouTube educational content:

1. **How to Take Notes** from educational videos
2. **Key Elements to Look For** when studying from video content
3. **Study Strategies** for video-based learning
4. **Tips for Retention** from multimedia content

Please provide practical, actionable advice for studying from this video format.`;

      console.log('Sending video analysis request to AI');
      const aiText = await chatWithAI(prompt);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `📺 **Video Analysis: ${videoTitle}**\n\n${aiText}`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'youtube'
      };

      setCurrentChat(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage]
      }));
    } catch (error) {
      console.error('YouTube processing error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `❌ Error processing YouTube video: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the URL and your API connections.`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'youtube'
      };
      setCurrentChat(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (viewMode === 'chat') {
        sendMessage();
      } else if (viewMode === 'youtube') {
        processYouTubeVideo();
      }
    }
  };

  const startNewChat = () => {
    // Current chat is already auto-saved by useEffect, no need to manually save
    setCurrentChat({
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [
        {
          id: '1',
          text: "Hi! I'm your AI study assistant. How can I help you today?",
          sender: 'ai',
          timestamp: new Date()
        }
      ],
      createdAt: new Date()
    });
    setViewMode('chat');
  };

  const deleteChat = async (chatId: string) => {
    console.log('🗑️ AITest: Deleting chat:', chatId);
    
    try {
      // First, remove from local state for immediate UI update
      setSavedChats(savedChats.filter(chat => chat.id !== chatId));
      
      // Also remove from localStorage
      const dataStr = localStorage.getItem('studyflow-ai-chats');
      if (dataStr) {
        const chats = JSON.parse(dataStr, (key, value) => {
          if (key === 'timestamp' || key === 'createdAt') {
            return new Date(value);
          }
          return value;
        });
        const updatedChats = chats.filter((c: any) => c.id !== chatId);
        localStorage.setItem('studyflow-ai-chats', JSON.stringify(updatedChats));
        
        // Trigger storage event for other components
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'studyflow-ai-chats',
          newValue: JSON.stringify(updatedChats),
          oldValue: dataStr
        }));
      }
      
      // If the chat has a database ID, delete it from database too
      const chatInStorage = dataStr ? JSON.parse(dataStr, (key, value) => {
        if (key === 'timestamp' || key === 'createdAt') {
          return new Date(value);
        }
        return value;
      }).find((c: any) => c.id === chatId) : null;
      
      if (chatInStorage?.db_id && hybridSyncService.getSyncStatus().isOnline) {
        console.log(`☁️ Deleting chat ${chatInStorage.db_id} from database...`);
        const dbSuccess = await aiChatsService.deleteChat(chatInStorage.db_id);
        if (dbSuccess) {
          console.log(`✅ Successfully deleted chat from database`);
        } else {
          console.warn(`⚠️ Failed to delete chat from database`);
        }
      } else {
        console.log(`📝 Chat has no database ID or offline - local deletion only`);
      }
      
      console.log('✅ AITest: Chat deleted successfully');
    } catch (error) {
      console.error('❌ AITest: Error deleting chat:', error);
      // Restore chat if deletion failed
      if (savedChats.find(chat => chat.id === chatId) === undefined) {
        const dataStr = localStorage.getItem('studyflow-ai-chats');
        if (dataStr) {
          const chats = JSON.parse(dataStr, (key, value) => {
            if (key === 'timestamp' || key === 'createdAt') {
              return new Date(value);
            }
            return value;
          });
          setSavedChats(chats);
        }
      }
    }
  };

  const loadChat = (chat: Chat) => {
    setCurrentChat(chat);
    setViewMode('chat');
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'file': return <FileText className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  if (viewMode === 'test') {
    return (
      <div className="p-8 space-y-8 bg-background min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl text-foreground font-semibold">AI Connection Test</h1>
            <p className="text-muted-foreground">
              Test your AI API connections and troubleshoot issues
            </p>
          </div>
          <Button 
            onClick={() => setViewMode('chat')}
            variant="outline"
            className="rounded-xl clay-input"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
        </div>

        {/* Connection Test */}
        <div className="max-w-4xl mx-auto">
          <AIConnectionTest />
        </div>
      </div>
    );
  }

  if (viewMode === 'history') {
    return (
      <div className="p-8 space-y-8 bg-background min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl text-foreground font-semibold">Chat History</h1>
            <p className="text-muted-foreground">
              View and manage your previous AI conversations • {savedChats.length} chats saved
            </p>
          </div>
          <Button 
            onClick={() => setViewMode('chat')}
            variant="outline"
            className="rounded-xl clay-input"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
        </div>

        {/* Chat History List */}
        <div className="max-w-4xl mx-auto space-y-4">
          {savedChats.map((chat) => (
            <Card 
              key={chat.id}
              className="p-6 clay-card border-0 hover:clay-elevated transition-all duration-200 cursor-pointer group"
              onClick={() => loadChat(chat)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-foreground font-medium group-hover:text-primary transition-colors">
                      {chat.title}
                    </h3>
                    
                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-muted-foreground text-sm mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{chat.createdAt.toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{chat.messages.length} messages</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                    {chat.messages[chat.messages.length - 1]?.text}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Card>
          ))}
          
          {savedChats.length === 0 && (
            <Card className="p-12 clay-card border-0 text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-foreground text-lg mb-2">No chat history yet</h3>
              <p className="text-muted-foreground">
                Start conversations with the AI assistant to see them here
              </p>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl text-foreground font-semibold">AI Study Assistant</h1>
          <p className="text-muted-foreground">
            Chat with AI, analyze YouTube videos, and get study help
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => setViewMode('test')}
            variant="outline"
            className="rounded-xl clay-input"
          >
            <Bot className="w-4 h-4 mr-2" />
            Test Connection
          </Button>
          <Button 
            onClick={() => setViewMode('history')}
            variant="outline"
            className="rounded-xl clay-input"
          >
            <History className="w-4 h-4 mr-2" />
            View History
          </Button>
          <Button 
            onClick={startNewChat}
            className="clay-button bg-gradient-to-r from-primary to-primary-hover text-primary-foreground rounded-xl border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Mode Tabs */}
        <Card className="p-6 clay-card border-0">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setViewMode('chat')}
              variant={viewMode === 'chat' ? 'default' : 'outline'}
              className={viewMode === 'chat' ? 'clay-button bg-gradient-to-r from-primary to-primary-hover text-primary-foreground rounded-xl border-0' : 'rounded-xl clay-input'}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
            <Button
              onClick={() => setViewMode('youtube')}
              variant={viewMode === 'youtube' ? 'default' : 'outline'}
              className={viewMode === 'youtube' ? 'clay-button bg-gradient-to-r from-primary to-primary-hover text-primary-foreground rounded-xl border-0' : 'rounded-xl clay-input'}
            >
              <Youtube className="w-4 h-4 mr-2" />
              YouTube Analysis
            </Button>
          </div>
        </Card>

        {/* Chat Messages */}
        <Card className="p-6 clay-card border-0">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {currentChat.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-start space-x-3 max-w-lg">
                  {message.sender === 'ai' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-hover rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-primary to-primary-hover text-primary-foreground ml-12'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {message.type && getMessageIcon(message.type)}
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                  
                  {message.sender === 'user' && (
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-foreground" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-hover rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted text-foreground px-4 py-3 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Input Area */}
        <Card className="p-6 clay-card border-0">
          {viewMode === 'chat' ? (
            <div className="flex items-center space-x-3">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your studies..."
                className="flex-1 clay-input border-0"
                disabled={loading}
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !currentMessage.trim()}
                className="clay-button bg-gradient-to-r from-primary to-primary-hover text-primary-foreground rounded-xl border-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Paste YouTube URL here..."
                  className="flex-1 clay-input border-0"
                  disabled={loading}
                />
                <Button
                  onClick={processYouTubeVideo}
                  disabled={loading || !youtubeUrl.trim()}
                  className="clay-button bg-gradient-to-r from-primary to-primary-hover text-primary-foreground rounded-xl border-0"
                >
                  <Youtube className="w-4 h-4 mr-2" />
                  Analyze
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                Enter a YouTube URL to get AI-generated study notes, summaries, and key concepts from the video.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
