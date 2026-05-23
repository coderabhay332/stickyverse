-- Verify StickyVerse schema was created successfully
-- Run this to check what exists

-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'notes', 'links', 'goals', 'user_preferences', 'activity_log');

-- Check if RLS is enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname IN ('users', 'notes', 'links', 'goals', 'user_preferences', 'activity_log');

-- Check policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
