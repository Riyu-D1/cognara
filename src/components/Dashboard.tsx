import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Plus, 
  Brain, 
  HelpCircle, 
  FileText, 
  Clock, 
  TrendingUp,
  Target,
  Bot,
  Calendar,
  Settings,
  Star,
  BookOpen
} from 'lucide-react';
import { Screen } from '../utils/constants';

interface DashboardProps {
  userName: string;
  onNavigate: (screen: Screen) => void;
}

export function Dashboard({ userName, onNavigate }: DashboardProps) {
  const quickActions = [
    {
      title: 'Notes',
      description: 'Create and manage notes',
      icon: FileText,
      color: 'from-primary to-primary-hover',
      action: () => onNavigate('notes')
    },
    {
      title: 'AI Assistant',
      description: 'Chat with your study AI',
      icon: Bot,
      color: 'from-accent-indigo to-accent',
      action: () => onNavigate('ai')
    },
    {
      title: 'Flashcards',
      description: 'Create and review cards',
      icon: Brain,
      color: 'from-accent-cyan to-accent',
      action: () => onNavigate('flashcards')
    },
    {
      title: 'Quizzes',
      description: 'Create and take quizzes',
      icon: HelpCircle,
      color: 'from-primary to-accent-indigo',
      action: () => onNavigate('quiz')
    },
    {
      title: 'Calendar',
      description: 'Schedule & Pomodoro',
      icon: Calendar,
      color: 'from-accent-cyan to-primary',
      action: () => onNavigate('calendar')
    },
    {
      title: 'Settings',
      description: 'Customize your experience',
      icon: Settings,
      color: 'from-accent-indigo to-accent-cyan',
      action: () => onNavigate('settings')
    }
  ];

  const recentActivity = [
    { title: 'Biology Chapter 12', type: 'Notes', time: '2 hours ago', progress: 85, icon: FileText },
    { title: 'Chemistry Flashcards', type: 'Flashcards', time: '1 day ago', progress: 92, icon: Brain },
    { title: 'Math Quiz', type: 'Quiz', time: '2 days ago', progress: 78, icon: HelpCircle },
    { title: 'History Summary', type: 'Notes', time: '3 days ago', progress: 95, icon: BookOpen }
  ];

  const stats = [
    { label: 'Study Streak', value: '7 days', icon: Target, color: 'accent-cyan' },
    { label: 'Total Hours', value: '24h', icon: Clock, color: 'primary' },
    { label: 'Average Score', value: '88%', icon: TrendingUp, color: 'accent-indigo' }
  ];

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      {/* Welcome Header */}
      <div className="clay-card p-8">
                  <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-muted-foreground text-sm">StudyNet Active</span>
          </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="clay-card p-6 hover:clay-glow-accent transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-semibold text-foreground mt-2">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl bg-${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 clay-button group-hover:clay-glow-primary`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Quick Actions</h2>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-accent clay-glow-accent" />
            <span className="text-muted-foreground text-sm">Most Used</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div 
                key={index} 
                className="clay-card p-6 hover:clay-glow-primary hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                onClick={action.action}
              >
                <div className="space-y-4">
                  <div className={`w-14 h-14 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300 clay-button group-hover:clay-glow-primary`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold text-lg group-hover:text-primary transition-colors duration-200">{action.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{action.description}</p>
                  </div>
                  <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform duration-200">
                    <span>Get started</span>
                    <Plus className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Recent Activity</h2>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary-hover hover:bg-muted rounded-xl font-medium"
          >
            View All
          </Button>
        </div>
        
        <div className="clay-card p-6">
          <div className="space-y-4">
            {recentActivity.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors duration-200 clay-input">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center clay-button">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-foreground font-medium">{item.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-muted text-muted-foreground border-0 rounded-lg"
                        >
                          {item.type}
                        </Badge>
                        <span className="text-muted-foreground text-sm">{item.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            item.progress >= 90 ? 'bg-accent-cyan' : 
                            item.progress >= 80 ? 'bg-primary' : 'bg-accent-indigo'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${
                        item.progress >= 90 ? 'text-accent-cyan' : 
                        item.progress >= 80 ? 'text-primary' : 'text-accent-indigo'
                      }`}>
                        {item.progress}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Progress</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="clay-card p-8 bg-gradient-to-br from-primary/5 to-accent-indigo/5 border border-primary/10">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto clay-button">
            <Star className="w-6 h-6 text-white" />
          </div>
          <p className="text-foreground text-lg italic font-medium">
            "Success is not final, failure is not fatal: it is the courage to continue that counts."
          </p>
          <p className="text-muted-foreground text-sm">- Winston Churchill</p>
        </div>
      </div>
    </div>
  );
}