import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ContentInputOptions } from './ContentInputOptions';
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
  ChevronRight
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
  const [viewMode, setViewMode] = useState<'chat' | 'youtube' | 'history'>('chat');
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
  const [savedChats, setSavedChats] = useState<Chat[]>(() => {
    try {
      const storedChats = localStorage.getItem('studyflow-ai-chats');
      return storedChats ? JSON.parse(storedChats, (key, value) => {
        // Convert timestamp strings back to Date objects
        if (key === 'timestamp' || key === 'createdAt') {
          return new Date(value);
        }
        return value;
      }) : [];
    } catch (error) {
      console.error('Error loading AI chats from localStorage:', error);
      return [];
    }
  });

  // Save AI chats to localStorage whenever savedChats changes
  useEffect(() => {
    try {
      localStorage.setItem('studyflow-ai-chats', JSON.stringify(savedChats));
    } catch (error) {
      console.error('Error saving AI chats to localStorage:', error);
    }
  }, [savedChats]);

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
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are a helpful AI study assistant for students. Be friendly, encouraging, and provide clear explanations. Help with studying, concepts, homework questions, and study tips. 

User message: ${userMessage.text}

Respond helpfully and conversationally.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

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
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
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
      // Extract video ID from URL
      const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // Get video info from YouTube API
      const ytResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
      );
      const ytData = await ytResponse.json();
      const video = ytData.items?.[0];
      
      if (!video) {
        throw new Error('Video not found');
      }

      // Use Google AI to analyze video
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analyze this YouTube video and create comprehensive study content:

Title: ${video.snippet.title}
Description: ${video.snippet.description}

Please provide:
1. **Key Topics** covered in the video
2. **Important Concepts** and definitions
3. **Study Notes** with main points
4. **Summary** of the content

Format as clear, organized study material.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `📺 **Video Analysis: ${video.snippet.title}**\n\n${aiText}`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'youtube'
      };

      setCurrentChat(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage]
      }));
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `❌ Error processing YouTube video: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the URL and try again.`,
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
                  <h3 className="text-foreground font-medium group-hover:text-primary transition-colors">
                    {chat.title}
                  </h3>
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
