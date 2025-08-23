# Base de Datos para Moodify - PostgreSQL

## 🛠️ Instalación de PostgreSQL

### En macOS (usando Homebrew):
```bash
# Instalar PostgreSQL
brew install postgresql@15

# Iniciar el servicio
brew services start postgresql@15

# Crear base de datos
createdb moodify_dev
```

### En Windows:
1. Descarga PostgreSQL desde [postgresql.org](https://www.postgresql.org/download/windows/)
2. Instala siguiendo el wizard
3. Usa pgAdmin para crear la base de datos `moodify_dev`

### En Linux (Ubuntu/Debian):
```bash
# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Cambiar a usuario postgres
sudo -u postgres psql

# Crear base de datos
CREATE DATABASE moodify_dev;
CREATE USER moodify_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE moodify_dev TO moodify_user;
\q
```

---

## 📊 Esquema de Base de Datos

### 1. Tabla de Usuarios (NextAuth)
```sql
-- Tabla principal de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified TIMESTAMP,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cuentas (para OAuth providers como Spotify)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Tabla de sesiones
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tokens de verificación
CREATE TABLE verification_tokens (
    token VARCHAR(255) PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    expires TIMESTAMP NOT NULL,
    UNIQUE(identifier, token)
);
```

### 2. Tablas Específicas de Moodify
```sql
-- Tabla de análisis de emociones
CREATE TABLE emotion_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emotion VARCHAR(50) NOT NULL CHECK (emotion IN ('happy', 'sad', 'angry', 'surprised', 'neutral', 'fear', 'disgust')),
    confidence DECIMAL(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    image_url TEXT,
    metadata JSONB, -- Para almacenar datos adicionales del análisis
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para la tabla emotion_analyses
CREATE INDEX idx_emotion_analyses_user_id ON emotion_analyses(user_id);
CREATE INDEX idx_emotion_analyses_emotion ON emotion_analyses(emotion);
CREATE INDEX idx_emotion_analyses_created_at ON emotion_analyses(created_at);
CREATE INDEX idx_emotion_analyses_user_emotion ON emotion_analyses(user_id, emotion);

-- Tabla de recomendaciones musicales
CREATE TABLE music_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emotion_analysis_id UUID REFERENCES emotion_analyses(id) ON DELETE SET NULL,
    emotion VARCHAR(50) NOT NULL,
    track_id VARCHAR(255) NOT NULL, -- Spotify track ID
    track_name VARCHAR(500) NOT NULL,
    artist_name VARCHAR(500) NOT NULL,
    album_name VARCHAR(500),
    track_url TEXT,
    image_url TEXT,
    duration_ms INTEGER,
    popularity INTEGER CHECK (popularity >= 0 AND popularity <= 100),
    audio_features JSONB, -- Para almacenar características de audio de Spotify
    was_played BOOLEAN DEFAULT FALSE,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para la tabla music_recommendations
CREATE INDEX idx_music_recommendations_user_id ON music_recommendations(user_id);
CREATE INDEX idx_music_recommendations_emotion ON music_recommendations(emotion);
CREATE INDEX idx_music_recommendations_track_id ON music_recommendations(track_id);
CREATE INDEX idx_music_recommendations_created_at ON music_recommendations(created_at);

-- Tabla de historial de actividad del usuario
CREATE TABLE user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL CHECK (activity_type IN ('emotion_analysis', 'music_recommendation', 'track_play', 'track_rating')),
    activity_data JSONB NOT NULL,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para la tabla user_activity
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX idx_user_activity_created_at ON user_activity(created_at);

-- Tabla de preferencias del usuario
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_genres TEXT[], -- Array de géneros musicales preferidos
    disliked_genres TEXT[], -- Array de géneros que no le gustan
    preferred_artists TEXT[], -- Array de artistas favoritos
    music_discovery_level INTEGER CHECK (music_discovery_level >= 1 AND music_discovery_level <= 5) DEFAULT 3,
    explicit_content_allowed BOOLEAN DEFAULT FALSE,
    language_preferences TEXT[] DEFAULT ARRAY['es', 'en'],
    notification_preferences JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- Tabla de estadísticas del usuario (cache de agregaciones frecuentes)
CREATE TABLE user_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_analyses INTEGER DEFAULT 0,
    total_recommendations INTEGER DEFAULT 0,
    most_common_emotion VARCHAR(50),
    favorite_genre VARCHAR(100),
    average_mood_score DECIMAL(3,2),
    last_activity TIMESTAMP,
    statistics_data JSONB, -- Para métricas adicionales
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);
```

### 3. Triggers y Funciones
```sql
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
```

### 4. Datos de Ejemplo (Opcional)
```sql
-- Insertar usuario de prueba
INSERT INTO users (name, email) VALUES ('Usuario de Prueba', 'test@example.com');

-- Insertar algunas emociones de ejemplo
INSERT INTO emotion_analyses (user_id, emotion, confidence) 
SELECT id, 'happy', 0.85 FROM users WHERE email = 'test@example.com';

INSERT INTO emotion_analyses (user_id, emotion, confidence) 
SELECT id, 'sad', 0.72 FROM users WHERE email = 'test@example.com';
```

---

## 🔧 Configuración en tu Proyecto

### 1. Instalar dependencias de base de datos
```bash
npm install prisma @prisma/client
npm install -D prisma
```

### 2. Configurar Prisma
```bash
npx prisma init
```

### 3. Actualizar tu .env.local
```env
# PostgreSQL local
DATABASE_URL="postgresql://moodify_user:tu_password@localhost:5432/moodify_dev?schema=public"

# O si usas PostgreSQL sin usuario específico
DATABASE_URL="postgresql://localhost:5432/moodify_dev?schema=public"
```

### 4. Ejecutar migraciones (después de configurar Prisma)
```bash
npx prisma db push
npx prisma generate
```

---

## 📈 Consultas Útiles para Desarrollo

```sql
-- Ver análisis de emociones por usuario
SELECT u.name, ea.emotion, COUNT(*) as count
FROM users u
JOIN emotion_analyses ea ON u.id = ea.user_id
GROUP BY u.name, ea.emotion
ORDER BY u.name, count DESC;

-- Ver recomendaciones más populares
SELECT track_name, artist_name, COUNT(*) as recommendation_count
FROM music_recommendations
GROUP BY track_name, artist_name
ORDER BY recommendation_count DESC
LIMIT 10;

-- Estadísticas de emociones por día
SELECT DATE(created_at) as date, emotion, COUNT(*) as count
FROM emotion_analyses
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), emotion
ORDER BY date DESC, count DESC;
```

---

## 🛡️ Consideraciones de Seguridad

1. **Nunca almacenes contraseñas en texto plano**
2. **Usa conexiones SSL en producción**
3. **Limita los permisos de usuario de base de datos**
4. **Implementa backups regulares**
5. **Considera encriptar datos sensibles como imágenes**

---

## 🚀 Próximos Pasos

1. Ejecuta los scripts SQL en tu base de datos PostgreSQL
2. Configura la conexión en tu .env.local
3. Instala y configura Prisma
4. Habilita las funciones de base de datos en tu aplicación