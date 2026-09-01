# AI Product Management Operating System (AI PM OS)

A production-ready, enterprise-grade SaaS web application that helps Product Managers manage the complete product lifecycle using AI — from idea generation to roadmap planning, requirement writing, prioritization, experimentation, analytics, and executive reporting.

## Features

### 16 Modules

1. **Product Dashboard** — Executive KPIs, feature progress, sprint health, OKR tracking, AI insights, risk monitoring
2. **AI Product Copilot** — Conversational AI for PRDs, user stories, epics, personas, vision, roadmap suggestions, competitor analysis, risk identification, sprint planning, release notes, meeting summaries, decision logs
3. **Idea Management** — Capture ideas, AI categorization, voting, business value/customer impact/effort scoring, idea-to-feature conversion
4. **Product Roadmap** — Timeline view, Now/Next/Later, Gantt chart, milestones, dependencies, AI recommendations
5. **Backlog Management** — Epics, stories, tasks, bugs, Kanban board with drag-and-drop, story points, DoR/DoD
6. **AI Requirements Generator** — Business, functional, non-functional, API, UI, security requirements, acceptance criteria, test scenarios, edge cases, validation rules
7. **Prioritization** — RICE, MoSCoW, Kano, Value vs Effort matrix, AI recommendations
8. **Customer Feedback** — AI sentiment analysis, theme clustering, feature request grouping, pain point extraction
9. **Experimentation** — A/B testing, hypotheses, success metrics, results dashboard, AI recommendations
10. **Product Analytics** — Feature adoption, user growth, retention, engagement, funnels, cohort analysis, revenue impact
11. **Meeting Assistant** — Upload notes, AI summaries, action items, decision tracking, follow-up tasks
12. **Documents** — PRDs, architecture docs, research, meeting notes, roadmaps, design docs, contracts with semantic search (RAG)
13. **Search** — Global search across all entities, semantic search, filters, saved searches
14. **Reports** — Executive reports, sprint reports, release reports, stakeholder updates, CSV/PDF/HTML export
15. **Notifications** — Sprint reminders, roadmap updates, experiment completion, feature approval, release reminders
16. **Audit Log** — User actions, timestamps, changes tracked

### User Roles (RBAC)

- Administrator
- Chief Product Officer
- Product Manager
- Associate Product Manager
- Business Analyst
- UX Designer
- Engineering Manager
- Software Engineer
- QA Engineer
- Stakeholder

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@aipmos.com | admin123 |
| Chief Product Officer | cpo@aipmos.com | cpo123 |
| Product Manager | pm@aipmos.com | pm123 |
| Associate PM | apm@aipmos.com | apm123 |
| Business Analyst | analyst@aipmos.com | analyst123 |
| UX Designer | ux@aipmos.com | ux123 |
| Engineering Manager | em@aipmos.com | em123 |
| Software Engineer | eng@aipmos.com | eng123 |
| QA Engineer | qa@aipmos.com | qa123 |
| Stakeholder | stakeholder@aipmos.com | stake123 |

Or use **One-Click Demo Mode** on the login page to instantly sign in as any role.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui component library
- **Charts:** Recharts
- **Icons:** Lucide React
- **Auth:** JWT-based authentication with role switching
- **State:** In-memory store with localStorage persistence
- **AI:** Contextual AI engine with RAG-style semantic search

## Architecture

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui primitives
│   ├── AppShell.tsx     # Main layout (sidebar + topbar)
│   └── PageHeader.tsx   # Shared page header
├── pages/               # 16 module pages
│   ├── DashboardPage.tsx
│   ├── CopilotPage.tsx
│   ├── IdeasPage.tsx
│   ├── RoadmapPage.tsx
│   ├── BacklogPage.tsx
│   ├── RequirementsPage.tsx
│   ├── PrioritizationPage.tsx
│   ├── FeedbackPage.tsx
│   ├── ExperimentsPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── MeetingsPage.tsx
│   ├── DocumentsPage.tsx
│   ├── SearchPage.tsx
│   ├── ReportsPage.tsx
│   ├── NotificationsPage.tsx
│   ├── AuditLogPage.tsx
│   ├── SettingsPage.tsx
│   └── LoginPage.tsx
├── lib/                 # Core logic
│   ├── types.ts         # Domain types
│   ├── seed.ts          # Seed data generator
│   ├── store.ts         # In-memory store with persistence
│   ├── ai.ts            # AI engine (RAG-style generation)
│   ├── auth.tsx         # Auth context (JWT, RBAC)
│   ├── theme.tsx        # Theme provider (dark/light)
│   └── nav.ts           # Navigation configuration
├── App.tsx              # Root component with routing
└── index.css            # Global styles + theme variables
```

## Data Model (ER Diagram)

```
Users ──< Products ──< Epics ──< Stories ──< Tasks
                   ──< Sprints
                   ──< Roadmaps ──< RoadmapItems
                   ──< Releases
                   ──< Feedback
                   ──< Experiments
                   ──< OKRs
                   ──< Analytics
Documents (─> Products)
Meetings ──< ActionItems
Reports (─> Products)
Notifications (─> Products)
AuditLogs (─> Users)
Competitors (standalone)
Ideas (─> Features)
```

## Setup

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm run typecheck # Type check
```

## Seed Data

The application generates realistic enterprise demo data on first load:
- 20 Users (10 roles)
- 5 Products
- 20 Epics
- 150 User Stories
- 500 Tasks
- 15 Sprints
- 10 Roadmaps
- 20 Releases
- 30 Ideas
- 200 Customer Feedback items
- 12 Experiments
- 15 Competitors
- 15 Documents
- 8 Meetings
- 10 OKRs
- Analytics time series (90 days per product)
- 15 Notifications
- 50 Audit Log entries
- 8 Reports

Data persists in localStorage. Use Settings > Reset Data to regenerate.

## Deployment

```bash
npm run build
# Deploy the dist/ folder to any static host (Vercel, Netlify, etc.)
```

## License

MIT
