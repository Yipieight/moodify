# Guía Completa de Credenciales para Moodify

## 🎵 1. Spotify API Credentials

### Paso 1: Crear cuenta de desarrollador
1. Ve a [Spotify for Developers](https://developer.spotify.com/dashboard)
2. Inicia sesión con tu cuenta de Spotify (o crea una si no tienes)
3. Acepta los términos de servicio para desarrolladores

### Paso 2: Crear una nueva aplicación
1. Haz clic en **"Create an App"**
2. Llena el formulario:
   - **App name**: `Moodify Local Development`
   - **App description**: `Aplicación de recomendaciones musicales basadas en emociones`
   - **Website**: `http://localhost:3000`
   - **Redirect URI**: `http://localhost:3000/api/auth/callback/spotify`
3. Acepta los términos y condiciones
4. Haz clic en **"Create"**

### Paso 3: Obtener las credenciales
1. En el dashboard de tu app, encontrarás:
   - **Client ID**: Copia este valor (visible por defecto)
   - **Client Secret**: Haz clic en "Show client secret" y cópialo

### Paso 4: Configurar Redirect URIs
1. En tu app dashboard, ve a **"Settings"**
2. En **"Redirect URIs"**, asegúrate de tener:
   - `http://localhost:3000/api/auth/callback/spotify`
3. Guarda los cambios

---

## 🔐 2. NextAuth Configuration

### NEXTAUTH_SECRET
Necesitas una clave secreta aleatoria y segura:

**Opción 1: Generar online**
```bash
# Ve a https://generate-secret.vercel.app/32
# O usa este comando en terminal:
openssl rand -base64 32
```

**Opción 2: Generar en Node.js**
```javascript
// Ejecuta en la consola del navegador o Node.js:
require('crypto').randomBytes(32).toString('base64')
```

### NEXTAUTH_URL
Para desarrollo local siempre será:
```
NEXTAUTH_URL=http://localhost:3000
```

---

## 📧 3. Email Configuration (Opcional)

Si quieres habilitar autenticación por email, necesitarás configurar un proveedor SMTP:

### Gmail (Recomendado para desarrollo)
1. Ve a tu [Google Account](https://myaccount.google.com/)
2. Navega a **Security** → **2-Step Verification**
3. En la parte inferior, selecciona **App passwords**
4. Genera una nueva contraseña de aplicación para "Mail"
5. Usa estas credenciales:

```env
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=tu-email@gmail.com
EMAIL_SERVER_PASSWORD=tu-app-password-generada
EMAIL_FROM=noreply@moodify.app
```

### Otros proveedores SMTP
- **Outlook**: smtp-mail.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **SendGrid**: smtp.sendgrid.net:587

---

## 🗄️ 4. Base de Datos

Para este proyecto, recomiendo **PostgreSQL** para producción y **SQLite** para desarrollo local.

### Configuración recomendada:
```env
# Para desarrollo local con SQLite
DATABASE_URL="file:./dev.db"

# Para desarrollo local con PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/moodify_dev"
```

---

## ⚙️ 5. Variables Opcionales

```env
# Redis para caché (opcional)
REDIS_URL=redis://localhost:6379

# AWS (solo si decides usar AWS Rekognition en lugar de face-api.js)
AWS_ACCESS_KEY_ID=tu-access-key
AWS_SECRET_ACCESS_KEY=tu-secret-key
AWS_REGION=us-east-1
```

---

## 📋 Archivo .env.local Completo

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-clave-super-secreta-generada

# Spotify API Configuration
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=tu-spotify-client-id
SPOTIFY_CLIENT_SECRET=tu-spotify-client-secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback/spotify

# Email Configuration (opcional)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=tu-email@gmail.com
EMAIL_SERVER_PASSWORD=tu-app-password
EMAIL_FROM=noreply@moodify.app

# Database Configuration
DATABASE_URL="file:./dev.db"

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development Settings
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# Redis Configuration (opcional)
REDIS_URL=redis://localhost:6379
```

---

## 🚨 Importante

1. **Nunca subas tu archivo .env.local a Git**
2. **Mantén tus credenciales seguras**
3. **Para producción, usa variables de entorno del servidor**
4. **Las credenciales de Spotify son gratuitas pero tienen límites de uso**

---

## ✅ Verificación

Una vez configurado todo, puedes verificar que funciona:

1. Spotify API: Las recomendaciones musicales deberían funcionar
2. NextAuth: Deberías poder autenticarte con Spotify
3. Email (si configurado): Deberías poder recibir emails de magic link
