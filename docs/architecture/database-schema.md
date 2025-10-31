# LYROX OS - Database Schema

**Version:** 0.1.0
**Last Updated:** 2025-10-31
**Status:** Design Phase - Multi-Tenant Architecture

---

## Table of Contents

1. [Overview](#overview)
2. [Database Strategy](#database-strategy)
3. [PostgreSQL Schema](#postgresql-schema)
4. [MongoDB Collections](#mongodb-collections)
5. [Redis Keys](#redis-keys)
6. [Relationships](#relationships)
7. [Indexes](#indexes)
8. [Seed Data](#seed-data)

---

## Overview

LYROX OS uses a **multi-database strategy** optimized for different data types:

- **PostgreSQL:** Structured, relational data (users, companies, products, sales)
- **MongoDB:** Flexible, document data (conversations, messages)
- **Redis:** Cache, sessions, queues

**Critical Design Principle:**
> All business data tables include `company_id` for multi-tenant isolation from day 1.

See [ADR-004](../decisions/004-avoid-double-work.md) for rationale.

---

## Database Strategy

### Why Multi-Database?

**PostgreSQL for:**
- Data with strict relationships (users → companies → products)
- Financial transactions (need ACID guarantees)
- Data that rarely changes structure
- Need for complex joins

**MongoDB for:**
- Conversations (variable structure, nested messages)
- High write volume (every message is a write)
- Flexible schema (different businesses may log different metadata)
- Easy to query recent history

**Redis for:**
- Session data (fast, temporary)
- Rate limiting counters
- Message queues (Bull)
- Real-time state

---

## PostgreSQL Schema

### Core Tables

#### `users`
Platform users (business owners, admins)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  email_verified BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

---

#### `companies`
Each business using LYROX OS

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Business Info
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  website VARCHAR(500),

  -- AI Configuration
  brand_personality TEXT NOT NULL, -- The AI prompt
  system_prompt TEXT, -- Fixed system instructions (future)

  -- WhatsApp
  whatsapp_phone VARCHAR(20) UNIQUE,
  whatsapp_connected BOOLEAN DEFAULT FALSE,
  whatsapp_session_data JSONB, -- Session persistence
  whatsapp_last_connected TIMESTAMP,

  -- Status
  active BOOLEAN DEFAULT TRUE,
  subscription_plan VARCHAR(50) DEFAULT 'free', -- free, starter, pro, enterprise
  subscription_status VARCHAR(50) DEFAULT 'active',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_companies_owner ON companies(owner_id);
CREATE INDEX idx_companies_active ON companies(active);
CREATE INDEX idx_companies_whatsapp_phone ON companies(whatsapp_phone);
```

**Example Row (Emilio Born):**
```json
{
  "id": "emilio-born-pilot-123",
  "owner_id": "pedro-user-id",
  "name": "Emilio Born Coaching",
  "industry": "Fitness & Wellness",
  "brand_personality": "Eres Emilio Born, un coach fitness venezolano...",
  "whatsapp_phone": "+1305555XXXX",
  "whatsapp_connected": true,
  "active": true,
  "subscription_plan": "free"
}
```

---

#### `products`
Products/services offered by each company

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Product Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Payment
  payment_link TEXT, -- Stripe payment link or similar
  stripe_price_id VARCHAR(255), -- For Stripe integration

  -- Status
  active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_active ON products(company_id, active);
```

**Example Rows (Emilio Born):**
```json
[
  {
    "id": "prod-plan-personalizado",
    "company_id": "emilio-born-pilot-123",
    "name": "Plan Personalizado",
    "description": "Plan de entrenamiento y nutrición 100% personalizado",
    "price": 98.00,
    "payment_link": "https://buy.stripe.com/xxxxx",
    "active": true
  },
  {
    "id": "prod-reto-mensual",
    "company_id": "emilio-born-pilot-123",
    "name": "Reto Mensual",
    "description": "Reto de transformación de 30 días",
    "price": 78.00,
    "payment_link": "https://buy.stripe.com/yyyyy",
    "active": true
  }
]
```

---

#### `customers`
End customers (people who message the business)

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Customer Info
  phone VARCHAR(20) NOT NULL, -- Unique per company
  name VARCHAR(255),
  email VARCHAR(255),

  -- Status
  stage VARCHAR(50) DEFAULT 'lead', -- lead, qualified, customer, churned

  -- Metrics
  first_contact TIMESTAMP DEFAULT NOW(),
  last_interaction TIMESTAMP,
  total_interactions INTEGER DEFAULT 0,
  lifetime_value DECIMAL(10, 2) DEFAULT 0.00,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Metadata
  tags VARCHAR(100)[], -- ['interested-fitness', 'budget-conscious']
  metadata JSONB DEFAULT '{}'::jsonb,

  UNIQUE(company_id, phone) -- Phone unique per company
);

CREATE INDEX idx_customers_company ON customers(company_id);
CREATE INDEX idx_customers_phone ON customers(company_id, phone);
CREATE INDEX idx_customers_stage ON customers(company_id, stage);
CREATE INDEX idx_customers_last_interaction ON customers(last_interaction);
```

---

#### `sales`
Financial transactions (purchases)

```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,

  -- Sale Info
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Payment
  payment_method VARCHAR(50), -- stripe, paypal, etc
  payment_id VARCHAR(255), -- External payment ID
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, refunded

  -- Timestamps
  sale_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_sales_company ON sales(company_id);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(company_id, sale_date);
CREATE INDEX idx_sales_status ON sales(payment_status);
```

---

#### `agent_logs`
Activity logs from AI agents

```sql
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Agent Info
  agent_type VARCHAR(100) NOT NULL, -- customer-acquisition, finance, etc

  -- Event
  event_type VARCHAR(100) NOT NULL, -- message_sent, sale_recorded, etc
  event_data JSONB NOT NULL,

  -- Context
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- Metadata
  tokens_used INTEGER, -- For AI calls
  response_time_ms INTEGER,

  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_logs_company ON agent_logs(company_id);
CREATE INDEX idx_agent_logs_type ON agent_logs(agent_type);
CREATE INDEX idx_agent_logs_created ON agent_logs(created_at);
```

---

#### `subscriptions` (Phase 1)
Billing information

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Subscription Info
  plan VARCHAR(50) NOT NULL, -- free, starter, pro, enterprise
  status VARCHAR(50) NOT NULL, -- active, past_due, canceled

  -- Billing
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  canceled_at TIMESTAMP
);

CREATE INDEX idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
```

---

## MongoDB Collections

### `conversations`
Full conversation history per customer

```javascript
{
  _id: ObjectId("..."),

  // Tenant Isolation
  companyId: "emilio-born-pilot-123", // ⬅️ Multi-tenant key

  // Customer
  customerId: "customer-uuid-123",
  customerPhone: "+1786555XXXX",
  customerName: "Pedro García",

  // Messages
  messages: [
    {
      id: "msg_001",
      timestamp: ISODate("2025-11-01T10:30:00Z"),
      direction: "incoming", // incoming or outgoing
      sender: "customer", // customer or agent
      content: "Hola, me interesa el coaching",

      // AI Metadata (if outgoing)
      aiMetadata: {
        model: "gpt-4o",
        tokensUsed: 150,
        responseTime: 1200, // ms
        intent: "product_inquiry",
        sentiment: "positive",
        confidence: 0.89
      }
    },
    {
      id: "msg_002",
      timestamp: ISODate("2025-11-01T10:30:15Z"),
      direction: "outgoing",
      sender: "agent",
      content: "¡Hola Pedro! 💪 Cuéntame, ¿cuál es tu objetivo principal...",
      aiMetadata: { /* ... */ }
    }
    // ... more messages
  ],

  // Conversation Metadata
  stage: "qualified", // lead, qualified, customer
  lastInteraction: ISODate("2025-11-01T10:35:00Z"),
  messageCount: 12,

  // AI Summary (generated periodically)
  summary: {
    lastUpdated: ISODate("2025-11-01T10:35:00Z"),
    keyPoints: [
      "Objetivo: perder 10kg en 3 meses",
      "Presupuesto: hasta $100/mes",
      "Experiencia previa: ninguna"
    ],
    recommendedAction: "Ofrecer Plan Personalizado con descuento",
    sentiment: "positive"
  },

  // Tags
  tags: ["interested", "hot-lead", "budget-conscious"],

  // Timestamps
  createdAt: ISODate("2025-11-01T10:30:00Z"),
  updatedAt: ISODate("2025-11-01T10:35:00Z")
}
```

**Indexes:**
```javascript
db.conversations.createIndex({ companyId: 1, customerId: 1 });
db.conversations.createIndex({ companyId: 1, customerPhone: 1 });
db.conversations.createIndex({ companyId: 1, lastInteraction: -1 });
db.conversations.createIndex({ companyId: 1, stage: 1 });
```

---

## Redis Keys

### Session Data
```
session:{sessionId} → User session data (JWT payload)
TTL: 7 days
```

### Rate Limiting
```
rate_limit:{companyId}:{customerPhone} → Message count
TTL: 60 seconds
Max: 10 messages per minute
```

### WhatsApp Connection State
```
whatsapp_state:{companyId} → Connection status
Values: "connected", "disconnected", "qr_pending"
TTL: None (persists)
```

### Message Queue (Bull)
```
Queue: message_processing
Jobs: { companyId, customerId, message, timestamp }
```

### Conversation Context Cache
```
conversation_context:{companyId}:{customerId} → Last 20 messages
TTL: 1 hour
```

---

## Relationships

```
users (1) ──── (M) companies
                    │
                    ├──── (M) products
                    ├──── (M) customers
                    │          │
                    │          └──── (M) sales
                    │
                    └──── (M) agent_logs

MongoDB:
conversations linked via: companyId + customerId
```

---

## Indexes

### Performance-Critical Indexes

**PostgreSQL:**
```sql
-- Multi-tenant queries (most common)
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_customers_company_phone ON customers(company_id, phone);
CREATE INDEX idx_sales_company_date ON sales(company_id, sale_date DESC);

-- Dashboard queries
CREATE INDEX idx_customers_last_interaction ON customers(company_id, last_interaction DESC);
CREATE INDEX idx_agent_logs_company_created ON agent_logs(company_id, created_at DESC);
```

**MongoDB:**
```javascript
// Most common query: Get conversation by phone
db.conversations.createIndex(
  { companyId: 1, customerPhone: 1 },
  { unique: true }
);

// Dashboard: Recent conversations
db.conversations.createIndex(
  { companyId: 1, lastInteraction: -1 }
);
```

---

## Seed Data

### Phase 0: Emilio Born Company

Script: `scripts/seed-emilio-born.ts`

```typescript
import { db } from './db';

async function seed() {
  // 1. Create user (Pedro)
  const user = await db.users.create({
    email: 'pedro@example.com',
    password_hash: await hash('temp-password-123'),
    name: 'Pedro Meza',
    email_verified: true
  });

  // 2. Create company (Emilio Born)
  const company = await db.companies.create({
    id: 'emilio-born-pilot',
    owner_id: user.id,
    name: 'Emilio Born Coaching',
    industry: 'Fitness & Wellness',
    brand_personality: `
      Eres Emilio Born, un coach fitness venezolano radicado en Miami.
      [FULL PROMPT WILL BE PROVIDED BY PEDRO IN WEEK 4]
    `,
    active: true,
    subscription_plan: 'free'
  });

  // 3. Create products (to be updated by Pedro via dashboard)
  await db.products.createMany([
    {
      company_id: company.id,
      name: 'Plan Personalizado',
      description: 'Placeholder - Pedro will update',
      price: 98.00,
      active: true
    },
    {
      company_id: company.id,
      name: 'Reto Mensual',
      description: 'Placeholder - Pedro will update',
      price: 78.00,
      active: true
    }
  ]);

  console.log('✅ Emilio Born company seeded');
  console.log(`Company ID: ${company.id}`);
  console.log(`User email: ${user.email}`);
}

seed();
```

**Run:**
```bash
npm run seed:emilio-born
```

---

## Migration Strategy

### Phase 0
- All tables created with company_id from day 1
- Only 1 company exists (Emilio Born)
- Seed script creates initial data

### Phase 1
- NO schema changes needed (already multi-tenant)
- Add subscriptions table for billing
- Add indexes for performance (if needed based on usage)

### Future Phases
- Add tables for new features (marketing campaigns, automations, etc.)
- All follow same pattern: include company_id

---

## Data Isolation

### Multi-Tenant Security

**Every query MUST filter by company_id:**

✅ **CORRECT:**
```typescript
const products = await db.products.findMany({
  where: { companyId: company.id }
});
```

❌ **WRONG:**
```typescript
const products = await db.products.findMany();
// Returns data from ALL companies! Security breach!
```

**Enforcement:**
- Use Prisma middleware to auto-inject company_id filter
- API endpoints always require authentication with companyId
- Database views per company (optional, for extra safety)

---

## Backup Strategy

### PostgreSQL
- Daily automated backups (Railway built-in)
- Point-in-time recovery enabled
- Retention: 7 days (Phase 0), 30 days (Production)

### MongoDB
- MongoDB Atlas automated backups
- Continuous backup with point-in-time restore
- Retention: 7 days (free tier)

### Redis
- No persistence needed (cache only)
- Data can be regenerated from PostgreSQL/MongoDB

---

## Performance Targets

**Phase 0:**
- Database size: <100 MB
- Queries: <100ms (95th percentile)
- Concurrent connections: <50

**Phase 1 (1000 companies):**
- Database size: ~10 GB
- Queries: <200ms (95th percentile)
- Concurrent connections: 500

**Scaling Strategy:**
- Add read replicas (PostgreSQL)
- Shard by company_id if needed (unlikely until 10,000+ companies)
- Use connection pooling (PgBouncer)

---

## Next Steps

1. Create Prisma schema from this design
2. Create MongoDB connection with Mongoose schemas
3. Setup Redis connection
4. Create seed scripts
5. Test multi-tenant isolation

---

**Document Version:** 0.1.0
**Last Reviewed:** 2025-10-31
**Next Review:** After Phase 0 implementation
