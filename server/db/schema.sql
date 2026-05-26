-- ParaOrganizer Database Schema
-- Compatible with PostgreSQL and Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- TABLES
-- =========================================================================

-- 1. Users Table (Aligned with Supabase auth.users or custom auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Notion Integration Configuration Table
CREATE TABLE IF NOT EXISTS notion_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notion_api_key TEXT NOT NULL, -- Encrypted token
    parent_page_id VARCHAR(255),
    inbox_database_id VARCHAR(255),
    projects_database_id VARCHAR(255),
    areas_database_id VARCHAR(255),
    resources_database_id VARCHAR(255),
    archives_database_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_user_notion_config UNIQUE (user_id)
);

-- 3. AI Classification Logs Table
CREATE TABLE IF NOT EXISTS classification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    url TEXT,
    content_snippet TEXT,
    assigned_category VARCHAR(50) NOT NULL CHECK (assigned_category IN ('PROJECTS', 'AREAS', 'RESOURCES', 'ARCHIVES')),
    reasoning TEXT,
    confidence NUMERIC(3,2) CHECK (confidence >= 0.00 AND confidence <= 1.00),
    is_overridden BOOLEAN DEFAULT FALSE,
    overridden_category VARCHAR(50) CHECK (overridden_category IN ('PROJECTS', 'AREAS', 'RESOURCES', 'ARCHIVES')),
    notion_page_id VARCHAR(255), -- Page created in the target Notion DB
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- INDICES (For Query Performance)
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_notion_configs_user ON notion_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_classification_logs_user ON classification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_classification_logs_created ON classification_logs(created_at DESC);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
-- Enable RLS on all tables to strictly isolate tenant data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notion_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE classification_logs ENABLE ROW LEVEL SECURITY;

-- 1. Users policies
CREATE POLICY user_read_own ON users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY user_update_own ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- 2. Notion Configs policies
CREATE POLICY notion_config_select_own ON notion_configs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY notion_config_insert_own ON notion_configs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY notion_config_update_own ON notion_configs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY notion_config_delete_own ON notion_configs
    FOR DELETE
    USING (auth.uid() = user_id);

-- 3. Classification Logs policies
CREATE POLICY logs_select_own ON classification_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY logs_insert_own ON classification_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY logs_update_own ON classification_logs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY logs_delete_own ON classification_logs
    FOR DELETE
    USING (auth.uid() = user_id);

-- =========================================================================
-- TRIGGERS (Auto update timestamp)
-- =========================================================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_notion_configs_modtime BEFORE UPDATE ON notion_configs FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_classification_logs_modtime BEFORE UPDATE ON classification_logs FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
