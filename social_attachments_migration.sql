-- StudyFlow Social Post Attachments - LinkedIn-style Feature
-- Run this AFTER social_migration.sql to add study material attachments to posts
-- This allows users to attach their notes, flashcards, and quizzes to social posts

-- ============================================
-- POST ATTACHMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS post_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE NOT NULL,
  attachment_type TEXT NOT NULL CHECK (attachment_type IN ('note', 'flashcard', 'quiz', 'file')),
  attachment_id UUID NOT NULL,
  attachment_title TEXT NOT NULL,
  attachment_preview TEXT,
  attachment_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FILE UPLOADS TABLE (for external files like PDFs, images)
-- ============================================
CREATE TABLE IF NOT EXISTS post_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE post_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_files ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Post Attachments: Anyone can view attachments on visible posts
CREATE POLICY "Anyone can view post attachments" ON post_attachments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM social_posts 
    WHERE id = post_attachments.post_id 
    AND (
      visibility = 'public' OR 
      user_id = auth.uid() OR
      (visibility = 'followers' AND EXISTS (
        SELECT 1 FROM user_followers WHERE following_id = social_posts.user_id AND follower_id = auth.uid()
      ))
    )
  )
);

CREATE POLICY "Post authors can add attachments" ON post_attachments FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM social_posts 
    WHERE id = post_attachments.post_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Post authors can delete attachments" ON post_attachments FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM social_posts 
    WHERE id = post_attachments.post_id 
    AND user_id = auth.uid()
  )
);

-- Post Files: Users can manage their own files
CREATE POLICY "Anyone can view files attached to visible posts" ON post_files FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM post_attachments pa
    JOIN social_posts sp ON pa.post_id = sp.id
    WHERE pa.attachment_id = post_files.id::text::uuid
    AND pa.attachment_type = 'file'
    AND (
      sp.visibility = 'public' OR 
      sp.user_id = auth.uid() OR
      (sp.visibility = 'followers' AND EXISTS (
        SELECT 1 FROM user_followers WHERE following_id = sp.user_id AND follower_id = auth.uid()
      ))
    )
  )
);

CREATE POLICY "Users can upload their own files" ON post_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own files" ON post_files FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_post_attachments_post_id ON post_attachments(post_id);
CREATE INDEX idx_post_attachments_attachment_id ON post_attachments(attachment_id);
CREATE INDEX idx_post_attachments_type ON post_attachments(attachment_type);
CREATE INDEX idx_post_files_user_id ON post_files(user_id);

-- ============================================
-- FUNCTION TO VALIDATE ATTACHMENT EXISTS
-- ============================================
CREATE OR REPLACE FUNCTION validate_attachment_exists()
RETURNS TRIGGER AS $$
DECLARE
  v_exists BOOLEAN;
  v_user_id UUID;
BEGIN
  -- Get the post author's user_id
  SELECT user_id INTO v_user_id FROM social_posts WHERE id = NEW.post_id;
  
  -- Validate based on attachment type
  CASE NEW.attachment_type
    WHEN 'note' THEN
      SELECT EXISTS(
        SELECT 1 FROM user_notes 
        WHERE id = NEW.attachment_id::uuid 
        AND user_id = v_user_id
      ) INTO v_exists;
      
    WHEN 'flashcard' THEN
      SELECT EXISTS(
        SELECT 1 FROM user_flashcards 
        WHERE id = NEW.attachment_id::uuid 
        AND user_id = v_user_id
      ) INTO v_exists;
      
    WHEN 'quiz' THEN
      SELECT EXISTS(
        SELECT 1 FROM user_quizzes 
        WHERE id = NEW.attachment_id::uuid 
        AND user_id = v_user_id
      ) INTO v_exists;
      
    WHEN 'file' THEN
      SELECT EXISTS(
        SELECT 1 FROM post_files 
        WHERE id = NEW.attachment_id::uuid 
        AND user_id = v_user_id
      ) INTO v_exists;
      
    ELSE
      v_exists := FALSE;
  END CASE;
  
  IF NOT v_exists THEN
    RAISE EXCEPTION 'Attachment does not exist or does not belong to post author';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate attachments
CREATE TRIGGER validate_attachment_before_insert
BEFORE INSERT ON post_attachments
FOR EACH ROW
EXECUTE FUNCTION validate_attachment_exists();

-- ============================================
-- VIEW FOR POSTS WITH ATTACHMENTS
-- ============================================
CREATE OR REPLACE VIEW social_posts_with_attachments AS
SELECT 
  p.*,
  u.display_name,
  u.avatar_url,
  u.badges,
  u.study_streak,
  EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = auth.uid()) as is_liked_by_me,
  EXISTS(SELECT 1 FROM saved_posts WHERE post_id = p.id AND user_id = auth.uid()) as is_saved_by_me,
  (
    SELECT json_agg(
      json_build_object(
        'id', pa.id,
        'type', pa.attachment_type,
        'attachment_id', pa.attachment_id,
        'title', pa.attachment_title,
        'preview', pa.attachment_preview,
        'metadata', pa.attachment_metadata
      )
    )
    FROM post_attachments pa
    WHERE pa.post_id = p.id
  ) as attachments
FROM social_posts p
JOIN user_profiles u ON p.user_id = u.user_id;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get attachment details for a post
CREATE OR REPLACE FUNCTION get_post_attachments(p_post_id UUID)
RETURNS TABLE (
  id UUID,
  attachment_type TEXT,
  attachment_id UUID,
  title TEXT,
  preview TEXT,
  metadata JSONB,
  details JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.id,
    pa.attachment_type,
    pa.attachment_id,
    pa.attachment_title as title,
    pa.attachment_preview as preview,
    pa.attachment_metadata as metadata,
    CASE pa.attachment_type
      WHEN 'note' THEN (
        SELECT json_build_object(
          'id', n.id,
          'title', n.title,
          'content', LEFT(n.content, 200),
          'subject', n.subject,
          'word_count', n.word_count,
          'created_at', n.created_at
        )::jsonb
        FROM user_notes n
        WHERE n.id = pa.attachment_id::uuid
      )
      WHEN 'flashcard' THEN (
        SELECT json_build_object(
          'id', f.id,
          'title', f.title,
          'subject', f.subject,
          'card_count', (SELECT COUNT(*) FROM flashcard_cards WHERE deck_id = f.id),
          'created_at', f.created_at
        )::jsonb
        FROM user_flashcards f
        WHERE f.id = pa.attachment_id::uuid
      )
      WHEN 'quiz' THEN (
        SELECT json_build_object(
          'id', q.id,
          'title', q.title,
          'question_count', (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id),
          'created_at', q.created_at
        )::jsonb
        FROM user_quizzes q
        WHERE q.id = pa.attachment_id::uuid
      )
      WHEN 'file' THEN (
        SELECT json_build_object(
          'id', pf.id,
          'file_name', pf.file_name,
          'file_type', pf.file_type,
          'file_size', pf.file_size,
          'file_url', pf.file_url,
          'created_at', pf.created_at
        )::jsonb
        FROM post_files pf
        WHERE pf.id = pa.attachment_id::uuid
      )
      ELSE '{}'::jsonb
    END as details
  FROM post_attachments pa
  WHERE pa.post_id = p_post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to count attachments by type for a user
CREATE OR REPLACE FUNCTION get_user_attachment_stats(p_user_id UUID)
RETURNS TABLE (
  attachment_type TEXT,
  count BIGINT,
  total_shares BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.attachment_type,
    COUNT(DISTINCT pa.attachment_id) as count,
    COUNT(pa.id) as total_shares
  FROM post_attachments pa
  JOIN social_posts sp ON pa.post_id = sp.id
  WHERE sp.user_id = p_user_id
  GROUP BY pa.attachment_type;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE COMMENT
-- ============================================
COMMENT ON TABLE post_attachments IS 'LinkedIn-style attachments linking social posts to study materials (notes, flashcards, quizzes) or uploaded files';
COMMENT ON TABLE post_files IS 'Uploaded files (PDFs, images, documents) that can be attached to posts';
COMMENT ON COLUMN post_attachments.attachment_type IS 'Type of attachment: note, flashcard, quiz, or file';
COMMENT ON COLUMN post_attachments.attachment_metadata IS 'Additional metadata like subject, tags, preview info in JSON format';
