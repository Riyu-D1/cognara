import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Grid3X3, 
  ChevronLeft, 
  ChevronRight, 
  Brain, 
  RotateCcw, 
  Play, 
  Pause, 
  Eye, 
  EyeOff,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { 
  getDifficultyColor, 
  getSubjectColor, 
  getPerformanceColor, 
  getAccuracyPercentage,
  sortFlashcards,
  updateCardPerformance,
  type SortOption,
  type StudyResult,
  type CardPerformance
} from '../../utils/studyConstants';
import { Screen } from '../../utils/constants';

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
    performance?: CardPerformance;
  }>;
}

interface FlashcardsStudyProps {
  deck: FlashcardDeck;
  currentCard: number;
  onFlipCard: (cardId: number) => void;
  onPrevCard: () => void;
  onNextCard: () => void;
  onBackToGrid: () => void;
  onNavigate: (screen: Screen) => void;
}

export function FlashcardsStudy({ 
  deck, 
  currentCard, 
  onFlipCard, 
  onPrevCard, 
  onNextCard, 
  onBackToGrid,
  onNavigate 
}: FlashcardsStudyProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyTime, setStudyTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [cardsStudied, setCardsStudied] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [sortedCards, setSortedCards] = useState(deck.cards);
  const [cardStartTime, setCardStartTime] = useState<Date | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(currentCard);

  const card = sortedCards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / sortedCards.length) * 100;

  // Update sorted cards when sort option changes
  useEffect(() => {
    const sorted = sortFlashcards(deck.cards, sortBy);
    setSortedCards(sorted);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [sortBy, deck.cards]);

  // Start timing when a new card is shown
  useEffect(() => {
    if (card && !isFlipped) {
      setCardStartTime(new Date());
    }
  }, [currentCardIndex, isFlipped]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setStudyTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
    onFlipCard(card.id);
  };

  const handleNextCard = () => {
    if (currentCardIndex < sortedCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
      if (isFlipped) {
        setCardsStudied(prev => prev + 1);
      }
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleStudyResult = (result: StudyResult) => {
    if (!card?.performance || !cardStartTime) return;
    
    const responseTime = (Date.now() - cardStartTime.getTime()) / 1000;
    const updatedPerformance = updateCardPerformance(card.performance, result, responseTime);
    
    // In a real app, you would update this in your state management/database
    console.log('Updated card performance:', updatedPerformance);
    
    // Move to next card automatically
    setTimeout(() => {
      handleNextCard();
    }, 1000);
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetSession = () => {
    setStudyTime(0);
    setCardsStudied(0);
    setIsFlipped(false);
    setIsTimerRunning(true);
  };

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Badge className={getSubjectColor(deck.subject)}>
              {deck.subject}
            </Badge>
            <Badge className={getDifficultyColor(deck.difficulty)}>
              {deck.difficulty}
            </Badge>
            {card?.performance && (
              <Badge className={getPerformanceColor(card.performance.currentLevel)}>
                {card.performance.currentLevel} • {getAccuracyPercentage(card.performance)}%
              </Badge>
            )}
          </div>
          <h1 className="text-3xl text-foreground">{deck.title}</h1>
          <p className="text-muted-foreground">Study Mode • {deck.cards.length} cards</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Sort Controls */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-48 clay-input">
                <SelectValue placeholder="Sort cards by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Order</SelectItem>
                <SelectItem value="needs-review">Needs Review First</SelectItem>
                <SelectItem value="accuracy-asc">Accuracy (Low to High)</SelectItem>
                <SelectItem value="accuracy-desc">Accuracy (High to Low)</SelectItem>
                <SelectItem value="level">Performance Level</SelectItem>
                <SelectItem value="last-studied">Recently Studied</SelectItem>
                <SelectItem value="difficulty">Difficulty</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Timer Controls */}
          <div className="flex items-center space-x-2">
            <Button 
              onClick={toggleTimer}
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <span className="text-muted-foreground font-mono">{formatTime(studyTime)}</span>
          </div>
          
          <Button 
            onClick={resetSession}
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button 
            onClick={onBackToGrid}
            variant="outline"
            className="rounded-xl clay-input"
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Back to Decks
          </Button>
        </div>
      </div>

      {/* Progress and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 clay-card border-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-foreground">{currentCardIndex + 1}/{sortedCards.length}</p>
              <p className="text-muted-foreground text-xs">Progress</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 clay-card border-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-foreground">{cardsStudied}</p>
              <p className="text-muted-foreground text-xs">Studied</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 clay-card border-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-foreground">{formatTime(studyTime)}</p>
              <p className="text-muted-foreground text-xs">Study Time</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 clay-card border-0">
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs">Progress</p>
            <Progress value={progress} className="h-2" />
            <p className="text-foreground text-xs">{Math.round(progress)}%</p>
          </div>
        </Card>
      </div>

      {/* Study Card */}
      <div className="max-w-4xl mx-auto">
        <Card 
          className="p-8 clay-card border-0 cursor-pointer transition-all duration-300 hover:clay-elevated min-h-96 flex items-center justify-center"
          onClick={handleFlipCard}
        >
          <div className="text-center space-y-6 w-full">
            <div className="space-y-4">
              <h2 className="text-xl text-foreground leading-relaxed">
                {isFlipped ? card.back : card.front}
              </h2>
              
              <div className="flex items-center justify-center text-muted-foreground">
                {isFlipped ? <EyeOff className="w-5 h-5 mr-2" /> : <Eye className="w-5 h-5 mr-2" />}
                <span className="text-sm">
                  {isFlipped ? 'Click to see question' : 'Click to reveal answer'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Actions (when card is flipped) */}
        {isFlipped && card?.performance && (
          <div className="mt-6">
            <Card className="p-4 clay-card border-0 bg-muted/50">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground text-sm">How well did you know this answer?</p>
                <div className="flex items-center justify-center space-x-3">
                  <Button
                    onClick={() => handleStudyResult('incorrect')}
                    variant="outline"
                    className="clay-input text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Incorrect
                  </Button>
                  <Button
                    onClick={() => handleStudyResult('hard')}
                    variant="outline"
                    className="clay-input text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    Hard
                  </Button>
                  <Button
                    onClick={() => handleStudyResult('correct')}
                    variant="outline"
                    className="clay-input text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Correct
                  </Button>
                  <Button
                    onClick={() => handleStudyResult('easy')}
                    variant="outline"
                    className="clay-input text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    Easy
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button 
            onClick={handlePrevCard}
            disabled={currentCardIndex === 0}
            variant="outline"
            className="rounded-xl clay-input"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => onNavigate('quiz')}
              className="clay-button bg-gradient-to-r from-primary to-primary-hover text-primary-foreground rounded-xl border-0"
            >
              <Brain className="w-4 h-4 mr-2" />
              Take Quiz
            </Button>
          </div>
          
          <Button 
            onClick={handleNextCard}
            disabled={currentCardIndex === sortedCards.length - 1}
            variant="outline"
            className="rounded-xl clay-input"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}