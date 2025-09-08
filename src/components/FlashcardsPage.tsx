import React, { useState, useEffect } from 'react';
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
  const [savedDecks, setSavedDecks] = useState(() => {
    try {
      const storedDecks = localStorage.getItem('cognara-flashcards');
      return storedDecks ? JSON.parse(storedDecks) : mockFlashcardDecks;
    } catch (error) {
      console.error('Error loading flashcards from localStorage:', error);
      return mockFlashcardDecks;
    }
  });

  // Save flashcards to localStorage whenever savedDecks changes
  useEffect(() => {
    try {
      localStorage.setItem('cognara-flashcards', JSON.stringify(savedDecks));
    } catch (error) {
      console.error('Error saving flashcards to localStorage:', error);
    }
  }, [savedDecks]);

  const getCurrentDeck = () => {
    if (selectedDeck === null) return null;
    return savedDecks.find(deck => deck.id === selectedDeck);
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
    if (!newSetTitle.trim() || newCards.length === 0 || !newCards.some(card => card.front.trim() && card.back.trim())) return;
    
    const newDeck = {
      id: Date.now(),
      title: newSetTitle,
      cardCount: newCards.filter(card => card.front.trim() && card.back.trim()).length,
      subject: 'General', // Could be detected or selected
      cards: newCards.filter(card => card.front.trim() && card.back.trim()).map((card, index) => ({
        id: index + 1,
        front: card.front.trim(),
        back: card.back.trim(),
        mastered: false
      })),
      createdAt: 'Just now',
      lastStudied: 'Never'
    };

    // Add new deck to saved decks
    setSavedDecks([newDeck, ...savedDecks]);
    
    console.log('Flashcard deck saved successfully:', newDeck);
    resetCreateForm();
    setViewMode('grid');
  };

  const resetCreateForm = () => {
    setNewSetTitle('');
    setNewCards([{front: '', back: ''}]);
    setShowContentOptions(true);
    setShowManualInput(false);
  };

  const handleContentSelect = async (type: 'youtube' | 'file', content: any) => {
    console.log('Content selected for flashcards:', type, content);
    setShowContentOptions(false);
    setShowManualInput(true);
    
    if (type === 'youtube') {
      try {
        setNewSetTitle(`Flashcards from: ${content.url}`);
        setNewCards([
          { front: '🤖 AI is analyzing the YouTube video...', back: 'Generating flashcards from video content...' }
        ]);

        // Extract video ID and get video info
        const videoId = extractVideoId(content.url);
        if (!videoId) throw new Error('Invalid YouTube URL');

        const videoInfo = await getYouTubeVideoInfo(content.url);
        
        // Use AI to generate flashcards
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Create flashcards from this YouTube video information:

Title: ${videoInfo.title}
Description: ${videoInfo.description}

Generate 6-8 flashcards that test key concepts from this content. 
Format each flashcard as:
Q: [Clear, specific question]
A: [Concise, accurate answer]

Focus on important concepts, definitions, and key information that would be valuable for studying.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse AI response to extract flashcards
        const flashcards = parseFlashcardsFromAI(text);
        
        setNewSetTitle(`${videoInfo.title} - Flashcards`);
        setNewCards(flashcards.length > 0 ? flashcards : [
          { front: 'Main Topic', back: 'Key concepts from: ' + videoInfo.title },
          { front: 'Key Concept', back: 'Important information from the video content' }
        ]);

      } catch (error) {
        console.error('Error processing YouTube video for flashcards:', error);
        setNewCards([
          { front: '❌ Error Processing Video', back: 'Please check the URL and try again, or create flashcards manually.' }
        ]);
      }
    } else if (type === 'file') {
      const fileNames = content.files.map((file: File) => file.name).join(', ');
      setNewSetTitle(`Flashcards from: ${fileNames}`);
      setNewCards([
        { front: '📄 File Processing', back: 'File processing will be implemented soon. You can create flashcards manually for now.' }
      ]);
    }
  };

  // Helper functions
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  const getYouTubeVideoInfo = async (url: string) => {
    const videoId = extractVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');

    try {
      console.log('Fetching YouTube video info for ID:', videoId);
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`;
      console.log('YouTube API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('YouTube API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('YouTube API error response:', errorText);
        throw new Error(`YouTube API request failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('YouTube API response data:', data);
      const video = data.items?.[0];
      
      if (!video) throw new Error('Video not found or may be private/restricted');

      return {
        title: video.snippet?.title ?? 'Untitled',
        description: video.snippet?.description ?? 'No description available',
        videoId
      };
    } catch (error) {
      console.error('YouTube API error:', error);
      throw error;
    }
  };

  const parseFlashcardsFromAI = (text: string): {front: string; back: string}[] => {
    const flashcards: {front: string; back: string}[] = [];
    const lines = text.split('\n');
    
    let currentCard: {front?: string; back?: string} = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.match(/^(Q|Question)[:.]?\s*/i)) {
        if (currentCard.front && currentCard.back) {
          flashcards.push(currentCard as {front: string; back: string});
        }
        currentCard = { front: trimmed.replace(/^(Q|Question)[:.]?\s*/i, '') };
      } else if (trimmed.match(/^(A|Answer)[:.]?\s*/i) && currentCard.front) {
        currentCard.back = trimmed.replace(/^(A|Answer)[:.]?\s*/i, '');
      }
    }
    
    if (currentCard.front && currentCard.back) {
      flashcards.push(currentCard as {front: string; back: string});
    }
    
    return flashcards;
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
      decks={savedDecks}
      onStartStudy={startStudyMode}
      onCreateSet={() => setViewMode('create')}
    />
  );
}