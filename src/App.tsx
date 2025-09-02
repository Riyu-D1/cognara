import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { SettingsProvider } from './components/SettingsContext';
import { AuthPage } from './components/AuthPage';
import { AppRouter } from './components/AppRouter';
import { BYPASS_AUTH, mockUser, mockSignOut, Screen } from './utils/constants';
import { createNavigationHelpers } from './utils/helpers';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [hasAccessedApp, setHasAccessedApp] = useState(false);

  // Use real auth or mock auth based on bypass setting
  const authData = BYPASS_AUTH 
    ? { user: mockUser, loading: false, signOut: mockSignOut }
    : useAuth();

  const { user, loading, signOut } = authData;

  // Create navigation helpers
  const navigationHelpers = createNavigationHelpers(
    setCurrentScreen, 
    setHasAccessedApp, 
    signOut
  );

  if (loading && !BYPASS_AUTH) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading StudyFlow...</p>
        </div>
      </div>
    );
  }

  if (!user && !BYPASS_AUTH) {
    return <AuthPage />;
  }

  return (
    <AppRouter 
      currentScreen={currentScreen}
      setCurrentScreen={setCurrentScreen}
      hasAccessedApp={hasAccessedApp}
      user={user}
      navigationHelpers={navigationHelpers}
    />
  );
}

export default function App() {
  // When auth is bypassed, we don't need the AuthProvider
  if (BYPASS_AUTH) {
    return (
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    );
  }

  return (
    <AuthProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}