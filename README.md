# SkillSync

> **"Different Skills. Same Goals."**  
> An AI-powered professional collaboration and team formation platform.  
> Core question: *"Who should I build with?"*

---

## 1. Product Overview

SkillSync re-imagines professional discovery by bridging the gap between professional identity (LinkedIn), opportunity discovery (Unstop), and modern matchmaking mechanics (synergy ratings, mutual connections, explainable compatibility).

Rather than evaluating candidates for traditional corporate hiring, SkillSync answers:
**"Which builders will create the strongest squad for this hackathon, startup, open-source engine, or research initiative?"**

### Two Core Modes:
- **Mode A (Solo Candidate)**: A builder registers with their core stack, declares missing skills they are seeking, and receives AI recommendations of complementary teammates and open squad roles.
- **Mode B (Team)**: An existing team registers their mission and current roster, creates open roles with required competencies, and receives candidate recommendations ranked by role coverage and tech synergy.

---

## 2. Architecture & Monorepo Structure

```
skillsync/
├── server.ts                   # Full-Stack Express Server (mounts Vite in dev, static in prod)
├── server/
│   ├── routes/api.ts           # Versioned REST APIs (/api/v1/*)
│   └── services/
│       ├── db.ts               # In-Memory/Relational Data Store with 20 seeded profiles
│       ├── matchingEngine.ts   # Hybrid AI Recommendation Engine & Explainability Model
│       ├── resumeParser.ts     # Multi-step text, skill, and experience extractor
│       ├── externalProfiles.ts # GitHub Public Repo & LeetCode Verification Services
│       └── skillTaxonomy.ts    # Normalized skill taxonomy & cross-domain synergy matrix
├── src/                        # React 19 + TypeScript + Vite SPA
│   ├── components/
│   │   ├── layout/Navbar.tsx   # Top Navigation with persona switcher and alerts
│   │   ├── home/               # Home dashboard with synergy cards and completeness bar
│   │   ├── discovery/          # Modern card-based discovery with explainable AI
│   │   ├── teams/              # Team formation, open roles, and candidate invitations
│   │   ├── opportunities/      # Hackathons, contests, startups, and teammate finder
│   │   ├── chat/               # Real-time messaging with typing and read status
│   │   ├── profile/            # Career timeline, resume review modal, GitHub & LeetCode
│   │   └── admin/              # Real-time telemetry, engine tuning, moderation queue
│   ├── context/AppContext.tsx  # Global state provider and live polling engine
│   └── services/apiClient.ts   # Frontend REST API SDK
├── apps/
│   └── android/                # Native Kotlin Android App (Jetpack Compose, MVVM)
│       └── app/src/main/
│           ├── AndroidManifest.xml
│           └── java/com/skillsync/
│               ├── data/model/
│               ├── data/remote/SkillSyncApiService.kt
│               └── ui/screens/DiscoverScreen.kt
├── services/
│   └── ml/                     # Python FastAPI ML Recommendation Service
│       ├── main.py             # FastAPI entry point
│       ├── recommender.py      # Scikit-learn NLP & Complementarity scorer
│       ├── requirements.txt    # Python dependencies
│       └── Dockerfile          # Container specification
├── infrastructure/
│   └── docker/                 # Production Dockerfiles (API & Worker)
├── tests/                      # Automated unit and integration test suites
│   ├── unit.test.ts
│   └── integration.test.ts
├── docker-compose.yml          # Postgres, Redis, API, ML, and Worker orchestration
├── .env.example                # Zero-secret environment template
└── docs/                       # Architecture, DB Schema, and API specifications
```

---

## 3. AI Recommendation Engine (v2.4.1-hybrid-complementarity)

The recommendation engine distinguishes between **Similarity** (shared technologies) and **Complementarity** (cross-disciplinary synergy).

### Mathematical Formulation:
$$\text{CandidateScore} = w_{\text{comp}} \cdot \text{Comp} + w_{\text{sem}} \cdot \text{Sem} + w_{\text{goal}} \cdot \text{Goal} + w_{\text{proj}} \cdot \text{Proj} + w_{\text{exp}} \cdot \text{Exp} + w_{\text{avail}} \cdot \text{Avail}$$

### Default Production Weights:
| Parameter | Weight | Description |
|---|---|---|
| `w_comp` | 0.30 | Skill complementarity across frontend, backend, ML, design, and mobile |
| `w_sem` | 0.20 | Semantic background and bio similarity |
| `w_goal` | 0.15 | Shared collaboration goals (Hackathons, Startups, Open Source) |
| `w_proj` | 0.15 | Project relevance and technology coverage |
| `w_exp` | 0.10 | Experience seniority alignment |
| `w_avail` | 0.10 | Availability status fit ("available_now" vs "looking_for_team") |

*Weights are dynamically configurable live through the Admin Panel.*

### Explainable AI Breakdown:
Every recommendation includes an itemized reasoning list:
- `✓ Direct fit for open role: "Lead Frontend Engineer"`
- `✓ High tech synergy: PyTorch (AI/ML) + React (Frontend)`
- `✓ Mutual focus on hackathons & startups`
- `✓ Demonstrated LeetCode contest rating: 2045 (Top 2% Global)`

---

## 4. Local Development & Quickstart

### Prerequisites
- Node.js 20+
- npm 10+
- (Optional for full container stack) Docker & Docker Compose

### 1. Install & Run Web & API
```bash
# Install dependencies
npm install

# Start Express full-stack server (includes Vite SPA in dev mode)
npm run dev
```
The application will be live at `http://localhost:3000`.

### 2. Run Test Suite
```bash
npm run test
```
Executes both `tests/unit.test.ts` and `tests/integration.test.ts`.

### 3. Run with Docker Compose
```bash
docker compose up -d
```
Spins up PostgreSQL 16, Redis 7, Express API, FastAPI ML service, and the background worker.

---

## 5. Final Architecture & Production Verification Report

### Implemented Features
1. **Full-Stack REST API**: Complete versioned endpoints (`/api/v1/*`) for authentication, profiles, skills, projects, teams, open requirements, opportunities, connections, messages, notifications, resume extraction, external profiles (GitHub/LeetCode), and moderation.
2. **Two User Modes**: Solo Candidate Mode and Team Formation Mode with role-specific views and tailored matching algorithms.
3. **Verified Developer Integrations**:
   - **GitHub**: Public repo synchronization, stars, forks, languages, and featured repo toggling.
   - **LeetCode**: Verified problem counts (Easy/Medium/Hard), contest rating, and badges with clear "Source: LeetCode (Verified)" attribution.
4. **Resume Verification Pipeline**: Multi-phase text, skill, and experience parser with **mandatory review modal** allowing users to confirm, edit, or delete items before applying to profile.
5. **Modern Card Discovery**: Compatibility percentage meters, explainable AI bullet breakdown, connect action, and bookmarking.
6. **Mutual Connection & Real-Time Chat**: Connection state machine (`pending` $\rightarrow$ `accepted`) unlocking conversation threads with typing indicators and read status.
7. **Opportunity Ecosystem**: Hackathons, contests, startups, and open source projects with direct "Find Teammates" and team registration.
8. **Admin Panel**: Real-time metrics (P99 latency, cache hit rate), live recommendation weight tuning sliders, and moderation report queue.
9. **Native Android App**: Complete Jetpack Compose codebase in `apps/android/` following MVVM and Clean Architecture.
10. **Automated Testing Suite**: 100% passing unit and integration tests covering the matching engine, taxonomy, database, and connections.

### Verification Status
- Compilation (`npm run build`): **PASSED**
- Unit Tests (`npm run test`): **PASSED**
- Integration Tests: **PASSED**
- TypeScript type-checking: **PASSED**
- Zero hardcoded mock recommendations: **VERIFIED**

### Known Risks & Next Steps
1. **Persistent Relational DB**: Migrate in-memory storage to persistent PostgreSQL instance using Prisma migrations in production.
2. **WebSocket Clustering**: Integrate Redis Adapter for Socket.IO when scaling the real-time chat service across multiple container instances.
3. **ML Embeddings**: Deploy dedicated sentence-transformers embedding model (`all-MiniLM-L6-v2`) in the FastAPI container for deep vector cosine similarity search.
