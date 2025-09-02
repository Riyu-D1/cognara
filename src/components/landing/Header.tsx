import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Brain, ArrowRight } from 'lucide-react';

interface HeaderProps {
  onTryApp: () => void;
  onNavigateToAbout?: () => void;
}

export function Header({ onTryApp, onNavigateToAbout }: HeaderProps) {
  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border clay-nav"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center clay-glow-primary">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Cognara</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-4">
            <button 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }} 
              className="nav-button-animated"
            >
              Features
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' });
              }} 
              className="nav-button-animated"
            >
              Benefits
            </button>
            <button 
              onClick={onNavigateToAbout}
              className="nav-button-animated"
            >
              About
            </button>
          </nav>
          
          <div 
            onClick={onTryApp}
            className="drawing-button drawing-button-type--A cursor-pointer"
          >
            <div className="drawing-button__line"></div>
            <div className="drawing-button__line"></div>
            <div className="drawing-button__text">
              Try it Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
            <div className="drawing-button__drow1"></div>
            <div className="drawing-button__drow2"></div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}