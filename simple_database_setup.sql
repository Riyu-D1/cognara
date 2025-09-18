-- Simple User Data Storage Table
-- This table stores user data as key-value pairs for easy syncing with localStorage

-- Create user_data table for simple key-value storage
CREATE TABLE IF NOT EXISTS user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_key TEXT NOT NULL,
  data_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, data_key)
);

-- Enable Row Level Security
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Create policies for user_data
CREATE POLICY "Users can view their own data" ON user_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON user_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON user_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON user_data FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_key ON user_data(user_id, data_key);
CREATE INDEX IF NOT EXISTS idx_user_data_updated_at ON user_data(updated_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_user_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_data_updated_at 
    BEFORE UPDATE ON user_data 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_user_data_updated_at();
