# LYROX OS - Setup Guide

**Version:** 0.1.0
**Last Updated:** 2025-10-31
**Target Audience:** Developers setting up local environment

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Development Workflow](#development-workflow)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js:** 20.x LTS or higher
- **pnpm:** 8.x or higher (recommended) or npm 10.x
- **Docker Desktop:** For local databases
- **Git:** For version control

### Recommended Tools

- **VS Code:** With recommended extensions
- **Postman or Insomnia:** For API testing
- **MongoDB Compass:** For MongoDB GUI (optional)
- **pgAdmin or TablePlus:** For PostgreSQL GUI (optional)

### Check Prerequisites

```bash
# Node.js version
node --version
# Should output: v20.x.x or higher

# pnpm version
pnpm --version
# Should output: 8.x.x or higher

# Docker version
docker --version
# Should output: Docker version 24.x.x or higher

# Git version
git --version
# Should output: git version 2.x.x or higher
```

---

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/gymtopz/lyrox-os.git
cd lyrox-os
```

### 2. Install Dependencies

```bash
# Install all dependencies (monorepo)
pnpm install
```

### 3. Setup Environment Variables

```bash
# Copy example env files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Edit with your values
nano apps/backend/.env
```

### 4. Start Databases

```bash
# Start PostgreSQL, MongoDB, Redis via Docker
docker-compose up -d
```

### 5. Run Database Migrations

```bash
# Backend directory
cd apps/backend

# Run Prisma migrations
pnpm prisma migrate dev

# Seed database with Emilio Born company
pnpm seed
```

### 6. Start Development Servers

```bash
# From root directory
pnpm dev
```

This starts:
- **Backend:** http://localhost:3000
- **Frontend:** http://localhost:3001
- **Database UI (Prisma Studio):** http://localhost:5555

---

## Detailed Setup

### Project Structure

```
lyrox-os/
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── .env
│   │   └── package.json
│   │
│   └── frontend/         # Next.js Dashboard
│       ├── src/
│       ├── .env
│       └── package.json
│
├── packages/
│   ├── types/            # Shared TypeScript types
│   └── config/           # Shared configuration
│
├── docker-compose.yml    # Local databases
├── package.json          # Monorepo root
└── pnpm-workspace.yaml   # Workspace config
```

---

### Installing Node.js (if needed)

**Using nvm (recommended):**

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js 20
nvm install 20
nvm use 20
nvm alias default 20
```

**Or download from:** https://nodejs.org

---

### Installing pnpm (if needed)

```bash
# Via npm
npm install -g pnpm

# Or via Homebrew (macOS)
brew install pnpm

# Verify
pnpm --version
```

---

### Installing Docker Desktop

**macOS:**
```bash
brew install --cask docker
# Or download from: https://www.docker.com/products/docker-desktop
```

**Windows/Linux:**
Visit: https://www.docker.com/products/docker-desktop

---

## Environment Variables

### Backend (.env)

Create `apps/backend/.env`:

```bash
# App
NODE_ENV=development
PORT=3000

# Database - PostgreSQL
DATABASE_URL="postgresql://lyrox:lyrox_dev@localhost:5432/lyrox_db?schema=public"

# Database - MongoDB
MONGODB_URI="mongodb://lyrox:lyrox_dev@localhost:27017/lyrox_db?authSource=admin"

# Database - Redis
REDIS_URL="redis://localhost:6379"

# OpenAI
OPENAI_API_KEY=sk-...  # Get from platform.openai.com

# JWT Secret (generate random string)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# CORS
CORS_ORIGIN=http://localhost:3001

# Logging
LOG_LEVEL=debug
```

### Frontend (.env)

Create `apps/frontend/.env.local`:

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# App
NEXT_PUBLIC_APP_NAME=LYROX OS
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## Database Setup

### Using Docker Compose (Recommended)

**File:** `docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: lyrox-postgres
    environment:
      POSTGRES_USER: lyrox
      POSTGRES_PASSWORD: lyrox_dev
      POSTGRES_DB: lyrox_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lyrox"]
      interval: 10s
      timeout: 5s
      retries: 5

  mongodb:
    image: mongo:7
    container_name: lyrox-mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: lyrox
      MONGO_INITDB_ROOT_PASSWORD: lyrox_dev
      MONGO_INITDB_DATABASE: lyrox_db
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: lyrox-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  mongo_data:
  redis_data:
```

**Commands:**

```bash
# Start all databases
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f postgres
docker-compose logs -f mongodb
docker-compose logs -f redis

# Stop all
docker-compose down

# Stop and remove volumes (⚠️ deletes all data)
docker-compose down -v
```

---

### Database Migrations (Prisma)

```bash
cd apps/backend

# Create a new migration
pnpm prisma migrate dev --name init

# Apply migrations
pnpm prisma migrate dev

# Reset database (⚠️ deletes all data)
pnpm prisma migrate reset

# Generate Prisma Client
pnpm prisma generate

# Open Prisma Studio (database GUI)
pnpm prisma studio
```

---

### Seed Database

```bash
cd apps/backend

# Seed Emilio Born company
pnpm seed

# Or run specific seed file
pnpm tsx prisma/seeds/emilio-born.ts
```

**What gets seeded:**
- 1 user (Pedro)
- 1 company (Emilio Born Coaching)
- 2 products (placeholder - Pedro will update via dashboard)

---

## Running the Application

### Development Mode

**Option 1: Run everything from root**

```bash
# From project root
pnpm dev
```

This starts:
- Backend (NestJS) on port 3000
- Frontend (Next.js) on port 3001

**Option 2: Run separately**

```bash
# Terminal 1 - Backend
cd apps/backend
pnpm dev

# Terminal 2 - Frontend
cd apps/frontend
pnpm dev
```

---

### Access the Application

- **Frontend Dashboard:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **API Docs (Swagger):** http://localhost:3000/api/docs
- **Prisma Studio:** Run `pnpm prisma studio` from backend

---

### Test Everything Works

**1. Check Backend Health:**
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok"}
```

**2. Check Database Connection:**
```bash
curl http://localhost:3000/api/companies
# Should return array with Emilio Born company
```

**3. Check Frontend:**
Visit http://localhost:3001 - should see login page

---

## Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install new dependencies (if any)
pnpm install

# 3. Apply new migrations (if any)
cd apps/backend && pnpm prisma migrate dev

# 4. Start development servers
cd ../.. && pnpm dev

# 5. Start coding!
```

---

### Making Changes

#### Backend Changes

```bash
cd apps/backend

# Auto-restart on file changes (watch mode)
pnpm dev

# Run tests
pnpm test

# Lint
pnpm lint

# Format
pnpm format
```

#### Frontend Changes

```bash
cd apps/frontend

# Auto-reload on file changes (hot module replacement)
pnpm dev

# Build for production (test)
pnpm build

# Lint
pnpm lint
```

---

### Database Changes

#### Adding a New Table

1. **Edit Prisma schema:**
```prisma
// apps/backend/prisma/schema.prisma
model NewTable {
  id        String   @id @default(uuid())
  companyId String   // Always include for multi-tenant
  name      String
  createdAt DateTime @default(now())

  company Company @relation(fields: [companyId], references: [id])
}
```

2. **Create migration:**
```bash
pnpm prisma migrate dev --name add_new_table
```

3. **Update code:**
```typescript
// Backend code now has access to:
await prisma.newTable.create({ /* ... */ });
```

---

### Testing

```bash
# Backend unit tests
cd apps/backend
pnpm test

# Backend e2e tests
pnpm test:e2e

# Frontend tests
cd apps/frontend
pnpm test

# All tests
cd ../.. && pnpm test
```

---

## Troubleshooting

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 pnpm dev
```

---

### Database Connection Failed

**Error:** `Can't reach database server at localhost:5432`

**Solution:**
```bash
# Check Docker is running
docker ps

# Start databases
docker-compose up -d

# Check logs
docker-compose logs postgres
```

---

### Prisma Client Not Found

**Error:** `@prisma/client` did not initialize yet

**Solution:**
```bash
cd apps/backend
pnpm prisma generate
```

---

### Node Modules Issues

**Error:** Various dependency errors

**Solution:**
```bash
# Clean install
rm -rf node_modules
rm -rf apps/*/node_modules
rm pnpm-lock.yaml

pnpm install
```

---

### Docker Issues

**Error:** Docker daemon not running

**macOS:**
- Open Docker Desktop app
- Wait for whale icon to stop animating

**Linux:**
```bash
sudo systemctl start docker
```

---

### OpenAI API Errors

**Error:** `Invalid API key`

**Solution:**
1. Check `.env` file has correct key
2. Verify key at https://platform.openai.com/api-keys
3. Check for extra spaces or quotes in `.env`

---

### Hot Reload Not Working

**Solution:**
```bash
# Backend: Restart dev server
# Frontend: Delete .next folder
rm -rf apps/frontend/.next
pnpm dev
```

---

## VS Code Setup

### Recommended Extensions

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "ms-azuretools.vscode-docker",
    "mongodb.mongodb-vscode",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

---

## Next Steps

After setup is complete:

1. ✅ All services running locally
2. ✅ Can access frontend dashboard
3. ✅ Can access backend API
4. ✅ Database is seeded

**Now you're ready to start developing!**

See:
- [System Architecture](../architecture/system-architecture.md) - Understand the system
- [Database Schema](../architecture/database-schema.md) - Understand the data
- [Git Workflow](./git-workflow.md) - How to commit changes

---

**Document Version:** 0.1.0
**Last Updated:** 2025-10-31
**Next Update:** After first developer onboarding
