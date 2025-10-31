import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { hybridSyncService } from '../services/hybridSync';

interface Note {
  id: number;
  title: string;
  content: string;
  subject: string;
  createdAt?: string;
  lastModified: string;
  wordCount: number;
}

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
    mastered?: boolean;
    performance?: any;
  }>;
  createdAt: string;
}

interface Quiz {
  id: number;
  title: string;
  questions: Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    subject: string;
    explanation: string;
  }>;
  createdAt: string;
}

interface StudyMaterialsContextType {
  // Data
  notes: Note[];
  flashcards: FlashcardDeck[];
  quizzes: Quiz[];
  
  // Loading states
  isLoading: boolean;
  isReady: boolean;
  
  // Update functions
  setNotes: (notes: Note[]) => void;
  setFlashcards: (flashcards: FlashcardDeck[]) => void;
  setQuizzes: (quizzes: Quiz[]) => void;
  
  // Reload function
  reloadMaterials: () => void;
}

const StudyMaterialsContext = createContext<StudyMaterialsContextType | undefined>(undefined);

export function StudyMaterialsProvider({ children }: { children: ReactNode }) {
  const [notes, setNotesState] = useState<Note[]>([]);
  const [flashcards, setFlashcardsState] = useState<FlashcardDeck[]>([]);
  const [quizzes, setQuizzesState] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Load all materials once when the provider mounts
  const loadMaterials = () => {
    console.log('📚 StudyMaterialsContext: Loading all study materials...');
    setIsLoading(true);
    
    hybridSyncService.onReady(() => {
      try {
        // Load notes
        const storedNotes = localStorage.getItem('studyflow-notes');
        if (storedNotes) {
          setNotesState(JSON.parse(storedNotes));
        }

        // Load flashcards
        const storedFlashcards = localStorage.getItem('studyflow-flashcards');
        if (storedFlashcards) {
          const parsed = JSON.parse(storedFlashcards);
          const normalized = parsed.map((deck: any) => ({
            ...deck,
            cardCount: deck.cardCount ?? deck.cards?.length ?? 0,
            difficulty: deck.difficulty ?? 'Medium',
            description: deck.description ?? '',
            lastStudied: deck.lastStudied ?? 'Never',
            progress: deck.progress ?? 0,
            createdAt: deck.createdAt ?? new Date().toISOString(),
            cards: (deck.cards || []).map((card: any) => ({
              ...card,
              isFlipped: card.isFlipped ?? false,
            })),
          }));
          setFlashcardsState(normalized);
        }

        // Load quizzes
        const storedQuizzes = localStorage.getItem('studyflow-quizzes');
        if (storedQuizzes) {
          setQuizzesState(JSON.parse(storedQuizzes));
        }

        console.log('✅ StudyMaterialsContext: All materials loaded successfully');
        setIsLoading(false);
        setIsReady(true);
      } catch (error) {
        console.error('❌ StudyMaterialsContext: Error loading materials:', error);
        setIsLoading(false);
        setIsReady(true); // Still set ready even on error
      }
    });
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  // Helper to ensure flashcard deck has all required properties
  const normalizeFlashcardDeck = (deck: any): FlashcardDeck => ({
    ...deck,
    cardCount: deck.cardCount ?? deck.cards?.length ?? 0,
    difficulty: deck.difficulty ?? 'Medium',
    description: deck.description ?? '',
    lastStudied: deck.lastStudied ?? 'Never',
    progress: deck.progress ?? 0,
    createdAt: deck.createdAt ?? new Date().toISOString(),
    cards: (deck.cards || []).map((card: any) => ({
      ...card,
      isFlipped: card.isFlipped ?? false,
    })),
  });

  // Wrapped setters that also update localStorage
  const setNotes = (newNotes: Note[]) => {
    setNotesState(newNotes);
    try {
      localStorage.setItem('studyflow-notes', JSON.stringify(newNotes));
    } catch (error) {
      console.error('Error saving notes to localStorage:', error);
    }
  };

  const setFlashcards = (newFlashcards: FlashcardDeck[]) => {
    // Normalize all decks to ensure required properties
    const normalized = newFlashcards.map(normalizeFlashcardDeck);
    setFlashcardsState(normalized);
    try {
      localStorage.setItem('studyflow-flashcards', JSON.stringify(normalized));
    } catch (error) {
      console.error('Error saving flashcards to localStorage:', error);
    }
  };

  const setQuizzes = (newQuizzes: Quiz[]) => {
    setQuizzesState(newQuizzes);
    try {
      localStorage.setItem('studyflow-quizzes', JSON.stringify(newQuizzes));
    } catch (error) {
      console.error('Error saving quizzes to localStorage:', error);
    }
  };

  const reloadMaterials = () => {
    console.log('🔄 StudyMaterialsContext: Reloading materials...');
    loadMaterials();
  };

  const value: StudyMaterialsContextType = {
    notes,
    flashcards,
    quizzes,
    isLoading,
    isReady,
    setNotes,
    setFlashcards,
    setQuizzes,
    reloadMaterials,
  };

  return (
    <StudyMaterialsContext.Provider value={value}>
      {children}
    </StudyMaterialsContext.Provider>
  );
}

export function useStudyMaterials() {
  const context = useContext(StudyMaterialsContext);
  if (context === undefined) {
    throw new Error('useStudyMaterials must be used within a StudyMaterialsProvider');
  }
  return context;
}
