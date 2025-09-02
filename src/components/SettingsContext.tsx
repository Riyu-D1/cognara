import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SettingsContextType {
  // Appearance settings
  darkMode: boolean;
  textSize: 'small' | 'medium' | 'large';
  fontSize: number;
  accentColor: 'purple' | 'blue' | 'green' | 'orange' | 'red';
  
  // Notification settings
  notifications: boolean;
  studyReminders: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  
  // Study experience settings
  autoSave: boolean;
  soundEffects: boolean;
  focusMode: boolean;
  autoBreakReminders: boolean;
  pomodoroLength: number;
  shortBreakLength: number;
  longBreakLength: number;
  
  // Privacy settings
  profileVisibility: 'public' | 'friends' | 'private';
  shareProgress: boolean;
  analyticsOptIn: boolean;
  
  // App settings
  language: string;
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  
  // Update functions
  updateSettings: (newSettings: Partial<SettingsContextType>) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

const defaultSettings: Omit<SettingsContextType, 'updateSettings' | 'resetSettings' | 'exportSettings' | 'importSettings'> = {
  // Appearance
  darkMode: false,
  textSize: 'medium',
  fontSize: 14,
  accentColor: 'blue',
  
  // Notifications
  notifications: true,
  studyReminders: true,
  emailNotifications: true,
  pushNotifications: true,
  
  // Study experience
  autoSave: true,
  soundEffects: false,
  focusMode: false,
  autoBreakReminders: true,
  pomodoroLength: 25,
  shortBreakLength: 5,
  longBreakLength: 15,
  
  // Privacy
  profileVisibility: 'friends',
  shareProgress: true,
  analyticsOptIn: true,
  
  // App
  language: 'en',
  timezone: 'auto',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Omit<SettingsContextType, 'updateSettings' | 'resetSettings' | 'exportSettings' | 'importSettings'>>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('cognara-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    setIsLoaded(true);
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (!isLoaded) return;
    
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode, isLoaded]);

  // Apply font size to document
  useEffect(() => {
    if (!isLoaded) return;
    
    document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`);
  }, [settings.fontSize, isLoaded]);

  // Apply accent color - Global theme system
  useEffect(() => {
    if (!isLoaded) return;
    
    const accentColors = {
      purple: {
        // Light mode colors
        primary: '#4F46E5',
        primaryHover: '#3730A3',
        accent: '#4F46E5',
        accentIndigo: '#4F46E5',
        accentCyan: '#6366F1',
        ring: '#4F46E5',
        inputFocus: '#4F46E5',
        // Dark mode colors
        primaryDark: '#6366F1',
        primaryHoverDark: '#4F46E5',
        accentDark: '#6366F1',
        ringDark: '#6366F1',
        inputFocusDark: '#6366F1',
        // Chart colors
        chart1: '#4F46E5',
        chart2: '#6366F1',
        chart3: '#8B5CF6',
        chart4: '#A78BFA',
        chart5: '#C4B5FD'
      },
      blue: {
        // Light mode colors (default)
        primary: '#2563EB',
        primaryHover: '#1E40AF',
        accent: '#1E40AF',
        accentIndigo: '#4F46E5',
        accentCyan: '#06B6D4',
        ring: '#2563EB',
        inputFocus: '#2563EB',
        // Dark mode colors
        primaryDark: '#3B82F6',
        primaryHoverDark: '#2563EB',
        accentDark: '#06B6D4',
        ringDark: '#3B82F6',
        inputFocusDark: '#06B6D4',
        // Chart colors
        chart1: '#2563EB',
        chart2: '#06B6D4',
        chart3: '#4F46E5',
        chart4: '#0891B2',
        chart5: '#6366F1'
      },
      green: {
        // Light mode colors
        primary: '#059669',
        primaryHover: '#047857',
        accent: '#059669',
        accentIndigo: '#059669',
        accentCyan: '#06B6D4',
        ring: '#059669',
        inputFocus: '#059669',
        // Dark mode colors
        primaryDark: '#10B981',
        primaryHoverDark: '#059669',
        accentDark: '#10B981',
        ringDark: '#10B981',
        inputFocusDark: '#10B981',
        // Chart colors
        chart1: '#059669',
        chart2: '#10B981',
        chart3: '#34D399',
        chart4: '#6EE7B7',
        chart5: '#A7F3D0'
      },
      orange: {
        // Light mode colors
        primary: '#EA580C',
        primaryHover: '#C2410C',
        accent: '#EA580C',
        accentIndigo: '#EA580C',
        accentCyan: '#F59E0B',
        ring: '#EA580C',
        inputFocus: '#EA580C',
        // Dark mode colors
        primaryDark: '#F59E0B',
        primaryHoverDark: '#EA580C',
        accentDark: '#F59E0B',
        ringDark: '#F59E0B',
        inputFocusDark: '#F59E0B',
        // Chart colors
        chart1: '#EA580C',
        chart2: '#F59E0B',
        chart3: '#FBBF24',
        chart4: '#FCD34D',
        chart5: '#FDE68A'
      },
      red: {
        // Light mode colors
        primary: '#DC2626',
        primaryHover: '#B91C1C',
        accent: '#DC2626',
        accentIndigo: '#DC2626',
        accentCyan: '#EF4444',
        ring: '#DC2626',
        inputFocus: '#DC2626',
        // Dark mode colors
        primaryDark: '#EF4444',
        primaryHoverDark: '#DC2626',
        accentDark: '#EF4444',
        ringDark: '#EF4444',
        inputFocusDark: '#EF4444',
        // Chart colors
        chart1: '#DC2626',
        chart2: '#EF4444',
        chart3: '#F87171',
        chart4: '#FCA5A5',
        chart5: '#FED7D7'
      }
    };

    const colors = accentColors[settings.accentColor];
    const isDark = settings.darkMode;
    
    // Update all core design system colors
    document.documentElement.style.setProperty('--primary', isDark ? colors.primaryDark : colors.primary);
    document.documentElement.style.setProperty('--primary-hover', isDark ? colors.primaryHoverDark : colors.primaryHover);
    document.documentElement.style.setProperty('--accent', isDark ? colors.accentDark : colors.accent);
    document.documentElement.style.setProperty('--accent-indigo', colors.accentIndigo);
    document.documentElement.style.setProperty('--accent-cyan', colors.accentCyan);
    document.documentElement.style.setProperty('--ring', isDark ? colors.ringDark : colors.ring);
    document.documentElement.style.setProperty('--input-focus', isDark ? colors.inputFocusDark : colors.inputFocus);
    
    // Update chart colors to match the theme
    document.documentElement.style.setProperty('--chart-1', colors.chart1);
    document.documentElement.style.setProperty('--chart-2', colors.chart2);
    document.documentElement.style.setProperty('--chart-3', colors.chart3);
    document.documentElement.style.setProperty('--chart-4', colors.chart4);
    document.documentElement.style.setProperty('--chart-5', colors.chart5);
    
    // Update gradients
    const gradientButton = `linear-gradient(145deg, ${isDark ? colors.primaryDark : colors.primary}, ${isDark ? colors.primaryHoverDark : colors.primaryHover})`;
    document.documentElement.style.setProperty('--gradient-button', gradientButton);
    
    // Update glow effects to match the theme
    const glowPrimary = `0px 0px 8px ${isDark ? colors.primaryDark : colors.primary}80`;
    const glowAccent = `0px 0px 6px ${isDark ? colors.accentDark : colors.accent}66`;
    document.documentElement.style.setProperty('--glow-primary', glowPrimary);
    document.documentElement.style.setProperty('--glow-accent', glowAccent);
  }, [settings.accentColor, settings.darkMode, isLoaded]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      localStorage.setItem('cognara-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings, isLoaded]);

  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('cognara-settings');
  };

  const exportSettings = () => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = (settingsJson: string): boolean => {
    try {
      const parsed = JSON.parse(settingsJson);
      // Validate that the imported settings have valid keys
      const validKeys = Object.keys(defaultSettings);
      const importedKeys = Object.keys(parsed);
      
      if (importedKeys.every(key => validKeys.includes(key))) {
        setSettings(prev => ({ ...prev, ...parsed }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  };

  const contextValue: SettingsContextType = {
    ...settings,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}