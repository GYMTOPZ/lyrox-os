# LYROX OS

> **Autonomous Business Operating System**
> Transform any business into a self-operating AI-powered company

[![Status](https://img.shields.io/badge/status-in%20development-yellow)](https://github.com/gymtopz/lyrox-os)
[![Phase](https://img.shields.io/badge/phase-0%20pilot-blue)](./docs/business/roadmap.md)
[![License](https://img.shields.io/badge/license-Proprietary-red)]()

---

## 🎯 Vision

LYROX OS is a platform that converts any business into an autonomous company operated by AI agents. Connect your communication channels (WhatsApp, Email, etc.), payment processors (Stripe, PayPal), and business tools - then let our AI agents handle sales, support, finance tracking, customer retention, and business analytics 24/7 without human intervention.

### The Future of Business Operations

```
Traditional Company              LYROX-Powered Company
─────────────────               ─────────────────────
👤 Customer Service Team   →    🤖 AI Customer Agent (24/7)
👤 Sales Team              →    🤖 AI Acquisition Agent
👤 Finance Manager         →    🤖 AI Finance Agent
👤 Retention Specialist    →    🤖 AI Retention Agent
📊 Manual Reports          →    🤖 AI Analytics Agent

Cost: $200K-500K/year          Cost: $99-999/month
Availability: 9-5, M-F         Availability: 24/7/365
Response Time: Minutes-Hours   Response Time: <5 seconds
Scalability: Limited           Scalability: Infinite
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│              LYROX OS PLATFORM                      │
│            (Multi-Tenant SaaS)                      │
└─────────────────┬───────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
[Company A]  [Company B]  [Company C]
    │             │             │
    └─────────────┴─────────────┘
                  │
         Each Company Has:
                  │
    ┌─────────────┴─────────────┐
    │     AUTONOMOUS BRAIN      │
    │  (AI Orchestrator)        │
    └─────────────┬─────────────┘
                  │
    ┌─────────────┴─────────────┐
    │                           │
    ▼                           ▼
[AGENT MODULES]          [INTEGRATIONS]
- Acquisition            - WhatsApp
- Support                - Email
- Retention              - Stripe
- Finance                - Shopify
- Analytics              - And 50+ more
```

---

## 🚀 Current Status

**Phase:** Phase 0 - Pilot (Emilio Born Coaching)
**Progress:** 15% - Documentation & Architecture Complete
**Next Milestone:** WhatsApp Agent MVP (Week 1-2)

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for real-time status.

---

## 📦 Project Structure

```
lyrox-os/
├── apps/
│   ├── backend/              # NestJS API + AI Agents
│   └── frontend/             # Next.js Dashboard
│
├── packages/
│   ├── types/                # Shared TypeScript types
│   └── config/               # Shared configuration
│
├── docs/
│   ├── architecture/         # System design docs
│   ├── development/          # Dev guides
│   ├── agents/               # Agent specifications
│   ├── integrations/         # Integration guides
│   ├── deployment/           # Deploy instructions
│   ├── business/             # Product & business docs
│   ├── decisions/            # Architecture Decision Records
│   └── sessions/             # Session notes & progress
│
├── scripts/
│   └── auto-docs.ts          # Auto-documentation system
│
├── docker-compose.yml        # Local development environment
├── PROJECT_STATUS.md         # Current project status
├── CHANGELOG.md              # History of changes
└── README.md                 # This file
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** NestJS (TypeScript)
- **AI Engine:** OpenAI GPT-4o
- **Queue System:** Bull + Redis

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui
- **State:** Zustand

### Databases
- **SQL:** PostgreSQL 15 (structured data)
- **NoSQL:** MongoDB 7 (conversations)
- **Cache:** Redis 7
- **Vector:** Pinecone (future: semantic search)

### Infrastructure
- **Development:** Docker Compose
- **Production:** Railway (backend) + Vercel (frontend)
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry + Custom logging

### Key Integrations
- WhatsApp (whatsapp-web.js)
- Stripe (payments)
- Gmail API (email)
- Shopify (e-commerce - future)
- 50+ more planned

---

## 📚 Documentation

### For Developers
- [System Architecture](./docs/architecture/system-architecture.md)
- [Setup Guide](./docs/development/setup-guide.md)
- [API Documentation](./docs/architecture/api-documentation.md)
- [Coding Standards](./docs/development/coding-standards.md)
- [Testing Strategy](./docs/development/testing-strategy.md)

### For Product/Business
- [Product Requirements](./docs/business/product-requirements.md)
- [Roadmap](./docs/business/roadmap.md)
- [Emilio Born Config](./docs/business/emilio-born-config.md)

### Architecture Decisions
- [ADR-001: Tech Stack Selection](./docs/decisions/001-tech-stack.md)
- [ADR-002: Pilot-First Approach](./docs/decisions/002-pilot-first.md)
- [ADR-003: Agent Architecture](./docs/decisions/003-agent-architecture.md)

---

## 🎯 Roadmap

### Phase 0: Pilot - Emilio Born Coaching (Current)
**Timeline:** 2-3 weeks
**Goal:** Validate concept with real business

- ✅ Architecture & documentation
- 🔨 WhatsApp Customer Acquisition Agent
- 🔨 Basic finance tracking
- 🔨 Simple monitoring dashboard
- ⏳ Deploy to production
- ⏳ 7-day live test with real customers

### Phase 1: Multi-Tenant Platform
**Timeline:** 8-10 weeks
**Goal:** Convert to SaaS that others can use

- Multi-tenant architecture
- User signup/login system
- Onboarding flow
- 3 core agents (Acquisition, Finance, Analytics)
- Professional dashboard
- Stripe integration for payments

### Phase 2: Advanced Agents
**Timeline:** 3-4 months

- Retention Agent
- Support Agent
- Marketing Automation Agent
- More integrations (Shopify, PayPal, Email)

### Phase 3: Enterprise Features
**Timeline:** 6+ months

- Advanced ML predictions
- Custom agent marketplace
- White-label options
- API for custom development

See [full roadmap](./docs/business/roadmap.md) for details.

---

## 🔐 Security & Privacy

- End-to-end encryption for sensitive data
- API keys stored securely (never in code)
- SOC 2 compliance planned (Phase 2)
- GDPR/CCPA compliant
- Regular security audits
- Customer data isolation (multi-tenant)

---

## 💰 Business Model (Future)

### SaaS Pricing Tiers

**Starter:** $99/month
- 3 AI agents
- 1,000 interactions/month
- 3 integrations
- Email support

**Professional:** $299/month
- 6 AI agents
- 10,000 interactions/month
- All integrations
- Priority support

**Enterprise:** Custom pricing
- Unlimited agents
- Unlimited interactions
- White-label
- Dedicated support
- SLA guarantees

---

## 🤝 Contributing

This is currently a private project in active development.

**Core Team:**
- **Pedro Meza** ([@gymtopz](https://github.com/gymtopz)) - Product Manager & CEO
- **Claude Code** - Technical Lead & Development

---

## 📞 Contact

- **GitHub:** [@gymtopz](https://github.com/gymtopz)
- **Project Issues:** [GitHub Issues](https://github.com/gymtopz/lyrox-os/issues)

---

## 📜 License

Proprietary - All Rights Reserved

Copyright (c) 2025 Pedro Meza

---

## 🔗 Quick Links

- [Project Status](./PROJECT_STATUS.md) - Current progress
- [Changelog](./CHANGELOG.md) - History of changes
- [Setup Guide](./docs/development/setup-guide.md) - Get started developing
- [Architecture Docs](./docs/architecture/) - Technical deep-dive

---

**Built with ❤️ by humans, operated by AI**
