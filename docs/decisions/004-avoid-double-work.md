# ADR-004: Build Multi-Tenant Architecture from Day 1 (Avoid Double Work)

**Date:** 2025-10-31
**Status:** ✅ Accepted
**Deciders:** Pedro Meza (PM/CEO), Claude Code (Tech Lead)
**Tags:** #architecture #strategy #critical-decision
**Supersedes:** Clarifies ADR-002 (Pilot-First Approach)

---

## Context

In ADR-002, we decided on a "pilot-first" approach: start with Emilio Born business, then scale to multi-tenant platform. However, this created ambiguity:

**The Confusion:**
- Should we hard-code Emilio Born config in Phase 0?
- Would we need to rewrite code in Phase 1 to make it multi-tenant?
- Is this creating double work?

**Pedro's Critical Question (Oct 31, 2025):**
> "¿No sería después doble trabajo tener que volver a escribir el código para que el sistema funcione diferente después?"

**Answer:** YES, if we do it wrong. NO, if we architect correctly from day 1.

---

## Decision

**We will build with multi-tenant architecture from Day 1, but deploy for single tenant in Phase 0.**

### Principle

> **"Build for Many, Deploy for One, Scale to Many"**

### What This Means

#### Phase 0 Implementation:
✅ **Database schema designed for multiple companies**
```sql
companies (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  brand_personality TEXT,
  ...
)

products (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies,  -- Multi-tenant ready
  name VARCHAR(255),
  ...
)

conversations (
  id UUID PRIMARY KEY,
  company_id UUID,  -- Multi-tenant ready
  ...
)
```

✅ **Code reads from configuration (not hard-coded)**
```typescript
// CORRECT from Day 1
const company = await db.companies.findById(companyId);
const prompt = company.brandPersonality;
const products = await db.products.findByCompany(companyId);

// WRONG (what we WON'T do)
const PROMPT = "Eres Emilio Born...";  // Hard-coded
const PRODUCTS = [{...}];  // Hard-coded
```

✅ **Dashboard with configuration UI**
- Pedro can edit prompt via textarea
- Pedro can add/edit products
- Pedro can connect WhatsApp via QR

❌ **What we DON'T build in Phase 0:**
- Public signup (only Pedro has access)
- Onboarding flow for new users
- Billing/subscription system
- Marketing website

### Phase 0 Setup Process

**How we create Emilio Born company:**

```typescript
// scripts/seed-emilio-born.ts
await db.companies.create({
  id: 'emilio-born-pilot',
  name: 'Emilio Born Coaching',
  brandPersonality: `[Pedro's prompt]`,
  whatsappPhone: null,  // Set via dashboard
  active: true
});

// Create Pedro's admin user
await db.users.create({
  email: 'pedro@example.com',
  password: hash('temp-password'),
  companyId: 'emilio-born-pilot',
  role: 'owner'
});
```

Run once: `npm run seed:emilio-born`

### Phase 1 Changes

When we add multi-tenant capability:

✅ **Core code: NO CHANGES** (already multi-tenant)
✅ **Database: NO CHANGES** (already supports multiple companies)

✅ **NEW code only:**
- Signup flow
- Onboarding wizard
- Stripe integration
- Company creation API
- Multi-user management

**Estimated refactoring: 0-5%** (adding features, not rewriting core)

---

## Rationale

### Why This Approach?

**1. Eliminates Double Work**
- Write core logic once
- Phase 1 adds features on top (doesn't rewrite)

**2. Validates Architecture Early**
- If multi-tenant design has flaws, we discover in Phase 0
- Cheaper to fix early than after scaling

**3. Faster to Phase 1**
- No "refactoring phase" needed
- Just add signup/billing features

**4. Better Code Quality**
- Forced to think about multi-tenancy from start
- No "quick hacks" that need cleanup later

**5. Pedro Can Configure Everything**
- Even in Phase 0, Pedro uses dashboard (not asking Claude to edit code)
- Same experience future customers will have

---

## Trade-offs Analyzed

### Option A: Hard-Code in Phase 0 (REJECTED ❌)

**Approach:**
```typescript
// Phase 0
const EMILIO_PROMPT = "...";
const EMILIO_PRODUCTS = [...];

// Phase 1 - REWRITE 60% of code
const prompt = await getFromDB();
const products = await getFromDB();
```

**Pros:**
- Faster to start (maybe 1 week faster)
- Simpler initially

**Cons:**
- 60% code rewrite in Phase 1
- 2-3 weeks of refactoring work
- High risk of bugs during refactor
- Pedro can't configure (needs Claude to edit code)
- Architecture not validated until Phase 1

**Verdict:** Saves 1 week now, costs 3 weeks later. **Rejected.**

---

### Option B: Full Platform in Phase 0 (REJECTED ❌)

**Approach:**
- Build signup, onboarding, billing in Phase 0
- Everything ready for multiple customers day 1

**Pros:**
- Commercially ready immediately
- No Phase 1 needed

**Cons:**
- 8-10 weeks development (vs 4-5 weeks)
- Building features before validating concept
- Higher initial investment

**Verdict:** Over-engineering before validation. **Rejected.**

---

### Option C: Multi-Tenant Architecture, Single Deployment (ACCEPTED ✅)

**Approach:**
- Architecture supports N companies from day 1
- Database has company_id everywhere
- Code reads from configuration
- Dashboard exists but no signup
- Only 1 company (Emilio Born) in Phase 0

**Pros:**
- NO refactoring needed in Phase 1
- Pedro can configure via dashboard
- Architecture validated early
- 4-5 week timeline (acceptable)
- Phase 1 adds features (doesn't rewrite)

**Cons:**
- Slightly more complex than hard-coding
- Need to build basic dashboard in Phase 0

**Verdict:** Best balance. **Accepted.**

---

## Implementation Guidelines

### Database Design Rules

**✅ DO:**
```sql
-- Every table with business data has company_id
CREATE TABLE products (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR(255),
  ...
);

CREATE INDEX idx_products_company ON products(company_id);
```

**❌ DON'T:**
```sql
-- No company_id = hardcoded for one business
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  ...
);
```

---

### Code Pattern Rules

**✅ DO:**
```typescript
// Always pass companyId
async getProducts(companyId: string): Promise<Product[]> {
  return db.products.findMany({
    where: { companyId }
  });
}

// Use in agent
const products = await this.getProducts(company.id);
```

**❌ DON'T:**
```typescript
// Global/hardcoded config
const PRODUCTS = [
  { name: "Plan Personalizado", price: 98 }
];

// Use in agent
const products = PRODUCTS;
```

---

### Configuration Pattern

**✅ DO:**
```typescript
// Read from database
const company = await db.companies.findById(companyId);
const config = {
  brandName: company.name,
  personality: company.brandPersonality,
  products: await db.products.findByCompany(companyId)
};
```

**❌ DON'T:**
```typescript
// Environment variables or hardcoded
const config = {
  brandName: process.env.BRAND_NAME,
  personality: EMILIO_PROMPT,
  products: HARDCODED_PRODUCTS
};
```

---

## Phase 0 Scope (Clarified)

### What We Build

**Week 1-2: Core System**
- ✅ Multi-tenant database schema
- ✅ WhatsApp integration (company-specific)
- ✅ AI engine (reads company config)
- ✅ Message handler
- ✅ Seed script for Emilio Born

**Week 3: Dashboard (Read-Only)**
- ✅ Login (basic auth, only Pedro)
- ✅ View conversations in real-time
- ✅ View metrics (messages, sales)

**Week 4: Dashboard (Configuration)**
- ✅ Edit brand personality (textarea)
- ✅ Manage products (add, edit, delete)
- ✅ Connect WhatsApp (QR code)
- ✅ View/edit WhatsApp status

**Week 5: Testing & Deploy**
- ✅ End-to-end testing
- ✅ Deploy to Railway/Vercel
- ✅ 7-day live test with real customers
- ✅ Monitor and fix issues

### What We DON'T Build (Phase 1)

- ❌ Public signup page
- ❌ Onboarding wizard for new companies
- ❌ Billing/subscription system (Stripe)
- ❌ Multi-user per company
- ❌ Marketing website
- ❌ Email verification
- ❌ Password reset flow
- ❌ Advanced analytics

---

## Success Criteria

### Phase 0 Complete When:

✅ **Functionality:**
- [ ] Bot responds 24/7 automatically
- [ ] At least 1 real sale completed by AI
- [ ] System runs 7 days without crashes
- [ ] Response time <5 seconds (95th percentile)

✅ **Configuration:**
- [ ] Pedro can edit prompt via dashboard
- [ ] Pedro can add/edit products via dashboard
- [ ] Pedro can connect WhatsApp via dashboard
- [ ] Changes take effect immediately (no code deploy needed)

✅ **Architecture:**
- [ ] All tables have company_id where appropriate
- [ ] Code never hardcodes business logic
- [ ] Database supports multiple companies (even if only 1 exists)
- [ ] No global state or singletons for business config

✅ **Documentation:**
- [ ] Database schema documented
- [ ] API endpoints documented
- [ ] Configuration flow documented

**Only after these are met, proceed to Phase 1.**

---

## Phase 1 Scope (Preview)

When Phase 0 is successful, Phase 1 adds:

**Week 1-2: Authentication System**
- Public signup page
- Email verification
- Password reset
- JWT authentication

**Week 3-4: Onboarding Flow**
- Company creation wizard
- Connect integrations (WhatsApp, Stripe)
- Brand personality setup
- Product configuration

**Week 5-6: Billing**
- Stripe integration
- Subscription plans
- Payment processing
- Invoicing

**Week 7-8: Polish & Launch**
- Marketing website
- Documentation
- Customer support system
- Public launch

**Core codebase changes: Minimal** ✅

---

## Monitoring Plan

### Validation Checkpoints

**After Week 2:**
- Review: Is multi-tenant architecture working?
- Check: Can we easily configure for different businesses?
- Test: Create dummy second company in DB

**After Week 4:**
- Review: Is dashboard sufficient for configuration?
- Check: Can Pedro change config without Claude's help?
- Test: Pedro changes prompt and sees effect immediately

**End of Phase 0:**
- Review: What would need to change for Phase 1?
- Document: List of Phase 1 features
- Estimate: Time needed for Phase 1 (should be ~6 weeks, not 10+)

---

## Conclusion

**This decision is CRITICAL to project success.**

By building multi-tenant architecture from day 1 while deploying for single tenant:
- ✅ We avoid 2-3 weeks of refactoring work
- ✅ We validate architecture early
- ✅ Pedro can configure everything himself
- ✅ Phase 1 becomes feature addition (not rewrite)
- ✅ Timeline is reasonable (4-5 weeks)

**Key Principle:**
> "The best way to avoid double work is to do it right the first time."

---

## References

- [ADR-002: Pilot-First Approach](./002-pilot-first.md) - Strategy context
- [ADR-003: Agent Architecture](./003-agent-architecture.md) - How agents fit in

---

**Status:** Accepted and will be implemented
**Last Updated:** 2025-10-31
**Impact:** Critical - Defines entire Phase 0 approach
