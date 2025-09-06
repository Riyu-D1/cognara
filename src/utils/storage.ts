// StudyFlow Data Storage Utilities

export const clearAllStudyFlowData = () => {
  try {
    localStorage.removeItem('studyflow-notes');
    localStorage.removeItem('studyflow-flashcards');
    localStorage.removeItem('studyflow-quizzes');
    localStorage.removeItem('studyflow-ai-chats');
    console.log('✅ All StudyFlow data cleared successfully');
    window.location.reload(); // Reload to reset components
  } catch (error) {
    console.error('❌ Error clearing StudyFlow data:', error);
  }
};

export const exportStudyFlowData = () => {
  try {
    const data = {
      notes: localStorage.getItem('studyflow-notes'),
      flashcards: localStorage.getItem('studyflow-flashcards'),
      quizzes: localStorage.getItem('studyflow-quizzes'),
      aiChats: localStorage.getItem('studyflow-ai-chats'),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('✅ StudyFlow data exported successfully');
  } catch (error) {
    console.error('❌ Error exporting StudyFlow data:', error);
  }
};

export const getStorageStats = () => {
  try {
    const notes = localStorage.getItem('studyflow-notes');
    const flashcards = localStorage.getItem('studyflow-flashcards');
    const quizzes = localStorage.getItem('studyflow-quizzes');
    const aiChats = localStorage.getItem('studyflow-ai-chats');
    
    console.log('📊 StudyFlow Storage Stats:');
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
  (window as any).clearAllStudyFlowData = clearAllStudyFlowData;
  (window as any).exportStudyFlowData = exportStudyFlowData;
  (window as any).getStorageStats = getStorageStats;
}
