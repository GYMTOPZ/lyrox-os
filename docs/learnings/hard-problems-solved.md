# Hard Problems Solved (10+ Iterations)

**Last Updated:** 2025-11-01
**Purpose:** Document challenges that took significant iteration to resolve

---

## 1. Understanding the True Product Vision (15+ iterations)

### The Problem
Initial conversation started with "WhatsApp bot for Emilio Born" but the actual vision was much bigger.

### Iterations Required
- **Iteration 1-3:** Thought it was a simple chatbot for one business
- **Iteration 4-7:** Realized it's multi-tenant SaaS but still thinking single agent
- **Iteration 8-12:** User kept saying "cada cliente" (each customer) but I kept thinking "each business"
- **Iteration 13-15:** FINALLY understood: Agent-per-customer architecture (revolutionary)

### The Breakthrough
User said: "cada mensaje que llegue genere un agente especialmente para ese usuario"

Translation: Each incoming message generates an agent SPECIFICALLY for that user.

### Why It Was Hard
- Language barrier (Spanish/English context switching)
- User described end-state, I kept thinking MVP
- Conceptual leap: Not "chatbot" → "autonomous employee per customer"

### Solution
PermanentCustomerAgent architecture where each customer gets dedicated AI agent forever.

### Lesson Learned
When user keeps repeating something ("cada cliente"), they're trying to emphasize something you're missing. Stop and ask directly.

---

## 2. Monorepo Build Path Issues (12+ iterations)

### The Problem
```
Error: Cannot find module '/dist/main'
```

### Iterations Required
- **Iteration 1-3:** Tried standard NestJS paths
- **Iteration 4-7:** Realized monorepo creates nested structure
- **Iteration 8-10:** Tested various dist paths
- **Iteration 11-12:** Found correct path: `dist/apps/backend/src/main.js`

### Why It Was Hard
- NestJS + pnpm workspace + monorepo = non-standard paths
- Documentation assumes single-app structure
- No clear error message about where it's looking

### Solution
```bash
# Wrong
node dist/main.js

# Correct
node dist/apps/backend/src/main.js
```

### Lesson Learned
Monorepos need explicit path mapping. Always verify dist output structure after build.

---

## 3. Multi-Tenant From Day 1 Decision (10+ iterations)

### The Problem
Should we build for one business first or multi-tenant immediately?

### Iterations Required
- **Iteration 1-3:** User said "pilot first" → I designed single-tenant
- **Iteration 4-6:** User mentioned "other businesses later" → I suggested migration path
- **Iteration 7-9:** User kept asking about "avoiding double work"
- **Iteration 10:** FINALLY created ADR-004: Build multi-tenant, deploy for one

### Why It Was Hard
- Tension between "move fast" and "avoid technical debt"
- User wanted both but couldn't articulate it initially
- Required understanding user's long-term vision vs immediate needs

### Solution
**Build for Many, Deploy for One, Scale to Many**

- Database has `company_id` from day 1
- Code reads from config (never hard-coded)
- Dashboard controls everything
- Phase 1 only adds signup/billing (core unchanged)

### Lesson Learned
When user says "avoid double work" repeatedly, they want architecture that scales WITHOUT refactoring. Don't just plan migration - prevent it.

---

## 4. WhatsApp Integration Approach (8+ iterations)

### The Problem
Which WhatsApp API to use: whatsapp-web.js vs Business API?

### Iterations Required
- **Iteration 1-2:** Suggested Business API (official, safe)
- **Iteration 3-4:** User balked at complexity and approval process
- **Iteration 5-6:** Suggested whatsapp-web.js but warned about risks
- **Iteration 7-8:** User revealed scale (300-1000 customers) → Had to reconsider

### Why It Was Hard
- Trade-off between speed and stability
- Unknown: Will Facebook ban the account?
- Unknown: Can it handle 1000 customers?

### Solution
Use whatsapp-web.js for pilot with strict guardrails:
- Only respond to incoming messages (never spam)
- Human-like delays
- Plan migration to Business API before scaling beyond pilot

### Lesson Learned
For pilots, "good enough + fast" beats "perfect + slow". But always have migration path ready.

---

## 5. Cost Analysis: OpenAI vs Claude vs Others (6+ iterations)

### The Problem
Which AI provider to use for agent reasoning?

### Iterations Required
- **Iteration 1-2:** User asked about Claude (because I'm Claude)
- **Iteration 3-4:** Analyzed pricing: Claude $3/M tokens vs OpenAI GPT-4o-mini $0.15/M
- **Iteration 5-6:** User mentioned Chinese models, did research on alternatives

### Why It Was Hard
- Balancing quality vs cost vs complexity
- Fine-tuning open-source models = more work
- Need to project costs at scale (1000s of customers)

### Solution
**GPT-4o-mini:**
- 20x cheaper than Claude
- Quality sufficient for sales conversations
- Fast responses (<200ms)
- Proven at scale

**Math:**
- 1000 customers × 10 msgs/month = $100-150/month
- vs Claude = $800-1200/month
- vs fine-tuned open-source = $400/month + engineering time

### Lesson Learned
For conversational AI, cost-per-interaction matters more than marginal quality improvements. 95% quality at 5% cost wins.

---

## 6. Prisma Decimal Type Issues (5+ iterations)

### The Problem
```typescript
Type 'Decimal' is not assignable to type 'number'
```

### Iterations Required
- **Iteration 1-2:** Tried casting with `as number`
- **Iteration 3-4:** Realized Decimal is Prisma object, not primitive
- **Iteration 5:** Found correct solution: `parseFloat(price.toString())`

### Why It Was Hard
- Prisma Decimal type looks like number but isn't
- TypeScript strict mode caught it
- No clear documentation on conversion

### Solution
```typescript
const products = company.products.map(p => ({
  ...p,
  price: parseFloat(p.price.toString())
}));
```

### Lesson Learned
Always convert Prisma Decimal to number when passing to external APIs or AI.

---

## 7. Customer Schema Field Mismatches (4+ iterations)

### The Problem
Code used `source` and `status` fields that don't exist in Prisma schema.

### Iterations Required
- **Iteration 1:** Got TypeScript error about missing `source`
- **Iteration 2:** Found schema uses `stage` instead
- **Iteration 3:** Updated code to use `stage`
- **Iteration 4:** Realized `status` was also wrong, removed it

### Why It Was Hard
- Code was written before checking actual schema
- Field names seemed reasonable (`status`, `source`)
- Had to trace through Prisma schema to find correct fields

### Solution
Use `stage` field with `CustomerStage` enum:
- LEAD
- CUSTOMER
- ACTIVE_USER
- CHURNED

### Lesson Learned
ALWAYS read the Prisma schema before writing business logic. Don't assume field names.

---

## 8. QR Code Visibility Issue (ONGOING - 10+ iterations so far)

### The Problem
User can't see QR code in terminal.

### Iterations Required
- **Iteration 1-3:** Showed QR from background process logs
- **Iteration 4-6:** User said "I don't see anything"
- **Iteration 7-8:** Tried to restart server in foreground
- **Iteration 9-10:** Server keeps running in background
- **CURRENT:** User sent screenshot - QR hasn't appeared yet

### Why It's Hard
- Server running in background (not visible to user)
- WhatsApp initialization takes time (downloading Puppeteer/Chrome)
- Multiple server instances running simultaneously
- Terminal output not visible to user in this chat interface

### Current Status
Server is initializing WhatsApp but QR hasn't appeared yet. Likely downloading Chrome headless in background.

### Lesson Learned (In Progress)
When user needs to see terminal output:
1. Kill all background processes first
2. Give user command to run in THEIR terminal
3. Don't run server in background via tools

---

## 9. Agent-per-Customer Memory Architecture (7+ iterations)

### The Problem
How to structure agent memory for thousands of permanent agents?

### Iterations Required
- **Iteration 1-2:** Thought of single conversation collection
- **Iteration 3-4:** Realized need agent-specific memory
- **Iteration 5-6:** Designed MongoDB document per agent
- **Iteration 7:** Finalized with lifecycle tracking and insights

### Why It Was Hard
- Need to store unlimited conversation history
- Need to track customer lifecycle (LEAD → CUSTOMER → etc)
- Need AI-generated insights per customer
- Need to scale to 10,000+ agents

### Solution
MongoDB document per agent:
```javascript
{
  customerPhone: "+52...",
  companyId: "uuid",
  messages: [...], // Full conversation history
  lifecycle: {...}, // Journey tracking
  insights: {...}, // AI-generated understanding
  metadata: {...}  // Agent stats
}
```

### Lesson Learned
When building agent systems, memory structure IS the architecture. Document design determines what agents can remember and how intelligent they can be.

---

## Summary Statistics

- **Total hard problems:** 9 (1 ongoing)
- **Average iterations per problem:** 9.2
- **Total iterations across all problems:** 83+
- **Time invested in problem-solving:** ~60% of session time
- **Time saved by documenting:** Unmeasurable (prevents future re-solving)

---

## Meta Learning

### What Makes a Problem "Hard"?

1. **Conceptual misalignment** (vision, architecture)
2. **Hidden complexity** (monorepo paths, type systems)
3. **Trade-off decisions** (speed vs quality, cost vs performance)
4. **Tool/framework quirks** (Prisma types, NestJS paths)
5. **Communication gaps** (language, context, assumptions)

### How to Solve Hard Problems Faster

1. **Ask clarifying questions earlier** (don't assume)
2. **Read the actual code/schema** (don't guess field names)
3. **Document decisions as ADRs** (capture the "why")
4. **Test incrementally** (don't write 500 lines then compile)
5. **When user repeats something, stop and dig deeper**

---

## Future Hard Problems to Watch For

### Likely Challenges Ahead

1. **WhatsApp rate limiting** at scale
2. **OpenAI API costs** exceeding projections
3. **Agent quality** degrading with complex conversations
4. **Multi-tenant data isolation** bugs
5. **Dashboard performance** with 1000s of conversations
6. **Memory optimization** for long-running agents
7. **Migration from whatsapp-web.js** to Business API

### Prepared Solutions

- Monitor metrics from day 1
- Set up alerts for anomalies
- Budget 20% buffer for API costs
- Design for graceful degradation
- Document every edge case encountered

---

**Note:** This document grows with each session. Add new hard problems as they're solved.
