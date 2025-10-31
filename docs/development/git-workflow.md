# LYROX OS - Git Workflow & Commit Conventions

**Version:** 1.0
**Last Updated:** 2025-10-31
**Status:** Active - All contributors must follow

---

## 🎯 Philosophy

> "Your Git history should tell the complete story of the project - not just WHAT changed, but WHY and HOW."

We treat every commit as a professional logbook entry. Future-you (and your team) will thank you.

---

## 📋 Commit Message Format

### Structure

```
Session [X] Part [Y]: [TÍTULO DESCRIPTIVO]

CONTEXTO:
[Por qué este cambio fue necesario]

CAMBIOS PRINCIPALES:
- [Cambio 1]
- [Cambio 2]
- [Cambio 3]

DETALLES TÉCNICOS:
Files modified:
- path/to/file.ext: +X lines

Technical decisions:
- [Decisión importante]

IMPACTO:
[Por qué esto importa]

PRÓXIMOS PASOS: (opcional)
- [ ] Tarea pendiente

---
Generated with Claude Code
Co-authored-by: Pedro Meza <pedro@gymtopz>
```

---

## 🔢 Numbering System

### Sessions
- A **Session** is a logical group of work (usually one development session)
- Sessions represent major features or milestones
- Example: Session 1 = "WhatsApp Integration", Session 2 = "AI Engine"

### Parts
- A **Part** is an atomic commit within a session
- Each Part should be independently understandable
- Parts tell a sequential story

### Example

```
Session 1: WhatsApp Integration
├── Session 1 Part 1: Setup whatsapp-web.js client
├── Session 1 Part 2: Implement QR code generation
├── Session 1 Part 3: Add message event handlers
└── Session 1 Part 4: Test with real WhatsApp account

Session 2: AI Engine
├── Session 2 Part 1: Setup OpenAI API client
├── Session 2 Part 2: Implement prompt builder
└── Session 2 Part 3: Add response parser
```

---

## ✅ Rules of Gold

### 1. Atomic Commits
- One logical idea per commit
- If you say "and" in your title, split it into two commits

❌ BAD:
```
Session 1 Part 1: Add login and fix bug and update deps
```

✅ GOOD:
```
Session 1 Part 1: Add user login authentication
Session 1 Part 2: Fix token expiration bug
Session 1 Part 3: Update authentication dependencies
```

---

### 2. Descriptive Titles
- Use imperative mood ("Add", not "Added" or "Adding")
- Be specific about WHAT was done
- Include WHY if not obvious

❌ BAD:
```
Session 1 Part 1: Update code
Session 2 Part 3: Fix bug
Session 3 Part 1: Changes
```

✅ GOOD:
```
Session 1 Part 1: Add real-time message synchronization
Session 2 Part 3: Fix memory leak in conversation cache
Session 3 Part 1: Optimize database queries for 10x speedup
```

---

### 3. Explain the WHY
- The code shows WHAT you did
- The commit message explains WHY you did it

❌ BAD:
```
Session 1 Part 2: Change from REST to GraphQL

- Replaced REST endpoints
- Added GraphQL schema
```

✅ GOOD:
```
Session 1 Part 2: Migrate from REST to GraphQL for flexible data fetching

CONTEXTO:
REST was causing over-fetching (30% unnecessary data on mobile)
Clients needed flexible queries for offline mode

CAMBIOS PRINCIPALES:
- Replaced 15 REST endpoints with unified GraphQL schema
- Added Apollo Client for intelligent caching
- Maintained backward compatibility for v1 clients

IMPACTO:
- Reduces API calls by 60%
- Improves mobile app performance
- Enables offline-first architecture
```

---

### 4. Keep Sequential Order
- Never skip numbers in Parts
- Never go backwards in Session numbers
- If you need to fix something from previous session, create new session

❌ BAD:
```
Session 1 Part 1
Session 1 Part 3  ← Missing Part 2
Session 3 Part 1  ← Missing Session 2
```

✅ GOOD:
```
Session 1 Part 1
Session 1 Part 2
Session 1 Part 3
Session 2 Part 1
```

---

### 5. Commit Frequently
- Don't accumulate days of work in one commit
- Commit after each logical unit of work
- Push at least once per day

❌ BAD:
- 20 files changed in one commit
- One commit with multiple unrelated features
- Week of work without commits

✅ GOOD:
- Small, focused commits (1-5 files typically)
- Commit after completing each sub-task
- Push at end of each work session

---

### 6. Review Before Committing

Always run this checklist:

```bash
# Check what's modified
git status

# Review changes
git diff

# Review what will be committed
git diff --cached

# Then commit
```

**Checklist:**
- [ ] Title describes clearly WHAT was done?
- [ ] Body explains WHY it was done?
- [ ] Includes technical details?
- [ ] Files modified are listed?
- [ ] Numbering is sequential?
- [ ] Commit is atomic (one logical idea)?
- [ ] Ready to push?

---

## 🚫 What NOT to Do

### 1. Vague Messages

❌ NEVER:
```
git commit -m "fixed bug"
git commit -m "updates"
git commit -m "wip"
git commit -m "changes"
```

---

### 2. Giant Commits

❌ NEVER:
- 50 files in one commit
- Multiple features mixed together
- "End of day" dumps

---

### 3. Missing Context

❌ BAD:
```
Session 1 Part 3: Changed validation
```

✅ GOOD:
```
Session 1 Part 3: Strengthen email validation to prevent spam accounts

CONTEXTO:
Users were creating fake accounts with invalid emails

CAMBIOS PRINCIPALES:
- Added regex validation
- Added DNS MX record check
- Added disposable email detection

IMPACTO:
Reduces spam by 80%
```

---

### 4. Breaking the Narrative

❌ NEVER:
- Skip session numbers
- Skip part numbers
- Go backwards in numbering
- Mix unrelated changes in same commit

---

### 5. Destructive Commands Without Documentation

❌ AVOID:
```bash
git reset --hard HEAD~5
git push --force
git rebase -i
```

If absolutely necessary:
- Document WHY in commit message
- Use `--force-with-lease` instead of `--force`
- Coordinate with team first

---

## 🛠️ How to Use

### Method 1: Using Template (Recommended)

Template is already configured. Just:

```bash
git add [files]
git commit
# Editor opens with template
# Fill in the template
# Save and close
git push
```

---

### Method 2: Inline Commit

```bash
git add [files]

git commit -m "$(cat <<'EOF'
Session X Part Y: [Título]

CONTEXTO:
[Por qué]

CAMBIOS PRINCIPALES:
- Cambio 1
- Cambio 2

DETALLES TÉCNICOS:
Files modified:
- file.ext: +X lines

IMPACTO:
[Por qué importa]

---
Generated with Claude Code
Co-authored-by: Pedro Meza <pedro@gymtopz>
EOF
)"

git push
```

---

## 📊 Session Planning

### Before Starting a Session

1. **Define the goal** - What will this session accomplish?
2. **Break it down** - What are the logical parts?
3. **Number it** - What's the next session number?

Example:
```
Session 5: Customer Acquisition Agent
├── Part 1: Setup agent module structure
├── Part 2: Implement message handler
├── Part 3: Integrate with AI engine
├── Part 4: Add conversation context system
└── Part 5: Write integration tests
```

---

### During the Session

- Commit after each Part
- Keep notes of technical decisions
- Update PROJECT_STATUS.md after each significant Part

---

### After the Session

- Review all commits (git log)
- Push to remote
- Update SESSION NOTES (docs/sessions/session-XXX.md)
- Update CHANGELOG.md
- Update PROJECT_STATUS.md

---

## 📁 Session Notes

Every session should have a note document:

```
docs/sessions/session-XXX-YYYY-MM-DD.md
```

Content:
- What was accomplished
- Decisions made
- Problems encountered
- Next steps

See [session-001-2025-10-31.md](../sessions/session-001-2025-10-31.md) for example.

---

## 🔄 Workflow Summary

```
START SESSION
    ↓
Define Session Goal
    ↓
Plan Parts
    ↓
┌─────────────────┐
│ Work on Part 1  │
│ git add         │
│ git commit      │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Work on Part 2  │
│ git add         │
│ git commit      │
└────────┬────────┘
         ↓
    ... more parts ...
         ↓
git push
    ↓
Update docs
    ↓
END SESSION
```

---

## 🎯 Benefits

✅ **History as narrative** - Tells project evolution story
✅ **Easy debugging** - Understand context of every change
✅ **Simple onboarding** - New team members read the history
✅ **Living documentation** - Updates automatically
✅ **Intelligent rollback** - Know exactly what you're undoing
✅ **Better code reviews** - Context is in the commit
✅ **Team alignment** - Everyone understands changes

---

## 📚 References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)

---

## 🚀 Quick Reference Card

```
TITLE FORMAT:
Session [X] Part [Y]: [Descriptive title in imperative]

BODY SECTIONS:
- CONTEXTO: Why this change
- CAMBIOS PRINCIPALES: What was done
- DETALLES TÉCNICOS: How it was done
- IMPACTO: Why it matters
- PRÓXIMOS PASOS: What's next (optional)

RULES:
✓ Atomic commits
✓ Descriptive titles
✓ Explain WHY
✓ Sequential numbering
✓ Commit frequently
✓ Review before committing

AVOID:
✗ Vague messages
✗ Giant commits
✗ Missing context
✗ Breaking narrative
✗ Skipping numbers
```

---

**Consistency over perfection. Better a simple format used always than a complex one used sometimes.**

---

**Last Updated:** 2025-10-31
**Maintained by:** LYROX OS Team
