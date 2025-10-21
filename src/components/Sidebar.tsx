import React from 'react';
import { Card } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { 
  Home, 
  FileText, 
  Brain, 
  HelpCircle, 
  Bot,
  Users,
  Calendar,
  Settings,
  BookOpen,
  ArrowLeft 
} from 'lucide-react';
import { Screen } from '../utils/constants';

interface SidebarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  userName: string;
}

export function Sidebar({ currentScreen, onNavigate, userName }: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as Screen, icon: Home, label: 'Dashboard' },
    { id: 'notes' as Screen, icon: FileText, label: 'Notes' },
    { id: 'flashcards' as Screen, icon: Brain, label: 'Flashcards' },
    { id: 'quiz' as Screen, icon: HelpCircle, label: 'Quizzes' },
    { id: 'ai' as Screen, icon: Bot, label: 'AI Assistant' },
    { id: 'social' as Screen, icon: Users, label: 'Social (Beta)' },
    { id: 'calendar' as Screen, icon: Calendar, label: 'Calendar' },
    { id: 'settings' as Screen, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 clay-nav border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center clay-button clay-glow-primary">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StudyNet
            </h1>
            <p className="text-xs text-muted-foreground">Modern Learning</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start h-12 rounded-xl transition-all duration-300 border-0 ${
                isActive 
                  ? 'bg-gradient-to-r from-primary to-primary-hover text-primary-foreground clay-active dark:clay-glow-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted clay-input border-transparent dark:hover:clay-glow-accent'
              }`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </Button>
          );
        })}
        
        {/* Back to Landing */}
        <div className="pt-4 border-t border-border mt-4">
          <Button
            variant="ghost"
            className="w-full justify-start h-10 rounded-xl transition-all duration-300 border-0 text-muted-foreground hover:text-foreground hover:bg-muted clay-input border-transparent"
            onClick={() => onNavigate('landing')}
          >
            <ArrowLeft className="w-4 h-4 mr-3" />
            <span className="text-sm">Back to Home</span>
          </Button>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="clay-card p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 clay-elevated">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-hover text-primary-foreground font-semibold text-lg">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground">Student</p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-accent rounded-full mr-1 shadow-[0px_0px_4px_rgba(6,182,212,0.6)]"></div>
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}