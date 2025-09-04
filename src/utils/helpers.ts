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
      setHasAccessedApp(false);
      setCurrentScreen('landing');
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