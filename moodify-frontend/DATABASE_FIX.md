# 🔧 Database Schema Fix

## ❌ Problema Identificado

El error `"idx_emotion_analyses_user_id" does not exist` ocurrió porque el script original tenía sintaxis de MySQL en lugar de PostgreSQL.

**Error original:**
```sql
CREATE TABLE emotion_analyses (
    -- ...
    INDEX idx_emotion_analyses_user_id (user_id)  -- ❌ Sintaxis MySQL
);
```

**Sintaxis correcta para PostgreSQL:**
```sql
CREATE TABLE emotion_analyses (
    -- ...
);
-- Crear índices después de la tabla
CREATE INDEX idx_emotion_analyses_user_id ON emotion_analyses(user_id);  -- ✅ PostgreSQL
```

## ✅ Solución

He creado archivos corregidos:

### 1. `database-schema.sql` - Script SQL Corregido
- ✅ Sintaxis PostgreSQL correcta
- ✅ Extensión UUID habilitada
- ✅ Índices creados separadamente
- ✅ Datos de ejemplo incluidos
- ✅ Triggers y funciones funcionales

### 2. `create-database.sh` - Script de Instalación
- ✅ Crea la base de datos automáticamente
- ✅ Ejecuta el esquema
- ✅ Verifica que todo funcione
- ✅ Muestra instrucciones de próximos pasos

## 🚀 Uso Rápido

### Opción 1: Script Automático (Recomendado)
```bash
# Ejecutar el script automático
./create-database.sh
```

### Opción 2: Manual
```bash
# 1. Crear base de datos
createdb moodify_dev

# 2. Ejecutar esquema
psql -d moodify_dev -f database-schema.sql
```

## 📝 Configuración en .env.local

Después de crear la base de datos, actualiza tu `.env.local`:

```env
# Para PostgreSQL local (sin contraseña)
DATABASE_URL="postgresql://postgres@localhost:5432/moodify_dev?schema=public"

# O si tienes contraseña
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/moodify_dev?schema=public"
```

## 🔍 Verificación

```bash
# Conectar a la base de datos
psql -d moodify_dev

# Ver tablas creadas
\dt

# Ver datos de ejemplo
SELECT * FROM users;

# Salir
\q
```

## 📦 Integración con Prisma

Una vez creada la base de datos:

```bash
# Instalar Prisma si no lo tienes
npm install prisma @prisma/client

# Importar el esquema existente
npx prisma db pull

# Generar cliente
npx prisma generate

# Iniciar aplicación
npm run dev
```

## 🎯 Resultado Esperado

Después de ejecutar correctamente:

- ✅ Base de datos `moodify_dev` creada
- ✅ 9 tablas creadas (users, accounts, sessions, etc.)
- ✅ Índices optimizados
- ✅ Triggers funcionando
- ✅ Datos de ejemplo disponibles
- ✅ Listo para usar con tu aplicación Next.js

¡La base de datos debería funcionar perfectamente ahora! 🎉