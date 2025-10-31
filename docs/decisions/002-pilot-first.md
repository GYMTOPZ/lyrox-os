# ADR-002: Pilot-First Approach

**Date:** 2025-10-31
**Status:** ✅ Accepted
**Deciders:** Pedro Meza (PM/CEO), Claude Code (Tech Lead)
**Tags:** #strategy #mvp #risk-mitigation

---

## Context

LYROX OS vision is to be a multi-tenant SaaS platform where any business can connect and become AI-operated. However, we face a classic build vs validate dilemma:

**Option A:** Build the full multi-tenant platform immediately
- Longer development time (8-10 weeks)
- More complex from day 1
- Risk: Architecture doesn't fit real business needs

**Option B:** Build for one business first (Emilio Born), then generalize
- Faster to validation (2-3 weeks)
- Learn from real usage
- Risk: Need to refactor for multi-tenant later

---

## Decision

**We will start with Phase 0: Pilot for Emilio Born Coaching, then evolve to multi-tenant platform**

### Phase 0 (Weeks 1-3)
- Build for **single business** (Emilio Born)
- Hard-code some business-specific logic
- Simple dashboard (not multi-user)
- Focus on **proving the concept works**

### Phase 1 (Weeks 4-12)
- Refactor to **multi-tenant architecture**
- Add user authentication system
- Build onboarding flow
- Make everything configurable (no hard-coding)

---

## Rationale

### Why Pilot-First?

**1. Faster Time to Validation**
- 2-3 weeks vs 8-10 weeks to first real usage
- Can test with actual customers quickly
- Get feedback sooner

**2. Learn from Real Usage**
- Discover what features actually matter
- Understand conversation patterns
- Identify edge cases we didn't think of
- See which AI prompts work best

**3. De-Risk the Architecture**
- Validate that WhatsApp integration is stable
- Test that GPT-4 responses are good enough
- Measure actual costs (API usage, hosting)
- Ensure 24/7 operation works

**4. Immediate Value for Pedro**
- Solves his current pain (ChatGPT agent disconnecting)
- Starts generating value for his business immediately
- Motivation to push through challenges

**5. Still Architect for Scale**
- We design for multi-tenant even if we deploy single-tenant
- Use modular architecture from day 1
- Keep business logic separate from core system
- Easy to extract into configuration later

### Why Not Full Platform First?

**❌ Risks of Building Full Platform Immediately:**
- Spend 8-10 weeks building features we might not need
- Complex architecture before understanding requirements
- Harder to pivot if design assumptions are wrong
- No user feedback until very late
- High risk of over-engineering

---

## Design Strategy: "Build for One, Design for Many"

Even though Phase 0 is single-tenant, we will:

✅ Use modular architecture (agents as separate modules)
✅ Keep business config in separate files (easy to make configurable)
✅ Design database with multi-tenancy in mind (add company_id later)
✅ Use environment variables for business-specific values
✅ Document what needs to change for multi-tenant

**Example:**
```typescript
// Phase 0: Hard-coded for Emilio Born
const BRAND_CONFIG = {
  name: "Emilio Born",
  personality: "You are Emilio Born...",
  products: [...]
};

// Phase 1: Database-driven
const company = await db.companies.findById(companyId);
const BRAND_CONFIG = {
  name: company.name,
  personality: company.brandPersonality,
  products: await db.products.findByCompany(companyId)
};
```

---

## Trade-offs

### Pros of Pilot-First

✅ **Speed:** 2-3 weeks vs 8-10 weeks to validation
✅ **Learning:** Real-world feedback early
✅ **Risk Reduction:** Validate assumptions before heavy investment
✅ **Motivation:** Immediate value keeps momentum high
✅ **Cost Effective:** Don't build features we don't need
✅ **Flexibility:** Easier to pivot based on learnings

### Cons of Pilot-First

⚠️ **Refactoring Required:** Will need to generalize code in Phase 1
⚠️ **Potential Rework:** Some code may need significant changes
⚠️ **Discipline Required:** Must resist urge to over-specialize for one business
⚠️ **Tech Debt:** Hard-coded values create temporary debt

### Mitigation Strategies

For each con, we have a mitigation:

**Refactoring Required**
→ Keep business logic in separate modules
→ Use dependency injection (NestJS built-in)
→ Document what needs to change

**Potential Rework**
→ Design architecture for multi-tenant even if not implementing yet
→ Use configuration files instead of scattered hard-coding
→ Write modular, testable code

**Discipline Required**
→ Code reviews focusing on generalizability
→ Explicit comments: `// TODO-PHASE1: Make this configurable`
→ Maintain list of multi-tenant changes needed

**Tech Debt**
→ Track all hard-coded values in documentation
→ Plan Phase 1 sprint specifically for removing this debt
→ Keep debt localized (not spread throughout codebase)

---

## Success Criteria for Phase 0

Before moving to Phase 1, we must achieve:

✅ **Functionality:**
- [ ] WhatsApp agent responds automatically 24/7
- [ ] At least 1 real sale completed by AI without human intervention
- [ ] System runs for 7 consecutive days without crashes
- [ ] Response time <5 seconds for 95% of messages

✅ **Learning:**
- [ ] Document conversation patterns observed
- [ ] List features that were needed but missing
- [ ] List features we built but weren't used
- [ ] Measure actual AI costs vs predictions

✅ **Technical Validation:**
- [ ] WhatsApp connection is stable
- [ ] Database can handle message volume
- [ ] No security issues discovered
- [ ] Performance meets targets

✅ **Business Validation:**
- [ ] Pedro (customer) is satisfied with results
- [ ] Conversion rate is same or better than manual
- [ ] System saves time vs manual handling

**Only after these are met, proceed to Phase 1.**

---

## Alternatives Considered

### Alternative 1: Build Full Platform Immediately

**Approach:**
- Spend 8-10 weeks building complete multi-tenant SaaS
- Launch with signup, billing, onboarding, etc.
- First customer is Emilio Born, but system ready for others

**Verdict:** ❌ Rejected

**Reasoning:**
- Too high risk without validation
- Would build features we might not need
- Harder to pivot if assumptions wrong
- No real-world feedback for 2+ months
- Could lose motivation if takes too long

---

### Alternative 2: No-Code/Low-Code First

**Approach:**
- Use existing platforms (Zapier, Make, Voiceflow)
- Validate concept without writing code
- Build custom platform only if successful

**Verdict:** ❌ Rejected

**Reasoning:**
- Pedro explicitly wants to own the code (privacy concerns)
- No-code platforms have limitations for complex workflows
- Can't evolve into product we want to sell
- Vendor lock-in
- Less control over AI prompts and logic

---

### Alternative 3: Parallel Development

**Approach:**
- Build pilot AND multi-tenant architecture simultaneously
- Use feature flags to toggle between modes

**Verdict:** ❌ Rejected

**Reasoning:**
- Most complex option (worst of both worlds)
- Slower than either approach alone
- Hard to maintain mental model of two modes
- Premature optimization

---

## Implementation Plan

### Phase 0 (Current)
**Timeline:** Weeks 1-3
**Goal:** Working AI agent for Emilio Born

**Deliverables:**
- WhatsApp integration functional
- Customer Acquisition Agent working
- Basic dashboard to monitor
- Simple finance tracking
- Deployed and running 24/7

**Hard-coded for now:**
- Emilio Born brand personality
- Product list
- Single WhatsApp number
- No user authentication (Pedro accesses dashboard directly)

---

### Phase 1 (After Phase 0 Success)
**Timeline:** Weeks 4-12
**Goal:** Multi-tenant SaaS platform

**Major Changes:**
1. **Database Schema:**
   - Add `companies` table
   - Add `company_id` foreign key to all tables
   - Move config to database

2. **Authentication:**
   - User signup/login
   - JWT authentication
   - Multi-user support

3. **Onboarding:**
   - New user flow
   - Connect integrations wizard
   - Brand personality configuration
   - Product management UI

4. **Dashboard:**
   - Multi-user safe
   - Company switching (if user has multiple)
   - Admin vs regular user roles

5. **Business Logic:**
   - Extract hard-coded config to database
   - Make all agents work with any company
   - Test data isolation

---

## Monitoring & Review

### Check-ins:

**Week 1:** Review architecture decisions
- Are we keeping multi-tenant in mind?
- Is code modular enough?

**Week 2:** Mid-phase review
- Are we on track for 3-week goal?
- Any unexpected challenges?
- Do we need to adjust scope?

**Week 3:** End of Phase 0
- Meet all success criteria?
- Document lessons learned
- Plan Phase 1 based on learnings

**Month 3:** Post-Phase 1 review
- Was pilot-first the right decision?
- How much refactoring was actually needed?
- Would we do it differently next time?

---

## Documentation Requirements

To make Phase 1 easier, we must document during Phase 0:

📝 **List of Hard-Coded Values**
- Location in code
- What it should be in Phase 1
- Estimated effort to change

📝 **Multi-Tenant TODO List**
- Database changes needed
- Code that needs refactoring
- New features required

📝 **Lessons Learned**
- What worked well
- What didn't work
- Unexpected challenges
- Feature requests from real usage

---

## Conclusion

**Pilot-first is the right approach for LYROX OS because:**

1. Validates concept faster (2-3 weeks)
2. Learns from real usage before heavy investment
3. Reduces risk significantly
4. Provides immediate value to Pedro
5. Still enables multi-tenant future (with planned refactoring)

The key is **discipline:** Design for many, build for one, evolve to many.

---

## References

- [The Lean Startup](https://theleanstartup.com/) - Build-Measure-Learn cycle
- [Shape Up by Basecamp](https://basecamp.com/shapeup) - Betting on small batches
- [YC: Do Things That Don't Scale](http://paulgraham.com/ds.html) - Manual first, automate later

---

**Status:** Accepted and in execution
**Last Updated:** 2025-10-31
**Next Review:** End of Week 3 (Phase 0 completion)
