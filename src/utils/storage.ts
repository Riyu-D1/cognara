// Cognara Data Storage Utilities

export const clearAllCognaraData = () => {
  try {
    localStorage.removeItem('cognara-notes');
    localStorage.removeItem('cognara-flashcards');
    localStorage.removeItem('cognara-quizzes');
    localStorage.removeItem('cognara-ai-chats');
    console.log('✅ All Cognara data cleared successfully');
    window.location.reload(); // Reload to reset components
  } catch (error) {
    console.error('❌ Error clearing Cognara data:', error);
  }
};

export const exportCognaraData = () => {
  try {
    const data = {
      notes: localStorage.getItem('cognara-notes'),
      flashcards: localStorage.getItem('cognara-flashcards'),
      quizzes: localStorage.getItem('cognara-quizzes'),
      aiChats: localStorage.getItem('cognara-ai-chats'),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cognara-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ Cognara data exported successfully');
  } catch (error) {
    console.error('❌ Error exporting Cognara data:', error);
  }
};

export const getStorageStats = () => {
  try {
    const notes = localStorage.getItem('cognara-notes');
    const flashcards = localStorage.getItem('cognara-flashcards');
    const quizzes = localStorage.getItem('cognara-quizzes');
    const aiChats = localStorage.getItem('cognara-ai-chats');

    console.log('📊 Cognara Storage Stats:');
    console.log('Notes:', notes ? JSON.parse(notes).length : 0, 'items');
    console.log('Flashcard Decks:', flashcards ? JSON.parse(flashcards).length : 0, 'items');
    console.log('Quizzes:', quizzes ? JSON.parse(quizzes).length : 0, 'items');
    console.log('AI Chats:', aiChats ? JSON.parse(aiChats).length : 0, 'items');
  } catch (error) {
    console.error('❌ Error getting storage stats:', error);
  }
};

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).clearAllCognaraData = clearAllCognaraData;
  (window as any).exportCognaraData = exportCognaraData;
  (window as any).getStorageStats = getStorageStats;
}
