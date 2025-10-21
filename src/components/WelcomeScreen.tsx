import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BookOpen, Brain, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onLogin: () => void;
}

export function WelcomeScreen({ onLogin }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                StudyNet
              </h1>
            </div>
            
            <h2 className="text-3xl text-gray-800">
              Your smarter way to study
            </h2>
            
            <p className="text-lg text-gray-600 max-w-md">
              Transform your notes into summaries, flashcards, and quizzes. 
              Study smarter, not harder, and ace your exams with confidence.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-800">Smart Notes</h3>
                  <p className="text-xs text-gray-600">AI-powered summaries</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-800">Flashcards</h3>
                  <p className="text-xs text-gray-600">Generated instantly</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-800">Quizzes</h3>
                  <p className="text-xs text-gray-600">Test your knowledge</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Action buttons */}
          <div className="space-y-4">
            <Button 
              onClick={onLogin}
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Button>
            
            <Button 
              variant="outline"
              onClick={onLogin}
              className="w-full h-12 border-gray-200 text-gray-600 hover:text-gray-800 rounded-xl"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Right side - Hero Image */}
        <div className="hidden lg:block">
          <Card className="p-8 bg-white/60 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1701576766277-c6160505581d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBib29rcyUyMGxhcHRvcHxlbnwxfHx8fDE3NTY1NjUyOTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Student studying with books and laptop"
              className="w-full h-96 object-cover rounded-2xl"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}