import type {
  AppState, User, Product, Epic, Story, Task, Sprint, Roadmap, RoadmapItem,
  Release, Idea, Feedback, Experiment, Competitor, Document, Meeting,
  Notification, AuditLog, OKR, AnalyticsPoint, UserRole, ItemStatus, Priority, Report,
} from './types';

const NAMES = [
  'Sarah Chen', 'Marcus Johnson', 'Priya Patel', 'David Kim', 'Elena Rodriguez',
  'James Wilson', 'Aisha Mohammed', 'Tom Anderson', 'Lisa Wang', 'Carlos Mendez',
  'Rachel Green', 'Kevin O\'Brien', 'Yuki Tanaka', 'Olivia Martinez', 'Ahmed Hassan',
  'Sophie Laurent', 'Nathan Brooks', 'Diana Volkov', 'Michael Scott', 'Jessica Liu',
];

const ROLE_TITLES: Record<UserRole, { title: string; dept: string }[]> = {
  Administrator: [{ title: 'System Administrator', dept: 'IT' }],
  ChiefProductOfficer: [{ title: 'Chief Product Officer', dept: 'Executive' }],
  ProductManager: [{ title: 'Senior Product Manager', dept: 'Product' }, { title: 'Product Manager', dept: 'Product' }],
  AssociateProductManager: [{ title: 'Associate Product Manager', dept: 'Product' }],
  BusinessAnalyst: [{ title: 'Business Analyst', dept: 'Product' }],
  UXDesigner: [{ title: 'Senior UX Designer', dept: 'Design' }],
  EngineeringManager: [{ title: 'Engineering Manager', dept: 'Engineering' }],
  SoftwareEngineer: [{ title: 'Senior Software Engineer', dept: 'Engineering' }, { title: 'Software Engineer', dept: 'Engineering' }],
  QAEngineer: [{ title: 'QA Engineer', dept: 'Engineering' }],
  Stakeholder: [{ title: 'VP of Sales', dept: 'Sales' }, { title: 'VP of Marketing', dept: 'Marketing' }],
};

const AVATAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const rand = seeded(42);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)] as T;
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const id = (p: string, n: number) => `${p}-${String(n).padStart(4, '0')}`;

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
function dateOffset(days: number): string { return daysFromNow(days); }

const PRODUCT_DATA = [
  { name: 'Atlas Analytics Platform', vision: 'The unified analytics platform that turns data into decisions for enterprise teams.', team: 'Platform Team', color: '#3b82f6', domain: 'analytics' },
  { name: 'Nimbus Cloud Suite', vision: 'Seamless cloud infrastructure management for modern engineering organizations.', team: 'Cloud Team', color: '#10b981', domain: 'cloud' },
  { name: 'Pulse Customer Hub', vision: 'A 360-degree customer experience platform powered by real-time signals.', team: 'CX Team', color: '#f59e0b', domain: 'cx' },
  { name: 'Forge DevTools', vision: 'Developer-first tooling that accelerates the software delivery lifecycle.', team: 'DevTools Team', color: '#8b5cf6', domain: 'devtools' },
  { name: 'Insight BI Engine', vision: 'Self-service business intelligence that empowers every team member.', team: 'BI Team', color: '#06b6d4', domain: 'bi' },
];

const EPIC_TITLES = [
  'Real-time Data Pipeline', 'SSO & Enterprise Auth', 'Mobile App v2', 'API Gateway Redesign',
  'AI-Powered Insights', 'Workflow Automation Engine', 'Multi-tenant Architecture',
  'Advanced Reporting Suite', 'Customer Onboarding Flow', 'Billing & Subscription Mgmt',
  'Performance Optimization', 'Security Hardening', 'Integration Marketplace',
  'Collaboration Features', 'Data Export & Compliance', 'Custom Dashboard Builder',
  'Notification Center', 'Search Infrastructure', 'Audit & Governance', 'Webhook System',
];

const STORY_TITLES = [
  'Implement OAuth2 flow', 'Add dark mode support', 'Create dashboard widget SDK',
  'Build export to CSV', 'Add bulk import wizard', 'Implement role-based access',
  'Add real-time updates via WebSocket', 'Create onboarding checklist',
  'Build search with filters', 'Add keyboard shortcuts', 'Implement drag-and-drop reordering',
  'Add email notifications', 'Create API rate limiting', 'Build audit log viewer',
  'Add data visualization charts', 'Implement version history', 'Add commenting system',
  'Create custom field builder', 'Build saved views', 'Add CSV import mapping',
  'Implement SAML integration', 'Add MFA support', 'Create admin console',
  'Build webhook configuration UI', 'Add activity timeline', 'Implement soft delete',
  'Add pagination to lists', 'Create bulk edit mode', 'Build template gallery',
  'Add inline editing', 'Implement optimistic updates', 'Add error boundary handling',
  'Create empty states', 'Build loading skeletons', 'Add toast notifications',
  'Implement undo/redo', 'Add command palette', 'Create settings page',
  'Build profile management', 'Add team management', 'Implement invite flow',
  'Add password reset', 'Create account deactivation', 'Build data retention policy',
  'Add GDPR compliance tools', 'Implement data anonymization', 'Create backup scheduler',
  'Add health check endpoint', 'Build metrics collector', 'Implement caching layer',
];

const TASK_TITLES = [
  'Write technical spec', 'Review PR', 'Update documentation', 'Write unit tests',
  'Integration testing', 'Code review', 'Fix failing tests', 'Update API docs',
  'Create Figma mockups', 'User testing session', 'Stakeholder demo', 'Deploy to staging',
  'Performance benchmark', 'Security review', 'Accessibility audit', 'Update changelog',
];

const FEEDBACK_TEXTS = [
  'The new dashboard is incredibly fast and the charts are beautiful. Love the real-time updates!',
  'Would love to see a dark mode option. The white background strains my eyes during long sessions.',
  'Export to CSV is broken when I have more than 1000 rows. Please fix this urgently.',
  'The onboarding flow was confusing. Took me 3 days to figure out how to invite my team.',
  'API documentation is excellent. We integrated in under a day. Great developer experience.',
  'Please add SSO support. Our security team requires SAML for enterprise tools.',
  'The mobile app crashes on iOS 17 when I try to open reports. High priority for us.',
  'Love the new AI insights feature! It saved my team hours of analysis this week.',
  'Pricing is too high for small teams. Consider a startup tier under $50/month.',
  'The search feature is slow and doesn\'t return relevant results. Needs improvement.',
  'Bulk import worked flawlessly. Imported 5000 records without a single error.',
  'Need webhook support for our CI/CD pipeline. Currently have to poll for changes.',
  'The collaboration features are a game changer. My team can finally work together in real time.',
  'Performance has degraded significantly since the last update. Pages take 5+ seconds to load.',
  'Customer support was amazing. They helped us migrate from our old tool in one weekend.',
  'Please add more integrations. We specifically need Slack and Jira connectors.',
  'The reporting suite is powerful but the learning curve is steep. Better tutorials needed.',
  'Love the customizable dashboards. I built a view for each of my stakeholders in minutes.',
  'The notification system is too noisy. I get 50+ emails a day. Need better controls.',
  'Audit logs are comprehensive and our compliance team is very happy. Great work.',
];

const COMPETITOR_DATA = [
  { name: 'ProductBoard', website: 'productboard.com', marketShare: 18, pricing: '$20-$150/user/mo', threat: 'high' as const },
  { name: 'Aha! Software', website: 'aha.io', marketShare: 15, pricing: '$39-$149/user/mo', threat: 'medium' as const },
  { name: 'Roadmunk (Tempo)', website: 'roadmunk.com', marketShare: 8, pricing: '$19-$99/user/mo', threat: 'low' as const },
  { name: 'Asana', website: 'asana.com', marketShare: 25, pricing: '$10-$25/user/mo', threat: 'high' as const },
  { name: 'Monday.com', website: 'monday.com', marketShare: 12, pricing: '$8-$16/user/mo', threat: 'medium' as const },
  { name: 'Jira (Atlassian)', website: 'atlassian.com', marketShare: 35, pricing: '$7-$14/user/mo', threat: 'high' as const },
  { name: 'Notion', website: 'notion.so', marketShare: 20, pricing: '$0-$18/user/mo', threat: 'medium' as const },
  { name: 'Linear', website: 'linear.app', marketShare: 6, pricing: '$8-$14/user/mo', threat: 'low' as const },
  { name: 'Airfocus', website: 'airfocus.com', marketShare: 5, pricing: '$19-$69/user/mo', threat: 'low' as const },
  { name: 'Confluence', website: 'atlassian.com', marketShare: 15, pricing: '$5-$10/user/mo', threat: 'medium' as const },
  { name: 'Miro', website: 'miro.com', marketShare: 10, pricing: '$0-$16/user/mo', threat: 'low' as const },
  { name: 'Figma (FigJam)', website: 'figma.com', marketShare: 14, pricing: '$0-$15/user/mo', threat: 'low' as const },
  { name: 'ClickUp', website: 'clickup.com', marketShare: 9, pricing: '$5-$19/user/mo', threat: 'medium' as const },
  { name: 'Wrike', website: 'wrike.com', marketShare: 7, pricing: '$10-$25/user/mo', threat: 'low' as const },
  { name: 'ProductPlan', website: 'productplan.com', marketShare: 4, pricing: '$39-$69/user/mo', threat: 'low' as const },
];

const DOC_TEMPLATES = [
  { type: 'prd' as const, title: 'PRD: Real-time Analytics Dashboard', tags: ['analytics', 'dashboard', 'real-time'] },
  { type: 'prd' as const, title: 'PRD: Mobile App v2.0', tags: ['mobile', 'ios', 'android'] },
  { type: 'prd' as const, title: 'PRD: AI-Powered Insights Engine', tags: ['ai', 'ml', 'insights'] },
  { type: 'architecture' as const, title: 'Architecture: Multi-tenant Data Pipeline', tags: ['architecture', 'data', 'infrastructure'] },
  { type: 'architecture' as const, title: 'Architecture: API Gateway Redesign', tags: ['api', 'gateway', 'microservices'] },
  { type: 'research' as const, title: 'User Research: Enterprise Onboarding Study', tags: ['research', 'onboarding', 'enterprise'] },
  { type: 'research' as const, title: 'Competitive Analysis: Q3 2025', tags: ['research', 'competitive', 'analysis'] },
  { type: 'meeting_notes' as const, title: 'Q3 Roadmap Planning Notes', tags: ['meeting', 'roadmap', 'planning'] },
  { type: 'meeting_notes' as const, title: 'Stakeholder Review: Atlas Platform', tags: ['meeting', 'stakeholder', 'review'] },
  { type: 'roadmap' as const, title: 'Roadmap: Nimbus Cloud 2025-2026', tags: ['roadmap', 'cloud', 'strategy'] },
  { type: 'design' as const, title: 'Design System: Component Library v3', tags: ['design', 'components', 'system'] },
  { type: 'design' as const, title: 'UX Research: Dashboard Usability', tags: ['design', 'ux', 'research'] },
  { type: 'contract' as const, title: 'Vendor Agreement: Data Pipeline Provider', tags: ['contract', 'vendor', 'legal'] },
  { type: 'prd' as const, title: 'PRD: Workflow Automation Engine', tags: ['workflow', 'automation', 'product'] },
  { type: 'architecture' as const, title: 'Architecture: Event-Driven Notification System', tags: ['architecture', 'events', 'notifications'] },
];

const MEETING_DATA = [
  { title: 'Sprint Planning - Atlas Team', type: 'planning' as const },
  { title: 'Weekly Standup - Nimbus Cloud', type: 'standup' as const },
  { title: 'Q3 OKR Review', type: 'review' as const },
  { title: 'Customer Discovery: Enterprise Segment', type: 'discovery' as const },
  { title: 'Stakeholder Update: Board Presentation', type: 'stakeholder' as const },
  { title: 'Sprint Retrospective - Pulse Team', type: 'retrospective' as const },
  { title: 'Roadmap Alignment Workshop', type: 'planning' as const },
  { title: 'Engineering Architecture Review', type: 'review' as const },
];

const NOTIF_TEMPLATES = [
  { type: 'sprint_reminder' as const, title: 'Sprint ends in 2 days', message: 'Atlas Sprint 24 has 12 stories remaining. Review burndown.' },
  { type: 'roadmap_update' as const, title: 'Roadmap item moved', message: 'AI-Powered Insights moved from Next to Now on Atlas roadmap.' },
  { type: 'experiment_completion' as const, title: 'Experiment concluded', message: 'A/B Test: Dashboard CTA Color reached 95% significance. Variant B won.' },
  { type: 'feature_approval' as const, title: 'Feature needs approval', message: 'SSO & Enterprise Auth epic is ready for CPO review.' },
  { type: 'release_reminder' as const, title: 'Release scheduled tomorrow', message: 'Nimbus Cloud v3.4.0 is scheduled for release on Friday.' },
  { type: 'stakeholder_update' as const, title: 'Stakeholder report ready', message: 'Weekly stakeholder update for Pulse Customer Hub is ready to review.' },
];

export function generateSeedData(): AppState {
  // Users
  const users: User[] = [];
  let nameIdx = 0;
  const roleAssigns: UserRole[] = [
    'Administrator', 'ChiefProductOfficer', 'ProductManager', 'ProductManager',
    'ProductManager', 'AssociateProductManager', 'BusinessAnalyst', 'UXDesigner',
    'EngineeringManager', 'SoftwareEngineer', 'SoftwareEngineer', 'QAEngineer',
    'Stakeholder', 'Stakeholder', 'BusinessAnalyst', 'SoftwareEngineer',
    'UXDesigner', 'AssociateProductManager', 'EngineeringManager', 'SoftwareEngineer',
  ];
  roleAssigns.forEach((role, i) => {
    const name = NAMES[nameIdx % NAMES.length]; nameIdx++;
    const titles = ROLE_TITLES[role];
    const titleInfo = titles[Math.floor(rand() * titles.length)];
    users.push({
      id: id('user', i + 1),
      name,
      email: name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '') + '@aipmos.com',
      role,
      avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
      title: titleInfo.title,
      department: titleInfo.dept,
      createdAt: dateOffset(-randInt(30, 365)),
    });
  });

  // Products
  const products: Product[] = PRODUCT_DATA.map((p, i) => ({
    id: id('prod', i + 1),
    name: p.name,
    description: `${p.name} is a ${p.domain} product designed for enterprise teams.`,
    vision: p.vision,
    status: i < 3 ? 'active' : i === 3 ? 'beta' : 'active',
    owner: pick(users.filter(u => u.role === 'ProductManager')).name,
    team: p.team,
    startDate: dateOffset(-randInt(60, 400)),
    targetDate: dateOffset(randInt(30, 180)),
    health: pick(['green', 'green', 'yellow', 'red'] as const),
    metrics: {
      mau: randInt(5000, 50000),
      revenue: randInt(100000, 2000000),
      nps: randInt(20, 65),
      churn: Math.round(rand() * 5 * 10) / 10,
      adoption: randInt(45, 85),
      retention: randInt(70, 95),
    },
    color: p.color,
  }));

  // Epics
  const epics: Epic[] = [];
  const stories: Story[] = [];
  const tasks: Task[] = [];
  const sprints: Sprint[] = [];
  let storyCounter = 0;
  let taskCounter = 0;

  for (let i = 0; i < 20; i++) {
    const product = products[i % products.length];
    const epicId = id('epic', i + 1);
    const status = pick(['backlog', 'todo', 'in_progress', 'in_progress', 'done', 'in_review'] as const);
    const epicStoryIds: string[] = [];

    // 5-10 stories per epic
    const storyCount = randInt(5, 10);
    for (let j = 0; j < storyCount && storyCounter < 150; j++) {
      storyCounter++;
      const storyId = id('story', storyCounter);
      epicStoryIds.push(storyId);
      const storyStatus = pick(['backlog', 'todo', 'in_progress', 'in_review', 'done', 'done', 'blocked'] as const);
      const assignee = pick(users).name;
      const labels: string[] = [];
      const labelPool = ['frontend', 'backend', 'api', 'ui', 'performance', 'security', 'analytics', 'mobile', 'accessibility', 'integration'];
      for (let k = 0; k < randInt(1, 3); k++) {
        const l = pick(labelPool);
        if (!labels.includes(l)) labels.push(l);
      }
      stories.push({
        id: storyId,
        epicId,
        productId: product.id,
        title: pick(STORY_TITLES),
        description: `As a user, I want to ${pick(STORY_TITLES).toLowerCase()} so that I can improve my workflow efficiency.`,
        type: pick(['story', 'story', 'story', 'task', 'bug', 'spike'] as const),
        status: storyStatus,
        priority: pick(['P0', 'P1', 'P1', 'P2', 'P2', 'P3'] as const),
        storyPoints: pick([1, 2, 3, 5, 8, 13]),
        assignee,
        labels,
        acceptanceCriteria: [
          'Given a valid user, when they perform the action, then the expected result is displayed.',
          'Given an invalid input, when the form is submitted, then an error message is shown.',
          'Given the feature is enabled, when the user accesses it, then it loads within 2 seconds.',
        ],
        dor: rand() > 0.4,
        dod: storyStatus === 'done',
        createdAt: dateOffset(-randInt(1, 60)),
      });

      // 2-4 tasks per story (up to 500 total)
      for (let k = 0; k < randInt(2, 4) && taskCounter < 500; k++) {
        taskCounter++;
        tasks.push({
          id: id('task', taskCounter),
          storyId,
          title: pick(TASK_TITLES),
          status: storyStatus === 'done' ? 'done' : pick(['todo', 'in_progress', 'done', 'todo'] as const),
          assignee: pick(users).name,
          hours: randInt(2, 16),
          done: storyStatus === 'done' || rand() > 0.6,
        });
      }
    }

    const progress = Math.round((epicStoryIds.filter(sid => stories.find(s => s.id === sid)?.status === 'done').length / epicStoryIds.length) * 100);
    epics.push({
      id: epicId,
      productId: product.id,
      title: pick(EPIC_TITLES),
      description: `This epic covers the delivery of ${pick(EPIC_TITLES).toLowerCase()} capabilities for ${product.name}.`,
      status,
      priority: pick(['P0', 'P1', 'P1', 'P2', 'P3'] as const),
      owner: pick(users).name,
      startDate: dateOffset(-randInt(10, 60)),
      dueDate: dateOffset(randInt(10, 90)),
      progress,
      storyIds: epicStoryIds,
    });
  }

  // Sprints
  for (let i = 0; i < products.length * 3; i++) {
    const product = products[i % products.length];
    const committed = randInt(20, 50);
    const completed = randInt(10, committed);
    sprints.push({
      id: id('sprint', i + 1),
      productId: product.id,
      name: `Sprint ${24 + i}`,
      startDate: dateOffset(-randInt(0, 60)),
      endDate: dateOffset(randInt(0, 14)),
      goal: pick(['Improve onboarding experience', 'Ship reporting v2', 'Performance optimization', 'Security hardening sprint', 'Mobile app polish']),
      status: pick(['planning', 'active', 'active', 'completed', 'completed', 'review'] as const),
      capacity: randInt(40, 60),
      committed,
      completed,
    });
  }

  // Roadmaps
  const roadmaps: Roadmap[] = [];
  for (let i = 0; i < 10; i++) {
    const product = products[i % products.length];
    const items: RoadmapItem[] = [];
    for (let j = 0; j < randInt(4, 8); j++) {
      items.push({
        id: id('rmi', i * 10 + j + 1),
        title: pick(EPIC_TITLES),
        type: pick(['milestone', 'feature', 'release', 'initiative'] as const),
        startDate: dateOffset(randInt(-30, 120)),
        endDate: dateOffset(randInt(30, 180)),
        status: pick(['backlog', 'todo', 'in_progress', 'done'] as const),
        progress: randInt(0, 100),
        lane: pick(['now', 'next', 'later'] as const),
        dependencies: rand() > 0.5 ? [id('rmi', randInt(1, 50))] : [],
        owner: pick(users).name,
      });
    }
    roadmaps.push({
      id: id('road', i + 1),
      productId: product.id,
      title: `${product.name} Roadmap ${pick(['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'H1 2025', 'H2 2025'])}`,
      quarter: pick(['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025']),
      items,
    });
  }

  // Releases
  const releases: Release[] = [];
  for (let i = 0; i < 20; i++) {
    const product = products[i % products.length];
    releases.push({
      id: id('rel', i + 1),
      productId: product.id,
      version: `v${randInt(1, 5)}.${randInt(0, 9)}.${randInt(0, 9)}`,
      name: pick(['Spring Release', 'Summer Update', 'Stability Release', 'Feature Drop', 'Security Patch', 'Performance Update']),
      date: dateOffset(randInt(-90, 90)),
      status: pick(['planned', 'in_progress', 'in_progress', 'released', 'released', 'planned'] as const),
      features: EPIC_TITLES.slice(0, randInt(2, 5)),
      notes: `This release includes ${randInt(3, 8)} new features, ${randInt(5, 15)} improvements, and ${randInt(2, 8)} bug fixes.`,
    });
  }

  // Ideas
  const ideaCategories = ['Growth', 'Retention', 'Efficiency', 'Integration', 'AI/ML', 'Mobile', 'Security', 'UX', 'Performance', 'Compliance'];
  const ideas: Idea[] = [];
  for (let i = 0; i < 30; i++) {
    const bv = randInt(1, 10);
    const ci = randInt(1, 10);
    const eff = randInt(1, 10);
    const score = (bv * ci) / eff;
    ideas.push({
      id: id('idea', i + 1),
      title: pick(EPIC_TITLES) + ' - ' + pick(STORY_TITLES),
      description: `Proposal to implement ${pick(STORY_TITLES).toLowerCase()} which would improve the overall product experience and drive user engagement.`,
      category: pick(ideaCategories),
      status: pick(['new', 'reviewing', 'reviewing', 'approved', 'rejected', 'converted'] as const),
      votes: randInt(1, 50),
      businessValue: bv,
      customerImpact: ci,
      effort: eff,
      priority: score > 5 ? 'P1' : score > 3 ? 'P2' : 'P3',
      submittedBy: pick(users).name,
      createdAt: dateOffset(-randInt(1, 90)),
      tags: [pick(ideaCategories), pick(ideaCategories)],
    });
  }

  // Feedback
  const feedback: Feedback[] = [];
  const segments = ['enterprise', 'midmarket', 'smb', 'startup'] as const;
  const companies = ['Acme Corp', 'TechFlow Inc', 'DataSystems LLC', 'CloudNine Co', 'ByteWorks Ltd', 'Nexus Group', 'Quantum Labs', 'Vertex Solutions', 'Apex Industries', 'StreamLine Co'];
  for (let i = 0; i < 200; i++) {
    const text = pick(FEEDBACK_TEXTS);
    const sentimentScore = Math.round((rand() * 2 - 1) * 100) / 100;
    const sentiment = sentimentScore > 0.3 ? 'positive' : sentimentScore < -0.3 ? 'negative' : 'neutral';
    feedback.push({
      id: id('fb', i + 1),
      productId: pick(products).id,
      customer: pick(NAMES),
      company: pick(companies),
      segment: pick(segments),
      text,
      sentiment: sentiment as 'positive' | 'neutral' | 'negative',
      sentimentScore,
      themes: [pick(['ui', 'performance', 'pricing', 'onboarding', 'integrations', 'mobile', 'support', 'reporting', 'security', 'collaboration'])],
      type: pick(['bug', 'feature_request', 'compliment', 'complaint', 'question'] as const),
      date: dateOffset(-randInt(0, 120)),
      priority: pick(['P0', 'P1', 'P2', 'P2', 'P3'] as const),
      status: pick(['new', 'new', 'triaged', 'addressed', 'watching'] as const),
    });
  }

  // Experiments
  const experiments: Experiment[] = [];
  for (let i = 0; i < 12; i++) {
    const status = pick(['draft', 'running', 'running', 'completed', 'completed', 'paused'] as const);
    const hasResults = status === 'completed';
    const aConv = randInt(3, 15);
    const bConv = randInt(3, 15);
    experiments.push({
      id: id('exp', i + 1),
      productId: pick(products).id,
      name: pick(['Dashboard CTA Color', 'Onboarding Flow Length', 'Pricing Page Layout', 'Search Results Format', 'Email Signup Placement', 'Feature Tooltip Style', 'Navigation Menu Order', 'Signup Form Fields']),
      hypothesis: `Changing ${pick(['the CTA color', 'onboarding step count', 'page layout', 'result format'])} will increase conversion by at least 10%.`,
      successMetric: pick(['Conversion Rate', 'Click-through Rate', 'Signup Rate', 'Feature Adoption', 'Time to Value', 'Retention (7-day)']),
      variantA: 'Current design (control)',
      variantB: pick(['New design with bold CTA', 'Simplified 3-step flow', 'Two-column layout', 'Card-based results']),
      status,
      startDate: dateOffset(-randInt(0, 60)),
      endDate: dateOffset(randInt(0, 30)),
      traffic: randInt(10, 100),
      results: hasResults ? {
        variantAConv: aConv,
        variantBConv: bConv,
        lift: Math.round(((bConv - aConv) / aConv) * 1000) / 10,
        significance: randInt(90, 99),
        winner: bConv > aConv ? 'B' : bConv < aConv ? 'A' : 'inconclusive',
      } : undefined,
    });
  }

  // Competitors
  const competitors: Competitor[] = COMPETITOR_DATA.map((c, i) => ({
    id: id('comp', i + 1),
    name: c.name,
    website: c.website,
    strengths: pick([['Strong brand', 'Large user base', 'Good integrations'], ['Comprehensive features', 'Enterprise focus', 'Good support'], ['Modern UI', 'Fast performance', 'API-first']]),
    weaknesses: pick([['Expensive', 'Steep learning curve', 'Slow to ship'], ['Limited integrations', 'No AI features', 'Poor mobile'], ['Small team', 'Limited enterprise features', 'No SSO']]),
    marketShare: c.marketShare,
    pricing: c.pricing,
    features: pick([['Roadmapping', 'Backlog', 'Analytics', 'Integrations'], ['PRDs', 'Prioritization', 'Roadmaps', 'Reporting'], ['Kanban', 'Sprints', 'Timelines', 'Dashboards']]),
    threat: c.threat,
    notes: `${c.name} is a ${c.threat} threat in the product management space. Monitor their feature releases quarterly.`,
  }));

  // Documents
  const documents: Document[] = DOC_TEMPLATES.map((d, i) => ({
    id: id('doc', i + 1),
    productId: i < products.length ? products[i].id : pick(products).id,
    title: d.title,
    type: d.type,
    content: `# ${d.title}\n\n## Overview\nThis document outlines the ${d.title.toLowerCase()} including objectives, scope, and key decisions.\n\n## Background\n${pick(['The team identified a need for', 'Based on user research, we determined', 'Following stakeholder feedback, we decided to'])} ${d.title.toLowerCase()}.\n\n## Goals\n- Improve user experience\n- Increase efficiency\n- Reduce time to value\n\n## Key Decisions\n1. Adopt a phased rollout approach\n2. Prioritize enterprise customers\n3. Invest in AI-assisted features\n\n## Next Steps\n- Finalize technical spec\n- Begin implementation in Sprint 25\n- Schedule stakeholder review`,
    author: pick(users).name,
    tags: d.tags,
    createdAt: dateOffset(-randInt(10, 120)),
    updatedAt: dateOffset(-randInt(0, 10)),
  }));

  // Meetings
  const meetings: Meeting[] = MEETING_DATA.map((m, i) => {
    const attendeeCount = randInt(3, 6);
    const attendees: string[] = [];
    for (let k = 0; k < attendeeCount; k++) attendees.push(pick(users).name);
    const actionCount = randInt(2, 5);
    const actionItems = Array.from({ length: actionCount }, (_, k) => ({
      id: id('ai', i * 10 + k + 1),
      text: pick(['Follow up with engineering on timeline', 'Update PRD with new requirements', 'Schedule user testing session', 'Prepare stakeholder presentation', 'Review competitor analysis', 'Draft success metrics']),
      assignee: pick(users).name,
      dueDate: dateOffset(randInt(3, 21)),
      done: rand() > 0.6,
    }));
    return {
      id: id('mtg', i + 1),
      title: m.title,
      date: dateOffset(-randInt(0, 30)),
      attendees,
      notes: `Meeting started with a review of current sprint progress. Team discussed blockers and dependencies. Key topics included roadmap alignment, resource allocation, and upcoming release planning. Several action items were identified and assigned.`,
      summary: `In this ${m.type} meeting, the team reviewed progress, identified ${actionCount} action items, and made key decisions about next steps. Main focus was on ${pick(['roadmap alignment', 'sprint goals', 'customer feedback', 'release planning', 'OKR progress'])}.`,
      actionItems,
      decisions: [
        'Approved moving the AI Insights epic to the Now lane.',
        'Deferred the mobile redesign to Q4.',
        'Allocated 2 additional engineers to the API gateway epic.',
      ],
      type: m.type,
      productId: pick(products).id,
    };
  });

  // OKRs
  const okrs: OKR[] = [];
  for (let i = 0; i < products.length * 2; i++) {
    const product = products[i % products.length];
    okrs.push({
      id: id('okr', i + 1),
      productId: product.id,
      objective: pick(['Increase user engagement by 25%', 'Reduce time-to-value by 40%', 'Achieve 90% enterprise retention', 'Grow revenue by 30%', 'Reach 50K monthly active users']),
      keyResults: [
        { id: id('kr', i * 3 + 1), text: 'Increase DAU/MAU ratio to 0.4', target: 40, current: randInt(20, 38), unit: '%' },
        { id: id('kr', i * 3 + 2), text: 'Reduce onboarding time to under 5 minutes', target: 5, current: randInt(5, 12), unit: 'min' },
        { id: id('kr', i * 3 + 3), text: 'Achieve NPS score of 50+', target: 50, current: randInt(30, 48), unit: 'score' },
      ],
      quarter: pick(['Q1 2025', 'Q2 2025', 'Q3 2025']),
      owner: pick(users).name,
    });
  }

  // Analytics time series
  const analytics: Record<string, AnalyticsPoint[]> = {};
  products.forEach((p, pi) => {
    const points: AnalyticsPoint[] = [];
    let baseUsers = randInt(1000, 5000);
    let baseRev = randInt(50000, 200000);
    for (let d = 90; d >= 0; d--) {
      baseUsers += randInt(-50, 150);
      baseRev += randInt(-2000, 5000);
      points.push({
        date: dateOffset(-d),
        users: Math.max(100, baseUsers),
        revenue: Math.max(10000, baseRev),
        retention: randInt(70, 95),
        engagement: randInt(40, 80),
        conversion: Math.round(rand() * 8 * 10) / 10,
      });
    }
    analytics[p.id] = points;
  });

  // Notifications
  const notifications: Notification[] = NOTIF_TEMPLATES.map((n, i) => ({
    id: id('notif', i + 1),
    type: n.type,
    title: n.title,
    message: n.message,
    read: rand() > 0.5,
    date: dateOffset(-randInt(0, 7)),
    productId: pick(products).id,
  }));
  // Add more notifications
  for (let i = 6; i < 15; i++) {
    const tmpl = pick(NOTIF_TEMPLATES);
    notifications.push({
      id: id('notif', i + 1),
      type: tmpl.type,
      title: tmpl.title,
      message: tmpl.message,
      read: rand() > 0.4,
      date: dateOffset(-randInt(0, 14)),
      productId: pick(products).id,
    });
  }

  // Audit logs
  const auditLogs: AuditLog[] = [];
  const actions = ['created', 'updated', 'deleted', 'moved', 'approved', 'rejected', 'assigned', 'commented', 'completed'];
  const entities = ['Story', 'Epic', 'Product', 'Roadmap', 'Idea', 'Release', 'Document', 'Experiment'];
  for (let i = 0; i < 50; i++) {
    const user = pick(users);
    const entity = pick(entities);
    auditLogs.push({
      id: id('audit', i + 1),
      userId: user.id,
      userName: user.name,
      action: pick(actions),
      entity,
      entityId: id(entity.toLowerCase(), randInt(1, 20)),
      changes: pick([
        'Status changed from "todo" to "in_progress"',
        'Priority updated from P2 to P1',
        'Assignee changed to ' + pick(NAMES),
        'Story points updated from 3 to 5',
        'Due date moved to next sprint',
        'Title was edited',
        'Description was updated',
        'Labels added: frontend, ui',
      ]),
      timestamp: dateOffset(-randInt(0, 30)),
    });
  }
  auditLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  // Reports
  const reports: Report[] = [];
  for (let i = 0; i < 8; i++) {
    reports.push({
      id: id('rep', i + 1),
      title: pick(['Executive Summary Q3', 'Sprint 24 Report', 'Release v3.4 Status', 'Atlas Platform Status', 'Stakeholder Update Week 30', 'Roadmap Review Q3', 'Feature Adoption Report', 'Customer Health Report']),
      type: pick(['executive', 'sprint', 'release', 'feature_status', 'stakeholder', 'roadmap'] as const),
      productId: pick(products).id,
      date: dateOffset(-randInt(0, 30)),
      author: pick(users).name,
      content: 'Executive report content...',
      format: pick(['pdf', 'csv', 'html'] as const),
    });
  }

  return {
    users, products, epics, stories, tasks, sprints, roadmaps, releases,
    ideas, feedback, experiments, competitors, documents, meetings,
    reports, notifications, auditLogs, okrs, analytics,
  };
}
