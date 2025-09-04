import { Screen } from './constants';

export interface NavigationHelpers {
  handleTryApp: () => void;
  handleNavigateToAbout: () => void;
  handleNavigateBackToLanding: () => void;
  handleLogout: () => Promise<void>;
}

export function createNavigationHelpers(
  setCurrentScreen: (screen: Screen) => void,
  setHasAccessedApp: (accessed: boolean) => void,
  signOut: () => Promise<void>
): NavigationHelpers {
  const handleTryApp = () => {
    setHasAccessedApp(true);
    setCurrentScreen('dashboard'); // This ensures navigation happens
  };

  const handleNavigateToAbout = () => {
    setCurrentScreen('about');
  };

  const handleNavigateBackToLanding = () => {
    setCurrentScreen('landing');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Reset both flags to ensure user sees the landing page and needs to click "Try App" again
      setHasAccessedApp(false);
      setCurrentScreen('landing');
      // Clear any cached states without a full page reload
      sessionStorage.clear();
      localStorage.clear();
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return {
    handleTryApp,
    handleNavigateToAbout,
    handleNavigateBackToLanding,
    handleLogout
  };
}