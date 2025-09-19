import { supabase } from '../utils/supabase/client';


// Hybrid sync service - saves to localStorage for fast access AND Supabase for cross-device sync
export class HybridSyncService {
  private static instance: HybridSyncService;
  private userId: string | null = null;
  private isOnline = navigator.onLine;
  private pendingSync: Set<string> = new Set();
  private syncTimeout: NodeJS.Timeout | null = null;

  private ready = false;
  private readyCallbacks: Array<() => void> = [];

  isReady() {
    return this.ready;
  }

  onReady(cb: () => void) {
    if (this.ready) {
      cb();
    } else {
      this.readyCallbacks.push(cb);
    }
  }

  static getInstance(): HybridSyncService {
    if (!HybridSyncService.instance) {
      HybridSyncService.instance = new HybridSyncService();
    }
    return HybridSyncService.instance;
  }

  constructor() {
    // Listen for online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Initialize when user logs in
  async initializeForUser(userId: string): Promise<void> {
  console.log('🚀 HybridSync: Initializing for user', userId);
  this.userId = userId;
  this.ready = false;
  // Load data from database first, then merge with localStorage
  await this.loadFromDatabase();
  this.ready = true;
  // Call all ready callbacks
  this.readyCallbacks.forEach(cb => cb());
  this.readyCallbacks = [];
  // Start background sync
  this.startPeriodicSync();
  }

  // Load data from database and merge with localStorage
  private async loadFromDatabase(): Promise<void> {
    if (!this.userId || !this.isOnline) return;

    try {
      console.log('📥 Loading data from database...');
      
      // Load all data types in parallel
      const [notes, flashcards, quizzes, chats] = await Promise.all([
        this.loadNotesFromDB(),
        this.loadFlashcardsFromDB(), 
        this.loadQuizzesFromDB(),
        this.loadChatsFromDB()
      ]);

      // Merge with localStorage (keeping localStorage as source of truth for recent changes)
      this.mergeData('studyflow-notes', notes);
      this.mergeData('studyflow-flashcards', flashcards);
      this.mergeData('studyflow-quizzes', quizzes);
      this.mergeData('studyflow-ai-chats', chats);

      console.log('✅ Database data loaded and merged');
    } catch (error) {
      console.error('❌ Error loading from database:', error);
    }
  }

  // Smart merge - prioritize localStorage if newer, otherwise use database data
  private mergeData(key: string, dbData: any[]): void {
    try {
      const localData = localStorage.getItem(key);
      
      if (!localData && dbData.length > 0) {
        // No local data, use database data
        localStorage.setItem(key, JSON.stringify(dbData));
        console.log(`📝 Restored ${key} from database:`, dbData.length, 'items');
        
        // Trigger storage event so components update
        window.dispatchEvent(new StorageEvent('storage', {
          key,
          newValue: JSON.stringify(dbData),
          oldValue: null
        }));
      } else if (localData && dbData.length > 0) {
        // Both exist, merge intelligently
        const local = JSON.parse(localData);
        const merged = this.intelligentMerge(local, dbData);
        
        if (JSON.stringify(merged) !== localData) {
          localStorage.setItem(key, JSON.stringify(merged));
          console.log(`🔄 Merged ${key} data:`, merged.length, 'items');
          
          // Trigger storage event
          window.dispatchEvent(new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(merged),
            oldValue: localData
          }));
        }
      }
    } catch (error) {
      console.error(`Error merging ${key}:`, error);
    }
  }

  // Intelligent merge - prefer items with newer timestamps or IDs
  private intelligentMerge(local: any[], db: any[]): any[] {
    const merged = [...local];
    
    db.forEach(dbItem => {
      const existingIndex = merged.findIndex(localItem => {
        // Try to match by id, title, or content similarity
        return localItem.id === dbItem.id || 
               localItem.title === dbItem.title ||
               (localItem.text && dbItem.title && localItem.text.includes(dbItem.title));
      });
      
      if (existingIndex === -1) {
        // New item from database, add it
        merged.push(dbItem);
      }
      // If exists locally, keep local version (assume it's more recent)
    });
    
    return merged;
  }

  // Save data to both localStorage AND database
  async saveData(key: string, data: any[]): Promise<void> {
    try {
      // Always save to localStorage first (immediate)
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`💾 Saved ${key} to localStorage:`, data.length, 'items');
      
      // Add to pending sync queue
      this.pendingSync.add(key);
      
      // Debounce database sync (wait for user to stop making changes)
      if (this.syncTimeout) {
        clearTimeout(this.syncTimeout);
      }
      
      this.syncTimeout = setTimeout(() => {
        this.syncToDatabase();
      }, 2000); // Sync 2 seconds after last change
      
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }

  // Sync pending data to database
  private async syncToDatabase(): Promise<void> {
    if (!this.userId || !this.isOnline || this.pendingSync.size === 0) return;

    const keysToSync = Array.from(this.pendingSync);
    this.pendingSync.clear();

    try {
      console.log('🔄 Syncing to database:', keysToSync);
      
      for (const key of keysToSync) {
        await this.syncKeyToDatabase(key);
      }
      
      console.log('✅ Database sync completed');
    } catch (error) {
      console.error('❌ Database sync failed:', error);
      // Re-add failed keys to pending
      keysToSync.forEach(key => this.pendingSync.add(key));
    }
  }

  // Sync specific data type to database
  private async syncKeyToDatabase(key: string): Promise<void> {
    const data = localStorage.getItem(key);
    if (!data) return;

    const parsedData = JSON.parse(data);
    
    switch (key) {
      case 'studyflow-notes':
        await this.syncNotesToDB(parsedData);
        break;
      case 'studyflow-flashcards':
        await this.syncFlashcardsTooDB(parsedData);
        break;
      case 'studyflow-quizzes':
        await this.syncQuizzesToDB(parsedData);
        break;
      case 'studyflow-ai-chats':
        await this.syncChatsToDb(parsedData);
        break;
    }
  }

  // Helpers
  private isValidUuid(id: any): boolean {
    return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  }

  private uuidToNumericId(uuid: string): number {
    // Simple hash to 53-bit safe integer
    let hash = 0n;
    const clean = uuid.replace(/-/g, '');
    for (let i = 0; i < clean.length; i++) {
      hash = (hash * 31n + BigInt(clean.charCodeAt(i))) & ((1n << 53n) - 1n);
    }
    return Number(hash);
  }

  private updateLocalDbId(key: string, localId: any, dbId: string) {
    try {
      const data = localStorage.getItem(key);
      if (!data) return;
      const arr = JSON.parse(data);
      const updated = arr.map((item: any) => item && item.id === localId ? { ...item, db_id: dbId } : item);
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(updated) }));
    } catch {}
  }

  // Database sync methods for each data type
  private async syncNotesToDB(notes: any[]): Promise<void> {
    for (const note of notes) {
      const idForUpsert = this.isValidUuid(note?.db_id) ? note.db_id : undefined;
      // Upsert note (insert or update), return row to capture UUID
      const { data, error } = await supabase
        .from('user_notes')
        .upsert({
          id: idForUpsert,
          user_id: this.userId,
          title: note.title || note.text?.substring(0, 50) || 'Untitled Note',
          content: note.content || note.text || '',
          subject: note.subject || 'General',
          tags: note.tags || [],
          word_count: (note.content || note.text || '').split(' ').length,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .select()
        .single();
      
      if (error) {
        console.error('Error syncing note:', error);
      } else if (data && !this.isValidUuid(note?.db_id)) {
        this.updateLocalDbId('studyflow-notes', note.id, data.id);
      }
    }
  }

  private async syncFlashcardsTooDB(decks: any[]): Promise<void> {
    for (const deck of decks) {
      // Insert/update deck
      const deckIdForUpsert = this.isValidUuid(deck?.db_id) ? deck.db_id : undefined;
      const { data: deckData, error: deckError } = await supabase
        .from('user_flashcards')
        .upsert({
          id: deckIdForUpsert,
          user_id: this.userId,
          title: deck.title || 'Untitled Deck',
          subject: deck.subject || 'General',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .select()
        .single();
        
      if (deckError) {
        console.error('Error syncing flashcard deck:', deckError);
        continue;
      }

      if (!this.isValidUuid(deck?.db_id) && deckData?.id) {
        this.updateLocalDbId('studyflow-flashcards', deck.id, deckData.id);
      }

      // Sync cards
      if (deck.cards && Array.isArray(deck.cards)) {
        // Delete existing cards for this deck
        await supabase
          .from('flashcard_cards')
          .delete()
          .eq('deck_id', deckData.id);
          
        // Insert new cards
        const cards = deck.cards.map((card: any) => ({
          deck_id: deckData.id,
          front_text: card.front || card.front_text || '',
          back_text: card.back || card.back_text || ''
        }));
        
        if (cards.length > 0) {
          const { error: cardsError } = await supabase
            .from('flashcard_cards')
            .insert(cards);
            
          if (cardsError) console.error('Error syncing flashcard cards:', cardsError);
        }
      }
    }
  }

  private async syncQuizzesToDB(quizzes: any[]): Promise<void> {
    for (const quiz of quizzes) {
      // Insert/update quiz
      const quizIdForUpsert = this.isValidUuid(quiz?.db_id) ? quiz.db_id : undefined;
      const { data: quizData, error: quizError } = await supabase
        .from('user_quizzes')
        .upsert({
          id: quizIdForUpsert,
          user_id: this.userId,
          title: quiz.title || 'Untitled Quiz',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .select()
        .single();
        
      if (quizError) {
        console.error('Error syncing quiz:', quizError);
        continue;
      }

      if (!this.isValidUuid(quiz?.db_id) && quizData?.id) {
        this.updateLocalDbId('studyflow-quizzes', quiz.id, quizData.id);
      }

      // Sync questions
      if (quiz.questions && Array.isArray(quiz.questions)) {
        // Delete existing questions
        await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', quizData.id);
          
        // Insert new questions
        const questions = quiz.questions.map((q: any) => ({
          quiz_id: quizData.id,
          question_text: q.question || q.question_text || '',
          options: q.options || [],
          correct_answer: q.correctAnswer || q.correct_answer || 0,
          explanation: q.explanation || '',
          subject: q.subject || 'General'
        }));
        
        if (questions.length > 0) {
          const { error: questionsError } = await supabase
            .from('quiz_questions')
            .insert(questions);
            
          if (questionsError) console.error('Error syncing quiz questions:', questionsError);
        }
      }
    }
  }

  private async syncChatsToDb(chats: any[]): Promise<void> {
    for (const chat of chats) {
      // Insert/update chat
      const chatIdForUpsert = this.isValidUuid(chat?.db_id) ? chat.db_id : undefined;
      const { data: chatData, error: chatError } = await supabase
        .from('ai_chats')
        .upsert({
          id: chatIdForUpsert,
          user_id: this.userId,
          title: chat.title || 'New Chat',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .select()
        .single();
        
      if (chatError) {
        console.error('Error syncing chat:', chatError);
        continue;
      }

      if (!this.isValidUuid(chat?.db_id) && chatData?.id) {
        this.updateLocalDbId('studyflow-ai-chats', chat.id, chatData.id);
      }

      // Sync messages
      if (chat.messages && Array.isArray(chat.messages)) {
        // Delete existing messages
        await supabase
          .from('ai_messages')
          .delete()
          .eq('chat_id', chatData.id);
          
        // Insert new messages
        const messages = chat.messages.map((msg: any) => ({
          chat_id: chatData.id,
          message_text: msg.text || msg.message_text || '',
          sender: msg.sender || 'user',
          message_type: msg.type || msg.message_type || 'chat'
        }));
        
        if (messages.length > 0) {
          const { error: messagesError } = await supabase
            .from('ai_messages')
            .insert(messages);
            
          if (messagesError) console.error('Error syncing chat messages:', messagesError);
        }
      }
    }
  }

  // Database load methods
  private async loadNotesFromDB(): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_notes')
      .select('*')
      .eq('user_id', this.userId)
      .order('updated_at', { ascending: false });
      
    if (error) {
      console.error('Error loading notes:', error);
      return [];
    }
    // Map to local shape with numeric id and db_id
    return (data || []).map((n: any) => ({
      id: this.uuidToNumericId(n.id),
      db_id: n.id,
      title: n.title,
      content: n.content,
      subject: n.subject || 'General',
      tags: n.tags || [],
      wordCount: n.word_count || 0,
      lastModified: n.updated_at || new Date().toISOString()
    }));
  }

  private async loadFlashcardsFromDB(): Promise<any[]> {
    const { data: decks, error: decksError } = await supabase
      .from('user_flashcards')
      .select(`
        *,
        cards:flashcard_cards(*)
      `)
      .eq('user_id', this.userId)
      .order('updated_at', { ascending: false });
      
    if (decksError) {
      console.error('Error loading flashcards:', decksError);
      return [];
    }
    // Map to local shape with numeric id and db_id
    return (decks || []).map((deck: any) => ({
      id: this.uuidToNumericId(deck.id),
      db_id: deck.id,
      title: deck.title,
      subject: deck.subject || 'General',
      cards: (deck.cards || []).map((c: any) => ({
        front: c.front_text,
        back: c.back_text
      }))
    }));
  }

  private async loadQuizzesFromDB(): Promise<any[]> {
    const { data: quizzes, error: quizzesError } = await supabase
      .from('user_quizzes')
      .select(`
        *,
        questions:quiz_questions(*)
      `)
      .eq('user_id', this.userId)
      .order('updated_at', { ascending: false });
      
    if (quizzesError) {
      console.error('Error loading quizzes:', quizzesError);
      return [];
    }
    return (quizzes || []).map((q: any) => ({
      id: this.uuidToNumericId(q.id),
      db_id: q.id,
      title: q.title,
      questions: (q.questions || []).map((qq: any) => ({
        id: this.uuidToNumericId(qq.id),
        question: qq.question_text,
        options: qq.options || [],
        correctAnswer: typeof qq.correct_answer === 'number' ? qq.correct_answer : 0,
        explanation: qq.explanation || '',
        subject: qq.subject || 'General'
      })),
      createdAt: q.created_at
    }));
  }

  private async loadChatsFromDB(): Promise<any[]> {
    const { data: chats, error: chatsError } = await supabase
      .from('ai_chats')
      .select(`
        *,
        messages:ai_messages(*)
      `)
      .eq('user_id', this.userId)
      .order('updated_at', { ascending: false });
      
    if (chatsError) {
      console.error('Error loading chats:', chatsError);
      return [];
    }
    return (chats || []).map((c: any) => ({
      id: String(this.uuidToNumericId(c.id)),
      db_id: c.id,
      title: c.title,
      messages: (c.messages || []).map((m: any) => ({
        id: String(this.uuidToNumericId(m.id)),
        text: m.message_text,
        sender: m.sender,
        timestamp: new Date(m.created_at),
        type: m.message_type || 'chat'
      })),
      createdAt: new Date(c.created_at)
    }));
  }

  // Periodic sync
  private startPeriodicSync(): void {
    // Sync every 30 seconds if there's pending data
    setInterval(() => {
      if (this.pendingSync.size > 0) {
        this.syncToDatabase();
      }
    }, 30000);

    // Sync when user is about to leave
    window.addEventListener('beforeunload', () => {
      if (this.pendingSync.size > 0) {
        // Use sendBeacon for reliable sync on page unload
        navigator.sendBeacon('/api/sync', JSON.stringify({
          userId: this.userId,
          pendingKeys: Array.from(this.pendingSync)
        }));
      }
    });
  }

  // Force sync all data
  async forceSync(): Promise<void> {
    this.pendingSync.add('studyflow-notes');
    this.pendingSync.add('studyflow-flashcards');
    this.pendingSync.add('studyflow-quizzes'); 
    this.pendingSync.add('studyflow-ai-chats');
    
    await this.syncToDatabase();
  }

  // Sync pending data when coming back online
  private async syncPendingData(): Promise<void> {
    if (this.pendingSync.size > 0) {
      console.log('📶 Back online, syncing pending data...');
      await this.syncToDatabase();
    }
  }

  // Clear data on logout
  clearUserData(): void {
    this.userId = null;
    this.pendingSync.clear();
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }
    this.ready = false;
    this.readyCallbacks = [];
    console.log('🧹 HybridSync cleared for logout');
  }
}

// Export singleton instance
export const hybridSyncService = HybridSyncService.getInstance();
