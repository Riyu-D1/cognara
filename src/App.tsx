import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { SettingsProvider } from './components/SettingsContext';
import { LandingPage } from './components/LandingPage';
import { AboutPage } from './components/AboutPage';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { NotesPage } from './components/NotesPage';
import { FlashcardsPage } from './components/FlashcardsPage';
import { QuizPage } from './components/QuizPage';
import { AIPage } from './components/AIPage';
import { SettingsPage } from './components/SettingsPage';
import { SocialPage } from './components/SocialPage';
import { CalendarPage } from './components/CalendarPage';
import { Sidebar } from './components/Sidebar';
import { Toaster } from './components/ui/sonner';
import { Screen } from './utils/constants';
import './utils/storage'; // Import storage utilities for global access

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [hasAccessedApp, setHasAccessedApp] = useState(false);
  const { user, loading, signOut } = useAuth();

  const handleTryApp = () => {
    setHasAccessedApp(true);
    if (user) {
      setCurrentScreen('dashboard');
    }
  };

  const handleNavigateToAbout = () => {
    setCurrentScreen('about');
  };

  const handleNavigateBackToLanding = () => {
    setCurrentScreen('landing');
    setHasAccessedApp(false);
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentScreen('landing');
    setHasAccessedApp(false);
  };

  // Auto-navigate to dashboard if user is already authenticated
  useEffect(() => {
    if (user && hasAccessedApp) {
      setCurrentScreen('dashboard');
    }
  }, [user, hasAccessedApp]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if user tried to access app but isn't authenticated
  if (hasAccessedApp && !user) {
    return (
      <SettingsProvider>
        <AuthPage />
        <Toaster />
      </SettingsProvider>
    );
  }

  // Show landing page 
  if (currentScreen === 'landing') {
    return (
      <SettingsProvider>
        <LandingPage onTryApp={handleTryApp} onNavigateToAbout={handleNavigateToAbout} />
        <Toaster />
      </SettingsProvider>
    );
  }

  // Show about page
  if (currentScreen === 'about') {
    return (
      <SettingsProvider>
        <AboutPage onNavigateBack={handleNavigateBackToLanding} onTryApp={handleTryApp} />
        <Toaster />
      </SettingsProvider>
    );
  }

  // Show main app with sidebar for authenticated users
  if (user && hasAccessedApp) {
    return (
      <SettingsProvider>
        <div className="min-h-screen bg-background flex">
          <Sidebar 
            currentScreen={currentScreen} 
            onNavigate={setCurrentScreen} 
            userName={user?.name || user?.email?.split('@')[0] || 'User'} 
          />
          <main className="flex-1 ml-64">
            {currentScreen === 'dashboard' && (
              <Dashboard 
                userName={user?.name || user?.email?.split('@')[0] || 'User'} 
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
                userName={user?.name || user?.email?.split('@')[0] || 'User'} 
                userEmail={user?.email || 'user@example.com'}
                userAvatar={user?.avatar_url || undefined}
                authProvider={user?.provider || 'email'}
                onLogout={handleLogout} 
              />
            )}
          </main>
          <Toaster />
        </div>
      </SettingsProvider>
    );
  }

  // Fallback to landing page
  return (
    <SettingsProvider>
      <LandingPage onTryApp={handleTryApp} onNavigateToAbout={handleNavigateToAbout} />
      <Toaster />
    </SettingsProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}