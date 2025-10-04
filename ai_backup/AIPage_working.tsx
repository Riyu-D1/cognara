import React from 'react';
import { Screen } from '../utils/constants';
import AITest from './AITest';

interface AIPageProps {
  onNavigate: (screen: Screen) => void;
}

export function AIPage({ onNavigate }: AIPageProps) {
  return (
    <div className="flex flex-col h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">AI Study Assistant</h1>
      <div className="flex-1">
        <AITest />
      </div>
    </div>
  );
}