# Changelog

All notable changes to LYROX OS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Phase 0 - Pilot Development
Target: December 5, 2025 (Updated from Nov 21)

---

## [0.1.0] - 2025-10-31

### Added - Session 1

#### Documentation
- Created complete project structure and documentation system
- Added README.md with comprehensive project overview
- Added PROJECT_STATUS.md for real-time project tracking
- Added CHANGELOG.md for history tracking
- Created docs/ directory structure:
  - architecture/ - System design documentation
  - development/ - Developer guides
  - agents/ - AI agent specifications
  - integrations/ - Integration guides
  - deployment/ - Deployment instructions
  - business/ - Product and business documentation
  - decisions/ - Architecture Decision Records (ADRs)
  - sessions/ - Session notes for context continuity

#### Architecture & Planning
- Defined product vision: Autonomous Business Operating System
- Designed multi-tenant SaaS architecture
- Planned modular agent-based system
- Decided tech stack: NestJS, Next.js, PostgreSQL, MongoDB, Redis
- Created Phase 0 roadmap (3-week pilot with Emilio Born Coaching)
- Planned future phases (Platform → Advanced Agents → Enterprise)

#### Key Decisions (ADRs)
- ADR-001: Selected NestJS + Next.js + PostgreSQL + MongoDB stack
- ADR-002: Decided to start with pilot (single business) before building full platform
- ADR-003: Chose modular agent architecture with central orchestrator

### Context
This is the initial session where the complete vision for LYROX OS was defined. Started as a simple WhatsApp bot idea for Emilio Born Coaching, evolved into understanding this should be a multi-tenant SaaS platform where any business can become AI-operated.

The documentation-first approach was established to enable context continuity across development sessions, critical for AI-human collaboration.

---

## Session Notes

### Session 1 - October 31, 2025
**Duration:** ~2 hours
**Participants:** Pedro Meza (PM/CEO), Claude Code (Tech Lead)

**Major Milestones:**
1. ✅ Complete product vision defined
2. ✅ Full system architecture designed
3. ✅ Documentation structure created
4. ✅ GitHub repository initialized

**Key Insights:**
- The product is not just a bot, it's a platform for autonomous business operations
- Must architect for scale even though Phase 0 is single-tenant
- Documentation is critical for maintaining context across sessions

**Decisions Made:**
- Start with Emilio Born as pilot to validate before building full platform
- Use modular architecture to support future multi-tenant deployment
- Build documentation system to preserve knowledge across sessions

**Next Session Goals:**
- Complete all technical documentation files
- Initialize code repository structure
- Setup Docker development environment
- Begin WhatsApp client implementation

---

## Versioning Strategy

For Phase 0 (Pilot):
- Version format: 0.x.y
- 0.1.0 - Initial documentation and planning
- 0.2.0 - Project structure and infrastructure setup
- 0.3.0 - WhatsApp integration working
- 0.4.0 - AI engine and message handler
- 0.5.0 - Dashboard MVP
- 0.6.0 - Finance tracking
- 0.7.0 - Deployment to production
- 0.8.0 - Live testing and refinement
- 1.0.0 - Phase 0 complete, ready for production use

For Phase 1 (Multi-Tenant Platform):
- Version format: 1.x.y
- Major: Breaking architectural changes
- Minor: New features, agents, integrations
- Patch: Bug fixes, optimizations

---

[Unreleased]: https://github.com/gymtopz/lyrox-os/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/gymtopz/lyrox-os/releases/tag/v0.1.0

## [0.1.1] - 2025-10-31

### Added - Session 1 Part 2

#### Critical Architecture Decision
- **ADR-004: Avoid Double Work** - Most important decision of the project
  - Decision: Build multi-tenant architecture from day 1, deploy for single tenant
  - Problem solved: Eliminates 2-3 weeks of refactoring in Phase 1
  - Key principle: "Build for Many, Deploy for One, Scale to Many"

#### Documentation Updates
- Created comprehensive ADR-004 explaining multi-tenant from day 1 approach
- Updated ADR-002 with clarification (no hard-coding, no refactoring needed)
- Updated PROJECT_STATUS.md with correct 4-5 week timeline
- Updated README.md roadmap with accurate milestones
- Updated session notes with critical decision context

#### Timeline Adjustments
- Phase 0: Updated from 2-3 weeks to 4-5 weeks
- Reason: Including dashboard for Pedro to configure (not hard-coding)
- Phase 1: Reduced effort (only adds signup/billing, core unchanged)

### Context
Pedro asked the critical question: "¿No sería después doble trabajo?" This led to
the most important architectural decision: build correctly from day 1 to avoid
weeks of refactoring later.

The approach ensures:
- Pedro can configure everything via dashboard
- No code rewriting needed in Phase 1
- Architecture validated with real usage
- Faster path to multi-tenant platform

## [0.2.0] - 2025-10-31

### Added - Session 2 Part 1

#### Project Structure Initialization
- **Monorepo Setup** - Initialized pnpm workspace
  - Root package.json with workspace configuration
  - Shared tsconfig.json, prettier config
  - Apps: backend, frontend
  - Packages: types, config

#### Backend (NestJS)
- Created complete NestJS application structure
  - Main application entry point with Swagger documentation
  - Health check endpoint
  - Module directories for all features (auth, companies, products, customers, conversations, sales, whatsapp, metrics, agents)
  - Environment variable template (.env.example)
  - TypeScript configuration
  - Package.json with all dependencies

#### Database Layer
- **Prisma Schema** - Complete multi-tenant PostgreSQL schema
  - Users table with authentication
  - Companies table with WhatsApp configuration and brand personality
  - Products table with payment links
  - Customers table with stage tracking (lead → qualified → customer → churned)
  - Sales table with payment status
  - Agent logs for tracking AI operations
  - Subscriptions table (Phase 1 ready)
  - All tables include `company_id` for multi-tenant isolation
  - Proper indexes for performance
  - Enums for status fields

- **Seed Script** - Database seeding for Emilio Born
  - Creates Pedro user (pedro@example.com / temp-password-123)
  - Creates Emilio Born Coaching company
  - Creates 2 placeholder products (to be configured by Pedro in Week 4)
  - Includes placeholder brand personality prompt

#### Frontend (Next.js)
- Created complete Next.js 14 application structure
  - App router configuration
  - Tailwind CSS setup with shadcn/ui design system
  - TypeScript configuration
  - Environment variable template
  - Landing page with login/signup buttons
  - Global styles with CSS variables for theming
  - Utility functions (cn helper)
  - Package.json with all dependencies

#### Shared Packages
- **@lyrox/types** - Comprehensive TypeScript types
  - User types (User, UserStatus, CreateUserDto, AuthResponse)
  - Company types (Company, CreateCompanyDto, UpdateCompanyDto)
  - Product types (Product, CreateProductDto, UpdateProductDto)
  - Customer types (Customer, CustomerStage, CreateCustomerDto)
  - Conversation types (Message, Conversation, ConversationSummary)
  - Sale types (Sale, PaymentStatus, SaleWithDetails)
  - Agent types (AgentType, AgentLog, AgentEvent, AgentResponse)
  - API types (ApiResponse, PaginatedResponse, ErrorResponse, DashboardMetrics)

- **@lyrox/config** - Shared configuration constants
  - App configuration (name, version)
  - API configuration (timeout, prefix)
  - Pagination defaults
  - Rate limiting rules
  - Subscription plan limits
  - AI configuration (model, tokens, temperature)
  - WhatsApp configuration

#### Infrastructure
- **Docker Compose** - Complete development environment
  - PostgreSQL 15 with health checks
  - MongoDB 7 with health checks
  - Redis 7 with health checks
  - Data persistence with Docker volumes
  - All services configured with proper networking

#### Documentation
- Created SETUP.md with quick start guide
- Updated PROJECT_STATUS.md with progress (35% complete)
- Updated CHANGELOG.md with Session 2 details

### Technical Decisions
- Monorepo structure for better code sharing between apps
- Prisma for type-safe database access
- Shared packages to enforce consistent types across frontend/backend
- Docker Compose for reproducible local development
- All multi-tenant patterns in place from day 1

### Files Created
- 45+ files totaling ~3,500 lines of code
- Complete backend skeleton with NestJS
- Complete frontend skeleton with Next.js
- Full Prisma schema with all tables
- Comprehensive TypeScript types
- Docker development environment
- Environment templates
- Seed script

### Next Steps
- Install dependencies (`pnpm install`)
- Start Docker databases (`docker-compose up -d`)
- Run Prisma migrations (`pnpm prisma:migrate`)
- Seed database (`pnpm seed`)
- Start development servers (`pnpm dev`)
- Begin implementing WhatsApp client
- Integrate OpenAI for AI responses

### Context
This session focused on translating the comprehensive documentation from Session 1 into actual code structure. The entire monorepo was initialized with proper multi-tenant architecture from day 1, exactly as specified in ADR-004.

All database tables include `company_id`, all code reads from configuration (not hard-coded), and Pedro will be able to configure everything via the dashboard when it's ready in Week 4.

The project is now 35% complete and ready for the next phase: installing dependencies and getting the development environment running.

