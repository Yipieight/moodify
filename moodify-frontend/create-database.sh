#!/bin/bash

# Script para crear la base de datos de Moodify
echo "🗄️ Creando base de datos de Moodify..."

# Verificar si PostgreSQL está ejecutándose
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL no está instalado o no está en el PATH"
    echo "💡 Instala PostgreSQL primero:"
    echo "   macOS: brew install postgresql@15"
    echo "   Ubuntu: sudo apt install postgresql postgresql-contrib"
    exit 1
fi

# Variables de configuración
DB_NAME="moodify_dev"
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo "📝 Configuración:"
echo "   Base de datos: $DB_NAME"
echo "   Usuario: $DB_USER"
echo "   Host: $DB_HOST"
echo "   Puerto: $DB_PORT"

# Crear base de datos si no existe
echo "🔧 Creando base de datos '$DB_NAME' si no existe..."
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || {
    echo "⚠️  La base de datos '$DB_NAME' ya existe o hubo un error creándola"
}

# Ejecutar el esquema
echo "📊 Ejecutando esquema de base de datos..."
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database-schema.sql; then
    echo "✅ ¡Esquema de base de datos creado exitosamente!"
    
    # Mostrar tablas creadas
    echo ""
    echo "📋 Tablas creadas:"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt"
    
    echo ""
    echo "📊 Datos de ejemplo insertados:"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT name, email FROM users;"
    
    echo ""
    echo "🎉 ¡Base de datos lista para usar!"
    echo ""
    echo "📝 Próximos pasos:"
    echo "1. Configura tu .env.local con:"
    echo "   DATABASE_URL=\"postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME?schema=public\""
    echo "2. Ejecuta: npm install prisma @prisma/client"
    echo "3. Ejecuta: npx prisma db pull"
    echo "4. Ejecuta: npx prisma generate"
    echo "5. Ejecuta: npm run dev"
else
    echo "❌ Error ejecutando el esquema de base de datos"
    echo "💡 Verifica que PostgreSQL esté ejecutándose y que tengas permisos"
    exit 1
fi