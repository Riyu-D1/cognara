import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Play, Plus, Layers, BookOpen, Brain, Clock, TrendingUp } from 'lucide-react';
import { getDifficultyColor, getSubjectColor } from '../../utils/studyConstants';

interface FlashcardDeck {
  id: number;
  title: string;
  subject: string;
  cardCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  lastStudied: string;
  progress: number;
  cards: Array<{
    id: number;
    front: string;
    back: string;
    isFlipped: boolean;
  }>;
}

interface FlashcardsGridProps {
  decks: FlashcardDeck[];
  onStartStudy: (deckId: number) => void;
  onCreateSet: () => void;
}

export function FlashcardsGrid({ decks, onStartStudy, onCreateSet }: FlashcardsGridProps) {
  const subjects = [...new Set(decks.map(deck => deck.subject))];
  const totalCards = decks.reduce((sum, deck) => sum + deck.cardCount, 0);

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl text-foreground">Flashcard Decks</h1>
          <p className="text-muted-foreground">
            Study with organized flashcard decks • {decks.length} decks with {totalCards} total cards
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            onClick={onCreateSet}
            className="clay-button bg-gradient-to-r from-primary to-primary-hover text-primary-foreground rounded-xl border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Deck
          </Button>
        </div>
      </div>

      {/* Subject Filter */}
      <div className="flex items-center space-x-3">
        <span className="text-muted-foreground">Filter by subject:</span>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            All ({decks.length})
          </Badge>
          {subjects.map((subject) => (
            <Badge 
              key={subject}
              className={`cursor-pointer hover:opacity-80 ${getSubjectColor(subject)}`}
            >
              {subject} ({decks.filter(deck => deck.subject === subject).length})
            </Badge>
          ))}
        </div>
      </div>

      {/* Flashcard Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map((deck) => (
          <Card 
            key={deck.id}
            className="p-6 clay-card border-0 hover:clay-elevated transition-all duration-200 group"
          >
            <div className="space-y-4">
              {/* Deck Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getSubjectColor(deck.subject)} variant="secondary">
                      {deck.subject}
                    </Badge>
                    <Badge className={getDifficultyColor(deck.difficulty)} variant="secondary">
                      {deck.difficulty}
                    </Badge>
                  </div>
                  <h3 className="text-foreground group-hover:text-primary transition-colors font-medium">
                    {deck.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                    {deck.description}
                  </p>
                </div>
              </div>
              
              {/* Deck Stats */}
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-border">
                <div className="text-center">
                  <p className="text-lg text-foreground font-medium">{deck.cardCount}</p>
                  <p className="text-xs text-muted-foreground">Cards</p>
                </div>
                <div className="text-center">
                  <p className="text-lg text-foreground font-medium">{deck.progress}%</p>
                  <p className="text-xs text-muted-foreground">Mastered</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{deck.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary-hover h-2 rounded-full transition-all duration-300"
                    style={{ width: `${deck.progress}%` }}
                  />
                </div>
              </div>

              {/* Last Studied */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Last studied: {deck.lastStudied}</span>
                </div>
              </div>

              {/* Study Button */}
              <Button 
                onClick={() => onStartStudy(deck.id)}
                className="w-full clay-button bg-gradient-to-r from-primary to-primary-hover text-primary-foreground rounded-xl border-0 group-hover:clay-glow-primary"
              >
                <Play className="w-4 h-4 mr-2" />
                Study Deck
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Overall Stats */}
      <Card className="p-6 clay-card border-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl text-foreground">{decks.length}</p>
            <p className="text-muted-foreground text-sm">Total Decks</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl text-foreground">{totalCards}</p>
            <p className="text-muted-foreground text-sm">Total Cards</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Brain className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <p className="text-2xl text-foreground">{Math.round(decks.reduce((sum, deck) => sum + deck.progress, 0) / decks.length)}%</p>
            <p className="text-muted-foreground text-sm">Avg. Mastery</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl text-foreground">{subjects.length}</p>
            <p className="text-muted-foreground text-sm">Subjects</p>
          </div>
        </div>
      </Card>
    </div>
  );
}