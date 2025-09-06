export type Screen = 'landing' | 'about' | 'dashboard' | 'notes' | 'flashcards' | 'quiz' | 'ai' | 'social' | 'calendar' | 'settings';

// 🚨 TEMPORARY: Set to true to bypass authentication for frontend development
// Change back to false when you want to re-enable authentication
export const BYPASS_AUTH = true;

// Mock user for development when auth is bypassed
export const mockUser = {
  id: 'dev-user-123',
  name: 'Dev User',
  email: 'developer@cognara.com',
  avatar_url: null,
  provider: 'mock'
};

export const mockSignOut = async () => {
  console.log('Mock signout - auth is bypassed');
};