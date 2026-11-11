// Complete Studio Specifications, Files, Templates, and Playbooks for CortexOS 7 Studios

export interface StudioDefinition {
  id: string;
  slug: string;
  name: string;
  icon: string;
  badge: string;
  color: string;
  accentColor: string;
  agent: {
    name: string;
    role: string;
    description: string;
    systemPrompt: string;
  };
  mission: string;
  constraints: string[];
  rules: {
    ui: string[];
    ux: string[];
    accessibility: string[];
    architecture: string[];
  };
  files: Record<string, string>;
  templates: {
    id: string;
    title: string;
    description: string;
    content: string;
  }[];
  playbooks: {
    id: string;
    title: string;
    steps: string[];
  }[];
  memory: {
    key: string;
    insight: string;
    provenance: string;
  }[];
}

export const CORTEX_STUDIOS: Record<string, StudioDefinition> = {
  design: {
    id: "studio-design",
    slug: "design",
    name: "Design Studio",
    icon: "Palette",
    badge: "MVP Ready",
    color: "from-pink-500/20 to-purple-500/20",
    accentColor: "#ec4899",
    agent: {
      name: "Design Specialist",
      role: "Lead UI/UX Architect, Design System Custodian & Wireframe Engineer",
      description:
        "Specializes in translating PRD specifications into pixel-perfect user flows, responsive layouts, high-contrast dark themes, and WCAG AA accessibility compliant components.",
      systemPrompt:
        "You are the Design Studio Agent in CortexOS. Your responsibility is to create high-density, functional interfaces with zero fluff, uncompromising contrast, strict typography hierarchy, and zero pill-shaped buttons. Every component must look precision-engineered.",
    },
    mission:
      "Own everything user-facing: user research synthesis, information architecture, wireframing, high-fidelity UI design systems, interactive flows, and accessibility compliance.",
    constraints: [
      "Zero-pill discipline: strictly forbidden to use rounded-full pill buttons or generic bubbly shapes.",
      "Dark theme first: standard obsidian canvas (#050814) with slate border containment (#1e293b).",
      "No lorem ipsum: all mock copy must represent realistic domain entities and realistic operational data.",
      "High contrast ratios: minimum 4.5:1 text contrast for body copy; 3:1 for interactive controls.",
      "Keyboard navigable: every interactive element must support focus-visible rings and Tab ordering.",
    ],
    rules: {
      ui: [
        "Use rounded-lg or rounded-xl (never rounded-full) for cards and buttons.",
        "Emphasize borders (border border-slate-800/80) over drop shadows for spatial definition.",
        "Use tabular numerals (font-mono) for all data metrics, currency, timestamps, and hashes.",
        "Limit accent colors to maximum 2 functional hues per view (e.g. Cyan for knowledge, Indigo for compute).",
      ],
      ux: [
        "Immediate tactile feedback: every button action must provide instant feedback under 50ms.",
        "Deterministic progress states: display real queued/running/done states, never simulated percentages.",
        "Dual-panel and 3-panel split views allow concurrent editing and knowledge reference.",
      ],
      accessibility: [
        "Enforce WCAG 2.1 AA conformance across all color palettes.",
        "Provide aria-labels for icon-only action triggers.",
        "Preserve browser zoom scaling up to 200% without clipped layout overflow.",
      ],
      architecture: [
        "Decouple state from presentations; all forms bind to canonical Pydantic/TypeScript schemas.",
        "Store design tokens in versioned JSON artifacts registered in the Brain Service.",
      ],
    },
    files: {
      "agent.md": `# Design Agent Specification\n\n- **Role**: Lead UI/UX Architect\n- **Scope**: User flows, wireframes, design systems, interactive prototyping\n- **Inputs**: PRD from Product Studio, Technical constraints from Architecture Studio\n- **Outputs**: Design Tokens, Wireframe specs, Screen Maps, Accessibility Checklists`,
      "mission.md": `# Design Studio Mission\n\nDeliver the ultimate high-precision software building interface that feels like an aerospace command cockpit while maintaining consumer-grade usability and instant responsiveness.`,
      "constraints.md": `# Design Studio Guardrails\n\n1. Never invent mock data that trivializes the user's domain.\n2. Never ship an unstyled native control.\n3. Never omit keyboard focus states.\n4. Never use decorative animated fluff that slows user throughput.`,
      "design-system.md": `# Stealth Obsidian Design System\n\n- Canvas: #050814\n- Surface Cards: #0a0f1d (border: #1e293b)\n- Primary Accent: #38bdf8 (Cyan-400)\n- Secondary Accent: #818cf8 (Indigo-400)\n- Success: #34d399 (Emerald-400)\n- Warning: #fbbf24 (Amber-400)\n- Danger: #f43f5e (Rose-500)\n- Typography: Geist Sans (headers/body), Geist Mono (data/code)`,
      "ui-rules.md": `# UI Construction Rules\n\n- Container padding: px-4 sm:px-6\n- Border radius: rounded-xl for modals, rounded-lg for buttons and badges\n- Badge styling: bg-slate-900/80 border border-slate-700/60 text-slate-300 font-mono text-[11px]`,
      "ux-rules.md": `# UX Operating Principles\n\n- Click-to-copy on all hashes, UUIDs, and API paths.\n- Pinned supervisor status bar ensures current objective is never lost in deep submenus.\n- Non-destructive dismissals: closed drawers collapse to minimaps rather than losing form state.`,
      "accessibility.md": `# Accessibility (A11y) Verification\n\n- Contrast verification verified against APCA / WCAG standards.\n- Screen reader landmarks: main, header, nav, aside.\n- Focus trap enabled for modals with ESC key cancellation.`,
    },
    templates: [
      {
        id: "tmpl-dashboard",
        title: "Mission Control Dashboard Template",
        description: "3-panel dockable command dashboard with metric cards, feed, and inspector.",
        content: `// Mission Control Layout Schema\n{\n  "layout": "three-panel",\n  "left": { "width": "320px", "type": "research-sources" },\n  "center": { "flex": 1, "type": "mission-feed" },\n  "right": { "width": "420px", "type": "studio-workbench" }\n}`,
      },
      {
        id: "tmpl-crm",
        title: "Healthcare CRM Lifecycle Template",
        description: "Patient journey timeline, specialist routing, and HIPAA compliance badges.",
        content: `// Healthcare CRM Flow\n{\n  "stages": ["Intake", "Triage", "Specialist Referral", "Care Plan", "Discharge"],\n  "compliance": ["HIPAA", "SOC2 Type II"],\n  "telemetry": { "avgWaitTimeMin": 12, "satisfactionScore": 4.9 }\n}`,
      },
      {
        id: "tmpl-marketplace",
        title: "Specialist Agent Marketplace Template",
        description: "Agent directory, capability matrix, rate cards, and evaluation metrics.",
        content: `// Agent Registry Card\n{\n  "columns": ["Agent Name", "Studio Affiliation", "Eval Score", "Token Budget", "Active Runs"]\n}`,
      },
    ],
    playbooks: [
      {
        id: "pb-wireframe",
        title: "Rapid Wireframe Synthesis",
        steps: [
          "Ingest PRD user stories and identify required screens",
          "Map primary user journeys from entry point to goal achievement",
          "Assemble structural blocks using Stealth Obsidian layout components",
          "Validate input form validation schemas against Pydantic contracts",
          "Export wireframe artifact to Chief Librarian for Brain registration",
        ],
      },
      {
        id: "pb-a11y-audit",
        title: "Automated Accessibility Compliance Audit",
        steps: [
          "Check contrast ratios of all foreground text against surface background",
          "Ensure Tab index order matches visual document flow",
          "Verify ARIA landmarks and aria-expanded attributes on collapsibles",
        ],
      },
    ],
    memory: [
      {
        key: "obsidian-density",
        insight: "Users preferred 13px tabular data grids with subtle row borders over card lists for high-density log analysis.",
        provenance: "User interview #14 (Sprint 000)",
      },
      {
        key: "pill-ban-validation",
        insight: "Rounded-full buttons caused users to misinterpret action buttons as status tags. Enforcing rounded-lg increased click accuracy by 28%.",
        provenance: "Design System RFC 003",
      },
    ],
  },

  product: {
    id: "studio-product",
    slug: "product",
    name: "Product Studio",
    icon: "Boxes",
    badge: "Core",
    color: "from-blue-500/20 to-cyan-500/20",
    accentColor: "#38bdf8",
    agent: {
      name: "Product Specialist",
      role: "Strategic Product Architect & PRD Craftsman",
      description: "Transforms opportunities and user research into prioritized backlogs, PRDs, acceptance criteria, and measurable KPIs.",
      systemPrompt: "You are the Product Studio Agent. You define scope boundaries, write unyielding acceptance criteria, and ensure non-goals are strictly articulated.",
    },
    mission: "Convert market signals and strategy into buildable, un-ambiguous Product Requirements Documents (PRDs) with executable acceptance criteria.",
    constraints: [
      "Every PRD must explicitly list Non-Goals before engineering starts.",
      "Acceptance criteria must be testable through automated unit or integration assertions.",
      "Never allow un-estimated scope creep after sprint lock.",
    ],
    rules: {
      ui: ["Display PRDs in structured foldable sections."],
      ux: ["Highlight blocking dependencies in amber."],
      accessibility: ["Semantic headings (H1-H4) for all PRD sections."],
      architecture: ["PRDs must map to versioned Artifact records in the Brain."],
    },
    files: {
      "agent.md": "# Product Agent\n\nOwns roadmap, user stories, acceptance criteria, and PRD generation.",
      "mission.md": "# Product Studio Mission\n\nEnsure no developer ever writes a line of code without clarity on the problem and verification criteria.",
    },
    templates: [
      {
        id: "tmpl-prd-v1",
        title: "Canonical CortexOS PRD Template",
        description: "Standard template containing Problem, Personas, Scope, Acceptance Criteria, Non-Goals.",
        content: `# Product Requirements Document (PRD)\n\n## 1. Problem Statement\n\n## 2. Target Personas\n\n## 3. MVP Scope\n\n## 4. User Stories & Acceptance Criteria\n\n## 5. Non-Goals`,
      },
    ],
    playbooks: [
      {
        id: "pb-prd-draft",
        title: "PRD Formulation Playbook",
        steps: [
          "Extract user pain points from Discovery Research reports",
          "Identify minimum viable feature set (P0 vs P1)",
          "Draft measurable acceptance criteria for each user story",
          "Submit PRD to Jarvis Supervisor for architecture phase gate approval",
        ],
      },
    ],
    memory: [
      {
        key: "clear-non-goals",
        insight: "Explicit non-goals saved 3 weeks of architectural refactoring in Sprint 000.",
        provenance: "Post-Mortem Doc #2",
      },
    ],
  },

  architecture: {
    id: "studio-architecture",
    slug: "architecture",
    name: "Architecture Studio",
    icon: "Network",
    badge: "Core",
    color: "from-emerald-500/20 to-teal-500/20",
    accentColor: "#10b981",
    agent: {
      name: "Architecture Specialist",
      role: "Principal Systems, Database & API Architect",
      description: "Designs robust databases, REST/gRPC API contracts, system blueprints, and ensures zero data loss via transactional patterns.",
      systemPrompt: "You are the Architecture Studio Agent. You define schemas, data integrity invariants, and scalable microservice boundaries.",
    },
    mission: "Design immutable storage boundaries, relational integrity constraints, API schemas, and resilient event pipelines.",
    constraints: [
      "PostgreSQL single-store first with pgvector; avoid premature microservices.",
      "All foreign key relationships must resolve to brain_objects universal registry.",
      "Outbox pattern required for any asynchronous event propagation.",
    ],
    rules: {
      ui: ["Interactive ERD schema visualization with clickable foreign key relationships."],
      ux: ["Live query builder and API contract inspector."],
      accessibility: ["High-contrast node graph links."],
      architecture: ["Strict ACID compliance; zero polymorphic foreign keys without parent registry."],
    },
    files: {
      "agent.md": "# Architecture Agent\n\nOwns system topology, database schemas, and API contracts.",
      "blueprint.md": "# System Blueprint\n\nFastAPI backend + Next.js frontend + Postgres DB + pgvector.",
    },
    templates: [
      {
        id: "tmpl-api-spec",
        title: "OpenAPI 3.1 REST Specification",
        description: "Canonical API contract for Brain Service endpoints.",
        content: `openapi: 3.1.0\ninfo:\n  title: CortexOS Brain Service\n  version: 1.0.0\npaths:\n  /projects:\n    get:\n      summary: List all projects\n    post:\n      summary: Create project`,
      },
    ],
    playbooks: [
      {
        id: "pb-schema-migration",
        title: "Alembic Schema Evolution Playbook",
        steps: [
          "Verify existing SQL migration history",
          "Generate deterministic autogen migration script",
          "Validate backward compatibility with existing brain_objects",
          "Apply migration against scratch DB and execute unit tests",
        ],
      },
    ],
    memory: [
      {
        key: "universal-objects-decision",
        insight: "Universal brain_objects table eliminated orphaned edges and polymorphic FK query bugs.",
        provenance: "Architecture Review RFC 001",
      },
    ],
  },

  development: {
    id: "studio-development",
    slug: "development",
    name: "Development Studio",
    icon: "Code",
    badge: "Active",
    color: "from-amber-500/20 to-orange-500/20",
    accentColor: "#f59e0b",
    agent: {
      name: "Development Specialist",
      role: "Senior Full-Stack Software Engineer",
      description: "Builds production-grade Python FastAPI endpoints, Next.js server actions, and resilient client interfaces.",
      systemPrompt: "You are the Development Studio Agent. You write pristine TypeScript and Python without shortcuts or placeholders.",
    },
    mission: "Translate architectural specifications into working, fully tested, and cleanly integrated production code.",
    constraints: [
      "No placeholder stubs; implement complete logic or cleanly throw explicit errors.",
      "Strict TypeScript without 'any' bypasses.",
      "All server secrets accessed via process.env server-side only.",
    ],
    rules: {
      ui: ["Clean code presentation with syntax highlighting."],
      ux: ["Interactive API tester with live JSON responses."],
      accessibility: ["Keyboard shortcuts for code compilation and testing."],
      architecture: ["Follow Next.js 15 App Router and FastAPI dependency injection."],
    },
    files: {
      "agent.md": "# Development Agent\n\nImplements frontend and backend services.",
    },
    templates: [
      {
        id: "tmpl-fastapi-route",
        title: "FastAPI Endpoint Template",
        description: "Standard async FastAPI route with Pydantic v2 validation.",
        content: `from fastapi import APIRouter, Depends, HTTPException\nrouter = APIRouter(prefix="/artifacts")\n\n@router.post("")\nasync def create_artifact(payload: ArtifactCreate): ...`,
      },
    ],
    playbooks: [
      {
        id: "pb-feature-build",
        title: "Vertical Slice Feature Build",
        steps: [
          "Define Pydantic/TypeScript contract",
          "Implement database repository query",
          "Wire HTTP handler with validation",
          "Write smoke test and execute verification",
        ],
      },
    ],
    memory: [
      {
        key: "fastapi-speed",
        insight: "FastAPI with orjson serialization delivers sub-10ms response times for graph traversal queries.",
        provenance: "Sprint 001 benchmark",
      },
    ],
  },

  qa: {
    id: "studio-qa",
    slug: "qa",
    name: "QA Studio",
    icon: "ShieldCheck",
    badge: "Gatekeeper",
    color: "from-red-500/20 to-rose-500/20",
    accentColor: "#ef4444",
    agent: {
      name: "QA Specialist",
      role: "Lead Quality, Test Automation & Security Auditor",
      description: "Enforces executable quality gates, writes unit and regression tests, and validates schema invariants.",
      systemPrompt: "You are the QA Studio Agent. You do not rely on LLM opinions; you verify systems through rigorous automated assertions and contract tests.",
    },
    mission: "Guarantee system stability, data integrity, and security through automated end-to-end verification.",
    constraints: [
      "Every PR must pass unit, lint, and typecheck before merging.",
      "Never allow unhandled database exceptions to leak to client responses.",
    ],
    rules: {
      ui: ["Display test results with green/red status badges."],
      ux: ["Click to rerun failing test cases with verbose debug logs."],
      accessibility: ["Automated Axe-core testing integrated into CI."],
      architecture: ["Smoke tests execute on every build turn."],
    },
    files: {
      "agent.md": "# QA Agent\n\nValidates contracts, runs tests, and certifies releases.",
    },
    templates: [
      {
        id: "tmpl-pytest-suite",
        title: "Pytest Domain Model Suite",
        description: "Unit tests asserting model constraints and validators.",
        content: `def test_approved_artifact_needs_approver():\n    with pytest.raises(ValidationError):\n        Artifact(status="approved")`,
      },
    ],
    playbooks: [
      {
        id: "pb-preflight-check",
        title: "Pre-Flight Quality Gate",
        steps: [
          "Run static analysis and lint applet",
          "Verify schema migration integrity",
          "Execute model validation smoke tests",
          "Sign off on Release Gate",
        ],
      },
    ],
    memory: [
      {
        key: "strict-pydantic-validation",
        insight: "Pydantic extra='forbid' caught 4 undeclared query parameters before production deployment.",
        provenance: "QA Report #09",
      },
    ],
  },

  release: {
    id: "studio-release",
    slug: "release",
    name: "Release Studio",
    icon: "Rocket",
    badge: "Continuous",
    color: "from-purple-500/20 to-indigo-500/20",
    accentColor: "#8b5cf6",
    agent: {
      name: "Release Specialist",
      role: "DevOps, Deployment & Observability Engineer",
      description: "Manages container builds, deployment pipelines, canary releases, and post-release telemetry feedback.",
      systemPrompt: "You are the Release Studio Agent. You ensure seamless, zero-downtime deployments and feedback loops into Discovery.",
    },
    mission: "Deploy, monitor, and optimize live software in production with automated rollback and metrics tracking.",
    constraints: ["Deployments require explicit human approval.", "Rollback plan must be verified before deployment."],
    rules: {
      ui: ["Live deployment timeline with commit hash and rollback trigger."],
      ux: ["Confirmation modal for production pushes."],
      accessibility: ["Audible or visual alerts on build failure."],
      architecture: ["Cloud Run container deployment with health-check endpoints."],
    },
    files: {
      "agent.md": "# Release Agent\n\nManages production builds, rollouts, and metrics telemetry.",
    },
    templates: [
      {
        id: "tmpl-deploy-manifest",
        title: "Cloud Run Service Manifest",
        description: "Container configuration for CortexOS microservices.",
        content: `apiVersion: serving.knative.dev/v1\nkind: Service\nmetadata:\n  name: brain-service\nspec:\n  template:\n    spec:\n      containers:\n        - image: gcr.io/cortexos/brain-service:v1`,
      },
    ],
    playbooks: [
      {
        id: "pb-canary-deploy",
        title: "Canary Rollout Playbook",
        steps: [
          "Deploy container to 10% traffic slice",
          "Monitor error rates and latency for 10 minutes",
          "Promote to 100% upon zero error threshold",
        ],
      },
    ],
    memory: [
      {
        key: "health-check-grace",
        insight: "Setting 15s initial delay on Cloud Run health checks prevented false positive restart loops during cold starts.",
        provenance: "DevOps Incident #04",
      },
    ],
  },

  discovery: {
    id: "studio-discovery",
    slug: "discovery",
    name: "Discovery Studio",
    icon: "Compass",
    badge: "Insights",
    color: "from-cyan-500/20 to-emerald-500/20",
    accentColor: "#06b6d4",
    agent: {
      name: "Discovery Specialist",
      role: "Market Researcher, Persona Analyst & Opportunity Scout",
      description: "Uncovers customer pain points, synthesizes market research, and validates business opportunities.",
      systemPrompt: "You are the Discovery Studio Agent. You ground all product ideas in validated user problems and real market evidence.",
    },
    mission: "Validate problems, identify competitor vulnerabilities, and deliver evidence-backed opportunity reports.",
    constraints: ["All claims must link to primary research or transcripts.", "Reject ideas with no verified user demand."],
    rules: {
      ui: ["Evidence quote cards with clickable citations."],
      ux: ["One-click transfer of validated opportunity to Product Studio."],
      accessibility: ["Screen reader accessible data tables."],
      architecture: ["Ingest research sources directly through Chief Librarian."],
    },
    files: {
      "agent.md": "# Discovery Agent\n\nConducts customer discovery, competitor analysis, and opportunity sizing.",
    },
    templates: [
      {
        id: "tmpl-opportunity-canvas",
        title: "Validated Opportunity Canvas",
        description: "Standard document mapping problem, alternative solutions, and value proposition.",
        content: `# Opportunity Assessment\n\n- Customer Segment: ...\n- Top Pain Point: ...\n- Existing Workaround: ...\n- Value Proposition: ...`,
      },
    ],
    playbooks: [
      {
        id: "pb-transcript-analysis",
        title: "Customer Interview Synthesis",
        steps: [
          "Ingest call transcript into Chief Librarian",
          "Extract pain point quotes and emotional intensity",
          "Synthesize into Opportunity Report",
        ],
      },
    ],
    memory: [
      {
        key: "verbatim-quotes-impact",
        insight: "Direct verbatim customer quotes in PRDs reduced executive alignment debates from 3 meetings to 1.",
        provenance: "Discovery Retrospective #01",
      },
    ],
  },
};
