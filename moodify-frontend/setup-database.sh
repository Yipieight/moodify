#!/bin/bash

# Script de configuración de base de datos para Moodify
echo "🚀 Configurando base de datos para Moodify..."

# Instalar dependencias de Prisma
echo "📦 Instalando dependencias de Prisma..."
npm install prisma @prisma/client
npm install -D prisma

# Verificar si existe archivo .env.local
if [ ! -f .env.local ]; then
    echo "⚠️  Archivo .env.local no encontrado. Creando uno de ejemplo..."
    cp .env.example .env.local 2>/dev/null || echo "⚠️  No se encontró .env.example. Por favor crea .env.local manualmente."
fi

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Verificar conexión a base de datos
echo "🔍 Verificando conexión a base de datos..."
if npx prisma db pull --preview-feature 2>/dev/null; then
    echo "✅ Conexión a base de datos exitosa"
else
    echo "❌ No se pudo conectar a la base de datos. Verifica tu DATABASE_URL en .env.local"
    echo "💡 Asegúrate de que PostgreSQL esté ejecutándose y la base de datos exista"
fi

echo ""
echo "📋 Próximos pasos:"
echo "1. Asegúrate de que PostgreSQL esté ejecutándose"
echo "2. Crea la base de datos 'moodify_dev' si no existe"
echo "3. Configura DATABASE_URL en tu archivo .env.local"
echo "4. Ejecuta: npx prisma db push"
echo "5. Ejecuta: npx prisma db seed (opcional)"
echo ""
echo "🎉 ¡Configuración completada!"