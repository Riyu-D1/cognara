import { supabase } from '../utils/supabase/client';

interface Note {
  id?: string;
  user_id: string;
  title: string;
  content: string;
  source_type: 'youtube' | 'file';
  source_id: string;
  created_at?: string;
  updated_at?: string;
}

interface Flashcard {
  id?: string;
  user_id: string;
  note_id: string;
  question: string;
  answer: string;
  created_at?: string;
}

interface Quiz {
  id?: string;
  user_id: string;
  note_id: string;
  questions: {
    question: string;
    options: string[];
    correct_option: number;
  }[];
  created_at?: string;
}

export async function createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('notes')
    .insert([note])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getNotes(userId: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createFlashcards(flashcards: Omit<Flashcard, 'id' | 'created_at'>[]) {
  const { data, error } = await supabase
    .from('flashcards')
    .insert(flashcards)
    .select();

  if (error) throw error;
  return data;
}

export async function getFlashcards(userId: string, noteId?: string) {
  let query = supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', userId);

  if (noteId) {
    query = query.eq('note_id', noteId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createQuiz(quiz: Omit<Quiz, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('quizzes')
    .insert([quiz])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getQuizzes(userId: string, noteId?: string) {
  let query = supabase
    .from('quizzes')
    .select('*')
    .eq('user_id', userId);

  if (noteId) {
    query = query.eq('note_id', noteId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
