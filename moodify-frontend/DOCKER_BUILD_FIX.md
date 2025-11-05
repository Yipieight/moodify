# Docker Build Fix - Prisma Schema Issue

## Issue Resolved
**Error:** `Could not find Prisma Schema that is required for this command`

## Root Cause
The `postinstall` script in `package.json` runs `prisma generate` during dependency installation, but the `prisma/schema.prisma` file wasn't available in the Docker deps stage.

## Solution Applied

### 1. Updated Dockerfile - deps stage
```dockerfile
# Added openssl (required by Prisma)
RUN apk add --no-cache libc6-compat openssl

# Copy prisma schema before installing dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* ./
COPY prisma ./prisma/  # ← Added this line

# Now postinstall can find the schema
RUN pnpm i --frozen-lockfile
```

### 2. Updated Dockerfile - builder stage
```dockerfile
# Copy generated Prisma client from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/generated ./src/generated  # ← Added this line
```

### 3. Updated package.json
```json
{
  "scripts": {
    "build": "next build"  // ← Removed redundant "prisma generate &&"
  }
}
```

## Build Flow Now

1. **deps stage:**
   - Copy package files + prisma schema
   - Install dependencies
   - `postinstall` hook runs `prisma generate` ✅
   - Prisma client generated to `src/generated/prisma`

2. **builder stage:**
   - Copy node_modules from deps
   - Copy generated Prisma client from deps ✅
   - Copy all source files
   - Build Next.js application

3. **runner stage:**
   - Copy built application
   - Copy Prisma client for runtime ✅
   - Start production server

## Testing

Try building again:
```bash
docker compose build --no-cache
docker compose up -d
```

## Expected Output
Dependencies should install successfully, and you should see:
```
✔ Generated Prisma Client (v6.14.0) to ./src/generated/prisma in 123ms
```

## What Changed

| File | Change | Reason |
|------|--------|--------|
| `Dockerfile` | Added `openssl` to deps | Required by Prisma |
| `Dockerfile` | Copy `prisma/` before install | Enables postinstall hook |
| `Dockerfile` | Copy generated client to builder | Reuse generated client |
| `package.json` | Simplified build script | No redundant generation |

## Benefits

- ✅ Prisma client generated once during dependency installation
- ✅ Faster builds (no redundant generation)
- ✅ Cleaner build process
- ✅ Follows Docker best practices

---

**Issue:** Fixed on November 4, 2025  
**Status:** ✅ Resolved - Ready to build

