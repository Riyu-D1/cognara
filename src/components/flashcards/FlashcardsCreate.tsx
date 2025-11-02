import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { ContentInputOptions } from '../ContentInputOptions';
import LoadingAnimations from '../LoadingAnimations';
import { Plus, Save, X, Trash2, Keyboard } from 'lucide-react';

interface FlashcardsCreateProps {
  newSetTitle: string;
  newCards: {front: string; back: string}[];
  showContentOptions: boolean;
  showManualInput: boolean;
  isProcessing?: boolean;
  onTitleChange: (title: string) => void;
  onCardChange: (index: number, field: 'front' | 'back', value: string) => void;
  onAddCard: () => void;
  onRemoveCard: (index: number) => void;
  onContentSelect: (type: 'youtube' | 'file', content: any) => void;
  onToggleManualInput: () => void;
  onBackToContentOptions: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function FlashcardsCreate({
  newSetTitle,
  newCards,
  showContentOptions,
  showManualInput,
  isProcessing = false,
  onTitleChange,
  onCardChange,
  onAddCard,
  onRemoveCard,
  onContentSelect,
  onToggleManualInput,
  onBackToContentOptions,
  onSave,
  onCancel
}: FlashcardsCreateProps) {
  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl text-foreground">Create Flashcard Set</h1>
          <p className="text-muted-foreground">Build your own study cards</p>
        </div>
        <Button 
          onClick={onCancel}
          variant="outline"
          className="rounded-xl clay-input"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Content Input Options */}
        {showContentOptions && (
          <Card className="p-6 clay-card border-0">
            <ContentInputOptions 
              onContentSelect={onContentSelect}
              acceptedTypes={['.pdf', '.docx', '.txt', '.pptx', '.md', '.jpg', '.png']}
            />
            
            <div className="mt-6 pt-6 border-t border-border">
              <Button
                onClick={onToggleManualInput}
                variant="outline"
                className="w-full rounded-xl clay-input"
              >
                <Keyboard className="w-4 h-4 mr-2" />
                Or create flashcards manually
              </Button>
            </div>
          </Card>
        )}

        {/* Manual Input */}
        {(showManualInput || !showContentOptions) && (
          <>
            {/* Set Title */}
            <Card className="p-6 clay-card border-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-foreground">Set Title</label>
                  {!showContentOptions && (
                    <Button
                      onClick={onBackToContentOptions}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Back to content options
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Enter flashcard set title..."
                  value={newSetTitle}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="clay-input border-0"
                />
              </div>
            </Card>

            {/* Processing Animation */}
            {isProcessing && (
              <Card className="p-6 clay-card border-0">
                <LoadingAnimations variant="typewriter" ariaLabel="AI is generating your flashcards" />
                <p className="text-center text-primary mt-4">AI is analyzing your content and creating flashcards...</p>
              </Card>
            )}

            {/* Flashcards */}
            <div className="space-y-4">
              {newCards.map((card, index) => (
                <Card key={index} className="p-6 clay-card border-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-foreground">Card {index + 1}</h3>
                      {newCards.length > 1 && (
                        <Button
                          onClick={() => onRemoveCard(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm">Front (Question)</label>
                        <Textarea
                          placeholder="Enter the question or prompt..."
                          value={card.front}
                          onChange={(e) => onCardChange(index, 'front', e.target.value)}
                          className="min-h-24 clay-input border-0 resize-none"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-muted-foreground text-sm">Back (Answer)</label>
                        <Textarea
                          placeholder="Enter the answer or explanation..."
                          value={card.back}
                          onChange={(e) => onCardChange(index, 'back', e.target.value)}
                          className="min-h-24 clay-input border-0 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Action Buttons */}
        {(showManualInput || !showContentOptions) && (
          <div className="flex items-center justify-between">
            <Button
              onClick={onAddCard}
              variant="outline"
              className="rounded-xl clay-input"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Card
            </Button>
            
            <Button
              onClick={onSave}
              disabled={!newSetTitle.trim() || newCards.some(card => !card.front.trim() || !card.back.trim())}
              className="clay-button bg-gradient-to-r from-primary to-primary-hover text-primary-foreground rounded-xl border-0"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Flashcard Set
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}