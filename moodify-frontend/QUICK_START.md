# 🚀 Moodify Frontend - Quick Start Guide

## Prerequisites
- ✅ Docker & Docker Compose installed
- ✅ Spotify Developer Account
- ✅ Supabase Account (already configured)

---

## 1️⃣ Setup Environment (2 minutes)

```bash
# Copy environment template
cp env.example.txt .env
```

Edit `.env` and set:
```env
# Generate secret
NEXTAUTH_SECRET="run: openssl rand -base64 32"

# Get from https://developer.spotify.com/dashboard
NEXT_PUBLIC_SPOTIFY_CLIENT_ID="your-client-id"
SPOTIFY_CLIENT_SECRET="your-client-secret"
```

Database URL is **already configured** for Supabase! ✅

---

## 2️⃣ Deploy (1 minute)

### Option A: Using the Script (Easiest)
```bash
chmod +x docker-deploy.sh
./docker-deploy.sh
# Choose option 1: Build and start containers
```

### Option B: Using Docker Compose
```bash
docker compose up -d --build
```

---

## 3️⃣ Verify (30 seconds)

```bash
# Check if running
docker compose ps

# View logs
docker compose logs -f moodify-frontend

# Test health endpoint
curl http://localhost:3000/api/health
```

---

## 🎉 Done!

Access your application at: **http://localhost:3000**

---

## 🔍 Common Commands

```bash
# Stop
docker compose down

# Restart
docker compose restart

# Rebuild (clean)
docker compose build --no-cache && docker compose up -d

# Database migrations
docker compose exec moodify-frontend npm run db:push
```

---

## ⚠️ Troubleshooting

### Database connection failed?
- Check DATABASE_URL in `.env`
- Verify Supabase project is active

### Spotify auth not working?
- Add redirect URI in Spotify Dashboard:
  `http://localhost:3000/api/auth/callback/spotify`

### Container won't start?
```bash
# Check logs for errors
docker compose logs moodify-frontend

# Rebuild without cache
docker compose build --no-cache
```

---

## 📚 Full Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [DOCKER_SETUP_SUMMARY.md](./DOCKER_SETUP_SUMMARY.md) - Detailed changes summary

---

## 🆘 Need Help?

1. Check logs: `docker compose logs -f`
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
3. Verify all environment variables are set

---

**Current Configuration:**
- ✅ Database: Supabase PostgreSQL
- ✅ Auth: NextAuth with Spotify OAuth
- ✅ Session: JWT with optional Redis
- ✅ Face Detection: face-api.js models included

**Deployment Time:** ~3 minutes from zero to running! ⚡

