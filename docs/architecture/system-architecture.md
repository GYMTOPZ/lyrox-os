# LYROX OS - System Architecture

**Version:** 0.1.0
**Last Updated:** 2025-10-31
**Status:** Draft - Phase 0 Design

---

## Table of Contents

1. [Overview](#overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [Agent System](#agent-system)
6. [Database Architecture](#database-architecture)
7. [Security Architecture](#security-architecture)
8. [Scalability Considerations](#scalability-considerations)

---

## Overview

LYROX OS is an autonomous business operating system built on a modular, agent-based architecture. The system is designed to be multi-tenant from the ground up, even though Phase 0 deploys for a single business.

### Core Principles

1. **Agent-Based:** Each business function is an autonomous AI agent
2. **Modular:** Agents can be enabled/disabled independently
3. **Scalable:** Architecture supports 1 to 10,000+ businesses
4. **Autonomous:** Minimal human intervention required
5. **Extensible:** New agents and integrations can be added without refactoring core

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Dashboard (Next.js)    │    External Channels       │  │
│  │  - Web UI               │    - WhatsApp              │  │
│  │  - Real-time updates    │    - Email                 │  │
│  │  - Configuration        │    - SMS                   │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTPS / WebSocket
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   APPLICATION LAYER                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            API Gateway (NestJS)                      │  │
│  │  - Authentication                                    │  │
│  │  - Rate limiting                                     │  │
│  │  - Request routing                                   │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │         ORCHESTRATOR (Brain)                         │  │
│  │  - Agent coordination                                │  │
│  │  - Event distribution                                │  │
│  │  - Decision routing                                  │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│         ┌───────────┼───────────┬──────────────┐          │
│         │           │           │              │          │
│         ▼           ▼           ▼              ▼          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ Customer │ │ Finance  │ │Retention │ │ Health   │    │
│  │ Acq.     │ │ Agent    │ │ Agent    │ │ Monitor  │    │
│  │ Agent    │ │          │ │          │ │ Agent    │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│       │             │             │             │          │
│       └─────────────┴─────────────┴─────────────┘          │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │           AI ENGINE                                  │  │
│  │  - OpenAI GPT-4o                                     │  │
│  │  - Prompt management                                 │  │
│  │  - Response parsing                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   INTEGRATION LAYER                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  WhatsApp  │  Email  │  Stripe  │  Shopify  │ ...   │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ PostgreSQL   │  │   MongoDB    │  │    Redis     │     │
│  │ (Structured) │  │(Conversations)│  │   (Cache)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. API Gateway

**Technology:** NestJS
**Responsibility:** Entry point for all requests

**Key Functions:**
- Authentication & authorization
- Request validation
- Rate limiting (prevent abuse)
- Request routing to appropriate services
- Error handling & logging

**Endpoints:**
```
POST   /api/auth/login
POST   /api/auth/signup
GET    /api/companies/:id
GET    /api/agents
POST   /api/agents/:id/activate
GET    /api/conversations
GET    /api/conversations/:id
GET    /api/metrics
POST   /api/integrations/whatsapp/connect
POST   /api/integrations/stripe/connect
WebSocket /ws/dashboard
```

---

### 2. Orchestrator (Brain)

**Purpose:** Central coordinator for all agents

**Architecture:**
```typescript
class Orchestrator {
  private agents: Map<AgentType, Agent>;
  private eventBus: EventEmitter;
  private memory: UnifiedMemory;

  async route(event: BusinessEvent): Promise<void> {
    // Determine which agents should handle this event
    const targetAgents = this.determineHandlers(event);

    // Distribute to all relevant agents
    await Promise.all(
      targetAgents.map(agent => agent.handle(event))
    );

    // Coordinate if agents need to communicate
    await this.coordinateAgents(targetAgents);
  }
}
```

**Key Responsibilities:**
- Receive events from integrations (new WhatsApp message, payment received, etc.)
- Route events to appropriate agents
- Coordinate multi-agent workflows
- Maintain shared context/memory
- Handle agent failures gracefully

---

### 3. Agent System

Each agent is an independent module with:
- Specific responsibility (acquisition, support, finance, etc.)
- Access to AI engine
- Access to unified memory
- Ability to trigger actions (send message, create sale record, etc.)

**Base Agent Interface:**
```typescript
interface Agent {
  type: AgentType;
  isEnabled: boolean;

  // Handle incoming event
  handle(event: BusinessEvent): Promise<AgentResponse>;

  // Access to AI
  generateResponse(context: Context): Promise<AIResponse>;

  // Access to memory
  getContext(customerId: string): Promise<CustomerContext>;
  saveContext(customerId: string, data: any): Promise<void>;

  // Trigger actions
  sendMessage(channel: Channel, content: string): Promise<void>;
  createSaleRecord(sale: Sale): Promise<void>;
}
```

---

### 4. AI Engine

**Purpose:** Centralized AI interface for all agents

**Architecture:**
```typescript
class AIEngine {
  private openai: OpenAI;
  private promptBuilder: PromptBuilder;

  async generate(request: AIRequest): Promise<AIResponse> {
    // Build context-aware prompt
    const prompt = await this.promptBuilder.build({
      systemPrompt: request.systemPrompt,
      brandPersonality: request.brandPersonality,
      conversationHistory: request.history,
      currentMessage: request.message,
      availableProducts: request.products,
      customerContext: request.customerContext
    });

    // Call OpenAI
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: prompt,
      temperature: 0.7,
      max_tokens: 500
    });

    // Parse and structure response
    return this.parseResponse(response);
  }
}
```

**Features:**
- Prompt template system
- Context injection (last N messages, customer info)
- Response parsing (extract intent, sentiment, actions)
- Token usage tracking
- Fallback handling (if API fails)

---

### 5. Integration Layer

**Purpose:** Abstract external services

**Pattern:** Adapter pattern for each integration

```typescript
interface Integration {
  type: IntegrationType;
  connect(credentials: Credentials): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Integration-specific methods
  // Example for messaging integrations:
  sendMessage?(recipient: string, message: string): Promise<void>;
  onMessage?(handler: MessageHandler): void;
}
```

**Integrations (Phase 0):**
- WhatsApp (whatsapp-web.js)
- Stripe (payments)
- Email (Gmail API) - optional

**Future Integrations:**
- Shopify
- PayPal
- Instagram
- Telegram
- Slack
- And 50+ more

---

### 6. Database Layer

**Multi-Database Strategy:**

#### PostgreSQL (Structured Data)
- Users & authentication
- Companies (tenants)
- Products & services
- Sales records
- Financial transactions
- Agent configurations

#### MongoDB (Flexible Data)
- Conversations (full message history)
- Customer profiles with dynamic metadata
- AI interaction logs
- Event stream

#### Redis (Cache & Queues)
- Session data
- Rate limiting counters
- Message queues (Bull)
- Real-time state (active conversations)

**See [database-schema.md](./database-schema.md) for detailed schemas.**

---

## Data Flow

### Example: Customer Sends WhatsApp Message

```
1. WhatsApp Message Arrives
   ↓
2. Integration Layer (WhatsApp adapter)
   - Extracts: phone, message, sender name
   ↓
3. Orchestrator receives "MESSAGE_RECEIVED" event
   - Determines: Customer Acquisition Agent should handle
   ↓
4. Customer Acquisition Agent
   - Queries: Customer history from database
   - Builds: Context (last 20 messages, customer info)
   ↓
5. AI Engine
   - Receives: Context + new message
   - Builds: Prompt (system + brand + context + message)
   - Calls: OpenAI API
   - Parses: Response (message + detected intent)
   ↓
6. Customer Acquisition Agent (continued)
   - Saves: Message + response to database
   - Detects: If sale was made
   - If sale: Triggers "SALE_COMPLETED" event
   ↓
7. Integration Layer (WhatsApp adapter)
   - Sends: Response back to customer
   ↓
8. Finance Agent (if sale was completed)
   - Receives: "SALE_COMPLETED" event
   - Records: Sale in database
   - Updates: Customer lifetime value
   ↓
9. Retention Agent (if sale was completed)
   - Receives: "SALE_COMPLETED" event
   - Schedules: Follow-up message in 3 days
   ↓
10. Dashboard (via WebSocket)
    - Receives: Real-time update
    - Updates: UI with new conversation/sale
```

**Total Time:** <5 seconds from message received to response sent

---

## Agent System (Detailed)

### Phase 0 Agents

#### 1. Customer Acquisition Agent

**Purpose:** Convert leads into customers

**Triggers:**
- New message from unknown number
- Message from known lead (not yet customer)

**Capabilities:**
- Respond naturally to inquiries
- Qualify leads (ask diagnostic questions)
- Offer relevant products
- Handle objections
- Close sales (send payment link)
- Detect when sale is completed

**AI Prompt Structure:**
```
SYSTEM: You are an AI customer acquisition agent...
BRAND: [Emilio Born personality]
CONTEXT: Customer history, past interactions
PRODUCTS: Available offerings with prices
TASK: Respond to the customer's latest message
RULES: [Sales strategies, tone guidelines]
```

---

#### 2. Finance Tracking Agent

**Purpose:** Monitor financial health

**Triggers:**
- Sale completed
- Refund requested
- End of day (generate report)

**Capabilities:**
- Record sales automatically
- Track daily/monthly revenue
- Calculate customer lifetime value
- Detect anomalies (sudden drop in sales)
- Generate financial reports

**No AI needed** (rule-based logic)

---

#### 3. Health Monitor Agent

**Purpose:** Ensure system is running smoothly

**Triggers:**
- Every 5 minutes (health check)
- Error occurs anywhere in system

**Capabilities:**
- Check WhatsApp connection status
- Monitor database health
- Track API error rates
- Measure response times
- Alert if issues detected

**No AI needed** (monitoring logic)

---

### Future Agents (Phase 1+)

- Retention Agent (prevent churn, upsells)
- Support Agent (handle post-sale questions)
- Marketing Agent (automated campaigns)
- Analytics Agent (insights & predictions)
- Inventory Agent (stock management)

---

## Database Architecture

### Multi-Tenancy Strategy

**Phase 0:** Single company, but database designed for multi-tenant

**Phase 1+:** Schema per tenant (for data isolation)

```
Database: lyrox_platform
├── users (platform users)
├── companies (tenants)
└── subscriptions

Database: lyrox_tenant_[company_id]
├── customers
├── conversations
├── products
├── sales
└── agent_configs
```

**Alternative:** Single database with `company_id` foreign key on all tables

**Decision:** TBD based on Phase 0 learnings

See [database-schema.md](./database-schema.md) for full schemas.

---

## Security Architecture

### Authentication & Authorization

**Platform Level:**
- JWT tokens for API authentication
- Refresh tokens for long-lived sessions
- Role-based access control (RBAC)

**Company Level:**
- Each company is isolated tenant
- Users can only access their company's data
- Admin users have elevated permissions

### Data Security

**At Rest:**
- Database encryption (PostgreSQL pgcrypto)
- Sensitive fields encrypted (AES-256)
- API keys stored in encrypted vault

**In Transit:**
- HTTPS only (TLS 1.3)
- WebSocket over SSL
- No sensitive data in logs

### API Security

- Rate limiting (10 req/sec per IP)
- Input validation (Joi schemas)
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitize inputs)
- CORS configured properly

---

## Scalability Considerations

### Current Architecture (Phase 0)

**Handles:**
- 1 company
- 100 concurrent conversations
- 10,000 messages/day
- 1,000 sales/month

**Infrastructure:**
- Single server (Railway)
- Single PostgreSQL instance
- MongoDB Atlas (shared cluster)
- Redis (single instance)

### Future Architecture (Phase 1+)

**Target:**
- 1,000+ companies
- 10,000+ concurrent conversations
- 1M+ messages/day
- 100K+ sales/month

**Infrastructure:**
- Horizontal scaling (multiple backend instances)
- Load balancer (NGINX)
- Database read replicas
- Redis cluster
- CDN for static assets (Cloudflare)

**Optimizations:**
- Agent worker pools (Bull queues)
- Database sharding (by company_id)
- Caching layer (Redis heavily used)
- Message queue for async processing
- Microservices (if needed)

---

## Technology Decisions

See ADRs for detailed reasoning:
- [ADR-001: Tech Stack](../decisions/001-tech-stack.md)
- [ADR-003: Agent Architecture](../decisions/003-agent-architecture.md)

---

## Next Steps

1. Implement core orchestrator
2. Build Customer Acquisition Agent
3. Create WhatsApp integration
4. Setup databases with initial schemas
5. Build simple dashboard to visualize

---

**Document Version:** 0.1.0
**Last Reviewed:** 2025-10-31
**Next Review:** After Phase 0 completion
