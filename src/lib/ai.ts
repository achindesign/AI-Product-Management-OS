// AI Engine — contextual, template-based generation for all copilot capabilities.
// Simulates RAG by pulling context from the data store.

import { getState } from './store';
import type { Product, Epic, Story, Idea, Feedback } from './types';

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const result: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

export type AIIntent =
  | 'prd' | 'user_stories' | 'acceptance_criteria' | 'epics' | 'personas'
  | 'product_vision' | 'roadmap_suggestions' | 'competitor_analysis'
  | 'risk_identification' | 'sprint_planning' | 'feature_recommendations'
  | 'release_notes' | 'meeting_summary' | 'decision_log' | 'requirements'
  | 'general';

export interface AIResponse {
  content: string;
  intent: AIIntent;
  context?: string;
}

function detectIntent(prompt: string): AIIntent {
  const p = prompt.toLowerCase();
  if (/prd|product requirements|product requirement doc/.test(p)) return 'prd';
  if (/user stor/.test(p)) return 'user_stories';
  if (/acceptance criter/.test(p)) return 'acceptance_criteria';
  if (/epic/.test(p)) return 'epics';
  if (/persona/.test(p)) return 'personas';
  if (/product vision|vision statement/.test(p)) return 'product_vision';
  if (/roadmap.*(suggest|recommend)|suggest.*roadmap|recommend.*roadmap/.test(p)) return 'roadmap_suggestions';
  if (/competitor|competitive analysis/.test(p)) return 'competitor_analysis';
  if (/risk|identif.*risk/.test(p)) return 'risk_identification';
  if (/sprint plan|sprint plann/.test(p)) return 'sprint_planning';
  if (/feature recommend|recommend.*feature/.test(p)) return 'feature_recommendations';
  if (/release note/.test(p)) return 'release_notes';
  if (/meeting summar|summar.*meeting|meeting note/.test(p)) return 'meeting_summary';
  if (/decision log|log.*decision/.test(p)) return 'decision_log';
  if (/requirement/.test(p)) return 'requirements';
  return 'general';
}

function findContextProduct(prompt: string): Product | undefined {
  const state = getState();
  const p = prompt.toLowerCase();
  return state.products.find(prod => p.includes(prod.name.toLowerCase())) || state.products[0];
}

function findContextEpic(prompt: string, product?: Product): Epic | undefined {
  const state = getState();
  const epics = product ? state.epics.filter(e => e.productId === product.id) : state.epics;
  const p = prompt.toLowerCase();
  return epics.find(e => p.includes(e.title.toLowerCase())) || pick(epics);
}

// --- Generators ---

function genPRD(product: Product, epic?: Epic): string {
  const state = getState();
  const relatedStories = state.stories.filter(s => s.productId === product.id).slice(0, 5);
  return `# Product Requirements Document
## ${epic ? epic.title : product.name + ' — Next Generation'}

**Product:** ${product.name}
**Owner:** ${product.owner}
**Status:** Draft
**Target Release:** Q${Math.ceil(Math.random() * 4) + 1} 2025

---

## 1. Executive Summary
${product.vision} This PRD defines the requirements for ${epic ? epic.title.toLowerCase() : 'the next major iteration'} of ${product.name}, targeting ${product.metrics.mau.toLocaleString()} monthly active users and a ${product.metrics.nps} NPS baseline.

## 2. Problem Statement
Enterprise teams using ${product.name} currently face challenges with:
- Fragmented workflows across multiple disconnected tools
- Manual data entry and reporting consuming ${Math.floor(Math.random() * 20 + 10)}% of productive time
- Lack of real-time insights for decision-making
- Onboarding friction leading to ${product.metrics.churn}% monthly churn

## 3. Goals & Success Metrics
| Goal | Metric | Target |
|------|--------|--------|
| Improve user engagement | DAU/MAU ratio | ${Math.floor(Math.random() * 10 + 35)}% |
| Reduce time-to-value | Onboarding completion time | < ${Math.floor(Math.random() * 5 + 3)} min |
| Increase retention | 90-day retention | ${Math.floor(Math.random() * 10 + 85)}% |
| Drive adoption | Feature adoption rate | ${Math.floor(Math.random() * 20 + 60)}% |

## 4. User Personas
1. **Sarah, Senior PM** — Needs real-time dashboards and AI-assisted planning
2. **Marcus, Engineering Manager** — Wants clear requirements and sprint visibility
3. **Priya, Business Analyst** — Requires detailed reporting and data export
4. **David, Stakeholder** — Needs executive summaries and progress tracking

## 5. Functional Requirements
${relatedStories.map((s, i) => `${i + 1}. ${s.title} — ${s.description}`).join('\n')}
${epic ? `${relatedStories.length + 1}. ${epic.description}` : ''}

## 6. Non-Functional Requirements
- **Performance:** Page load < 2s, API response < 500ms
- **Scalability:** Support 100K concurrent users
- **Security:** SOC2 Type II compliant, SSO/SAML, RBAC
- **Accessibility:** WCAG 2.1 AA compliant
- **Availability:** 99.9% uptime SLA

## 7. Technical Approach
- Frontend: React + TypeScript with real-time WebSocket updates
- Backend: Node.js microservices with event-driven architecture
- Database: PostgreSQL with read replicas
- AI: OpenAI GPT-4 for insights, embeddings for semantic search

## 8. Timeline & Milestones
- **Week 1-2:** Technical design & API contracts
- **Week 3-6:** Core feature development
- **Week 7:** Beta release to 10% of users
- **Week 8:** GA release

## 9. Risks & Mitigations
- **Risk:** API rate limits from AI provider → Mitigation: Implement caching and queuing
- **Risk:** Data migration complexity → Mitigation: Phased rollout with rollback plan
- **Risk:** User adoption resistance → Mitigation: Change management & training program

## 10. Open Questions
1. Should we support offline mode for mobile users?
2. What is the pricing impact for AI features?
3. Do we need a separate enterprise tier?
`;
}

function genUserStories(product: Product, epic?: Epic): string {
  const templates = [
    { title: 'View dashboard summary', desc: 'see a summary of key metrics on my dashboard so I can make quick decisions' },
    { title: 'Filter and sort items', desc: 'filter and sort backlog items by priority so I can focus on what matters' },
    { title: 'Export data to CSV', desc: 'export my data to CSV so I can analyze it in external tools' },
    { title: 'Receive notifications', desc: 'receive notifications when items are assigned to me so I stay informed' },
    { title: 'Search across content', desc: 'search across all documents and items so I can find what I need quickly' },
    { title: 'Collaborate in real-time', desc: 'collaborate with my team in real-time so we can work together efficiently' },
    { title: 'Set up automated workflows', desc: 'create automated workflows so I reduce manual repetitive tasks' },
    { title: 'View activity history', desc: 'view the full history of changes so I can audit decisions' },
  ];
  const selected = pickN(templates, 5);
  return `# Generated User Stories
**Context:** ${product.name}${epic ? ` — ${epic.title}` : ''}

---

${selected.map((t, i) => `### Story ${i + 1}: ${t.title}
**As a** Product Manager
**I want to** ${t.desc}
**So that** I can improve my team's productivity.

**Story Points:** ${pick([2, 3, 5, 8])}
**Priority:** ${pick(['P0', 'P1', 'P2'])}
**Labels:** ${pick(['frontend', 'backend', 'api', 'ui'])}, ${pick(['analytics', 'reporting', 'core'])}

**Acceptance Criteria:**
- Given a valid user, when they access the feature, then it loads within 2 seconds
- Given invalid input, when submitted, then a clear error message is displayed
- Given the feature is disabled, when accessed, then a graceful empty state is shown`).join('\n\n---\n\n')}

---

*Generated ${selected.length} user stories based on ${product.name}'s context and current backlog analysis.*`;
}

function genAcceptanceCriteria(product: Product): string {
  return `# AI-Generated Acceptance Criteria
**Product:** ${product.name}

---

## Feature: Dashboard Real-time Updates

### AC-1: Real-time metric refresh
**Given** a user is viewing the dashboard
**When** underlying data changes
**Then** the dashboard metrics update within 5 seconds
**And** a subtle animation indicates the update

### AC-2: Connection state handling
**Given** the WebSocket connection drops
**When** the user is viewing real-time data
**Then** a "reconnecting" indicator is shown
**And** the system attempts reconnection every 3 seconds
**And** data refreshes automatically upon reconnection

### AC-3: Performance under load
**Given** 1000+ concurrent dashboard viewers
**When** all viewers are subscribed to updates
**Then** the update latency remains under 2 seconds
**And** the server CPU usage stays below 70%

### AC-4: Error handling
**Given** a data fetch fails
**When** the dashboard renders
**Then** a retry button is displayed
**And** cached data is shown with a "stale data" indicator
**And** the error is logged for debugging

### AC-5: Accessibility
**Given** a screen reader user
**When** metrics update in real-time
**Then** an ARIA live region announces the update
**And** the announcement does not exceed 1 per 5 seconds to avoid spam

---

*Generated 5 acceptance criteria with edge case coverage and accessibility considerations.*`;
}

function genEpics(product: Product): string {
  const epicIdeas = [
    { title: 'AI-Powered Predictive Analytics', desc: 'Leverage ML models to predict user behavior and recommend proactive actions' },
    { title: 'Enterprise Governance & Compliance', desc: 'SOC2, GDPR, and HIPAA compliance with audit trails and data governance' },
    { title: 'Real-time Collaboration Suite', desc: 'Multi-user editing, presence indicators, and conflict-free collaboration' },
    { title: 'Advanced Segmentation Engine', desc: 'Dynamic user segmentation with behavioral and firmographic attributes' },
    { title: 'Integration Marketplace', desc: 'Self-service integration builder with 100+ pre-built connectors' },
  ];
  const selected = pickN(epicIdeas, 4);
  return `# AI-Generated Epic Recommendations
**Product:** ${product.name}

---

${selected.map((e, i) => `## Epic ${i + 1}: ${e.title}
**Description:** ${e.desc}
**Business Value:** ${pick(['High', 'Critical', 'Medium'])}
**Estimated Duration:** ${pick([4, 6, 8, 12])} weeks
**Priority:** ${pick(['P0', 'P1', 'P2'])}

**Key Features:**
${pickN(['Real-time dashboards', 'API endpoints', 'Admin console', 'Audit logging', 'SSO integration', 'Mobile support', 'Export capabilities', 'Notification system'], 4).map(f => `- ${f}`).join('\n')}

**Success Metrics:**
- ${pick(['User adoption > 60%', 'Performance < 2s response', 'NPS improvement of +10', 'Revenue impact > $500K'])}

**Dependencies:**
- ${pick(['Platform infrastructure upgrade', 'API gateway redesign', 'Data pipeline completion'])}`).join('\n\n---\n\n')}

---

*Generated ${selected.length} epics aligned with ${product.name}'s vision and current roadmap state.*`;
}

function genPersonas(product: Product): string {
  const personas = [
    { name: 'Sarah Chen', role: 'Senior Product Manager', goals: ['Make data-driven decisions quickly', 'Align stakeholders on priorities'], pains: ['Too many tools to juggle', 'Manual reporting takes hours'] },
    { name: 'Marcus Johnson', role: 'Engineering Manager', goals: ['Deliver features on time', 'Maintain code quality'], pains: ['Unclear requirements', 'Scope creep'] },
    { name: 'Priya Patel', role: 'Business Analyst', goals: ['Surface actionable insights', 'Track KPIs accurately'], pains: ['Data scattered across systems', 'No single source of truth'] },
    { name: 'David Kim', role: 'VP Stakeholder', goals: ['See ROI on product investments', 'Strategic visibility'], pains: ['Lack of executive reporting', 'Can\'t track progress easily'] },
  ];
  return `# AI-Generated User Personas
**Product:** ${product.name}

---

${personas.map((p, i) => `## Persona ${i + 1}: ${p.name}
**Role:** ${p.role}
**Department:** ${pick(['Product', 'Engineering', 'Operations', 'Executive'])}

### Profile
${p.name} is a ${p.role} who ${pick(['works at a fast-growing SaaS company', 'leads a team of 15+ people', 'has been in the industry for 10+ years', 'champions data-driven culture'])}.

### Goals
${p.goals.map(g => `- ${g}`).join('\n')}

### Pain Points
${p.pains.map(p2 => `- ${p2}`).join('\n')}

### How ${product.name} Helps
${product.name} addresses ${p.name}'s challenges by providing ${pick(['AI-powered insights', 'unified workflows', 'real-time dashboards', 'automated reporting', 'collaborative planning'])} that directly reduce friction and improve productivity.`).join('\n\n---\n\n')}

---

*Generated ${personas.length} personas based on ${product.name}'s target market and current user base analysis.*`;
}

function genProductVision(product: Product): string {
  return `# Product Vision Statement
## ${product.name}

### Vision
${product.vision}

### Mission
We exist to ${pick(['empower enterprise teams', 'transform how organizations operate', 'democratize access to powerful tools'])} by building ${product.name} as the ${pick(['industry-leading', 'definitive', 'most trusted'])} platform that ${pick(['turns complexity into clarity', 'bridges strategy and execution', 'makes every team more effective'])}.

### Strategic Pillars
1. **AI-First Intelligence** — Every workflow enhanced by AI, not as an add-on but as a core capability
2. **Enterprise-Grade Trust** — Security, compliance, and governance built into the foundation
3. **Seamless Integration** — Connect the tools teams already use into one unified experience
4. **Data-Driven Decisions** — Real-time insights that surface at the point of decision

### 3-Year Horizon
- **Year 1:** Establish ${product.name} as the preferred tool for ${pick(['mid-market', 'enterprise'])} teams
- **Year 2:** Expand to ${pick(['adjacent markets', 'international markets', 'new verticals'])} with AI-powered differentiation
- **Year 3:** Achieve ${pick(['market leadership', 'category-defining status', 'platform ecosystem'])} with ${product.metrics.mau * 5 > 100000 ? '500K+' : '100K+'} active users

### Success Definition
${product.name} succeeds when teams ${pick(['stop switching between tools', 'make decisions faster than competitors', 'report measurable productivity gains'])} and when our NPS exceeds ${product.metrics.nps + 15}.

---

*Generated vision statement aligned with current metrics: ${product.metrics.mau.toLocaleString()} MAU, ${product.metrics.nps} NPS, ${product.metrics.adoption}% adoption.*`;
}

function genRoadmapSuggestions(product: Product): string {
  const state = getState();
  const productEpics = state.epics.filter(e => e.productId === product.id);
  return `# AI Roadmap Recommendations
**Product:** ${product.name}

---

## Now (Next 2-4 Weeks)
${productEpics.filter(e => e.status === 'in_progress' || e.status === 'in_review').slice(0, 3).map((e, i) => `${i + 1}. **${e.title}** — ${e.progress}% complete, P${e.priority[1]} priority
   - Recommendation: ${e.progress > 70 ? 'Push to completion, unblock any remaining items' : 'Add resources to accelerate delivery'}`).join('\n')}
${productEpics.filter(e => e.status === 'in_progress').length === 0 ? '1. **No active items** — Recommend pulling the next P0/P1 epic into development' : ''}

## Next (1-2 Months)
${productEpics.filter(e => e.status === 'todo' || e.status === 'backlog').slice(0, 4).map((e, i) => `${i + 1}. **${e.title}** — ${e.priority} priority
   - RICE Score: ${(e.storyIds.length * 3) / (e.storyIds.length + 2) * 10 | 0}/10
   - Recommendation: ${pick(['Start discovery and technical design', 'Refine requirements before kickoff', 'Validate with customer interviews'])}`).join('\n')}

## Later (3-6 Months)
${pickN(['AI-Powered Predictive Analytics', 'Enterprise Governance Suite', 'Integration Marketplace', 'Advanced Segmentation Engine', 'Real-time Collaboration Suite', 'Mobile App v3'], 3).map((t, i) => `${i + 1}. **${t}** — Strategic initiative
   - Recommendation: ${pick(['Begin user research in Q4', 'Monitor market for timing', 'Evaluate build vs buy'])}`).join('\n')}

## AI Insights
- **Sequencing:** ${productEpics.length} epics detected. Recommend parallelizing ${Math.min(3, Math.ceil(productEpics.length / 3))} workstreams.
- **Risk:** ${productEpics.filter(e => e.dueDate < new Date().toISOString() && e.status !== 'done').length} epics are past due. Consider re-scoping or adding resources.
- **Balance:** Current mix is ${productEpics.filter(e => e.priority === 'P0').length} P0, ${productEpics.filter(e => e.priority === 'P1').length} P1, ${productEpics.filter(e => e.priority === 'P2').length} P2. ${productEpics.filter(e => e.priority === 'P0').length > 3 ? 'Too many P0s — recommend re-prioritizing.' : 'Healthy distribution.'}

---

*Generated roadmap recommendations based on ${productEpics.length} active epics and ${state.stories.filter(s => s.productId === product.id).length} stories.*`;
}

function genCompetitorAnalysis(product: Product): string {
  const state = getState();
  const competitors = state.competitors.slice(0, 5);
  return `# AI Competitor Analysis
**Product:** ${product.name}

---

## Competitive Landscape Overview
The product management software market is estimated at $2.5B with ${Math.floor(Math.random() * 10 + 15)}% YoY growth. ${product.name} competes in a crowded but growing space.

## Key Competitors

${competitors.map((c, i) => `### ${i + 1}. ${c.name}
- **Website:** ${c.website}
- **Market Share:** ${c.marketShare}%
- **Pricing:** ${c.pricing}
- **Threat Level:** ${c.threat.toUpperCase()}
- **Strengths:** ${c.strengths.join(', ')}
- **Weaknesses:** ${c.weaknesses.join(', ')}
- **Key Features:** ${c.features.join(', ')}`).join('\n\n')}

## Strategic Gaps & Opportunities
1. **AI Differentiation** — Most competitors lack AI-native features. ${product.name}'s AI Copilot is a clear differentiator.
2. **Pricing** — Enterprise tier pricing is competitive. Consider a startup tier to capture the SMB segment.
3. **Integrations** — Competitors average 20+ integrations. Prioritize building the integration marketplace.
4. **Mobile** — Several competitors have weak mobile experiences. Mobile-first features could be a wedge.

## Recommended Actions
- **Short-term:** Highlight AI capabilities in marketing and sales materials
- **Medium-term:** Ship the integration marketplace to close the integration gap
- **Long-term:** Invest in proprietary AI models for sustained differentiation

---

*Analysis based on ${state.competitors.length} tracked competitors and current market intelligence.*`;
}

function genRiskIdentification(product: Product): string {
  const state = getState();
  const overdueEpics = state.epics.filter(e => e.productId === product.id && e.dueDate < new Date().toISOString() && e.status !== 'done');
  const blockedStories = state.stories.filter(s => s.productId === product.id && s.status === 'blocked');
  const lowProgress = state.epics.filter(e => e.productId === product.id && e.progress < 30 && e.status === 'in_progress');
  return `# AI Risk Identification Report
**Product:** ${product.name}

---

## Critical Risks

${overdueEpics.length > 0 ? `### 1. Schedule Risk — ${overdueEpics.length} Overdue Epics
**Severity:** HIGH
**Impact:** Delivery delays affecting ${overdueEpics.length} epics
**Affected Items:**
${overdueEpics.slice(0, 5).map(e => `- ${e.title} (due ${new Date(e.dueDate).toLocaleDateString()}, ${e.progress}% done)`).join('\n')}
**Mitigation:** Re-evaluate scope, add resources, or renegotiate deadlines with stakeholders.` : '### 1. No overdue epics detected. Schedule risk is low.'}

${blockedStories.length > 0 ? `### 2. Execution Risk — ${blockedStories.length} Blocked Stories
**Severity:** ${blockedStories.length > 5 ? 'HIGH' : 'MEDIUM'}
**Impact:** ${blockedStories.length} stories cannot progress
**Affected Items:**
${blockedStories.slice(0, 5).map(s => `- ${s.title} (assigned to ${s.assignee})`).join('\n')}
**Mitigation:** Daily standup review, escalate blockers, pair-programming sessions.` : '### 2. No blocked stories. Execution is flowing normally.'}

${lowProgress.length > 0 ? `### 3. Velocity Risk — ${lowProgress.length} Low-Progress Epics
**Severity:** MEDIUM
**Impact:** Epics with <30% progress despite being in-progress
**Affected Items:**
${lowProgress.slice(0, 3).map(e => `- ${e.title} (${e.progress}% done, started ${new Date(e.startDate).toLocaleDateString()})`).join('\n')}
**Mitigation:** Check for scope creep, validate estimates, consider splitting epics.` : '### 3. All in-progress epics have healthy velocity.'}

## Emerging Risks
4. **Team Capacity** — Current sprint has ${state.sprints.filter(s => s.productId === product.id && s.status === 'active').reduce((a, s) => a + (s.committed - s.completed), 0)} incomplete items across active sprints.
5. **Technical Debt** — ${state.stories.filter(s => s.productId === product.id && s.type === 'bug').length} bugs in backlog. Recommend dedicating 20% of next sprint to debt reduction.
6. **Dependencies** — ${state.roadmaps.flatMap(r => r.items).filter(i => i.dependencies.length > 0).length} roadmap items have cross-team dependencies.

## Risk Heatmap
| Risk | Likelihood | Impact | Score |
|------|-----------|--------|-------|
| Schedule slippage | ${overdueEpics.length > 2 ? 'High' : 'Medium'} | High | ${overdueEpics.length > 2 ? '9' : '6'}/10 |
| Team burnout | Medium | High | 6/10 |
| Scope creep | Medium | Medium | 4/10 |
| Technical debt | High | Medium | 6/10 |

---

*Generated risk report from ${state.epics.filter(e => e.productId === product.id).length} epics, ${state.stories.filter(s => s.productId === product.id).length} stories, and ${state.sprints.filter(s => s.productId === product.id).length} sprints.*`;
}

function genSprintPlanning(product: Product): string {
  const state = getState();
  const backlog = state.stories.filter(s => s.productId === product.id && (s.status === 'backlog' || s.status === 'todo'));
  const activeSprint = state.sprints.find(s => s.productId === product.id && s.status === 'active');
  return `# AI Sprint Planning Recommendation
**Product:** ${product.name}
${activeSprint ? `**Current Sprint:** ${activeSprint.name} (${activeSprint.completed}/${activeSprint.committed} completed)` : '**No active sprint**'}

---

## Sprint Capacity Analysis
- **Team Velocity (avg):** ${Math.floor(Math.random() * 20 + 30)} story points
- **Available Capacity:** ${Math.floor(Math.random() * 10 + 35)} story points
- **Backlog Items Available:** ${backlog.length}

## Recommended Sprint Backlog
${backlog.slice(0, 8).map((s, i) => `${i + 1}. **${s.title}** [${s.storyPoints} pts] — ${s.priority}
   - Type: ${s.type} | Status: ${s.status} | Assignee: ${s.assignee}
   - RICE: ${(s.storyPoints * 2)}/${s.storyPoints + 3}`).join('\n')}

## Sprint Goal
${pick(['Ship the core dashboard real-time features and resolve top customer-reported bugs', 'Complete the SSO integration and improve onboarding flow', 'Deliver the reporting v2 suite and stabilize performance', 'Launch the AI insights beta and close all P0 bugs'])}

## Capacity Utilization
- **Committed:** ${backlog.slice(0, 8).reduce((a, s) => a + s.storyPoints, 0)} story points
- **Buffer:** ${Math.floor(Math.random() * 10 + 5)}% (recommended 15-20%)
- **Risk Items:** ${backlog.filter(s => s.priority === 'P0').length} P0 items included

## Recommendations
1. **Include** ${backlog.filter(s => s.priority === 'P0').length} P0 items for critical fixes
2. **Stretch goals:** ${pickN(backlog.filter(s => s.priority === 'P2'), 2).map(s => s.title).join(', ')}
3. **Carry-over risk:** ${activeSprint ? `${activeSprint.committed - activeSprint.completed} items from current sprint` : 'None'}

---

*Generated sprint plan from ${backlog.length} backlog items with capacity and velocity analysis.*`;
}

function genFeatureRecommendations(product: Product): string {
  const features = [
    { name: 'AI-Powered Smart Summaries', impact: 'High', effort: 'Medium', rice: 8.5 },
    { name: 'Custom Dashboard Builder', impact: 'High', effort: 'Low', rice: 9.2 },
    { name: 'Real-time Collaboration', impact: 'Medium', effort: 'High', rice: 6.0 },
    { name: 'Advanced Filter Presets', impact: 'Medium', effort: 'Low', rice: 8.0 },
    { name: 'Mobile Push Notifications', impact: 'Medium', effort: 'Medium', rice: 7.0 },
    { name: 'Integration Webhooks v2', impact: 'High', effort: 'Medium', rice: 7.8 },
    { name: 'Bulk Operations API', impact: 'High', effort: 'Low', rice: 8.8 },
    { name: 'Audit Trail Export', impact: 'Low', effort: 'Low', rice: 6.5 },
  ];
  const selected = pickN(features, 5).sort((a, b) => b.rice - a.rice);
  return `# AI Feature Recommendations
**Product:** ${product.name}

---

Based on analysis of ${product.name}'s current state, customer feedback, and market trends, here are the top recommended features:

${selected.map((f, i) => `## ${i + 1}. ${f.name}
- **Business Impact:** ${f.impact}
- **Development Effort:** ${f.effort}
- **RICE Score:** ${f.rice}/10
- **Recommendation:** ${f.rice > 8 ? 'Ship immediately — high ROI' : f.rice > 6.5 ? 'Plan for next quarter' : 'Consider for backlog'}

### Why This Feature
${pick([
  'Directly addresses the top 3 customer feedback themes',
  'Aligns with the product vision of AI-first intelligence',
  'Competitors lack this capability — differentiation opportunity',
  'High adoption potential based on similar feature data',
  'Reduces support ticket volume by an estimated 15%',
])}

### Success Metrics
- ${pick(['Adoption rate > 40% within 30 days', 'Time saved per user > 2 hours/week', 'NPS impact +5', 'Revenue impact > $200K ARR'])}`).join('\n\n---\n\n')}

## Priority Matrix Summary
| Feature | Impact | Effort | RICE | Action |
|---------|--------|--------|------|--------|
${selected.map(f => `| ${f.name} | ${f.impact} | ${f.effort} | ${f.rice} | ${f.rice > 8 ? 'Now' : 'Next'} |`).join('\n')}

---

*Recommendations generated from ${product.name}'s feedback analysis, market data, and strategic alignment scoring.*`;
}

function genReleaseNotes(product: Product): string {
  const state = getState();
  const recentRelease = state.releases.filter(r => r.productId === product.id).slice(0, 1)[0];
  const doneStories = state.stories.filter(s => s.productId === product.id && s.status === 'done').slice(0, 6);
  return `# Release Notes
## ${product.name} ${recentRelease ? recentRelease.version : 'v2.5.0'}
**Release Date:** ${recentRelease ? new Date(recentRelease.date).toLocaleDateString() : new Date().toLocaleDateString()}

---

## What's New

${doneStories.slice(0, 4).map((s, i) => `### ${i + 1}. ${s.title}
${s.description}`).join('\n\n')}

## Improvements
${pickN([
  'Dashboard loading performance improved by 40%',
  'Search results now load 3x faster with semantic indexing',
  'Notification preferences now support per-project settings',
  'API rate limits increased to 10,000 requests/hour',
  'Mobile app battery usage reduced by 25%',
  'Export to CSV now supports 50,000+ rows',
], 4).map(i => `- ${i}`).join('\n')}

## Bug Fixes
${pickN([
  'Fixed issue where dashboard widgets would occasionally disappear on refresh',
  'Resolved pagination bug affecting lists with more than 100 items',
  'Fixed incorrect date formatting in exported reports',
  'Resolved SSO redirect loop for certain SAML configurations',
  'Fixed notification badge not clearing after reading all items',
  'Resolved memory leak in long-running dashboard sessions',
], 4).map(b => `- ${b}`).join('\n')}

## Known Issues
- ${pick(['Some custom chart types may not render on Safari 16', 'Bulk import of 10,000+ rows may timeout — use API for large imports', 'Dark mode toggle may require a page refresh on first use'])}

## Upgrade Notes
- No breaking changes in this release
- API consumers are encouraged to update to the latest SDK
- New environment variables: \`FEATURE_FLAG_AI_INSIGHTS\`

---

*Release notes generated from ${doneStories.length} completed stories and recent improvements.*`;
}

function genMeetingSummary(product?: Product): string {
  return `# AI Meeting Summary

## Meeting Overview
**Date:** ${new Date().toLocaleDateString()}
**Type:** ${pick(['Sprint Planning', 'Stakeholder Review', 'Product Discovery', 'Engineering Sync', 'OKR Review'])}
**Duration:** ${pick([30, 45, 60, 90])} minutes
**Attendees:** ${pick(['Sarah Chen, Marcus Johnson, Priya Patel', 'David Kim, Lisa Wang, Carlos Mendez', 'James Wilson, Aisha Mohammed, Tom Anderson'])}

## Summary
The meeting focused on ${pick(['aligning the team on Q3 roadmap priorities', 'reviewing sprint progress and addressing blockers', 'gathering customer discovery insights', 'planning the next release cycle'])}. Key discussion points included resource allocation, timeline adjustments, and risk mitigation strategies. The team agreed on ${pick([3, 4, 5])} action items with clear owners and deadlines.

## Key Decisions
1. **Approved** moving the AI Insights epic to the Now lane on the roadmap
2. **Deferred** the mobile redesign to Q4 to prioritize enterprise features
3. **Allocated** 2 additional engineers to the API gateway epic
4. **Agreed** to adopt a phased rollout for the upcoming release

## Action Items
${pick([
  ['Sarah Chen — Finalize PRD for AI Insights by Friday',
  'Marcus Johnson — Update sprint board with new capacity',
  'Priya Patel — Schedule customer interviews for next week',
  'David Kim — Prepare stakeholder presentation for Monday'],
  ['Lisa Wang — Review competitor analysis and share findings',
  'Tom Anderson — Follow up with engineering on timeline',
  'Elena Rodriguez — Draft success metrics for new features',
  'Kevin O\'Brien — Update roadmap with new dependencies'],
]).map((a, i) => `${i + 1}. ${a}`).join('\n')}

## Discussion Notes
- Team expressed concern about ${pick(['timeline pressure', 'resource constraints', 'technical complexity'])}
- ${pick(['Customer feedback', 'User research', 'Analytics data'])} suggests strong demand for AI features
- ${pick(['Engineering', 'Design', 'Product'])} team is confident in delivery timeline
- Risk of ${pick(['scope creep', 'dependency delays', 'resource conflicts'])} was discussed and mitigated

## Follow-up
- Next meeting: ${pick(['Sprint Review next Friday', 'Stakeholder update next Monday', 'Planning session next Wednesday'])}
- Async updates in #product-team channel

---

*Summary generated from meeting transcript with key decisions and action items extracted.*`;
}

function genDecisionLog(product?: Product): string {
  return `# Decision Log

## Recent Decisions

### DEC-001: Adopt Event-Driven Architecture
**Date:** ${new Date(Date.now() - 86400000 * 3).toLocaleDateString()}
**Decided by:** ${pick(['Sarah Chen (CPO)', 'Marcus Johnson (Eng Manager)', 'Leadership Team'])}
**Context:** The team needed to choose between monolithic and event-driven architecture for the next major release.
**Decision:** Adopt event-driven architecture with Apache Kafka for async communication.
**Rationale:** Better scalability, easier to add new services, aligns with long-term growth plans.
**Impact:** High — affects all new service development.
**Status:** Implemented

### DEC-002: Prioritize AI Features over Mobile Redesign
**Date:** ${new Date(Date.now() - 86400000 * 7).toLocaleDateString()}
**Decided by:** Sarah Chen (CPO)
**Context:** Limited engineering capacity required choosing between AI feature development and mobile app redesign.
**Decision:** Prioritize AI features; defer mobile redesign to Q4.
**Rationale:** AI features have higher business value (RICE 8.5 vs 5.2) and stronger customer demand.
**Impact:** Medium — mobile users will see incremental improvements only.
**Status:** In Progress

### DEC-003: Ship Beta to 10% of Users
**Date:** ${new Date(Date.now() - 86400000 * 14).toLocaleDateString()}
**Decided by:** Leadership Team
**Context:** Feature is functionally complete but needs real-world validation.
**Decision:** Release as beta to 10% of users with feature flag control.
**Rationale:** Reduces risk, gathers feedback, allows quick rollback.
**Impact:** Low — reversible with feature flags.
**Status:** Completed

### DEC-004: Integrate Third-Party Auth Provider
**Date:** ${new Date(Date.now() - 86400000 * 21).toLocaleDateString()}
**Decided by:** Marcus Johnson (Eng Manager)
**Context:** Building SSO in-house would take 6+ weeks; third-party integration takes 2 weeks.
**Decision:** Use Auth0 for enterprise SSO/SAML integration.
**Rationale:** Faster time-to-market, enterprise-grade security, reduces maintenance burden.
**Impact:** Medium — adds vendor dependency but accelerates delivery.
**Status:** In Progress

---

*Decision log maintained with context, rationale, and impact tracking for all major product decisions.*`;
}

function genRequirements(product: Product): string {
  return `# AI-Generated Requirements Specification
## ${product.name} — Feature Requirements

---

## 1. Business Requirements
1. The system shall increase user engagement by 25% within 6 months of launch
2. The system shall generate measurable ROI within the first quarter of deployment
3. The system shall support the company's expansion into ${pick(['enterprise', 'mid-market', 'international'])} segment
4. The system shall reduce operational overhead by 30% through automation

## 2. Functional Requirements
1. The system shall provide a real-time dashboard with ${pick([5, 6, 8, 10])} configurable widgets
2. The system shall support ${pick([10, 25, 50, 100])} concurrent users per workspace
3. The system shall allow users to create, edit, and delete items with optimistic updates
4. The system shall provide full-text and semantic search across all content
5. The system shall send notifications via email, in-app, and push channels
6. The system shall support bulk operations on ${pick([100, 500, 1000])}+ items
7. The system shall provide role-based access control with ${pick([5, 8, 10])} permission levels

## 3. Non-Functional Requirements
1. **Performance:** 95% of API responses shall complete within 500ms
2. **Scalability:** The system shall support 100K concurrent connections
3. **Availability:** The system shall maintain 99.9% uptime (8.76h downtime/year max)
4. **Security:** All data shall be encrypted at rest (AES-256) and in transit (TLS 1.3)
5. **Accessibility:** The system shall comply with WCAG 2.1 Level AA
6. **Browser Support:** Latest 2 versions of Chrome, Firefox, Safari, Edge

## 4. API Requirements
1. All endpoints shall follow RESTful conventions with proper HTTP methods
2. Authentication via JWT Bearer tokens, refreshed every 60 minutes
3. Rate limiting: 10,000 requests/hour per API key
4. Pagination via cursor-based approach (max 100 items per page)
5. Versioning via URL path (/api/v1/)
6. Error responses shall include error code, message, and request ID

## 5. UI Requirements
1. Responsive design supporting mobile (375px), tablet (768px), and desktop (1280px+)
2. Dark and light mode with system preference detection
3. Loading states (skeletons) for all async data fetches
4. Empty states with clear calls-to-action
5. Toast notifications for success/error feedback
6. Keyboard navigation support for all interactive elements

## 6. Security Requirements
1. OWASP Top 10 protection (XSS, CSRF, SQL injection, etc.)
2. SSO via SAML 2.0 and OAuth 2.0 / OIDC
3. Multi-factor authentication (TOTP, SMS)
4. Audit logging for all data modifications
5. Data retention policies configurable per workspace
6. GDPR compliance with right-to-erasure and data portability

## 7. Acceptance Criteria
- Given valid credentials, when a user logs in, then they are redirected to their dashboard within 2s
- Given a workspace with 10K items, when a user searches, then results appear within 500ms
- Given an admin, when they configure SSO, then users can authenticate via SAML within 5 minutes
- Given a rate-limited client, when they exceed 10K requests, then a 429 response is returned

## 8. Test Scenarios
1. **Performance Test:** 1000 concurrent users loading dashboard simultaneously
2. **Security Test:** Penetration testing against all API endpoints
3. **Integration Test:** SSO flow with 3 different SAML providers
4. **Accessibility Test:** Screen reader and keyboard-only navigation
5. **Load Test:** Bulk import of 50,000 records via API

## 9. Edge Cases
1. User session expires during a long-running bulk operation
2. Two users edit the same item simultaneously (conflict resolution)
3. Network disconnects during real-time dashboard updates
4. Search query returns zero results (empty state handling)
5. API rate limit hit during critical workflow

## 10. Validation Rules
1. Email format: RFC 5322 compliant
2. Password: min 12 chars, 1 upper, 1 lower, 1 number, 1 special
3. Workspace name: 3-50 characters, alphanumeric + spaces
4. File upload: max 50MB, types: pdf, docx, xlsx, csv
5. Date range: start date must be before end date

---

*Requirements specification generated with ${10} sections covering business, functional, non-functional, API, UI, security, and testing requirements.*`;
}

function genGeneral(prompt: string, product?: Product): string {
  const state = getState();
  return `I'm your AI Product Management Copilot. I can help you with:

**Content Generation:**
- Write a PRD for a feature
- Generate user stories with acceptance criteria
- Create epic breakdowns
- Generate user personas
- Write product vision statements

**Planning & Prioritization:**
- Suggest roadmap items
- Plan a sprint
- Recommend features based on data
- Prioritize using RICE/MoSCoW

**Analysis:**
- Competitor analysis
- Risk identification
- Customer feedback analysis
- Experiment recommendations

**Documentation:**
- Generate release notes
- Summarize meetings
- Create decision logs
- Generate full requirements specs

${product ? `I'm currently analyzing **${product.name}** context (${state.epics.filter(e => e.productId === product.id).length} epics, ${state.stories.filter(s => s.productId === product.id).length} stories, ${state.feedback.filter(f => f.productId === product.id).length} feedback items).

Try asking me: "Write a PRD for the AI Insights feature" or "What are the top risks for ${product.name}?"` : 'Try asking me: "Write a PRD for a new analytics dashboard" or "Generate user stories for a mobile app"'}`;
}

export function generateAIResponse(prompt: string, contextProduct?: string): AIResponse {
  const intent = detectIntent(prompt);
  const state = getState();
  let product: Product | undefined;
  if (contextProduct) {
    product = state.products.find(p => p.id === contextProduct);
  }
  if (!product) {
    product = findContextProduct(prompt);
  }

  let content = '';
  switch (intent) {
    case 'prd': content = genPRD(product!, findContextEpic(prompt, product)); break;
    case 'user_stories': content = genUserStories(product!, findContextEpic(prompt, product)); break;
    case 'acceptance_criteria': content = genAcceptanceCriteria(product!); break;
    case 'epics': content = genEpics(product!); break;
    case 'personas': content = genPersonas(product!); break;
    case 'product_vision': content = genProductVision(product!); break;
    case 'roadmap_suggestions': content = genRoadmapSuggestions(product!); break;
    case 'competitor_analysis': content = genCompetitorAnalysis(product!); break;
    case 'risk_identification': content = genRiskIdentification(product!); break;
    case 'sprint_planning': content = genSprintPlanning(product!); break;
    case 'feature_recommendations': content = genFeatureRecommendations(product!); break;
    case 'release_notes': content = genReleaseNotes(product!); break;
    case 'meeting_summary': content = genMeetingSummary(product); break;
    case 'decision_log': content = genDecisionLog(product); break;
    case 'requirements': content = genRequirements(product!); break;
    default: content = genGeneral(prompt, product); break;
  }

  return { content, intent, context: product?.name };
}

export const AI_SUGGESTIONS = [
  { label: 'Write a PRD', prompt: 'Write a PRD for the AI-Powered Insights feature' },
  { label: 'Generate user stories', prompt: 'Generate user stories for the real-time dashboard' },
  { label: 'Acceptance criteria', prompt: 'Generate acceptance criteria for the dashboard feature' },
  { label: 'Create epics', prompt: 'Create epics for the next quarter' },
  { label: 'Generate personas', prompt: 'Generate user personas for the product' },
  { label: 'Product vision', prompt: 'Write a product vision statement' },
  { label: 'Roadmap suggestions', prompt: 'Suggest roadmap items for the next quarter' },
  { label: 'Competitor analysis', prompt: 'Do a competitor analysis' },
  { label: 'Risk identification', prompt: 'Identify risks for the current product' },
  { label: 'Sprint planning', prompt: 'Help me plan the next sprint' },
  { label: 'Feature recommendations', prompt: 'Recommend features to build next' },
  { label: 'Release notes', prompt: 'Generate release notes for the latest release' },
  { label: 'Meeting summary', prompt: 'Summarize the last meeting' },
  { label: 'Decision log', prompt: 'Create a decision log' },
  { label: 'Requirements spec', prompt: 'Generate a full requirements specification' },
];
