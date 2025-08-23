-- Moodify Database Schema for PostgreSQL
-- Execute this script in your PostgreSQL database

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS user_statistics CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_activity CASCADE;
DROP TABLE IF EXISTS music_recommendations CASCADE;
DROP TABLE IF EXISTS emotion_analyses CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Tabla principal de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified TIMESTAMP,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de cuentas (para OAuth providers como Spotify)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type VARCHAR(255),
    scope VARCHAR(255),
    id_token TEXT,
    session_state VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_account_id)
);

-- 3. Tabla de sesiones
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de tokens de verificación
CREATE TABLE verification_tokens (
    token VARCHAR(255) PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    expires TIMESTAMP NOT NULL,
    UNIQUE(identifier, token)
);

-- 5. Tabla de análisis de emociones
CREATE TABLE emotion_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emotion VARCHAR(50) NOT NULL CHECK (emotion IN ('happy', 'sad', 'angry', 'surprised', 'neutral', 'fear', 'disgust')),
    confidence DECIMAL(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    image_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de recomendaciones musicales
CREATE TABLE music_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emotion_analysis_id UUID REFERENCES emotion_analyses(id) ON DELETE SET NULL,
    emotion VARCHAR(50) NOT NULL,
    track_id VARCHAR(255) NOT NULL,
    track_name VARCHAR(500) NOT NULL,
    artist_name VARCHAR(500) NOT NULL,
    album_name VARCHAR(500),
    track_url TEXT,
    image_url TEXT,
    duration_ms INTEGER,
    popularity INTEGER CHECK (popularity >= 0 AND popularity <= 100),
    audio_features JSONB,
    was_played BOOLEAN DEFAULT FALSE,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabla de historial de actividad del usuario
CREATE TABLE user_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL CHECK (activity_type IN ('emotion_analysis', 'music_recommendation', 'track_play', 'track_rating')),
    activity_data JSONB NOT NULL,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabla de preferencias del usuario
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_genres TEXT[],
    disliked_genres TEXT[],
    preferred_artists TEXT[],
    music_discovery_level INTEGER CHECK (music_discovery_level >= 1 AND music_discovery_level <= 5) DEFAULT 3,
    explicit_content_allowed BOOLEAN DEFAULT FALSE,
    language_preferences TEXT[] DEFAULT ARRAY['es', 'en'],
    notification_preferences JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- 9. Tabla de estadísticas del usuario
CREATE TABLE user_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_analyses INTEGER DEFAULT 0,
    total_recommendations INTEGER DEFAULT 0,
    most_common_emotion VARCHAR(50),
    favorite_genre VARCHAR(100),
    average_mood_score DECIMAL(3,2),
    last_activity TIMESTAMP,
    statistics_data JSONB,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_provider ON accounts(provider, provider_account_id);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_session_token ON sessions(session_token);

CREATE INDEX idx_emotion_analyses_user_id ON emotion_analyses(user_id);
CREATE INDEX idx_emotion_analyses_emotion ON emotion_analyses(emotion);
CREATE INDEX idx_emotion_analyses_created_at ON emotion_analyses(created_at);
CREATE INDEX idx_emotion_analyses_user_emotion ON emotion_analyses(user_id, emotion);

CREATE INDEX idx_music_recommendations_user_id ON music_recommendations(user_id);
CREATE INDEX idx_music_recommendations_emotion ON music_recommendations(emotion);
CREATE INDEX idx_music_recommendations_track_id ON music_recommendations(track_id);
CREATE INDEX idx_music_recommendations_created_at ON music_recommendations(created_at);

CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX idx_user_activity_created_at ON user_activity(created_at);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_statistics_user_id ON user_statistics(user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at 
    BEFORE UPDATE ON accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar estadísticas del usuario
CREATE OR REPLACE FUNCTION update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar estadísticas cuando se inserta un nuevo análisis de emoción
    IF TG_TABLE_NAME = 'emotion_analyses' THEN
        INSERT INTO user_statistics (user_id, total_analyses, last_activity)
        VALUES (NEW.user_id, 1, NEW.created_at)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            total_analyses = user_statistics.total_analyses + 1,
            last_activity = NEW.created_at,
            calculated_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- Actualizar estadísticas cuando se inserta una nueva recomendación
    IF TG_TABLE_NAME = 'music_recommendations' THEN
        INSERT INTO user_statistics (user_id, total_recommendations, last_activity)
        VALUES (NEW.user_id, 1, NEW.created_at)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            total_recommendations = user_statistics.total_recommendations + 1,
            last_activity = NEW.created_at,
            calculated_at = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar estadísticas
CREATE TRIGGER update_stats_on_emotion_analysis
    AFTER INSERT ON emotion_analyses
    FOR EACH ROW EXECUTE FUNCTION update_user_statistics();

CREATE TRIGGER update_stats_on_music_recommendation
    AFTER INSERT ON music_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_user_statistics();

-- Insertar datos de ejemplo (opcional)
INSERT INTO users (name, email) VALUES 
    ('Usuario de Prueba', 'test@example.com'),
    ('Demo User', 'demo@moodify.app');

-- Obtener el ID del usuario de prueba
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    SELECT id INTO test_user_id FROM users WHERE email = 'test@example.com';
    
    -- Insertar algunas emociones de ejemplo
    INSERT INTO emotion_analyses (user_id, emotion, confidence) VALUES
        (test_user_id, 'happy', 0.85),
        (test_user_id, 'sad', 0.72),
        (test_user_id, 'neutral', 0.91),
        (test_user_id, 'surprised', 0.67);
    
    -- Insertar preferencias de usuario
    INSERT INTO user_preferences (user_id, preferred_genres, music_discovery_level) VALUES
        (test_user_id, ARRAY['pop', 'rock', 'indie'], 4);
END $$;

-- Verificar que todo se creó correctamente
SELECT 'Tablas creadas correctamente' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;