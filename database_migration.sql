-- StudyFlow Database Schema
-- Run this in your Supabase SQL editor to create the necessary tables

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

-- Create user_notes table
CREATE TABLE user_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject TEXT,
  tags TEXT[] DEFAULT '{}',
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_flashcards table
CREATE TABLE user_flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flashcard_cards table (individual cards within a deck)
CREATE TABLE flashcard_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID REFERENCES user_flashcards(id) ON DELETE CASCADE NOT NULL,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_quizzes table
CREATE TABLE user_quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_questions table
CREATE TABLE quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES user_quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_chats table
CREATE TABLE ai_chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_messages table
CREATE TABLE ai_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES ai_chats(id) ON DELETE CASCADE NOT NULL,
  message_text TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  message_type TEXT DEFAULT 'chat' CHECK (message_type IN ('chat', 'youtube', 'file')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for user_notes
CREATE POLICY "Users can view their own notes" ON user_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notes" ON user_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON user_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON user_notes FOR DELETE USING (auth.uid() = user_id);

-- Create policies for user_flashcards
CREATE POLICY "Users can view their own flashcard decks" ON user_flashcards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own flashcard decks" ON user_flashcards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own flashcard decks" ON user_flashcards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own flashcard decks" ON user_flashcards FOR DELETE USING (auth.uid() = user_id);

-- Create policies for flashcard_cards
CREATE POLICY "Users can view cards in their decks" ON flashcard_cards FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_flashcards WHERE id = deck_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert cards in their decks" ON flashcard_cards FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_flashcards WHERE id = deck_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update cards in their decks" ON flashcard_cards FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_flashcards WHERE id = deck_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete cards in their decks" ON flashcard_cards FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_flashcards WHERE id = deck_id AND user_id = auth.uid())
);

-- Create policies for user_quizzes
CREATE POLICY "Users can view their own quizzes" ON user_quizzes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quizzes" ON user_quizzes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quizzes" ON user_quizzes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quizzes" ON user_quizzes FOR DELETE USING (auth.uid() = user_id);

-- Create policies for quiz_questions
CREATE POLICY "Users can view questions in their quizzes" ON quiz_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_quizzes WHERE id = quiz_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert questions in their quizzes" ON quiz_questions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_quizzes WHERE id = quiz_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update questions in their quizzes" ON quiz_questions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_quizzes WHERE id = quiz_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete questions in their quizzes" ON quiz_questions FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_quizzes WHERE id = quiz_id AND user_id = auth.uid())
);

-- Create policies for ai_chats
CREATE POLICY "Users can view their own ai chats" ON ai_chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ai chats" ON ai_chats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ai chats" ON ai_chats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ai chats" ON ai_chats FOR DELETE USING (auth.uid() = user_id);

-- Create policies for ai_messages
CREATE POLICY "Users can view messages in their chats" ON ai_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM ai_chats WHERE id = chat_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert messages in their chats" ON ai_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM ai_chats WHERE id = chat_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update messages in their chats" ON ai_messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM ai_chats WHERE id = chat_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete messages in their chats" ON ai_messages FOR DELETE USING (
  EXISTS (SELECT 1 FROM ai_chats WHERE id = chat_id AND user_id = auth.uid())
);

-- Create indexes for better performance
CREATE INDEX idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX idx_user_notes_updated_at ON user_notes(updated_at);
CREATE INDEX idx_user_flashcards_user_id ON user_flashcards(user_id);
CREATE INDEX idx_flashcard_cards_deck_id ON flashcard_cards(deck_id);
CREATE INDEX idx_user_quizzes_user_id ON user_quizzes(user_id);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_ai_chats_user_id ON ai_chats(user_id);
CREATE INDEX idx_ai_messages_chat_id ON ai_messages(chat_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_notes_updated_at BEFORE UPDATE ON user_notes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_flashcards_updated_at BEFORE UPDATE ON user_flashcards FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_quizzes_updated_at BEFORE UPDATE ON user_quizzes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ai_chats_updated_at BEFORE UPDATE ON ai_chats FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
