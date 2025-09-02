import React from 'react';
import { SettingsProvider } from './SettingsContext';
import { Toaster } from './ui/sonner';
import { Header } from './landing/Header';
import { HeroSection } from './landing/HeroSection';
import { FeaturesSection } from './landing/FeaturesSection';
import { BenefitsSection } from './landing/BenefitsSection';
import { CTASection } from './landing/CTASection';
import { Footer } from './landing/Footer';

interface LandingPageProps {
  onTryApp: () => void;
  onNavigateToAbout?: () => void;
}

export function LandingPage({ onTryApp, onNavigateToAbout }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header onTryApp={onTryApp} onNavigateToAbout={onNavigateToAbout} />
      <HeroSection onTryApp={onTryApp} />
      <FeaturesSection />
      <BenefitsSection onTryApp={onTryApp} />
      <CTASection onTryApp={onTryApp} />
      <Footer />
    </div>
  );
}