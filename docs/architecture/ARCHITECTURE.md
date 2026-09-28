# SkillSync System Architecture

**Product**: SkillSync  
**Tagline**: *"Different Skills. Same Goals."*  
**Core Question**: *"Who should I build with?"*

---

## 1. High-Level Architecture Overview

SkillSync is designed as a modular, scalable collaboration platform combining professional portfolio identity, opportunity discovery, and explainable AI team formation.

```
                           ┌──────────────────────────────┐
                           │      React SPA (Web)         │
                           │   TypeScript + Tailwind v4   │
                           └──────────────┬───────────────┘
                                          │
                                          ▼
                           ┌──────────────────────────────┐
                           │      Express API Gateway     │
                           │     /api/v1 REST Endpoints   │
                           └──────────────┬───────────────┘
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            │                             │                             │
            ▼                             ▼                             ▼
    ┌───────────────┐             ┌───────────────┐             ┌───────────────┐
    │  PostgreSQL   │             │  Redis Cache  │             │  FastAPI ML   │
    │  Normalized   │             │  & Pub/Sub    │             │  Engine v2.4  │
    │  Datastore    │             │  Session/Queue│             │  Scoring API  │
    └───────────────┘             └───────────────┘             └───────────────┘
            │                                                           │
            ▼                                                           ▼
    ┌───────────────┐                                           ┌───────────────┐
    │ S3 Object     │                                           │ Explainable   │
    │ Storage       │                                           │ AI Match      │
    │ Resumes/Media │                                           │ Reasoning     │
    └───────────────┘                                           └───────────────┘

                           ┌──────────────────────────────┐
                           │   Native Android Client      │
                           │   Kotlin + Jetpack Compose   │
                           └──────────────┬───────────────┘
                                          │
                                          ▼
                                     Node.js API
```

---

## 2. Two Primary User Modes

### Mode A: Solo Candidate
Individual builders register to find complementary collaborators or join existing teams.
- **Inputs**: User's skills, proficiency, collaboration goals (hackathons, startups, open source, research), hours per week.
- **Discovery Output**: High-synergy collaborators (e.g., ML Engineer paired with Frontend Engineer & UI/UX Designer) and open team roles.

### Mode B: Team Formation
Existing teams register to discover missing roles and competencies.
- **Inputs**: Team mission, current members, tech stack, open requirements with specific skill prerequisites.
- **Discovery Output**: Candidate recommendations ranked by role coverage and complementarity.

---

## 3. Core Subsystems

1. **AI Recommendation Engine**:
   - Computes weighted synergy:
     $$\text{Score} = 0.30 \cdot \text{Comp} + 0.20 \cdot \text{Sem} + 0.15 \cdot \text{Goal} + 0.15 \cdot \text{Proj} + 0.10 \cdot \text{Exp} + 0.10 \cdot \text{Avail}$$
   - Explainable AI output provides itemized reasoning bullets for every match.
2. **Resume Ingestion Pipeline**:
   - Multi-phase parsing extracts skills, experience, and projects.
   - **Zero Auto-Publish Rule**: Requires user verification, editing, and confirmation before profile enrichment.
3. **External Profile Verification**:
   - GitHub: public repositories, stars, and language breakdowns.
   - LeetCode: verified problem count, difficulty distribution, contest rating, and badges.
4. **Mutual Connection & Messaging**:
   - Connection state machine (`pending` $\rightarrow$ `accepted` $\rightarrow$ mutual chat enabled).
   - Real-time conversation thread with typing indicators and read status.
5. **Opportunity Discovery**:
   - Curated Hackathons, Contests, Open Source, and Startups with integrated teammate matching.
6. **Safety & Moderation**:
   - Granular reporting queue with admin actions (Warn, Suspend, Dismiss).
