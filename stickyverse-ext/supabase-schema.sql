-- StickyVerse Supabase Database Schema
-- Run these SQL commands in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferences JSONB DEFAULT '{}',
    
    -- Row Level Security
    CONSTRAINT users_id_check CHECK (id IS NOT NULL)
);

-- Notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    content TEXT,
    type TEXT DEFAULT 'note' CHECK (type IN ('note', 'checklist', 'quote', 'bullet', 'photo')),
    style TEXT DEFAULT 'regular' CHECK (style IN ('regular', 'notebook', 'tape', 'polaroid')),
    color TEXT DEFAULT 'purple' CHECK (color IN ('purple', 'yellow', 'pink', 'green', 'blue', 'cream', 'dark')),
    tag TEXT DEFAULT 'note' CHECK (tag IN ('note', 'task', 'idea', 'quote')),
    status TEXT DEFAULT 'none',
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    pinned BOOLEAN DEFAULT FALSE,
    starred BOOLEAN DEFAULT FALSE,
    archived BOOLEAN DEFAULT FALSE,
    has_tape BOOLEAN DEFAULT FALSE,
    tape_color TEXT,
    pin TEXT,
    items JSONB, -- For checklist items and bullet points
    author TEXT, -- For quotes
    pol_emoji TEXT, -- For polaroid emoji
    doodle TEXT, -- For doodles
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT notes_user_id_check CHECK (user_id IS NOT NULL)
);

-- Links table
CREATE TABLE IF NOT EXISTS public.links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    host TEXT NOT NULL,
    favicon TEXT,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    reading_status TEXT DEFAULT 'unread' CHECK (reading_status IN ('unread', 'reading', 'read')),
    is_favorite BOOLEAN DEFAULT FALSE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT links_user_id_check CHECK (user_id IS NOT NULL),
    CONSTRAINT links_url_check CHECK (url IS NOT NULL),
    CONSTRAINT links_title_check CHECK (title IS NOT NULL)
);

-- Goals table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'personal' CHECK (category IN ('personal', 'professional', 'health', 'learning', 'financial', 'other')),
    type TEXT DEFAULT 'short-term' CHECK (type IN ('daily', 'weekly', 'monthly', 'long-term')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT goals_user_id_check CHECK (user_id IS NOT NULL),
    CONSTRAINT goals_title_check CHECK (title IS NOT NULL)
);

-- User preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    theme TEXT DEFAULT 'void' CHECK (theme IN ('void', 'minimal', 'cyber', 'lofi')),
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    auto_save BOOLEAN DEFAULT TRUE,
    pomodoro_duration INTEGER DEFAULT 25,
    pomodoro_break_duration INTEGER DEFAULT 5,
    daily_goal_reminders BOOLEAN DEFAULT TRUE,
    weekly_summary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id),
    CONSTRAINT user_preferences_user_id_check CHECK (user_id IS NOT NULL)
);

-- Activity log table (for timeline)
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'completed', 'pinned', 'starred')),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('note', 'link', 'goal')),
    entity_id UUID NOT NULL,
    entity_title TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT activity_log_user_id_check CHECK (user_id IS NOT NULL),
    CONSTRAINT activity_log_action_check CHECK (action IS NOT NULL),
    CONSTRAINT activity_log_entity_type_check CHECK (entity_type IS NOT NULL)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_status ON public.notes(status);
CREATE INDEX IF NOT EXISTS idx_notes_tag ON public.notes(tag);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON public.notes(pinned);

CREATE INDEX IF NOT EXISTS idx_links_user_id ON public.links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_saved_at ON public.links(saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_links_host ON public.links(host);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON public.goals(target_date);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Notes policies
CREATE POLICY "Users can view own notes" ON public.notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);

-- Links policies
CREATE POLICY "Users can view own links" ON public.links
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own links" ON public.links
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links" ON public.links
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own links" ON public.links
    FOR DELETE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON public.goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
    FOR DELETE USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Activity log policies
CREATE POLICY "Users can view own activity" ON public.activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON public.activity_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_links_updated_at
    BEFORE UPDATE ON public.links
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to log activity
CREATE OR REPLACE FUNCTION public.log_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.activity_log (user_id, action, entity_type, entity_id, entity_title, metadata)
        VALUES (NEW.user_id, 'created', TG_TABLE_NAME, NEW.id, COALESCE(NEW.title, NEW.content), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.activity_log (user_id, action, entity_type, entity_id, entity_title, metadata)
        VALUES (NEW.user_id, 'updated', TG_TABLE_NAME, NEW.id, COALESCE(NEW.title, NEW.content), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.activity_log (user_id, action, entity_type, entity_id, entity_title, metadata)
        VALUES (OLD.user_id, 'deleted', TG_TABLE_NAME, OLD.id, COALESCE(OLD.title, OLD.content), row_to_json(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for activity logging
CREATE TRIGGER log_notes_activity
    AFTER INSERT OR UPDATE OR DELETE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.log_activity();

CREATE TRIGGER log_links_activity
    AFTER INSERT OR UPDATE OR DELETE ON public.links
    FOR EACH ROW
    EXECUTE FUNCTION public.log_activity();

CREATE TRIGGER log_goals_activity
    AFTER INSERT OR UPDATE OR DELETE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION public.log_activity();

-- Create user profile automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.notes TO authenticated;
GRANT ALL ON public.links TO authenticated;
GRANT ALL ON public.goals TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.activity_log TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
