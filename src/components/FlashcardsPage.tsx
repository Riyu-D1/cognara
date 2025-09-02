import React, { useState } from 'react';
import { FlashcardsGrid } from './flashcards/FlashcardsGrid';
import { FlashcardsStudy } from './flashcards/FlashcardsStudy';
import { FlashcardsCreate } from './flashcards/FlashcardsCreate';
import { mockFlashcardDecks } from '../utils/studyConstants';
import { Screen } from '../utils/constants';

interface FlashcardsPageProps {
  onNavigate: (screen: Screen) => void;
}

export function FlashcardsPage({ onNavigate }: FlashcardsPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'study' | 'create'>('grid');
  const [selectedDeck, setSelectedDeck] = useState<number | null>(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [newSetTitle, setNewSetTitle] = useState('');
  const [newCards, setNewCards] = useState<{front: string; back: string}[]>([{front: '', back: ''}]);
  const [showContentOptions, setShowContentOptions] = useState(true);
  const [showManualInput, setShowManualInput] = useState(false);

  const getCurrentDeck = () => {
    if (selectedDeck === null) return null;
    return mockFlashcardDecks.find(deck => deck.id === selectedDeck);
  };

  const flipCard = (deckId: number, cardId: number) => {
    // In a real app, this would update the state in a proper way
    console.log('Flipping card', cardId, 'in deck', deckId);
  };

  const startStudyMode = (deckId: number) => {
    setSelectedDeck(deckId);
    setCurrentCard(0);
    setViewMode('study');
  };

  const nextCard = () => {
    const deck = getCurrentDeck();
    if (deck && currentCard < deck.cards.length - 1) {
      setCurrentCard(prev => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(prev => prev - 1);
    }
  };

  const addNewCard = () => {
    setNewCards([...newCards, {front: '', back: ''}]);
  };

  const removeCard = (index: number) => {
    if (newCards.length > 1) {
      setNewCards(newCards.filter((_, i) => i !== index));
    }
  };

  const updateCard = (index: number, field: 'front' | 'back', value: string) => {
    const updated = [...newCards];
    updated[index][field] = value;
    setNewCards(updated);
  };

  const saveFlashcardSet = () => {
    console.log('Saving flashcard set:', { title: newSetTitle, cards: newCards });
    resetCreateForm();
    setViewMode('grid');
  };

  const resetCreateForm = () => {
    setNewSetTitle('');
    setNewCards([{front: '', back: ''}]);
    setShowContentOptions(true);
    setShowManualInput(false);
  };

  const handleContentSelect = (type: 'youtube' | 'file', content: any) => {
    console.log('Content selected for flashcards:', type, content);
    setShowContentOptions(false);
    setShowManualInput(true);
    
    if (type === 'youtube') {
      setNewSetTitle(`Flashcards from: ${content.url}`);
      setNewCards([
        { front: 'Sample Question 1', back: 'Content will be automatically generated from the YouTube video' },
        { front: 'Sample Question 2', back: 'AI will extract key concepts and create flashcards' }
      ]);
    } else if (type === 'file') {
      const fileNames = content.files.map((file: File) => file.name).join(', ');
      setNewSetTitle(`Flashcards from: ${fileNames}`);
      setNewCards([
        { front: 'Sample Question 1', back: 'Content will be automatically extracted from uploaded files' },
        { front: 'Sample Question 2', back: 'AI will process documents and create relevant flashcards' }
      ]);
    }
  };

  if (viewMode === 'create') {
    return (
      <FlashcardsCreate
        newSetTitle={newSetTitle}
        newCards={newCards}
        showContentOptions={showContentOptions}
        showManualInput={showManualInput}
        onTitleChange={setNewSetTitle}
        onCardChange={updateCard}
        onAddCard={addNewCard}
        onRemoveCard={removeCard}
        onContentSelect={handleContentSelect}
        onToggleManualInput={() => {
          setShowContentOptions(false);
          setShowManualInput(true);
        }}
        onBackToContentOptions={() => {
          setShowContentOptions(true);
          setShowManualInput(false);
          resetCreateForm();
        }}
        onSave={saveFlashcardSet}
        onCancel={() => setViewMode('grid')}
      />
    );
  }

  if (viewMode === 'study') {
    const deck = getCurrentDeck();
    if (!deck) {
      setViewMode('grid');
      return null;
    }

    return (
      <FlashcardsStudy
        deck={deck}
        currentCard={currentCard}
        onFlipCard={(cardId) => flipCard(deck.id, cardId)}
        onPrevCard={prevCard}
        onNextCard={nextCard}
        onBackToGrid={() => setViewMode('grid')}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <FlashcardsGrid
      decks={mockFlashcardDecks}
      onStartStudy={startStudyMode}
      onCreateSet={() => setViewMode('create')}
    />
  );
}