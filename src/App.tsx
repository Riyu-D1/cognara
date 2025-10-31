import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { SettingsProvider } from './components/SettingsContext';
import { StudyMaterialsProvider } from './components/StudyMaterialsContext';
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
import { debugStorage } from './utils/debugStorage';
import './utils/storage'; // Import storage utilities for global access

function AppContent() {
  // Initialize state from localStorage
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    try {
      const saved = localStorage.getItem('studyflow-current-screen');
      return (saved as Screen) || 'landing';
    } catch {
      return 'landing';
    }
  });
  
  const [hasAccessedApp, setHasAccessedApp] = useState(() => {
    try {
      return localStorage.getItem('studyflow-has-accessed-app') === 'true';
    } catch {
      return false;
    }
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { user, loading, signOut } = useAuth();

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('studyflow-current-screen', currentScreen);
    } catch (error) {
      console.error('Error saving current screen to localStorage:', error);
    }
  }, [currentScreen]);

  // Debug localStorage on app load
  useEffect(() => {
    console.log('🚀 App initialized - checking localStorage...');
    debugStorage();
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('studyflow-has-accessed-app', hasAccessedApp.toString());
    } catch (error) {
      console.error('Error saving hasAccessedApp to localStorage:', error);
    }
  }, [hasAccessedApp]);

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
    // Clear navigation state from localStorage on logout
    try {
      localStorage.removeItem('studyflow-current-screen');
      localStorage.removeItem('studyflow-has-accessed-app');
    } catch (error) {
      console.error('Error clearing navigation state from localStorage:', error);
    }
  };

  // Auto-navigate to dashboard only on first initialization or when needed
  useEffect(() => {
    if (!isInitialized && !loading) {
      setIsInitialized(true);
      
      if (user && hasAccessedApp) {
        // Only redirect to dashboard if there's no saved screen or if saved screen is landing/about
        const savedScreen = localStorage.getItem('studyflow-current-screen');
        if (!savedScreen || savedScreen === 'landing' || savedScreen === 'about') {
          setCurrentScreen('dashboard');
        }
        // Otherwise, keep the current screen (which was loaded from localStorage)
      }
    }
  }, [user, hasAccessedApp, loading, isInitialized]);

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
        <StudyMaterialsProvider>
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
              {currentScreen === 'notes' && <NotesPage key="notes-page" onNavigate={setCurrentScreen} />}
              {currentScreen === 'flashcards' && <FlashcardsPage key="flashcards-page" onNavigate={setCurrentScreen} />}
              {currentScreen === 'quiz' && <QuizPage key="quiz-page" onNavigate={setCurrentScreen} />}
              {currentScreen === 'ai' && <AIPage key="ai-page" onNavigate={setCurrentScreen} />}
              {currentScreen === 'social' && <SocialPage key="social-page" onNavigate={setCurrentScreen} />}
              {currentScreen === 'calendar' && <CalendarPage key="calendar-page" onNavigate={setCurrentScreen} />}
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
        </StudyMaterialsProvider>
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