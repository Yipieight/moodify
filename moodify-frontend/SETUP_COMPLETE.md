# 🚀 Guía de Configuración Completa - Moodify

## 📋 Pasos a Seguir (En Orden)

### 1. 🔑 Obtener Credenciales

#### A. Credenciales de Spotify (OBLIGATORIO)
1. Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crea una nueva app llamada "Moodify Local"
3. Configura Redirect URI: `http://localhost:3000/api/auth/callback/spotify`
4. Copia el **Client ID** y **Client Secret**

#### B. Generar NextAuth Secret
```bash
# Opción 1: Online
# Ve a https://generate-secret.vercel.app/32

# Opción 2: Terminal (macOS/Linux)
openssl rand -base64 32

# Opción 3: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. 🗄️ Configurar Base de Datos PostgreSQL

#### Instalar PostgreSQL

**En macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb moodify_dev
```

**En Windows:**
- Descarga desde [postgresql.org](https://www.postgresql.org/download/windows/)
- Instala y usa pgAdmin para crear DB `moodify_dev`

**En Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb moodify_dev
```

### 3. 📝 Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar con tus valores reales
nano .env.local  # o tu editor preferido
```

**Contenido mínimo de .env.local:**
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-clave-generada-aqui
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=tu-spotify-client-id
SPOTIFY_CLIENT_SECRET=tu-spotify-client-secret
DATABASE_URL="postgresql://postgres@localhost:5432/moodify_dev?schema=public"
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
```

### 4. 📦 Instalar Dependencias

```bash
# Instalar todas las dependencias
npm install

# Instalar dependencias adicionales de base de datos
npm install prisma @prisma/client
npm install -D tsx ts-node
```

### 5. 🔧 Configurar Base de Datos

```bash
# Generar cliente de Prisma
npx prisma generate

# Crear tablas en la base de datos
npx prisma db push

# Poblar con datos de ejemplo (opcional)
npm run db:seed

# Abrir Prisma Studio para ver los datos (opcional)
npm run db:studio
```

### 6. 🚀 Ejecutar la Aplicación

```bash
# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

### 7. 🎯 Rutas para Probar

- **Inicio**: `/`
- **Dashboard**: `/dashboard`
- **Captura de Emociones**: `/capture`
- **Historial**: `/history`
- **Recomendaciones**: `/recommendations`
- **Login**: `/auth/login`

---

## 🛠️ Comandos Útiles

```bash
# Ver estado de la base de datos
npx prisma studio

# Resetear base de datos
npm run db:reset

# Ver logs en tiempo real
npm run dev

# Ejecutar tests
npm test

# Construir para producción
npm run build
```

---

## 🐛 Solución de Problemas

### Error: "Can't reach database server"
```bash
# Verificar que PostgreSQL esté ejecutándose
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# Verificar conexión
psql -d moodify_dev -c "SELECT version();"
```

### Error: "Invalid CLIENT_ID or CLIENT_SECRET"
- Verifica que hayas copiado correctamente las credenciales de Spotify
- Asegúrate de que la Redirect URI esté configurada correctamente

### Error: "NextAuth configuration error"
- Verifica que NEXTAUTH_SECRET esté configurado
- Asegúrate de que NEXTAUTH_URL coincida con tu dominio local

---

## 📊 Verificación Final

Una vez todo configurado, deberías poder:

✅ **Acceder al dashboard sin errores**  
✅ **Ver datos de ejemplo en el historial**  
✅ **Autenticarte con Spotify**  
✅ **Capturar emociones usando la cámara**  
✅ **Recibir recomendaciones musicales**  

---

## 🎉 ¡Listo!

Tu aplicación Moodify debería estar funcionando completamente. Si encuentras algún problema, revisa:

1. **Logs del servidor** en la terminal
2. **Console del navegador** para errores de JavaScript
3. **Estado de PostgreSQL** con `brew services list`
4. **Variables de entorno** en `.env.local`

¡Disfruta desarrollando con Moodify! 🎵😊