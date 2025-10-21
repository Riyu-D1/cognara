import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { useSettings } from './SettingsContext';
import { toast } from 'sonner';
import { 
  User, 
  Bell, 
  Moon, 
  Sun, 
  Type, 
  Palette, 
  Shield, 
  LogOut,
  Edit,
  Crown,
  Mail,
  Calendar,
  Github,
  Download,
  Upload,
  RotateCcw,
  Globe,
  Clock,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Smartphone,
  Timer,
  Focus,
  Settings,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  Star,
  Loader2,
  X
} from 'lucide-react';

interface SettingsPageProps {
  userName: string;
  userEmail: string;
  userAvatar?: string;
  authProvider?: string;
  onLogout: () => void;
}

export function SettingsPage({ userName, userEmail, userAvatar, authProvider, onLogout }: SettingsPageProps) {
  const settings = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(userAvatar);

  // Load avatar from database on component mount
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const { userProfileService } = await import('../services/social');
        const profile = await userProfileService.getCurrentUserProfile();
        
        if (profile?.avatar_url) {
          console.log('Loaded avatar from database:', profile.avatar_url.substring(0, 100));
          setCurrentAvatar(profile.avatar_url);
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
      }
    };

    loadAvatar();
  }, []); // Run once on mount

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    const sizeMap = { small: 12, medium: 14, large: 16 };
    settings.updateSettings({ 
      textSize: size, 
      fontSize: sizeMap[size] 
    });
    toast.success(`Text size changed to ${size}`);
  };

  const handleAccentColorChange = (color: typeof settings.accentColor) => {
    settings.updateSettings({ accentColor: color });
    toast.success(`Accent color changed to ${color}`);
  };

  const handleExportSettings = () => {
    const settingsData = settings.exportSettings();
    const blob = new Blob([settingsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'studyflow-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully');
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = settings.importSettings(content);
        if (success) {
          toast.success('Settings imported successfully');
        } else {
          toast.error('Invalid settings file');
        }
      } catch (error) {
        toast.error('Failed to import settings');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetSettings = () => {
    settings.resetSettings();
    toast.success('Settings reset to defaults');
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB for better compatibility)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    setUploadingAvatar(true);
    
    try {
      const { supabase } = await import('../utils/supabase/client');
      const { userProfileService } = await import('../services/social');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Check if storage bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === 'user-content');
      
      if (!bucketExists) {
        console.log('Storage bucket not found, using base64 fallback');
        
        // Convert image to base64
        const reader = new FileReader();
        const base64Url = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        console.log('Base64 conversion successful, updating profile...');
        console.log('Base64 URL length:', base64Url.length);
        console.log('Base64 URL preview:', base64Url.substring(0, 100) + '...');
        
        // Update user profile with base64 data
        const updatedProfile = await userProfileService.updateUserProfile({
          avatar_url: base64Url
        });
        
        console.log('Update profile result:', updatedProfile);
        
        if (updatedProfile) {
          setCurrentAvatar(base64Url);
          toast.success('✅ Profile picture updated!');
          toast.info('💡 Create "user-content" bucket in Supabase Storage for permanent hosting', { 
            duration: 4000 
          });
        } else {
          throw new Error('Failed to update profile - check console for details');
        }
        
        return; // Exit early with base64 success
      }

      // If bucket exists, try normal storage upload
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log('Uploading to storage:', filePath);
      
      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Storage upload failed:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;
      
      if (!avatarUrl) {
        throw new Error('Failed to generate public URL');
      }

      // Update user profile
      const updatedProfile = await userProfileService.updateUserProfile({
        avatar_url: avatarUrl
      });

      if (updatedProfile) {
        setCurrentAvatar(avatarUrl);
        toast.success('Profile picture updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to upload: ${errorMessage}`);
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    try {
      const { userProfileService } = await import('../services/social');
      
      const updatedProfile = await userProfileService.updateUserProfile({
        avatar_url: undefined
      });

      if (updatedProfile) {
        setCurrentAvatar(undefined);
        toast.success('Profile picture removed');
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove profile picture');
    }
  };

  const getProviderBadge = () => {
    if (!authProvider) return null;
    
    const providerConfig = {
      google: { label: 'Google', icon: '🔍', color: 'bg-gradient-to-r from-[#2563EB]/10 to-[#1E40AF]/10 text-[#2563EB] border-[#2563EB]/20' },
      github: { label: 'GitHub', icon: Github, color: 'bg-gradient-to-r from-[#64748B]/10 to-[#475569]/10 text-[#64748B] border-[#64748B]/20' },
      discord: { label: 'Discord', icon: '🎮', color: 'bg-gradient-to-r from-[#4F46E5]/10 to-[#3730A3]/10 text-[#4F46E5] border-[#4F46E5]/20' },
      mock: { label: 'Development', icon: Settings, color: 'bg-gradient-to-r from-[#06B6D4]/10 to-[#0891B2]/10 text-[#06B6D4] border-[#06B6D4]/20' }
    };

    const config = providerConfig[authProvider as keyof typeof providerConfig];
    if (!config) return null;

    return (
      <Badge className={`${config.color} border text-xs font-medium rounded-lg`}>
        {typeof config.icon === 'string' ? config.icon : <config.icon className="w-3 h-3 mr-1" />} 
        {config.label}
      </Badge>
    );
  };

  const accentColors = [
    { id: 'purple' as const, name: 'Purple', class: 'bg-[#4F46E5]', preview: '#4F46E5' },
    { id: 'blue' as const, name: 'Blue', class: 'bg-[#2563EB]', preview: '#2563EB' },
    { id: 'green' as const, name: 'Green', class: 'bg-[#06B6D4]', preview: '#06B6D4' },
    { id: 'orange' as const, name: 'Orange', class: 'bg-[#F59E0B]', preview: '#F59E0B' },
    { id: 'red' as const, name: 'Red', class: 'bg-[#DC2626]', preview: '#DC2626' }
  ];

  const textSizes = [
    { id: 'small' as const, label: 'Small (12px)', value: 12 },
    { id: 'medium' as const, label: 'Medium (14px)', value: 14 },
    { id: 'large' as const, label: 'Large (16px)', value: 16 }
  ];

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="clay-card p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center clay-button clay-glow-primary">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Customize your StudyNet experience</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="clay-card p-6">
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="relative">
                  <Avatar className="w-24 h-24 mx-auto shadow-[4px_4px_8px_rgba(15,23,42,0.15)]">
                    {currentAvatar && <AvatarImage src={currentAvatar} alt={userName} />}
                    <AvatarFallback className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-white text-2xl font-semibold">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="sm"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white shadow-[4px_4px_8px_rgba(15,23,42,0.15)] hover:shadow-[6px_6px_12px_rgba(15,23,42,0.2)] p-0 border-0"
                    variant="outline"
                    title="Change profile picture"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="w-4 h-4 text-[#64748B] animate-spin" />
                    ) : (
                      <Edit className="w-4 h-4 text-[#64748B]" />
                    )}
                  </Button>
                  {currentAvatar && (
                    <Button 
                      size="sm"
                      onClick={handleRemoveAvatar}
                      className="absolute -bottom-2 -left-2 w-10 h-10 rounded-xl bg-white shadow-[4px_4px_8px_rgba(15,23,42,0.15)] hover:shadow-[6px_6px_12px_rgba(15,23,42,0.2)] hover:bg-destructive/10 p-0 border-0"
                      variant="outline"
                      title="Remove profile picture"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                {uploadingAvatar && (
                  <p className="text-sm text-muted-foreground animate-pulse">
                    Uploading profile picture...
                  </p>
                )}
                
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{userName}</h3>
                  <p className="text-muted-foreground">Student</p>
                </div>
                
                <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
                  <Badge className="bg-gradient-to-r from-[#4F46E5]/10 to-[#3730A3]/10 text-[#4F46E5] border-[#4F46E5]/20 rounded-lg">
                    <Crown className="w-3 h-3 mr-1" />
                    Free Plan
                  </Badge>
                  {getProviderBadge()}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground font-medium">Email</span>
                  </div>
                  <span className="text-foreground text-sm truncate max-w-[150px] font-medium" title={userEmail}>
                    {userEmail}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground font-medium">Joined</span>
                  </div>
                  <span className="text-foreground font-medium">Recently</span>
                </div>
              </div>

              <Button 
                onClick={onLogout}
                variant="outline" 
                className="w-full rounded-xl text-destructive border-destructive/20 hover:bg-destructive/5 clay-input font-medium"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Study Stats */}
          <div className="clay-card p-6 bg-gradient-to-br from-primary/5 to-accent-indigo/5 border border-primary/10">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Study Stats</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-card/50 rounded-xl clay-input">
                  <p className="text-2xl font-semibold text-foreground">127</p>
                  <p className="text-muted-foreground text-sm">Cards Studied</p>
                </div>
                <div className="text-center p-3 bg-card/50 rounded-xl clay-input">
                  <p className="text-2xl font-semibold text-foreground">24h</p>
                  <p className="text-muted-foreground text-sm">Study Time</p>
                </div>
                <div className="text-center p-3 bg-card/50 rounded-xl clay-input">
                  <p className="text-2xl font-semibold text-foreground">89%</p>
                  <p className="text-muted-foreground text-sm">Avg. Score</p>
                </div>
                <div className="text-center p-3 bg-card/50 rounded-xl clay-input">
                  <p className="text-2xl font-semibold text-foreground">7</p>
                  <p className="text-muted-foreground text-sm">Day Streak</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appearance Settings */}
          <div className="clay-card p-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-indigo to-accent-indigo/80 rounded-xl flex items-center justify-center clay-button clay-glow-primary">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
              </div>

              <div className="space-y-6">
                {/* Dark Mode */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl clay-input">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center clay-elevated">
                      {settings.darkMode ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Dark Mode</p>
                      <p className="text-muted-foreground text-sm">Use dark theme for better night studying</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox"
                      checked={settings.darkMode}
                      onChange={(e) => {
                        settings.updateSettings({ darkMode: e.target.checked });
                        toast.success(`Dark mode ${e.target.checked ? 'enabled' : 'disabled'}`);
                      }}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {/* Text Size */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center clay-elevated">
                      <Type className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Text Size</p>
                      <p className="text-muted-foreground text-sm">Adjust text size for better readability</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pl-13">
                    {textSizes.map((size) => (
                      <Button
                        key={size.id}
                        size="sm"
                        variant={settings.textSize === size.id ? "default" : "outline"}
                        className={`rounded-lg clay-button border-0 font-medium ${
                          settings.textSize === size.id 
                            ? 'bg-gradient-to-r from-primary to-primary-hover text-primary-foreground clay-glow-primary' 
                            : 'bg-card text-muted-foreground hover:text-primary clay-input'
                        }`}
                        onClick={() => handleFontSizeChange(size.id)}
                      >
                        {size.label.split(' ')[0]}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center clay-elevated">
                      <Palette className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Accent Color</p>
                      <p className="text-muted-foreground text-sm">Choose your preferred accent color</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pl-13">
                    {accentColors.map((color) => (
                      <Button
                        key={color.id}
                        size="sm"
                        variant="outline"
                        className={`w-10 h-10 p-0 rounded-xl border-2 clay-input ${
                          settings.accentColor === color.id ? 'border-primary clay-glow-primary' : 'border-border'
                        }`}
                        onClick={() => handleAccentColorChange(color.id)}
                      >
                        <div className={`w-6 h-6 rounded-lg ${color.class} clay-elevated`} />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="clay-card p-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center clay-button clay-glow-accent">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
              </div>

              <div className="space-y-4">
                {/* Push Notifications */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl clay-input">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center clay-elevated">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Push Notifications</p>
                      <p className="text-muted-foreground text-sm">Receive important updates and reminders</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => settings.updateSettings({ notifications: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {/* Study Reminders */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl clay-input">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center clay-elevated">
                      <Timer className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Study Reminders</p>
                      <p className="text-muted-foreground text-sm">Get reminded to study at your preferred times</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox"
                      checked={settings.studyReminders}
                      onChange={(e) => settings.updateSettings({ studyReminders: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl clay-input">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center clay-elevated">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Email Notifications</p>
                      <p className="text-muted-foreground text-sm">Receive weekly progress reports via email</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => settings.updateSettings({ emailNotifications: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Study Experience */}
          <div className="clay-card p-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center clay-button clay-glow-primary">
                  <Focus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Study Experience</h3>
              </div>

              <div className="space-y-4">
                {/* Auto Save */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl clay-input">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center clay-elevated">
                      <Save className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Auto Save</p>
                      <p className="text-muted-foreground text-sm">Automatically save your progress</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => settings.updateSettings({ autoSave: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {/* Sound Effects */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl clay-input">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center clay-elevated">
                      {settings.soundEffects ? <Volume2 className="w-5 h-5 text-muted-foreground" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Sound Effects</p>
                      <p className="text-muted-foreground text-sm">Play sounds for interactions and achievements</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox"
                      checked={settings.soundEffects}
                      onChange={(e) => settings.updateSettings({ soundEffects: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {/* Pomodoro Timer Settings */}
                <div className="space-y-4 p-4 bg-muted rounded-xl clay-input">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center clay-elevated">
                      <Timer className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Pomodoro Timer</p>
                      <p className="text-muted-foreground text-sm">Customize your study session lengths</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-13">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Work Session</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          value={[settings.pomodoroLength]}
                          onValueChange={([value]) => settings.updateSettings({ pomodoroLength: value })}
                          max={60}
                          min={15}
                          step={5}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground min-w-[40px] font-medium">{settings.pomodoroLength}m</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Short Break</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          value={[settings.shortBreakLength]}
                          onValueChange={([value]) => settings.updateSettings({ shortBreakLength: value })}
                          max={15}
                          min={3}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground min-w-[40px] font-medium">{settings.shortBreakLength}m</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-[#334155]">Long Break</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          value={[settings.longBreakLength]}
                          onValueChange={([value]) => settings.updateSettings({ longBreakLength: value })}
                          max={30}
                          min={10}
                          step={5}
                          className="flex-1"
                        />
                        <span className="text-sm text-[#64748B] min-w-[40px] font-medium">{settings.longBreakLength}m</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="clay-card p-6 bg-gradient-to-br from-white to-[#F9FAFB]">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#64748B] to-[#475569] rounded-xl flex items-center justify-center shadow-[4px_4px_8px_rgba(15,23,42,0.15)]">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A]">Data Management</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Button 
                    onClick={handleExportSettings} 
                    variant="outline" 
                    className="flex-1 justify-start clay-button bg-white hover:bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] font-medium"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Settings
                  </Button>
                  <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    variant="outline" 
                    className="flex-1 justify-start clay-button bg-white hover:bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] font-medium"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import Settings
                  </Button>
                </div>
                
                <Button 
                  onClick={handleResetSettings} 
                  variant="outline" 
                  className="w-full justify-start clay-button bg-white hover:bg-[#F59E0B]/5 border-[#F59E0B]/20 text-[#F59E0B] font-medium"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                className="hidden"
              />
            </div>
          </div>

          {/* Upgrade Prompt */}
          <div className="clay-card p-6 bg-gradient-to-br from-[#4F46E5]/5 to-[#2563EB]/5 border border-[#4F46E5]/20">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4F46E5] to-[#2563EB] rounded-xl flex items-center justify-center shadow-[4px_4px_8px_rgba(15,23,42,0.15)]">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#0F172A]">Upgrade to Pro</h3>
                  <p className="text-[#64748B] text-sm">Unlock unlimited flashcards and advanced features</p>
                </div>
              </div>
              
              <Button className="clay-button bg-gradient-to-r from-[#4F46E5] to-[#2563EB] hover:from-[#3730A3] hover:to-[#1E40AF] text-white rounded-xl font-medium border-0">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}