import { supabase } from '../utils/supabase/client';

// Types for our data structures
export interface Note {
  id?: string;
  title: string;
  content: string;
  subject?: string;
  tags: string[];
  word_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FlashcardDeck {
  id?: string;
  title: string;
  subject?: string;
  cards: FlashcardCard[];
  created_at?: string;
  updated_at?: string;
}

export interface FlashcardCard {
  id?: string;
  front_text: string;
  back_text: string;
}

export interface Quiz {
  id?: string;
  title: string;
  questions: QuizQuestion[];
  created_at?: string;
  updated_at?: string;
}

export interface QuizQuestion {
  id?: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  subject?: string;
}

export interface AIChat {
  id?: string;
  title: string;
  messages: AIMessage[];
  created_at?: string;
  updated_at?: string;
}

export interface AIMessage {
  id?: string;
  message_text: string;
  sender: 'user' | 'ai';
  message_type?: 'chat' | 'youtube' | 'file';
  created_at?: string;
}

// Notes Services
export const notesService = {
  async getUserNotes(): Promise<Note[]> {
    try {
      console.log('Fetching user notes from database...');
      const { data, error } = await supabase
        .from('user_notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Database error fetching notes:', error);
        throw error;
      }
      
      console.log('Notes fetched from database:', data?.length || 0, 'notes');
      return data || [];
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  },

  async createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note | null> {
    try {
      console.log('Creating note in database:', note);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated for note creation');
        throw new Error('User not authenticated');
      }

      console.log('User authenticated, inserting note for user:', user.id);
      const { data, error } = await supabase
        .from('user_notes')
        .insert([{
          user_id: user.id,
          title: note.title,
          content: note.content,
          subject: note.subject,
          tags: note.tags,
          word_count: note.word_count || note.content.split(' ').length
        }])
        .select()
        .single();

      if (error) {
        console.error('Database error creating note:', error);
        throw error;
      }
      
      console.log('Note created successfully in database:', data);
      return data;
    } catch (error) {
      console.error('Error creating note:', error);
      return null;
    }
  },

  async updateNote(noteId: string, updates: Partial<Note>): Promise<Note | null> {
    try {
      const { data, error } = await supabase
        .from('user_notes')
        .update({
          title: updates.title,
          content: updates.content,
          subject: updates.subject,
          tags: updates.tags,
          word_count: updates.content ? updates.content.split(' ').length : undefined
        })
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating note:', error);
      return null;
    }
  },

  async deleteNote(noteId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  }
};

// Flashcards Services
export const flashcardsService = {
  async getUserFlashcards(): Promise<FlashcardDeck[]> {
    try {
      const { data: decks, error: decksError } = await supabase
        .from('user_flashcards')
        .select('*')
        .order('updated_at', { ascending: false });

      if (decksError) throw decksError;

      // Get cards for each deck
      const decksWithCards = await Promise.all(
        (decks || []).map(async (deck) => {
          const { data: cards, error: cardsError } = await supabase
            .from('flashcard_cards')
            .select('*')
            .eq('deck_id', deck.id)
            .order('created_at');

          if (cardsError) {
            console.error('Error fetching cards for deck:', cardsError);
            return { ...deck, cards: [] };
          }

          return { ...deck, cards: cards || [] };
        })
      );

      return decksWithCards;
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      return [];
    }
  },

  async createFlashcardDeck(deck: Omit<FlashcardDeck, 'id' | 'created_at' | 'updated_at'>): Promise<FlashcardDeck | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create the deck
      const { data: deckData, error: deckError } = await supabase
        .from('user_flashcards')
        .insert([{
          user_id: user.id,
          title: deck.title,
          subject: deck.subject
        }])
        .select()
        .single();

      if (deckError) throw deckError;

      // Create the cards
      if (deck.cards && deck.cards.length > 0) {
        const { error: cardsError } = await supabase
          .from('flashcard_cards')
          .insert(
            deck.cards.map(card => ({
              deck_id: deckData.id,
              front_text: card.front_text,
              back_text: card.back_text
            }))
          );

        if (cardsError) throw cardsError;
      }

      return { ...deckData, cards: deck.cards };
    } catch (error) {
      console.error('Error creating flashcard deck:', error);
      return null;
    }
  },

  async updateFlashcardDeck(deckId: string, updates: Partial<FlashcardDeck>): Promise<FlashcardDeck | null> {
    try {
      // Update deck info
      const { data: deckData, error: deckError } = await supabase
        .from('user_flashcards')
        .update({
          title: updates.title,
          subject: updates.subject
        })
        .eq('id', deckId)
        .select()
        .single();

      if (deckError) throw deckError;

      // If cards are provided, replace all cards
      if (updates.cards) {
        // Delete existing cards
        await supabase
          .from('flashcard_cards')
          .delete()
          .eq('deck_id', deckId);

        // Insert new cards
        if (updates.cards.length > 0) {
          await supabase
            .from('flashcard_cards')
            .insert(
              updates.cards.map(card => ({
                deck_id: deckId,
                front_text: card.front_text,
                back_text: card.back_text
              }))
            );
        }
      }

      return { ...deckData, cards: updates.cards || [] };
    } catch (error) {
      console.error('Error updating flashcard deck:', error);
      return null;
    }
  },

  async deleteFlashcardDeck(deckId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_flashcards')
        .delete()
        .eq('id', deckId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting flashcard deck:', error);
      return false;
    }
  }
};

// Quizzes Services
export const quizzesService = {
  async getUserQuizzes(): Promise<Quiz[]> {
    try {
      const { data: quizzes, error: quizzesError } = await supabase
        .from('user_quizzes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (quizzesError) throw quizzesError;

      // Get questions for each quiz
      const quizzesWithQuestions = await Promise.all(
        (quizzes || []).map(async (quiz) => {
          const { data: questions, error: questionsError } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('quiz_id', quiz.id)
            .order('created_at');

          if (questionsError) {
            console.error('Error fetching questions for quiz:', questionsError);
            return { ...quiz, questions: [] };
          }

          return { ...quiz, questions: questions || [] };
        })
      );

      return quizzesWithQuestions;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      return [];
    }
  },

  async createQuiz(quiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>): Promise<Quiz | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create the quiz
      const { data: quizData, error: quizError } = await supabase
        .from('user_quizzes')
        .insert([{
          user_id: user.id,
          title: quiz.title
        }])
        .select()
        .single();

      if (quizError) throw quizError;

      // Create the questions
      if (quiz.questions && quiz.questions.length > 0) {
        const { error: questionsError } = await supabase
          .from('quiz_questions')
          .insert(
            quiz.questions.map(question => ({
              quiz_id: quizData.id,
              question_text: question.question_text,
              options: question.options,
              correct_answer: question.correct_answer,
              explanation: question.explanation,
              subject: question.subject
            }))
          );

        if (questionsError) throw questionsError;
      }

      return { ...quizData, questions: quiz.questions };
    } catch (error) {
      console.error('Error creating quiz:', error);
      return null;
    }
  },

  async updateQuiz(quizId: string, updates: Partial<Quiz>): Promise<Quiz | null> {
    try {
      // Update quiz info
      const { data: quizData, error: quizError } = await supabase
        .from('user_quizzes')
        .update({
          title: updates.title
        })
        .eq('id', quizId)
        .select()
        .single();

      if (quizError) throw quizError;

      // If questions are provided, replace all questions
      if (updates.questions) {
        // Delete existing questions
        await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', quizId);

        // Insert new questions
        if (updates.questions.length > 0) {
          await supabase
            .from('quiz_questions')
            .insert(
              updates.questions.map(question => ({
                quiz_id: quizId,
                question_text: question.question_text,
                options: question.options,
                correct_answer: question.correct_answer,
                explanation: question.explanation,
                subject: question.subject
              }))
            );
        }
      }

      return { ...quizData, questions: updates.questions || [] };
    } catch (error) {
      console.error('Error updating quiz:', error);
      return null;
    }
  },

  async deleteQuiz(quizId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      return false;
    }
  }
};

// AI Chats Services
export const aiChatsService = {
  async getUserChats(): Promise<AIChat[]> {
    try {
      const { data: chats, error: chatsError } = await supabase
        .from('ai_chats')
        .select('*')
        .order('updated_at', { ascending: false });

      if (chatsError) throw chatsError;

      // Get messages for each chat
      const chatsWithMessages = await Promise.all(
        (chats || []).map(async (chat) => {
          const { data: messages, error: messagesError } = await supabase
            .from('ai_messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('created_at');

          if (messagesError) {
            console.error('Error fetching messages for chat:', messagesError);
            return { ...chat, messages: [] };
          }

          return { ...chat, messages: messages || [] };
        })
      );

      return chatsWithMessages;
    } catch (error) {
      console.error('Error fetching AI chats:', error);
      return [];
    }
  },

  async createChat(chat: Omit<AIChat, 'id' | 'created_at' | 'updated_at'>): Promise<AIChat | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create the chat
      const { data: chatData, error: chatError } = await supabase
        .from('ai_chats')
        .insert([{
          user_id: user.id,
          title: chat.title
        }])
        .select()
        .single();

      if (chatError) throw chatError;

      // Create the messages
      if (chat.messages && chat.messages.length > 0) {
        const { error: messagesError } = await supabase
          .from('ai_messages')
          .insert(
            chat.messages.map(message => ({
              chat_id: chatData.id,
              message_text: message.message_text,
              sender: message.sender,
              message_type: message.message_type || 'chat'
            }))
          );

        if (messagesError) throw messagesError;
      }

      return { ...chatData, messages: chat.messages };
    } catch (error) {
      console.error('Error creating AI chat:', error);
      return null;
    }
  },

  async addMessageToChat(chatId: string, message: Omit<AIMessage, 'id' | 'created_at'>): Promise<AIMessage | null> {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .insert([{
          chat_id: chatId,
          message_text: message.message_text,
          sender: message.sender,
          message_type: message.message_type || 'chat'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding message to chat:', error);
      return null;
    }
  },

  async updateChat(chatId: string, updates: Partial<AIChat>): Promise<AIChat | null> {
    try {
      const { data, error } = await supabase
        .from('ai_chats')
        .update({
          title: updates.title
        })
        .eq('id', chatId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating AI chat:', error);
      return null;
    }
  },

  async deleteChat(chatId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_chats')
        .delete()
        .eq('id', chatId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting AI chat:', error);
      return false;
    }
  }
};

// Utility function to sync localStorage data to database (for migration)
export const syncLocalStorageToDatabase = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Sync notes
    const localNotes = localStorage.getItem('studyflow-notes');
    if (localNotes) {
      const notes = JSON.parse(localNotes);
      for (const note of notes) {
        await notesService.createNote({
          title: note.title,
          content: note.content,
          subject: note.subject,
          tags: note.tags || [],
          word_count: note.wordCount
        });
      }
    }

    // Sync flashcards
    const localFlashcards = localStorage.getItem('studyflow-flashcards');
    if (localFlashcards) {
      const decks = JSON.parse(localFlashcards);
      for (const deck of decks) {
        await flashcardsService.createFlashcardDeck({
          title: deck.title,
          subject: deck.subject,
          cards: deck.cards?.map((card: any) => ({
            front_text: card.front,
            back_text: card.back
          })) || []
        });
      }
    }

    // Sync quizzes
    const localQuizzes = localStorage.getItem('studyflow-quizzes');
    if (localQuizzes) {
      const quizzes = JSON.parse(localQuizzes);
      for (const quiz of quizzes) {
        await quizzesService.createQuiz({
          title: quiz.title,
          questions: quiz.questions?.map((q: any) => ({
            question_text: q.question,
            options: q.options,
            correct_answer: q.correctAnswer,
            explanation: q.explanation,
            subject: q.subject
          })) || []
        });
      }
    }

    // Sync AI chats
    const localChats = localStorage.getItem('studyflow-ai-chats');
    if (localChats) {
      const chats = JSON.parse(localChats, (key, value) => {
        if (key === 'timestamp' || key === 'createdAt') {
          return new Date(value);
        }
        return value;
      });
      for (const chat of chats) {
        await aiChatsService.createChat({
          title: chat.title,
          messages: chat.messages?.map((msg: any) => ({
            message_text: msg.text,
            sender: msg.sender,
            message_type: msg.type || 'chat'
          })) || []
        });
      }
    }

    console.log('✅ Local data synced to database successfully');
  } catch (error) {
    console.error('❌ Error syncing local data to database:', error);
  }
};
