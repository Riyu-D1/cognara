import { syncLocalStorageToDatabase } from './database';

// Simple script to migrate existing localStorage data to database
// Run this after setting up the database and when users first log in

export const migrateUserData = async () => {
  try {
    console.log('🚀 Starting data migration...');
    
    // Sync all localStorage data to database
    await syncLocalStorageToDatabase();
    
    // Clear localStorage after successful migration (optional)
    // Uncomment these lines if you want to clean up localStorage after migration
    /*
    localStorage.removeItem('studyflow-notes');
    localStorage.removeItem('studyflow-flashcards');  
    localStorage.removeItem('studyflow-quizzes');
    localStorage.removeItem('studyflow-ai-chats');
    */
    
    console.log('✅ Data migration completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Data migration failed:', error);
    return false;
  }
};

// Function to check if user has existing data that needs migration
export const needsMigration = () => {
  const hasNotes = localStorage.getItem('studyflow-notes');
  const hasFlashcards = localStorage.getItem('studyflow-flashcards');
  const hasQuizzes = localStorage.getItem('studyflow-quizzes');
  const hasChats = localStorage.getItem('studyflow-ai-chats');
  
  return !!(hasNotes || hasFlashcards || hasQuizzes || hasChats);
};
