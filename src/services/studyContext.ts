/**
 * Study Context Service
 * Provides AI with access to user's study materials for context-aware assistance
 */

import { notesService, flashcardsService, quizzesService, type Note, type FlashcardDeck, type Quiz } from './database';

export interface StudyMaterialContext {
  notes: Note[];
  flashcards: FlashcardDeck[];
  quizzes: Quiz[];
}

export interface SelectedMaterials {
  noteIds: string[];
  flashcardDeckIds: string[];
  quizIds: string[];
}

export interface FormattedContext {
  summary: string;
  detailedContent: string;
  materialCount: number;
}

/**
 * Load all user study materials
 */
export async function loadAllStudyMaterials(): Promise<StudyMaterialContext> {
  try {
    const [notes, flashcards, quizzes] = await Promise.all([
      notesService.getUserNotes(),
      flashcardsService.getUserFlashcards(),
      quizzesService.getUserQuizzes()
    ]);

    return {
      notes: notes || [],
      flashcards: flashcards || [],
      quizzes: quizzes || []
    };
  } catch (error) {
    console.error('Error loading study materials:', error);
    return {
      notes: [],
      flashcards: [],
      quizzes: []
    };
  }
}

/**
 * Format study materials into AI-readable context
 */
export function formatStudyMaterialsForAI(
  materials: StudyMaterialContext,
  selectedMaterials?: SelectedMaterials
): FormattedContext {
  let detailedContent = '';
  let materialCount = 0;
  const summaryParts: string[] = [];

  // Filter materials based on selection (if provided)
  const filteredNotes = selectedMaterials?.noteIds.length
    ? materials.notes.filter(n => n.id && selectedMaterials.noteIds.includes(n.id))
    : materials.notes;

  const filteredFlashcards = selectedMaterials?.flashcardDeckIds.length
    ? materials.flashcards.filter(d => d.id && selectedMaterials.flashcardDeckIds.includes(d.id))
    : materials.flashcards;

  const filteredQuizzes = selectedMaterials?.quizIds.length
    ? materials.quizzes.filter(q => q.id && selectedMaterials.quizIds.includes(q.id))
    : materials.quizzes;

  // Format Notes
  if (filteredNotes.length > 0) {
    materialCount += filteredNotes.length;
    summaryParts.push(`${filteredNotes.length} note${filteredNotes.length > 1 ? 's' : ''}`);
    
    detailedContent += '\n## User\'s Study Notes\n\n';
    filteredNotes.forEach((note, index) => {
      detailedContent += `### Note ${index + 1}: ${note.title}\n`;
      if (note.subject) detailedContent += `Subject: ${note.subject}\n`;
      detailedContent += `\nContent:\n${note.content}\n\n`;
      detailedContent += '---\n\n';
    });
  }

  // Format Flashcards
  if (filteredFlashcards.length > 0) {
    const totalCards = filteredFlashcards.reduce((sum, deck) => sum + (deck.cards?.length || 0), 0);
    materialCount += filteredFlashcards.length;
    summaryParts.push(`${filteredFlashcards.length} flashcard deck${filteredFlashcards.length > 1 ? 's' : ''} (${totalCards} cards)`);
    
    detailedContent += '\n## User\'s Flashcard Decks\n\n';
    filteredFlashcards.forEach((deck, index) => {
      detailedContent += `### Deck ${index + 1}: ${deck.title}\n`;
      if (deck.subject) detailedContent += `Subject: ${deck.subject}\n`;
      detailedContent += `Cards: ${deck.cards?.length || 0}\n\n`;
      
      if (deck.cards && deck.cards.length > 0) {
        deck.cards.forEach((card, cardIndex) => {
          detailedContent += `**Card ${cardIndex + 1}:**\n`;
          detailedContent += `Q: ${card.front_text}\n`;
          detailedContent += `A: ${card.back_text}\n\n`;
        });
      }
      detailedContent += '---\n\n';
    });
  }

  // Format Quizzes
  if (filteredQuizzes.length > 0) {
    const totalQuestions = filteredQuizzes.reduce((sum, quiz) => sum + (quiz.questions?.length || 0), 0);
    materialCount += filteredQuizzes.length;
    summaryParts.push(`${filteredQuizzes.length} quiz${filteredQuizzes.length > 1 ? 'zes' : ''} (${totalQuestions} questions)`);
    
    detailedContent += '\n## User\'s Quizzes\n\n';
    filteredQuizzes.forEach((quiz, index) => {
      detailedContent += `### Quiz ${index + 1}: ${quiz.title}\n`;
      detailedContent += `Questions: ${quiz.questions?.length || 0}\n\n`;
      
      if (quiz.questions && quiz.questions.length > 0) {
        quiz.questions.forEach((question, qIndex) => {
          detailedContent += `**Question ${qIndex + 1}:** ${question.question_text}\n`;
          if (question.subject) detailedContent += `Subject: ${question.subject}\n`;
          detailedContent += `Options:\n`;
          question.options.forEach((option, optIndex) => {
            const isCorrect = optIndex === question.correct_answer;
            detailedContent += `  ${String.fromCharCode(65 + optIndex)}) ${option}${isCorrect ? ' ✓' : ''}\n`;
          });
          if (question.explanation) {
            detailedContent += `Explanation: ${question.explanation}\n`;
          }
          detailedContent += '\n';
        });
      }
      detailedContent += '---\n\n';
    });
  }

  const summary = summaryParts.length > 0 
    ? summaryParts.join(', ')
    : 'No study materials available';

  return {
    summary,
    detailedContent,
    materialCount
  };
}

/**
 * Build AI prompt with study material context
 */
export function buildContextAwarePrompt(
  userMessage: string,
  context: FormattedContext,
  includeContext: boolean = true
): string {
  if (!includeContext || context.materialCount === 0) {
    // No context, return original chat prompt
    return `You are a helpful AI study assistant for students. Be friendly, encouraging, and provide clear explanations. Help with studying, concepts, homework questions, and study tips.

User message: ${userMessage}

Respond helpfully and conversationally.`;
  }

  // Build context-aware prompt
  return `You are a helpful AI study assistant with access to the user's study materials. Use this context to provide personalized, relevant answers that reference their specific content.

## User's Study Materials (Context)
${context.detailedContent}

## Guidelines:
- Reference specific notes, flashcards, or quiz questions from their materials when relevant
- Help them understand concepts from their own study content
- Suggest connections between different materials they've created
- Provide practice questions based on their content
- Be encouraging and supportive

User's Question: ${userMessage}

Provide a helpful response that uses their study materials for context when relevant:`;
}

/**
 * Get a quick summary of available study materials
 */
export async function getStudyMaterialsSummary(): Promise<string> {
  const materials = await loadAllStudyMaterials();
  const context = formatStudyMaterialsForAI(materials);
  
  if (context.materialCount === 0) {
    return 'No study materials yet. Create notes, flashcards, or quizzes to enable context-aware AI assistance!';
  }
  
  return `Available study materials: ${context.summary}`;
}

/**
 * Search study materials for relevant content
 */
export function searchStudyMaterials(
  materials: StudyMaterialContext,
  searchTerm: string
): SelectedMaterials {
  const term = searchTerm.toLowerCase();
  
  const relevantNoteIds = materials.notes
    .filter(note => 
      note.title.toLowerCase().includes(term) ||
      note.content.toLowerCase().includes(term) ||
      note.subject?.toLowerCase().includes(term)
    )
    .map(note => note.id)
    .filter((id): id is string => id !== undefined);

  const relevantFlashcardIds = materials.flashcards
    .filter(deck =>
      deck.title.toLowerCase().includes(term) ||
      deck.subject?.toLowerCase().includes(term) ||
      deck.cards?.some(card =>
        card.front_text.toLowerCase().includes(term) ||
        card.back_text.toLowerCase().includes(term)
      )
    )
    .map(deck => deck.id)
    .filter((id): id is string => id !== undefined);

  const relevantQuizIds = materials.quizzes
    .filter(quiz =>
      quiz.title.toLowerCase().includes(term) ||
      quiz.questions?.some(q =>
        q.question_text.toLowerCase().includes(term) ||
        q.subject?.toLowerCase().includes(term)
      )
    )
    .map(quiz => quiz.id)
    .filter((id): id is string => id !== undefined);

  return {
    noteIds: relevantNoteIds,
    flashcardDeckIds: relevantFlashcardIds,
    quizIds: relevantQuizIds
  };
}

/**
 * Get study materials by subject
 */
export function filterMaterialsBySubject(
  materials: StudyMaterialContext,
  subject: string
): SelectedMaterials {
  const subjectLower = subject.toLowerCase();
  
  const noteIds = materials.notes
    .filter(note => note.subject?.toLowerCase() === subjectLower)
    .map(note => note.id)
    .filter((id): id is string => id !== undefined);

  const flashcardDeckIds = materials.flashcards
    .filter(deck => deck.subject?.toLowerCase() === subjectLower)
    .map(deck => deck.id)
    .filter((id): id is string => id !== undefined);

  const quizIds = materials.quizzes
    .filter(quiz => 
      quiz.questions?.some(q => q.subject?.toLowerCase() === subjectLower)
    )
    .map(quiz => quiz.id)
    .filter((id): id is string => id !== undefined);

  return {
    noteIds,
    flashcardDeckIds,
    quizIds
  };
}

/**
 * Get list of all subjects from user's materials
 */
export function getAllSubjects(materials: StudyMaterialContext): string[] {
  const subjects = new Set<string>();
  
  materials.notes.forEach(note => {
    if (note.subject) subjects.add(note.subject);
  });
  
  materials.flashcards.forEach(deck => {
    if (deck.subject) subjects.add(deck.subject);
  });
  
  materials.quizzes.forEach(quiz => {
    quiz.questions?.forEach(q => {
      if (q.subject) subjects.add(q.subject);
    });
  });
  
  return Array.from(subjects).sort();
}
