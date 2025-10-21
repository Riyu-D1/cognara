import React from 'react';
import { SettingsProvider } from './SettingsContext';
import { LandingPage } from './LandingPage';
import { AboutPage } from './AboutPage';
import { AuthPage } from './AuthPage';
import { Dashboard } from './Dashboard';
import { NotesPage } from './NotesPage';
import { FlashcardsPage } from './FlashcardsPage';
import { QuizPage } from './QuizPage';
import { SettingsPage } from './SettingsPage';
import { AIPage } from './AIPage';
import { SocialPage } from './SocialPage';
import { CalendarPage } from './CalendarPage';
import { Sidebar } from './Sidebar';
import { Toaster } from './ui/sonner';
import { Screen } from '../utils/constants';
import { NavigationHelpers } from '../utils/helpers';

interface User {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string | null;
  provider?: string;
}

interface AppRouterProps {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  hasAccessedApp: boolean;
  user: User | null;
  navigationHelpers: NavigationHelpers;
  showAuth: boolean;
}

export function AppRouter({ 
  currentScreen, 
  setCurrentScreen, 
  hasAccessedApp, 
  user, 
  navigationHelpers,
  showAuth 
}: AppRouterProps) {
  const { handleTryApp, handleNavigateToAbout, handleNavigateBackToLanding, handleLogout } = navigationHelpers;

  if (showAuth && hasAccessedApp) {
    return <AuthPage />;
  }

  if (currentScreen === 'landing' || !hasAccessedApp) {
    return (
      <SettingsProvider>
        <LandingPage onTryApp={handleTryApp} onNavigateToAbout={handleNavigateToAbout} />
        <Toaster />
      </SettingsProvider>
    );
  }

  if (currentScreen === 'about') {
    return (
      <SettingsProvider>
        <AboutPage onNavigateBack={handleNavigateBackToLanding} onTryApp={handleTryApp} />
        <Toaster />
      </SettingsProvider>
    );
  }

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-background flex">
        <Sidebar 
          currentScreen={currentScreen} 
          onNavigate={setCurrentScreen} 
          userName={user?.name || user?.email?.split('@')[0] || 'Dev User'} 
        />
        <main className="flex-1 ml-64">
          {currentScreen === 'dashboard' && (
            <Dashboard 
              userName={user?.name || user?.email?.split('@')[0] || 'Dev User'} 
              onNavigate={setCurrentScreen} 
            />
          )}
          {currentScreen === 'notes' && <NotesPage onNavigate={setCurrentScreen} />}
          {currentScreen === 'flashcards' && <FlashcardsPage onNavigate={setCurrentScreen} />}
          {currentScreen === 'quiz' && <QuizPage onNavigate={setCurrentScreen} />}
          {currentScreen === 'ai' && <AIPage onNavigate={setCurrentScreen} />}
          {currentScreen === 'social' && <SocialPage onNavigate={setCurrentScreen} />}
          {currentScreen === 'calendar' && <CalendarPage onNavigate={setCurrentScreen} />}
          {currentScreen === 'settings' && (
            <SettingsPage 
              userName={user?.name || user?.email?.split('@')[0] || 'Dev User'} 
              userEmail={user?.email || 'developer@studynet.com'}
              userAvatar={user?.avatar_url || undefined}
              authProvider={user?.provider || 'mock'}
              onLogout={handleLogout} 
            />
          )}
        </main>
        <Toaster />
      </div>
    </SettingsProvider>
  );
}
