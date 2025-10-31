# LYROX OS - Quick Setup

**Initial setup for Session 2 - Project structure initialized**

## Prerequisites

Ensure you have installed:
- Node.js 20.x or higher
- pnpm 8.x or higher
- Docker Desktop

Check versions:
```bash
node --version  # Should be v20.x.x or higher
pnpm --version  # Should be 8.x.x or higher
docker --version # Should be 24.x.x or higher
```

## Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies (monorepo)
pnpm install
```

### 2. Setup Environment Variables

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Frontend
cp apps/frontend/.env.example apps/frontend/.env.local

# Edit backend .env and add your OpenAI API key (when you have it)
# nano apps/backend/.env
```

### 3. Start Databases

```bash
# Start PostgreSQL, MongoDB, Redis via Docker
docker-compose up -d

# Check they're running
docker-compose ps
```

### 4. Setup Database Schema

```bash
# From backend directory
cd apps/backend

# Generate Prisma Client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed database with Emilio Born company
pnpm seed

# Go back to root
cd ../..
```

### 5. Start Development Servers

```bash
# From root directory - starts both backend and frontend
pnpm dev
```

This starts:
- **Backend:** http://localhost:3000
- **Frontend:** http://localhost:3001
- **API Docs:** http://localhost:3000/api/docs

### 6. Verify Everything Works

**Test Backend:**
```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok",...}
```

**Test Frontend:**
Open http://localhost:3001 in browser - should see LYROX OS homepage

## Login Credentials (Phase 0)

After seeding:
- **Email:** pedro@example.com
- **Password:** temp-password-123

## Project Structure

```
lyrox-os/
├── apps/
│   ├── backend/          # NestJS API (port 3000)
│   └── frontend/         # Next.js Dashboard (port 3001)
├── packages/
│   ├── types/            # Shared TypeScript types
│   └── config/           # Shared configuration
├── docs/                 # Documentation
├── docker-compose.yml    # Local databases
└── package.json          # Monorepo root
```

## Common Commands

```bash
# Development
pnpm dev                  # Start all apps

# Backend only
cd apps/backend
pnpm dev

# Frontend only
cd apps/frontend
pnpm dev

# Prisma
cd apps/backend
pnpm prisma:studio       # Open database GUI
pnpm prisma:generate     # Regenerate client
pnpm prisma:migrate      # Run migrations

# Docker
docker-compose up -d     # Start databases
docker-compose down      # Stop databases
docker-compose logs -f   # View logs
```

## Troubleshooting

**Port already in use:**
```bash
lsof -ti:3000 | xargs kill -9  # Kill process on port 3000
```

**Database connection failed:**
```bash
docker-compose down
docker-compose up -d
```

**Prisma client not found:**
```bash
cd apps/backend
pnpm prisma:generate
```

## Next Steps

See [docs/development/setup-guide.md](./docs/development/setup-guide.md) for detailed setup instructions.

## Current Status

- ✅ Monorepo structure initialized
- ✅ Docker Compose configured
- ✅ NestJS backend skeleton created
- ✅ Next.js frontend skeleton created
- ✅ Prisma schema defined
- ✅ Shared packages (types, config) created
- ⏳ Need to install dependencies
- ⏳ Need to run database migrations
- ⏳ Need to seed database

**Version:** 0.2.0
**Last Updated:** 2025-10-31
