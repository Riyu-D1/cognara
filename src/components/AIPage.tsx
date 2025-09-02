import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Send, 
  Bot, 
  User, 
  Plus, 
  Clock, 
  FileText, 
  Brain, 
  HelpCircle,
  BookOpen,
  Lightbulb,
  Target,
  TrendingUp
} from 'lucide-react';
import { Screen } from '../utils/constants';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  relatedContent?: {
    type: 'note' | 'flashcard' | 'quiz';
    title: string;
    id: string;
  }[];
}

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

interface AIPageProps {
  onNavigate: (screen: Screen) => void;
}

export function AIPage({ onNavigate }: AIPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your AI study assistant. I can help you understand your study materials, create summaries, generate practice questions, and track your progress. What would you like to work on today?",
      sender: 'ai',
      timestamp: new Date(),
      relatedContent: []
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentChat, setCurrentChat] = useState<string>('current');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock previous chats
  const [previousChats] = useState<Chat[]>([
    {
      id: 'chat-1',
      title: 'Biology Study Session',
      lastMessage: 'Great! You scored 85% on the cell biology quiz.',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      messageCount: 12
    },
    {
      id: 'chat-2', 
      title: 'Math Problem Help',
      lastMessage: 'Here are some practice problems for calculus derivatives.',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      messageCount: 8
    },
    {
      id: 'chat-3',
      title: 'History Notes Review',
      lastMessage: 'I summarized your World War II notes.',
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
      messageCount: 15
    },
    {
      id: 'chat-4',
      title: 'Chemistry Lab Report',
      lastMessage: 'I helped format your organic chemistry lab report.',
      timestamp: new Date(Date.now() - 432000000), // 5 days ago
      messageCount: 6
    },
    {
      id: 'chat-5',
      title: 'Physics Study Guide',
      lastMessage: 'Created flashcards for thermodynamics concepts.',
      timestamp: new Date(Date.now() - 518400000), // 6 days ago
      messageCount: 9
    }
  ]);

  // Mock study data for AI context
  const studyContext = {
    totalNotes: 24,
    totalFlashcards: 156,
    totalQuizzes: 8,
    recentStudyTime: '2h 30m',
    weakAreas: ['Organic Chemistry', 'Calculus Integration'],
    strongAreas: ['Biology', 'World History']
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date(),
      relatedContent: []
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate AI response with delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.content);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    let response = '';
    let relatedContent: Message['relatedContent'] = [];

    if (input.includes('summary') || input.includes('summarize')) {
      response = "I can create a summary of your study materials! Based on your recent notes, I see you've been studying biology and chemistry. Would you like me to summarize your notes on cell biology or organic chemistry?";
      relatedContent = [
        { type: 'note', title: 'Cell Biology - Chapter 3', id: 'note-1' },
        { type: 'note', title: 'Organic Chemistry Basics', id: 'note-2' }
      ];
    } else if (input.includes('quiz') || input.includes('test')) {
      response = "I can generate practice questions based on your study materials! You have notes on biology, chemistry, and history. Which subject would you like me to create quiz questions for?";
      relatedContent = [
        { type: 'flashcard', title: 'Biology Flashcards', id: 'flash-1' },
        { type: 'quiz', title: 'Chemistry Practice Quiz', id: 'quiz-1' }
      ];
    } else if (input.includes('progress') || input.includes('performance')) {
      response = `Great question! Here's your study progress overview:\n\n📚 **Study Materials:**\n• ${studyContext.totalNotes} notes created\n• ${studyContext.totalFlashcards} flashcards made\n• ${studyContext.totalQuizzes} quizzes completed\n\n⏱️ **Recent Activity:** ${studyContext.recentStudyTime} studied today\n\n💪 **Strong Areas:** ${studyContext.strongAreas.join(', ')}\n🎯 **Focus Areas:** ${studyContext.weakAreas.join(', ')}\n\nWould you like me to create targeted practice for your focus areas?`;
    } else if (input.includes('flashcard')) {
      response = "I can help you create flashcards from your notes! I see you have notes on various subjects. Which notes would you like me to convert to flashcards?";
      relatedContent = [
        { type: 'note', title: 'World History Notes', id: 'note-3' },
        { type: 'note', title: 'Math Formulas', id: 'note-4' }
      ];
    } else if (input.includes('help') || input.includes('how')) {
      response = "I'm here to help with your studies! Here's what I can do:\n\n📝 **Content Creation:**\n• Summarize your notes\n• Generate flashcards\n• Create practice quizzes\n\n📊 **Progress Tracking:**\n• Analyze your performance\n• Identify weak areas\n• Suggest study strategies\n\n🧠 **Study Support:**\n• Answer questions about your materials\n• Explain difficult concepts\n• Provide study tips\n\nWhat would you like to start with?";
    } else {
      response = "I understand you want to work on your studies! Based on your materials, I can help you with biology, chemistry, history, and math. What specific topic or task would you like assistance with?";
    }

    return {
      id: Date.now().toString(),
      content: response,
      sender: 'ai',
      timestamp: new Date(),
      relatedContent
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([{
      id: '1',
      content: "Hi! I'm your AI study assistant. I can help you understand your study materials, create summaries, generate practice questions, and track your progress. What would you like to work on today?",
      sender: 'ai',
      timestamp: new Date(),
      relatedContent: []
    }]);
    setCurrentChat('new-' + Date.now());
  };

  const quickActions = [
    { 
      icon: FileText, 
      label: 'Summarize Notes', 
      action: () => setNewMessage('Can you summarize my recent notes?'),
      gradient: 'from-primary to-accent-cyan'
    },
    { 
      icon: Brain, 
      label: 'Generate Flashcards', 
      action: () => setNewMessage('Create flashcards from my notes'),
      gradient: 'from-accent-indigo to-accent'
    },
    { 
      icon: HelpCircle, 
      label: 'Practice Quiz', 
      action: () => setNewMessage('Generate a practice quiz for me'),
      gradient: 'from-accent-cyan to-primary'
    },
    { 
      icon: TrendingUp, 
      label: 'Check Progress', 
      action: () => setNewMessage('Show me my study progress'),
      gradient: 'from-accent to-accent-indigo'
    }
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Previous Chats Sidebar - Fixed Width */}
      <div className="w-80 bg-card/80 backdrop-blur-sm border-r border-border clay-nav">
        {/* Sidebar Header - Fixed */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center clay-glow-primary">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-foreground font-semibold">
                AI Assistant
              </h2>
            </div>
            <Button onClick={startNewChat} size="sm" className="clay-button text-white rounded-xl">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={action.action}
                className="h-auto p-3 flex flex-col items-center space-y-1 rounded-xl hover:bg-muted clay-input"
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center clay-elevated">
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-muted-foreground text-center leading-tight">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Previous Chats List - Properly contained */}
        <div className="flex flex-col h-0 flex-1">
          <div className="p-6 pb-4">
            <h3 className="text-foreground font-medium">Previous Chats</h3>
          </div>
          <div className="flex-1 px-6 pb-6">
            <div className="h-full overflow-auto">
              <div className="space-y-3">
                {previousChats.map((chat) => (
                  <Card 
                    key={chat.id}
                    className={`p-4 cursor-pointer transition-all duration-200 clay-input border-0 hover:clay-glow-accent ${
                      currentChat === chat.id ? 'clay-glow-primary' : ''
                    }`}
                    onClick={() => setCurrentChat(chat.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-foreground truncate flex-1 font-medium text-sm pr-2">{chat.title}</h4>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {chat.messageCount}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 leading-relaxed line-clamp-2">{chat.lastMessage}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span>{chat.timestamp.toLocaleDateString()}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area - Flex to fill remaining space */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header - Fixed */}
        <div className="flex-shrink-0 p-6 bg-card/80 backdrop-blur-sm border-b border-border clay-nav">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center clay-glow-primary">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl text-foreground font-semibold">
                  AI Study Assistant
                </h1>
                <p className="text-muted-foreground">Your personal AI tutor</p>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-muted px-4 py-2 rounded-xl clay-input">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">Study Context Active</span>
              </div>
              <div className="flex items-center space-x-2 bg-muted px-4 py-2 rounded-xl clay-input">
                <Lightbulb className="w-4 h-4 text-accent" />
                <span className="text-sm text-foreground">{studyContext.totalNotes} Notes • {studyContext.totalFlashcards} Cards</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area - Scrollable, fills remaining space */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="space-y-6 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div key={message.id} className={`flex items-start space-x-4 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className={message.sender === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-accent text-white'
                      }>
                        {message.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex-1 min-w-0 ${message.sender === 'user' ? 'text-right' : ''}`}>
                      <Card className={`p-4 inline-block max-w-2xl border-0 ${
                        message.sender === 'user' 
                          ? 'bg-primary text-primary-foreground clay-glow-primary' 
                          : 'bg-card clay-elevated'
                      }`}>
                        <div className="whitespace-pre-wrap break-words">{message.content}</div>
                        
                        {message.relatedContent && message.relatedContent.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className={`text-sm font-medium ${message.sender === 'user' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>Related Content:</p>
                            <div className="space-y-1">
                              {message.relatedContent.map((content, index) => (
                                <div key={index} className={`flex items-center space-x-2 p-2 rounded-lg ${message.sender === 'user' ? 'bg-white/20' : 'bg-muted'}`}>
                                  {content.type === 'note' && <FileText className="w-4 h-4 text-primary flex-shrink-0" />}
                                  {content.type === 'flashcard' && <Brain className="w-4 h-4 text-accent-indigo flex-shrink-0" />}
                                  {content.type === 'quiz' && <HelpCircle className="w-4 h-4 text-accent flex-shrink-0" />}
                                  <span className={`text-sm truncate ${message.sender === 'user' ? 'text-primary-foreground' : 'text-foreground'}`}>{content.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                      
                      <div className={`mt-2 text-xs text-muted-foreground ${message.sender === 'user' ? 'text-right' : ''}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-accent text-white">
                        <Bot className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <Card className="p-4 bg-card border-0 clay-elevated">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-accent-indigo rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-accent-indigo rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-accent-indigo rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </Card>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Message Input - Fixed at bottom */}
        <div className="flex-shrink-0 p-6 bg-card/80 backdrop-blur-sm border-t border-border clay-nav">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about your study materials, progress, or request help..."
                  className="min-h-[3rem] resize-none rounded-xl clay-input"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isTyping}
                className="clay-button text-white rounded-xl px-6 h-12 flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="mt-3 flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <span>💡 Try: "Summarize my biology notes" or "Create a quiz on chemistry"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}