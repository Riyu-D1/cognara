// Debug utility to check localStorage data
export const debugStorage = () => {
  console.log('🔍 === STORAGE DEBUG INFO ===');
  
  const keys = ['studyflow-notes', 'studyflow-flashcards', 'studyflow-quizzes', 'studyflow-ai-chats'];
  
  keys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log(`✅ ${key}:`, Array.isArray(parsed) ? `${parsed.length} items` : 'Data exists', parsed);
      } catch (error) {
        console.log(`❌ ${key}: Invalid JSON`, data);
      }
    } else {
      console.log(`⭕ ${key}: No data found`);
    }
  });
  
  console.log('🔍 === END STORAGE DEBUG ===');
};

// Test localStorage save/load
export const testStorage = () => {
  const testData = { test: 'data', timestamp: Date.now() };
  localStorage.setItem('test-key', JSON.stringify(testData));
  const retrieved = JSON.parse(localStorage.getItem('test-key') || '{}');
  console.log('Storage test:', retrieved);
  localStorage.removeItem('test-key');
  return retrieved.test === 'data';
};
