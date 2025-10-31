import { supabase } from '../utils/supabase/client';

interface Note {
  id: number;
  title: string;
  content: string;
  subject: string;
  lastModified: string;
  wordCount: number;
  db_id?: string; // Supabase UUID
}

export class NotesSync {
  private static instance: NotesSync;
  private userId: string | null = null;

  static getInstance(): NotesSync {
    if (!NotesSync.instance) {
      NotesSync.instance = new NotesSync();
    }
    return NotesSync.instance;
  }

  // Initialize when user logs in
  async initializeForUser(userId: string): Promise<void> {
    console.log('🔄 NotesSync: Initializing for user', userId);
    this.userId = userId;
    
    // Load notes from database and merge with local
    await this.loadAndMergeNotes();
  }

  // Load notes from database and merge with localStorage
  private async loadAndMergeNotes(): Promise<void> {
    if (!this.userId) {
      console.log('❌ NotesSync: No user ID available');
      return;
    }

    try {
      console.log('📥 NotesSync: Loading notes from database...');
      
      // Load from Supabase
      const { data: dbNotes, error } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', this.userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ NotesSync: Error loading notes:', error);
        return;
      }

      // Convert database format to local format
      const convertedNotes: Note[] = (dbNotes || []).map(dbNote => ({
        id: this.generateLocalId(dbNote.id),
        db_id: dbNote.id,
        title: dbNote.title,
        content: dbNote.content,
        subject: dbNote.subject || 'General',
        wordCount: dbNote.word_count || 0,
        lastModified: dbNote.updated_at || new Date().toISOString()
      }));

      // Get existing local notes
      const localNotes = this.getLocalNotes();

      // Simple merge strategy: combine and deduplicate
      const mergedNotes = this.mergeNotes(localNotes, convertedNotes);

      // Save merged notes to localStorage
      this.saveLocalNotes(mergedNotes);

      console.log(`✅ NotesSync: Loaded ${dbNotes?.length || 0} notes from database, merged with ${localNotes.length} local notes`);

    } catch (error) {
      console.error('❌ NotesSync: Error in loadAndMergeNotes:', error);
    }
  }

  // Save a note (localStorage + database)
  async saveNote(note: Note): Promise<void> {
    console.log('💾 NotesSync: Saving note:', note.title);

    // Save to localStorage immediately
    const localNotes = this.getLocalNotes();
    const existingIndex = localNotes.findIndex(n => n.id === note.id);
    
    if (existingIndex >= 0) {
      localNotes[existingIndex] = note;
    } else {
      localNotes.unshift(note);
    }
    
    this.saveLocalNotes(localNotes);

    // Save to database
    if (this.userId) {
      try {
        const dbNote = {
          user_id: this.userId,
          title: note.title,
          content: note.content,
          subject: note.subject,
          word_count: note.wordCount,
          updated_at: new Date().toISOString()
        };

        if (note.db_id) {
          // Update existing note
          const { error } = await supabase
            .from('user_notes')
            .update(dbNote)
            .eq('id', note.db_id)
            .eq('user_id', this.userId);

          if (error) {
            console.error('❌ NotesSync: Error updating note in database:', error);
          } else {
            console.log('✅ NotesSync: Note updated in database');
          }
        } else {
          // Insert new note
          const { data, error } = await supabase
            .from('user_notes')
            .insert(dbNote)
            .select()
            .single();

          if (error) {
            console.error('❌ NotesSync: Error inserting note to database:', error);
          } else if (data) {
            // Update local note with database ID
            note.db_id = data.id;
            const updatedNotes = localNotes.map(n => n.id === note.id ? note : n);
            this.saveLocalNotes(updatedNotes);
            console.log('✅ NotesSync: Note saved to database with ID:', data.id);
          }
        }
      } catch (error) {
        console.error('❌ NotesSync: Database save error:', error);
      }
    }
  }

  // Delete a note (localStorage + database)
  async deleteNote(noteId: number): Promise<void> {
    console.log('🗑️ NotesSync: Deleting note:', noteId);

    const localNotes = this.getLocalNotes();
    const note = localNotes.find(n => n.id === noteId);
    
    // Remove from localStorage
    const filteredNotes = localNotes.filter(n => n.id !== noteId);
    this.saveLocalNotes(filteredNotes);

    // Remove from database if it has a db_id
    if (note?.db_id && this.userId) {
      try {
        const { error } = await supabase
          .from('user_notes')
          .delete()
          .eq('id', note.db_id)
          .eq('user_id', this.userId);

        if (error) {
          console.error('❌ NotesSync: Error deleting note from database:', error);
        } else {
          console.log('✅ NotesSync: Note deleted from database');
        }
      } catch (error) {
        console.error('❌ NotesSync: Database delete error:', error);
      }
    }
  }

  // Helper methods
  private getLocalNotes(): Note[] {
    try {
      const stored = localStorage.getItem('studyflow-notes');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ NotesSync: Error reading local notes:', error);
      return [];
    }
  }

  private saveLocalNotes(notes: Note[]): void {
    try {
      localStorage.setItem('studyflow-notes', JSON.stringify(notes));
      // Trigger storage event so components update
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'studyflow-notes',
        newValue: JSON.stringify(notes)
      }));
    } catch (error) {
      console.error('❌ NotesSync: Error saving local notes:', error);
    }
  }

  private mergeNotes(localNotes: Note[], dbNotes: Note[]): Note[] {
    const merged = [...localNotes];

    dbNotes.forEach(dbNote => {
      // Check if this note already exists locally (by db_id)
      const existingIndex = merged.findIndex(local => local.db_id === dbNote.db_id);
      
      if (existingIndex >= 0) {
        // Compare timestamps and keep the newer one
        const localNote = merged[existingIndex];
        const localTime = new Date(localNote.lastModified).getTime();
        const dbTime = new Date(dbNote.lastModified).getTime();
        
        if (dbTime > localTime) {
          merged[existingIndex] = dbNote;
          console.log('📝 NotesSync: Updated local note with database version:', dbNote.title);
        }
      } else {
        // New note from database, add it
        merged.push(dbNote);
        console.log('📝 NotesSync: Added new note from database:', dbNote.title);
      }
    });

    return merged;
  }

  private generateLocalId(uuid: string): number {
    // Convert UUID to a consistent number for local use
    let hash = 0;
    const clean = uuid.replace(/-/g, '');
    for (let i = 0; i < clean.length; i++) {
      hash = ((hash << 5) - hash + clean.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash);
  }
}

// Export singleton instance
export const notesSync = NotesSync.getInstance();