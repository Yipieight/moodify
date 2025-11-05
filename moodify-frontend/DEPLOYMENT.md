# Moodify Frontend - Docker Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the Moodify frontend application using Docker with Supabase PostgreSQL database.

## Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- Spotify Developer Account (for API credentials)
- Supabase Account (for PostgreSQL database)

## Environment Configuration

### 1. Create Environment File

Create a `.env` file in the root directory based on the provided `env.example.txt`:

```bash
cp env.example.txt .env
```

### 2. Configure Required Environment Variables

#### Database Configuration (Supabase)
```env
DATABASE_URL="postgresql://postgres:Moodify@dmin123@db.gsjwtbmiqmgvibvilwfr.supabase.co:5432/postgres"
```

#### NextAuth Configuration
Generate a secure secret for NextAuth:
```bash
openssl rand -base64 32
```

Then configure:
```env
NEXTAUTH_URL="http://localhost:3000"  # Update for production
NEXTAUTH_SECRET="your-generated-secret-here"
```

#### Spotify API Configuration

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Add redirect URIs:
   - `http://localhost:3000/api/auth/callback/spotify` (development)
   - `https://your-domain.com/api/auth/callback/spotify` (production)
4. Copy your credentials:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
```

#### Optional: Email Configuration
For passwordless email authentication:
```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@moodify.com"
```

## Database Setup

### 1. Initialize Supabase Database

The database schema is already configured in `prisma/schema.prisma`. To set up the database:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to Supabase (creates tables)
npm run db:push
```

### 2. Verify Database Connection

Check that the DATABASE_URL is correct:
```bash
# Test connection
npx prisma db execute --stdin <<< "SELECT 1"
```

## Docker Deployment

### Method 1: Using Docker Compose (Recommended)

1. **Build and start the containers:**
   ```bash
   docker-compose up -d --build
   ```

2. **Check logs:**
   ```bash
   docker-compose logs -f moodify-frontend
   ```

3. **Stop the containers:**
   ```bash
   docker-compose down
   ```

### Method 2: Using Docker Directly

1. **Build the image:**
   ```bash
   docker build \
     --build-arg DATABASE_URL="$DATABASE_URL" \
     --build-arg NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
     --build-arg NEXT_PUBLIC_SPOTIFY_CLIENT_ID="$NEXT_PUBLIC_SPOTIFY_CLIENT_ID" \
     --build-arg SPOTIFY_CLIENT_SECRET="$SPOTIFY_CLIENT_SECRET" \
     -t moodify-frontend .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name moodify-frontend \
     -p 3000:3000 \
     -e DATABASE_URL="$DATABASE_URL" \
     -e NEXTAUTH_URL="http://localhost:3000" \
     -e NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
     -e NEXT_PUBLIC_SPOTIFY_CLIENT_ID="$NEXT_PUBLIC_SPOTIFY_CLIENT_ID" \
     -e SPOTIFY_CLIENT_SECRET="$SPOTIFY_CLIENT_SECRET" \
     moodify-frontend
   ```

## Production Deployment

### AWS ECS/ECR Deployment

1. **Tag and push to ECR:**
   ```bash
   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_REGISTRY

   # Tag image
   docker tag moodify-frontend:latest YOUR_ECR_REGISTRY/moodify-frontend:latest

   # Push image
   docker push YOUR_ECR_REGISTRY/moodify-frontend:latest
   ```

2. **Update ECS Task Definition:**
   Use the provided task definition in `infrastructure/ecs-task-definition.json`

3. **Deploy using Terraform:**
   ```bash
   cd infrastructure/terraform
   terraform init
   terraform plan
   terraform apply
   ```

### Environment-Specific Configuration

#### Production Environment
```env
NODE_ENV="production"
NEXTAUTH_URL="https://your-production-domain.com"
DATABASE_URL="postgresql://postgres:password@your-supabase-project.supabase.co:5432/postgres"
```

#### Staging Environment
```env
NODE_ENV="staging"
NEXTAUTH_URL="https://staging.your-domain.com"
DATABASE_URL="postgresql://postgres:password@staging-db.supabase.co:5432/postgres"
```

## Health Checks

The application includes a health check endpoint at `/api/health`. Docker Compose is configured to use this endpoint:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Monitoring and Logs

### View application logs:
```bash
docker-compose logs -f moodify-frontend
```

### View database logs (if using local PostgreSQL):
```bash
docker-compose logs -f postgres
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
**Error:** `PrismaClientInitializationError: Can't reach database server`

**Solution:**
- Verify DATABASE_URL is correct
- Check Supabase project is active
- Ensure IP/domain is whitelisted in Supabase settings

#### 2. Spotify Authentication Failed
**Error:** `Spotify credentials not configured`

**Solution:**
- Verify NEXT_PUBLIC_SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are set
- Check Spotify redirect URIs are configured correctly
- Ensure credentials are for a valid Spotify application

#### 3. NextAuth Session Issues
**Error:** `[next-auth][error][JWT_SESSION_ERROR]`

**Solution:**
- Ensure NEXTAUTH_SECRET is set and at least 32 characters
- Verify NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

#### 4. Prisma Client Not Found
**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
# Rebuild Docker image with Prisma generation
docker-compose build --no-cache
docker-compose up -d
```

#### 5. Face Detection Models Not Loading
**Error:** Models failing to load in browser

**Solution:**
- Verify `public/models` directory exists and contains all model files
- Check browser console for 404 errors
- Ensure models are copied in Dockerfile

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
NODE_ENV=development
```

## Performance Optimization

### 1. Redis Session Storage
For production, consider using Redis for session storage:

```yaml
# In docker-compose.yml (already configured)
services:
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD:-moodify123}
```

### 2. CDN for Static Assets
Consider using a CDN for:
- Face detection models (large files)
- Static images
- CSS/JS bundles

### 3. Database Connection Pooling
Supabase includes connection pooling by default. For optimal performance:
- Use transaction mode for short-lived queries
- Use session mode for long-lived connections

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use secrets management in production (AWS Secrets Manager, etc.)
- Rotate credentials regularly

### 2. CORS Configuration
Update CORS settings in `next.config.ts` for production:
```typescript
{ key: "Access-Control-Allow-Origin", value: "https://your-domain.com" }
```

### 3. Database Security
- Use strong passwords
- Enable SSL for database connections
- Restrict database access by IP when possible

## Backup and Recovery

### Database Backups
Supabase provides automatic backups. To create manual backup:
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore from Backup
```bash
psql $DATABASE_URL < backup_file.sql
```

## Scaling

### Horizontal Scaling
The application is stateless and can be scaled horizontally:

```bash
docker-compose up -d --scale moodify-frontend=3
```

### Load Balancing
Use AWS Application Load Balancer or Nginx for load balancing multiple instances.

## Additional Resources

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Supabase Documentation](https://supabase.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)

## Support

For issues and questions:
- Check the troubleshooting section above
- Review application logs
- Contact the development team

---

**Last Updated:** November 2025
**Version:** 1.0.0

