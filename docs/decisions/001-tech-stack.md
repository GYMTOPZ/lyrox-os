# ADR-001: Technology Stack Selection

**Date:** 2025-10-31
**Status:** ✅ Accepted
**Deciders:** Pedro Meza (PM/CEO), Claude Code (Tech Lead)
**Tags:** #architecture #technology #foundation

---

## Context

LYROX OS requires a technology stack that:
- Supports rapid development (Phase 0 target: 2-3 weeks)
- Can scale to multi-tenant SaaS platform (Phase 1+)
- Provides excellent developer experience
- Has strong TypeScript support (type safety critical for AI integrations)
- Is maintainable long-term
- Has good community support and documentation

---

## Decision

### Backend

**Framework:** NestJS
**Language:** TypeScript 5
**Runtime:** Node.js 20 LTS

**Rationale:**
- Modular architecture (perfect for agent-based system)
- Built-in dependency injection (easy testing, maintainability)
- Decorators for clean code
- Enterprise-ready (used by large companies)
- Excellent TypeScript support
- Built-in support for WebSockets, GraphQL, microservices

### Frontend

**Framework:** Next.js 14 (App Router)
**Language:** TypeScript 5
**Styling:** Tailwind CSS
**Components:** Shadcn/ui
**State Management:** Zustand

**Rationale:**
- Full-stack framework (API routes + frontend in one)
- Server + Client rendering (optimal performance)
- App Router provides better DX
- Tailwind enables rapid UI development
- Shadcn/ui = beautiful components without bloat
- Zustand = simple state management (lighter than Redux)

### Databases

**SQL:** PostgreSQL 15
**NoSQL:** MongoDB 7
**Cache:** Redis 7
**ORM/ODM:** Prisma (SQL), Mongoose (MongoDB)

**Rationale:**
- **PostgreSQL:** Best open-source relational DB
  - JSONB support (flexibility when needed)
  - Strong ACID guarantees
  - Excellent performance
  - Great for structured data (users, sales, products)

- **MongoDB:** Best for flexible schemas
  - Perfect for conversations (variable structure)
  - Fast writes (important for high-message volume)
  - Easy to iterate on schema
  - Native JSON support

- **Redis:** Industry standard for caching
  - In-memory speed
  - Pub/sub for real-time features
  - Queue system (Bull)

- **Prisma:** Best TypeScript-first ORM
  - Type-safe queries
  - Auto-generated types
  - Great DX with migrations

### AI

**Primary:** OpenAI GPT-4o
**Embeddings:** text-embedding-3-small (future)
**Orchestration:** LangChain (future, if needed)

**Rationale:**
- GPT-4o: Best performance/cost ratio
- OpenAI API: Most reliable, best docs
- Embeddings: For semantic search (Phase 2+)

### Infrastructure

**Development:** Docker Compose
**Production:**
- Backend: Railway.app
- Frontend: Vercel
- Databases: Railway (PostgreSQL, Redis) + MongoDB Atlas (free tier)

**CI/CD:** GitHub Actions

**Rationale:**
- **Railway:** Easy deploy, generous free tier, built-in DBs
- **Vercel:** Best Next.js hosting, edge network
- **Docker Compose:** Consistent dev environment
- **GitHub Actions:** Free for public repos, great integration

### DevOps

**Monitoring:** Sentry (errors) + Custom logging
**Logging:** Winston (structured logs)
**Version Control:** Git + GitHub
**Package Manager:** pnpm (faster than npm/yarn)

---

## Alternatives Considered

### Alternative 1: Express.js instead of NestJS

**Pros:**
- Simpler, less opinionated
- Faster to get started
- Smaller bundle size

**Cons:**
- No built-in structure (will get messy at scale)
- No dependency injection (harder to test)
- Need to choose/integrate everything manually

**Verdict:** ❌ Rejected
- We need structure for multi-agent system
- Long-term maintainability is critical
- The learning curve is acceptable

---

### Alternative 2: Python (Django/FastAPI) instead of Node.js

**Pros:**
- Python great for AI/ML
- FastAPI is very fast
- Django is mature

**Cons:**
- Separate language for frontend (JS) and backend (Python)
- Node.js ecosystem better for web/real-time apps
- TypeScript across stack = consistency

**Verdict:** ❌ Rejected
- Full TypeScript stack is more important
- Node.js ecosystem is richer for our use case
- Team (Claude) has deep Node.js expertise

---

### Alternative 3: Single Database (PostgreSQL JSONB only)

**Pros:**
- Simpler infrastructure
- One DB to manage
- PostgreSQL JSONB is powerful

**Cons:**
- JSONB queries slower than MongoDB for complex documents
- Conversations will have massive JSONB fields
- Less flexible for iteration

**Verdict:** ❌ Rejected
- Conversations are core feature, need optimal storage
- Multi-DB complexity is manageable
- Can consolidate in future if needed

---

### Alternative 4: AWS/GCP instead of Railway

**Pros:**
- More control
- Enterprise-grade
- More services available

**Cons:**
- Complex setup (days vs hours)
- Expensive (vs free Railway tier)
- Overkill for Phase 0

**Verdict:** ❌ Rejected for Phase 0, ✅ Revisit for Phase 2+
- Railway perfect for MVP
- Can migrate to AWS later when scaling requirements are clear
- Keep architecture cloud-agnostic (containerized)

---

## Consequences

### Positive

✅ **Type Safety:** TypeScript across entire stack prevents bugs
✅ **Scalability:** Architecture supports growth to 10,000+ companies
✅ **Developer Experience:** Modern tools, great docs, fast iteration
✅ **Cost Effective:** Free tiers get us far
✅ **Hiring:** Popular stack = easier to find developers
✅ **Ecosystem:** Rich libraries for everything we need

### Negative

⚠️ **Learning Curve:** NestJS not as simple as Express
⚠️ **Multi-DB Complexity:** Need to manage 3 databases
⚠️ **Vendor Lock-in:** Some Railway-specific features (mitigated by Docker)

### Neutral

🔷 **Not Cutting-Edge:** Stable, proven tech (good for production)
🔷 **Opinionated:** Less flexibility, more structure (good for consistency)

---

## Implementation Plan

### Week 1: Setup
1. Initialize NestJS project
2. Setup Next.js frontend
3. Configure Docker Compose (Postgres, Mongo, Redis)
4. Setup Prisma + Mongoose
5. Verify all databases connect locally

### Week 2-3: Core Development
1. Build with chosen stack
2. Deploy to Railway + Vercel
3. Validate performance meets targets

### Phase 1: Optimization
1. Fine-tune DB queries
2. Add caching strategically
3. Monitor performance in production

---

## References

- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Railway Documentation](https://docs.railway.app)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

## Review Schedule

- **First Review:** End of Phase 0 (evaluate if stack worked well)
- **Second Review:** After 3 months in production (performance analysis)
- **Ongoing:** Any major issues or new requirements

---

**Status:** Accepted and implemented
**Last Updated:** 2025-10-31
**Next Review:** November 21, 2025 (end of Phase 0)
