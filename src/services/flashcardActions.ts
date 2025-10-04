import { flashcardsService } from './database';
import { hybridSyncService } from './hybridSync';

// Enhanced flashcard actions that handle both localStorage and database
export const flashcardActions = {
  // Delete entire deck (with all cards)
  async deleteDeck(deckId: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting flashcard deck: ${deckId}`);
      
      // First, find the deck to get its database ID (UUID)
      const dataStr = localStorage.getItem('studyflow-flashcards');
      if (!dataStr) {
        console.warn('No flashcards data found in localStorage');
        return false;
      }
      
      const decks = JSON.parse(dataStr);
      const deck = decks.find((d: any) => 
        d.id.toString() === deckId || d.db_id === deckId
      );
      
      if (!deck) {
        console.warn(`Deck ${deckId} not found`);
        return false;
      }
      
      // Delete from localStorage first
      const updatedDecks = decks.filter((d: any) => 
        d.id.toString() !== deckId && d.db_id !== deckId
      );
      localStorage.setItem('studyflow-flashcards', JSON.stringify(updatedDecks));
      
      // Trigger storage event for UI updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'studyflow-flashcards',
        newValue: JSON.stringify(updatedDecks),
        oldValue: dataStr
      }));
      
      console.log(`💾 Deleted deck ${deckId} from localStorage`);
      
      // Delete from database if we have a database ID and are online
      if (deck.db_id && hybridSyncService.getSyncStatus().isOnline) {
        try {
          console.log(`☁️ Deleting deck ${deck.db_id} from database...`);
          const dbSuccess = await flashcardsService.deleteFlashcardDeck(deck.db_id);
          if (dbSuccess) {
            console.log(`✅ Successfully deleted deck ${deck.db_id} from database`);
          } else {
            console.warn(`⚠️ Failed to delete deck ${deck.db_id} from database`);
          }
        } catch (error) {
          console.error(`❌ Error deleting deck from database:`, error);
        }
      } else if (!deck.db_id) {
        console.log(`📝 Deck ${deckId} has no database ID (local-only deck)`);
      } else {
        console.log(`📴 Offline - deck deletion will sync when online`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting flashcard deck:', error);
      return false;
    }
  },

  // Delete individual card from a deck
  async deleteCard(deckId: string, cardId: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting card ${cardId} from deck ${deckId}`);
      
      // Get current deck data
      const dataStr = localStorage.getItem('studyflow-flashcards');
      if (!dataStr) return false;
      
      const decks = JSON.parse(dataStr);
      const deckIndex = decks.findIndex((deck: any) => 
        deck.id === deckId || deck.db_id === deckId
      );
      
      if (deckIndex === -1) return false;
      
      // Remove card from deck
      const deck = decks[deckIndex];
      if (deck.cards) {
        deck.cards = deck.cards.filter((card: any) => 
          card.id !== cardId && card.db_id !== cardId
        );
      }
      
      // Update localStorage
      localStorage.setItem('studyflow-flashcards', JSON.stringify(decks));
      
      // Trigger storage event for UI updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'studyflow-flashcards',
        newValue: JSON.stringify(decks),
        oldValue: dataStr
      }));
      
      // Delete from database if online
      if (hybridSyncService.getSyncStatus().isOnline) {
        try {
          await flashcardsService.deleteFlashcardCard(cardId);
          console.log(`☁️ Deleted card ${cardId} from database`);
        } catch (error) {
          console.warn(`⚠️ Failed to delete card from database:`, error);
        }
      }
      
      // Trigger sync for the updated deck
      await hybridSyncService.saveData('studyflow-flashcards', decks);
      
      return true;
    } catch (error) {
      console.error('Error deleting flashcard card:', error);
      return false;
    }
  },

  // Delete multiple cards at once
  async deleteMultipleCards(deckId: string, cardIds: string[]): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting ${cardIds.length} cards from deck ${deckId}`);
      
      // Get current deck data
      const dataStr = localStorage.getItem('studyflow-flashcards');
      if (!dataStr) return false;
      
      const decks = JSON.parse(dataStr);
      const deckIndex = decks.findIndex((deck: any) => 
        deck.id === deckId || deck.db_id === deckId
      );
      
      if (deckIndex === -1) return false;
      
      // Remove cards from deck
      const deck = decks[deckIndex];
      if (deck.cards) {
        deck.cards = deck.cards.filter((card: any) => 
          !cardIds.includes(card.id) && !cardIds.includes(card.db_id)
        );
      }
      
      // Update localStorage
      localStorage.setItem('studyflow-flashcards', JSON.stringify(decks));
      
      // Trigger storage event for UI updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'studyflow-flashcards',
        newValue: JSON.stringify(decks),
        oldValue: dataStr
      }));
      
      // Delete from database if online
      if (hybridSyncService.getSyncStatus().isOnline) {
        try {
          await flashcardsService.deleteMultipleCards(cardIds);
          console.log(`☁️ Deleted ${cardIds.length} cards from database`);
        } catch (error) {
          console.warn(`⚠️ Failed to delete cards from database:`, error);
        }
      }
      
      // Trigger sync for the updated deck
      await hybridSyncService.saveData('studyflow-flashcards', decks);
      
      return true;
    } catch (error) {
      console.error('Error deleting multiple flashcard cards:', error);
      return false;
    }
  },

  // Clear all cards from a deck (but keep the deck)
  async clearAllCards(deckId: string): Promise<boolean> {
    try {
      console.log(`🧹 Clearing all cards from deck ${deckId}`);
      
      // Get current deck data
      const dataStr = localStorage.getItem('studyflow-flashcards');
      if (!dataStr) return false;
      
      const decks = JSON.parse(dataStr);
      const deckIndex = decks.findIndex((deck: any) => 
        deck.id === deckId || deck.db_id === deckId
      );
      
      if (deckIndex === -1) return false;
      
      // Clear cards from deck
      decks[deckIndex].cards = [];
      
      // Update localStorage
      localStorage.setItem('studyflow-flashcards', JSON.stringify(decks));
      
      // Trigger storage event for UI updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'studyflow-flashcards',
        newValue: JSON.stringify(decks),
        oldValue: dataStr
      }));
      
      // Clear cards from database if online
      if (hybridSyncService.getSyncStatus().isOnline) {
        try {
          await flashcardsService.deleteAllCardsFromDeck(deckId);
          console.log(`☁️ Cleared all cards from deck ${deckId} in database`);
        } catch (error) {
          console.warn(`⚠️ Failed to clear cards from database:`, error);
        }
      }
      
      // Trigger sync for the updated deck
      await hybridSyncService.saveData('studyflow-flashcards', decks);
      
      return true;
    } catch (error) {
      console.error('Error clearing cards from deck:', error);
      return false;
    }
  },

  // Utility: Get deck by ID
  getDeck(deckId: string): any | null {
    try {
      const dataStr = localStorage.getItem('studyflow-flashcards');
      if (!dataStr) return null;
      
      const decks = JSON.parse(dataStr);
      return decks.find((deck: any) => 
        deck.id === deckId || deck.db_id === deckId
      ) || null;
    } catch (error) {
      console.error('Error getting deck:', error);
      return null;
    }
  },

  // Utility: Get all decks
  getAllDecks(): any[] {
    try {
      const dataStr = localStorage.getItem('studyflow-flashcards');
      if (!dataStr) return [];
      
      return JSON.parse(dataStr);
    } catch (error) {
      console.error('Error getting all decks:', error);
      return [];
    }
  }
};