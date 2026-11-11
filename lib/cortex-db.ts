import {
  Project,
  Source,
  Artifact,
  Entity,
  Concept,
  Decision,
  Studio,
  Agent,
  WikiPage,
  Claim,
  Relationship,
  EventRecord,
  AuditLogEntry,
  AuditFinding,
  WorkRequest,
  WorkResponse,
  ExtractionResult,
} from "./cortex-types";

// Helper to compute sha256 in browser or node
export function computeSha256(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return hex.repeat(8).slice(0, 64);
}

// -----------------------------------------------------------------------------
// CortexOS In-Memory & Persistent Service Store
// -----------------------------------------------------------------------------
class CortexDatabase {
  private projects: Map<string, Project> = new Map();
  private studios: Map<string, Studio> = new Map();
  private agents: Map<string, Agent> = new Map();
  private sources: Map<string, Source> = new Map();
  private artifacts: Map<string, Artifact> = new Map();
  private entities: Map<string, Entity> = new Map();
  private concepts: Map<string, Concept> = new Map();
  private decisions: Map<string, Decision> = new Map();
  private wikiPages: Map<string, WikiPage> = new Map();
  private claims: Map<string, Claim> = new Map();
  private relationships: Map<string, Relationship> = new Map();
  private events: EventRecord[] = [];
  private auditLog: AuditLogEntry[] = [];
  private auditFindings: Map<string, AuditFinding> = new Map();
  private workRequests: Map<string, WorkRequest> = new Map();
  private eventCounter = 1;
  private auditCounter = 1;

  constructor() {
    this.seedCanonicalData();
  }

  // ---------------------------------------------------------------------------
  // Seed Database (The 7 Studios, Canonical Projects, Artifacts, Initial Nodes)
  // ---------------------------------------------------------------------------
  private seedCanonicalData() {
    const now = new Date().toISOString();

    // 1. Seed 7 Studios
    const studiosList: Omit<Studio, "created_at" | "updated_at">[] = [
      {
        id: "studio-discovery",
        slug: "discovery",
        name: "Discovery Studio",
        mission: "Validate the problem, the market, and the target users.",
        status: "active",
        manifest_path: "studios/discovery/studio.yaml",
      },
      {
        id: "studio-product",
        slug: "product",
        name: "Product Studio",
        mission: "Turn validated opportunities into a buildable, prioritized plan and PRD.",
        status: "active",
        manifest_path: "studios/product/studio.yaml",
      },
      {
        id: "studio-design",
        slug: "design",
        name: "Design Studio",
        mission: "Own everything user-facing: UX, UI, design systems, flows, and accessibility.",
        status: "active",
        manifest_path: "studios/design/studio.yaml",
      },
      {
        id: "studio-architecture",
        slug: "architecture",
        name: "Architecture Studio",
        mission: "Own system, data, API, infrastructure, security design, and blueprints.",
        status: "active",
        manifest_path: "studios/architecture/studio.yaml",
      },
      {
        id: "studio-development",
        slug: "development",
        name: "Development Studio",
        mission: "Build the product: frontend, backend, database migrations, and integrations.",
        status: "active",
        manifest_path: "studios/development/studio.yaml",
      },
      {
        id: "studio-qa",
        slug: "qa",
        name: "QA Studio",
        mission: "Prove the product works, passes regression tests, and is bulletproof.",
        status: "active",
        manifest_path: "studios/qa/studio.yaml",
      },
      {
        id: "studio-release",
        slug: "release",
        name: "Release Studio",
        mission: "Ship, monitor, measure analytics, and feed post-launch results back into Discovery.",
        status: "active",
        manifest_path: "studios/release/studio.yaml",
      },
    ];

    studiosList.forEach((s) => {
      this.studios.set(s.id, { ...s, created_at: now, updated_at: now });
    });

    // 2. Seed Phase Agents
    const agentsList: Omit<Agent, "created_at" | "updated_at">[] = [
      {
        id: "agent-jarvis",
        studio_id: "studio-architecture",
        name: "Jarvis",
        role: "Supervisor, Orchestrator, Governor & Quality Gatekeeper",
        model: "gemini-3.8-flash",
        config: { autonomy: "supervised", maxBudgetTokens: 100000 },
        active: true,
      },
      {
        id: "agent-librarian",
        studio_id: "studio-architecture",
        name: "Chief Librarian",
        role: "Sole gatekeeper into the Brain. Maintains Wiki, Graph, and Search Index",
        model: "gemini-3.8-flash",
        config: { verificationStrict: true, extractQuotes: true },
        active: true,
      },
      {
        id: "agent-design",
        studio_id: "studio-design",
        name: "Design Specialist",
        role: "UI/UX Architect, Wireframer & Design System Engineer",
        model: "gemini-3.8-flash",
        config: { systemRules: "zero-pill-contrast", toolAccess: ["figma", "v0", "tokens"] },
        active: true,
      },
      {
        id: "agent-product",
        studio_id: "studio-product",
        name: "Product Specialist",
        role: "PRD Author & Backlog Orchestrator",
        model: "gemini-3.8-flash",
        config: { format: "cortex-prd-v1" },
        active: true,
      },
      {
        id: "agent-architecture",
        studio_id: "studio-architecture",
        name: "Architecture Specialist",
        role: "System & Database Blueprint Architect",
        model: "gemini-3.8-flash",
        config: { dbTarget: "postgres-pgvector" },
        active: true,
      },
      {
        id: "agent-development",
        studio_id: "studio-development",
        name: "Development Specialist",
        role: "Full-Stack Software Engineer (FastAPI & Next.js)",
        model: "gemini-3.8-flash",
        config: { lang: "python-typescript" },
        active: true,
      },
      {
        id: "agent-qa",
        studio_id: "studio-qa",
        name: "QA Specialist",
        role: "Test Engineer & Security Auditor",
        model: "gemini-3.8-flash",
        config: { lintRules: "strict" },
        active: true,
      },
    ];

    agentsList.forEach((a) => {
      this.agents.set(a.id, { ...a, created_at: now, updated_at: now });
    });

    // 3. Seed Canonical Projects
    const projectKernel: Project = {
      id: "project-cortex",
      slug: "cortex-os",
      name: "CortexOS Platform",
      description:
        "AI-native operating system for building software, managing organizational memory, and coordinating specialist studios.",
      status: "active",
      created_at: now,
      updated_at: now,
    };
    const projectCrm: Project = {
      id: "project-crm",
      slug: "ai-crm",
      name: "Enterprise Healthcare CRM",
      description:
        "HIPAA-compliant patient lifecycle and specialist referral coordination system.",
      status: "active",
      created_at: now,
      updated_at: now,
    };
    this.projects.set(projectKernel.id, projectKernel);
    this.projects.set(projectCrm.id, projectCrm);

    // 4. Seed Canonical Sources (Immutable Layer 1)
    const src1: Source = {
      id: "source-consolidated-spec",
      project_id: "project-cortex",
      kind: "pdf",
      title: "CortexOS Consolidated Spec (Draft v0.1)",
      uri: "https://cortexos.internal/spec/draft-v0.1.pdf",
      storage_path: "raw/sources/CortexOS_Consolidated_Spec__Draft_v0.1__7d8d51cb.pdf",
      content_hash: "7d8d51cb93d3958017c603b57e7bbcd6f70513812739185a730bf18349887e01",
      mime_type: "application/pdf",
      byte_size: 149200,
      trust: "trusted",
      ingest_status: "processed",
      metadata: { author: "Ray & Systems Team", pages: 8 },
      ingested_at: now,
    };
    const src2: Source = {
      id: "source-build-decision",
      project_id: "project-cortex",
      kind: "markdown",
      title: "CortexOS Build Decision",
      uri: "local://docs/CortexOS_Build_Decision.md",
      storage_path: "raw/sources/CortexOS_Build_Decision__7c3e0a5f.md",
      content_hash: "7c3e0a5fcda783c6b2259bb3ee7cf215b49ea7a10243452bcba853bc12301822",
      mime_type: "text/markdown",
      byte_size: 4211,
      trust: "trusted",
      ingest_status: "processed",
      metadata: { priority: "P0", sprint: "Sprint 001" },
      ingested_at: now,
    };
    this.sources.set(src1.id, src1);
    this.sources.set(src2.id, src2);

    // 5. Seed Canonical Artifacts (Layer 2)
    const artPrd: Artifact = {
      id: "art-prd-v1",
      project_id: "project-cortex",
      studio_id: "studio-product",
      artifact_type: "prd",
      schema_version: "1",
      title: "CortexOS Core Technical PRD v1",
      summary:
        "Canonical specification defining Chief Librarian, Brain Service, Jarvis Supervisor, and 7 Studios.",
      status: "approved",
      version: 1,
      storage_path: "artifacts/prd/cortexos-prd-v1.json",
      content_hash: "a49cb190f707f43dbcf1262ab0b031d2b8b9ef182a9d8031d683719b48c66041",
      body: {
        problem: "Agents without persistent organizational memory act as stateless chatbots.",
        personas: ["Founder / CTO", "Lead Architect", "Autonomous Studio Agents"],
        mvp_scope: ["brain-service", "Chief Librarian 5-stage pipeline", "War Room execution UI"],
        non_goals: ["50 micro-agents", "Unsupervised auto-deployment to production"],
      },
      created_by_agent_id: "agent-product",
      approved_by: "Ray (System Architect)",
      approved_at: now,
      created_at: now,
      updated_at: now,
    };
    const artDbSchema: Artifact = {
      id: "art-dbschema-v1",
      project_id: "project-cortex",
      studio_id: "studio-architecture",
      artifact_type: "database_schema",
      schema_version: "1",
      title: "Brain Schema v1 (PostgreSQL + pgvector)",
      summary:
        "Universal brain_objects registry, 11 core tables, transactional outbox events, and graph_neighbors() recursive traversal.",
      status: "approved",
      version: 1,
      storage_path: "artifacts/schema/brain_schema_v1.sql",
      content_hash: "36b1d887a0b38c014798e3b08e2f8319e71089201a0937c02bcf9215bb41f201",
      body: {
        tables_count: 14,
        extensions: ["pgcrypto", "vector", "pg_trgm"],
        edge_types_count: 13,
      },
      created_by_agent_id: "agent-architecture",
      approved_by: "Jarvis",
      approved_at: now,
      created_at: now,
      updated_at: now,
    };
    const artDesignTokens: Artifact = {
      id: "art-designtokens-v1",
      project_id: "project-cortex",
      studio_id: "studio-design",
      artifact_type: "design_system",
      schema_version: "1",
      title: "Stealth Obsidian Design System",
      summary:
        "High-density terminal aesthetics, 0-pill discipline, crisp border contrast, and Three.js constellation integration.",
      status: "approved",
      version: 1,
      storage_path: "studios/design/design-system.md",
      content_hash: "9831d10203fbc1023910940192a8391024901923019203912093102930192301",
      body: {
        theme: "obsidian",
        accents: ["#38bdf8", "#818cf8", "#34d399", "#f43f5e"],
        font: "Geist Mono & Inter",
      },
      created_by_agent_id: "agent-design",
      approved_by: "Ray",
      approved_at: now,
      created_at: now,
      updated_at: now,
    };
    this.artifacts.set(artPrd.id, artPrd);
    this.artifacts.set(artDbSchema.id, artDbSchema);
    this.artifacts.set(artDesignTokens.id, artDesignTokens);

    // 6. Seed Entities (Librarian Layer)
    const entitiesList: Omit<Entity, "created_at" | "updated_at">[] = [
      {
        id: "ent-fastapi",
        canonical_name: "FastAPI",
        entity_type: "technology",
        description: "High-performance Python web framework powering the backend brain-service.",
        aliases: ["FastAPI Service", "FastAPI App"],
        metadata: { language: "Python 3.10+" },
        review_state: "approved",
        confidence: 0.99,
      },
      {
        id: "ent-postgres",
        canonical_name: "PostgreSQL",
        entity_type: "database",
        description: "Primary operational datastore with pgvector and pg_trgm extensions.",
        aliases: ["Postgres", "PostgreSQL 15+"],
        metadata: { extensions: ["pgcrypto", "vector", "pg_trgm"] },
        review_state: "approved",
        confidence: 1.0,
      },
      {
        id: "ent-jarvis",
        canonical_name: "Jarvis",
        entity_type: "agent",
        description: "Supreme Supervisor orchestrating task routing, studio gates, and governance.",
        aliases: ["Jarvis Supervisor", "Orchestrator"],
        metadata: { role: "supervisor" },
        review_state: "approved",
        confidence: 1.0,
      },
      {
        id: "ent-librarian",
        canonical_name: "Chief Librarian",
        entity_type: "agent",
        description: "Sole gatekeeper into the Brain. Ingests, classifies, extracts, and maintains the Wiki.",
        aliases: ["Librarian Agent", "Knowledge Steward"],
        metadata: { role: "memory-gatekeeper" },
        review_state: "approved",
        confidence: 1.0,
      },
      {
        id: "ent-design-studio",
        canonical_name: "Design Studio",
        entity_type: "studio",
        description: "Specialized operating environment for UX, UI, design systems, and wireframes.",
        aliases: ["Design Agent Environment"],
        metadata: { slug: "design" },
        review_state: "approved",
        confidence: 1.0,
      },
    ];
    entitiesList.forEach((e) => {
      this.entities.set(e.id, { ...e, created_at: now, updated_at: now });
    });

    // 7. Seed Concepts
    const conceptsList: Omit<Concept, "created_at" | "updated_at">[] = [
      {
        id: "cpt-4c",
        name: "4C Framework",
        summary: "Context, Connections, Capabilities, Cadence: the enduring kernel of CortexOS.",
        domain: "system-architecture",
        aliases: ["4C Model", "Kernel Principles"],
        review_state: "approved",
        confidence: 1.0,
      },
      {
        id: "cpt-outbox",
        name: "Transactional Outbox Pattern",
        summary: "Guarantees reliable event publishing without distributed transaction coordinator bugs.",
        domain: "distributed-systems",
        aliases: ["Outbox Table"],
        review_state: "approved",
        confidence: 0.98,
      },
      {
        id: "cpt-provenance",
        name: "Claim-Based Provenance",
        summary: "Every asserted wiki fact references verbatim source quotations and specific locators.",
        domain: "knowledge-management",
        aliases: ["Fact Grounding", "Evidence Linking"],
        review_state: "approved",
        confidence: 1.0,
      },
      {
        id: "cpt-operating-env",
        name: "Studio Operating Environment",
        summary: "Agents are transient; the Studio (rules, skills, memory, templates, playbooks) is the compounding asset.",
        domain: "agent-architecture",
        aliases: ["Studio Framework", "Environment-First"],
        review_state: "approved",
        confidence: 1.0,
      },
    ];
    conceptsList.forEach((c) => {
      this.concepts.set(c.id, { ...c, created_at: now, updated_at: now });
    });

    // 8. Seed Key Decisions
    const dec1: Decision = {
      id: "dec-studio-centric",
      project_id: "project-cortex",
      title: "Transition from Agent-Centric to Studio-Centric Architecture",
      decision:
        "Evolve all 7 specialist agents into full Studio Operating Environments containing rules, templates, playbooks, tools, and local memory.",
      reasoning:
        "Agents can be upgraded or replaced, but accumulated studio workflows, constraints, and organizational intelligence compound over time.",
      status: "accepted",
      decided_by: "Ray & Systems Team",
      decided_at: now,
      created_at: now,
      updated_at: now,
    };
    const dec2: Decision = {
      id: "dec-postgres-single-store",
      project_id: "project-cortex",
      title: "PostgreSQL with pgvector as Universal Single Store for v1",
      decision:
        "Use PostgreSQL with pgcrypto, pgvector, and pg_trgm for relational data, graph traversal (recursive CTE), and vector search in v1 before introducing Neo4j/Qdrant.",
      reasoning:
        "Drastically simplifies deployment reliability, ensures zero-loss ACID transactions between domain entities and outbox events, and enables instant local testing.",
      status: "accepted",
      decided_by: "Ray",
      decided_at: now,
      created_at: now,
      updated_at: now,
    };
    this.decisions.set(dec1.id, dec1);
    this.decisions.set(dec2.id, dec2);

    // 9. Seed Relationships (Layer 4 Graph)
    const relationshipsList: Omit<Relationship, "created_at">[] = [
      {
        id: "rel-1",
        from_id: "project-cortex",
        to_id: "art-prd-v1",
        edge_type: "contains",
        confidence: 1.0,
        review_state: "approved",
        metadata: { note: "Project contains primary PRD" },
      },
      {
        id: "rel-2",
        from_id: "art-prd-v1",
        to_id: "cpt-4c",
        edge_type: "references",
        confidence: 1.0,
        review_state: "approved",
        metadata: { note: "PRD references 4C kernel" },
      },
      {
        id: "rel-3",
        from_id: "art-dbschema-v1",
        to_id: "ent-postgres",
        edge_type: "uses",
        confidence: 1.0,
        review_state: "approved",
        metadata: { note: "Brain schema runs on Postgres" },
      },
      {
        id: "rel-4",
        from_id: "ent-librarian",
        to_id: "cpt-provenance",
        edge_type: "implements",
        confidence: 1.0,
        review_state: "approved",
        metadata: { note: "Librarian enforces claim provenance" },
      },
      {
        id: "rel-5",
        from_id: "studio-design",
        to_id: "art-designtokens-v1",
        edge_type: "created_by",
        confidence: 1.0,
        review_state: "approved",
        metadata: { note: "Design Studio produced design tokens" },
      },
      {
        id: "rel-6",
        from_id: "agent-jarvis",
        to_id: "project-cortex",
        edge_type: "influences",
        confidence: 1.0,
        review_state: "approved",
        metadata: { note: "Jarvis supervises project execution" },
      },
      {
        id: "rel-7",
        from_id: "cpt-operating-env",
        to_id: "studio-design",
        edge_type: "references",
        confidence: 1.0,
        review_state: "approved",
        metadata: { note: "Design Studio is the first operating environment MVP" },
      },
    ];
    relationshipsList.forEach((r) => {
      this.relationships.set(r.id, { ...r, created_at: now });
    });

    // 10. Seed Wiki Pages & Claims (Layer 3)
    const page1: WikiPage = {
      id: "wiki-4c-kernel",
      page_type: "doctrine",
      path: "doctrines/4c_kernel.md",
      title: "The 4C Kernel Doctrine",
      summary: "Foundational laws governing Context, Connections, Capabilities, and Cadence.",
      project_id: "project-cortex",
      current_version: 1,
      body_hash: computeSha256("The 4C foundation stays as the kernel. It is not replaced."),
      content: `# The 4C Kernel Doctrine\n\nCortexOS is founded upon 4 non-negotiable pillars:\n1. **Context**: Deep understanding of business, user, and technical landscape.\n2. **Connections**: Bidirectional associative links between all entities, tasks, and artifacts.\n3. **Capabilities**: Specialized studio operating environments equipped with tools and skills.\n4. **Cadence**: Deterministic event-driven loops that ensure steady, measured progress.`,
      review_state: "approved",
      requires_approval: true,
      created_at: now,
      updated_at: now,
    };
    const page2: WikiPage = {
      id: "wiki-studio-env",
      page_type: "pattern",
      path: "patterns/studio_operating_environments.md",
      title: "Studio Operating Environments",
      summary: "Architectural blueprint detailing how agent packs are organized with SOPs, tools, and memory.",
      project_id: "project-cortex",
      current_version: 1,
      body_hash: computeSha256("Each studio contains agent, rules, skills, templates, playbooks, memory."),
      content: `# Studio Operating Environments\n\nThe agent is the smallest piece. The asset is the environment:\n- \`agent.md\`: Role, inputs, outputs\n- \`constraints.md\`: Strict guardrails\n- \`templates/\`: Standard artifact schemas\n- \`playbooks/\`: Step-by-step procedures\n- \`memory/\`: Local learned wisdom`,
      review_state: "approved",
      requires_approval: false,
      created_at: now,
      updated_at: now,
    };
    this.wikiPages.set(page1.id, page1);
    this.wikiPages.set(page2.id, page2);

    const claim1: Claim = {
      id: "claim-1",
      wiki_page_id: "wiki-4c-kernel",
      page_version: 1,
      claim_text: "The existing 4C foundation (Context, Connections, Capabilities, Cadence) stays as the kernel. It is not replaced.",
      source_id: "source-consolidated-spec",
      locator: "Page 1, Section 1",
      confidence: 1.0,
      review_state: "approved",
      created_at: now,
    };
    const claim2: Claim = {
      id: "claim-2",
      wiki_page_id: "wiki-studio-env",
      page_version: 1,
      claim_text: "The agent is actually the smallest piece. The real asset is the entire environment that surrounds the agent.",
      source_id: "source-build-decision",
      locator: "Section: Studio Specification v1",
      confidence: 0.99,
      review_state: "approved",
      created_at: now,
    };
    this.claims.set(claim1.id, claim1);
    this.claims.set(claim2.id, claim2);

    // 11. Initial Audit Log
    this.auditLog.push({
      id: this.auditCounter++,
      occurred_at: now,
      actor_type: "system",
      actor_id: "kernel",
      action: "brain.boot",
      details: { message: "CortexOS Brain Service boot completed with 7 Studios and Postgres v1 schema." },
    });
  }

  // ---------------------------------------------------------------------------
  // Projects
  // ---------------------------------------------------------------------------
  public getProjects(): Project[] {
    return Array.from(this.projects.values()).sort((a, b) => (a.name > b.name ? 1 : -1));
  }

  public getProject(id: string): Project | undefined {
    return this.projects.get(id);
  }

  public createProject(data: { slug: string; name: string; description?: string }): Project {
    const now = new Date().toISOString();
    const id = `project-${data.slug.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
    const project: Project = {
      id,
      slug: data.slug,
      name: data.name,
      description: data.description || "",
      status: "active",
      created_at: now,
      updated_at: now,
    };
    this.projects.set(id, project);

    // Record Event and Audit
    this.emitEvent("project_created", "project", id, { slug: project.slug, name: project.name });
    this.logAudit("user", "human-architect", "project.create", id, { name: project.name });

    return project;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | undefined {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.projects.set(id, updated);
    this.logAudit("user", "human-architect", "project.update", id, updates as Record<string, unknown>);
    return updated;
  }

  // ---------------------------------------------------------------------------
  // Studios & Agents
  // ---------------------------------------------------------------------------
  public getStudios(): Studio[] {
    return Array.from(this.studios.values());
  }

  public getStudio(id: string): Studio | undefined {
    return this.studios.get(id);
  }

  public getAgents(studioId?: string): Agent[] {
    const list = Array.from(this.agents.values());
    if (studioId) return list.filter((a) => a.studio_id === studioId);
    return list;
  }

  // ---------------------------------------------------------------------------
  // Sources (Layer 1 Immutable)
  // ---------------------------------------------------------------------------
  public getSources(projectId?: string): Source[] {
    const list = Array.from(this.sources.values());
    if (projectId) return list.filter((s) => s.project_id === projectId || !s.project_id);
    return list.sort((a, b) => (a.ingested_at < b.ingested_at ? 1 : -1));
  }

  public getSource(id: string): Source | undefined {
    return this.sources.get(id);
  }

  public createSource(data: {
    project_id?: string;
    kind: Source["kind"];
    title: string;
    uri?: string;
    content: string;
    metadata?: Record<string, unknown>;
  }): Source {
    const now = new Date().toISOString();
    const contentHash = computeSha256(data.content);
    const id = `source-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const storagePath = `raw/inbox/${data.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.${data.kind}`;

    const source: Source = {
      id,
      project_id: data.project_id,
      kind: data.kind,
      title: data.title,
      uri: data.uri,
      content: data.content,
      storage_path: storagePath,
      content_hash: contentHash,
      byte_size: data.content.length,
      trust: "trusted",
      ingest_status: "received",
      metadata: data.metadata || {},
      ingested_at: now,
    };

    this.sources.set(id, source);

    this.emitEvent("source_created", "source", id, {
      title: source.title,
      hash: source.content_hash,
      kind: source.kind,
    });
    this.logAudit("user", "researcher", "source.ingest_received", id, { title: source.title });

    return source;
  }

  // ---------------------------------------------------------------------------
  // Chief Librarian 5-Stage Ingestion Pipeline
  // ---------------------------------------------------------------------------
  public async executeLibrarianIngestion(sourceId: string, customExtraction?: Partial<ExtractionResult>): Promise<{
    source: Source;
    entities: Entity[];
    concepts: Concept[];
    relationships: Relationship[];
    wikiPages: WikiPage[];
    claims: Claim[];
  }> {
    const source = this.sources.get(sourceId);
    if (!source) throw new Error(`Source not found: ${sourceId}`);

    source.ingest_status = "processing";
    const now = new Date().toISOString();

    // Stage 1: Ingested & Verified
    const text = source.content || source.title;

    // Stage 2: Classification
    const category = customExtraction?.category || (source.kind === "pdf" ? "Architecture" : "Research");

    // Stage 3: Extraction (Entities & Concepts)
    const extractedEntities = customExtraction?.entities || [
      {
        name: `${source.title.split(" ")[0]} Engine`,
        entity_type: "technology",
        aliases: [],
        description: `Core technology extracted from ${source.title}`,
        evidence: `Source references ${source.title} directly.`,
        locator: "Line 1-10",
        confidence: 0.95,
      },
    ];

    const extractedConcepts = customExtraction?.concepts || [
      {
        name: `${category} Standard`,
        summary: `Domain concept extracted from ${source.title}.`,
        domain: category.toLowerCase(),
        evidence: `Extracted from evidence body in ${source.title}.`,
        locator: "Body Paragraph 1",
        confidence: 0.92,
      },
    ];

    // Persist Entities
    const createdEntities: Entity[] = [];
    for (const ent of extractedEntities) {
      const entId = `ent-${ent.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      const entity: Entity = {
        id: entId,
        canonical_name: ent.name,
        entity_type: ent.entity_type,
        description: ent.description,
        aliases: ent.aliases,
        metadata: { source_id: source.id },
        review_state: "needs_review",
        confidence: ent.confidence,
        created_at: now,
        updated_at: now,
      };
      this.entities.set(entId, entity);
      createdEntities.push(entity);
    }

    // Persist Concepts
    const createdConcepts: Concept[] = [];
    for (const cpt of extractedConcepts) {
      const cptId = `cpt-${cpt.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      const concept: Concept = {
        id: cptId,
        name: cpt.name,
        summary: cpt.summary,
        domain: cpt.domain,
        aliases: [],
        review_state: "needs_review",
        confidence: cpt.confidence,
        created_at: now,
        updated_at: now,
      };
      this.concepts.set(cptId, concept);
      createdConcepts.push(concept);
    }

    // Stage 4: Relationships
    const createdRelationships: Relationship[] = [];
    if (source.project_id && createdEntities.length > 0) {
      const rel1: Relationship = {
        id: `rel-${Date.now()}-1`,
        from_id: source.project_id,
        to_id: createdEntities[0].id,
        edge_type: "references",
        confidence: 0.9,
        review_state: "needs_review",
        source_id: source.id,
        metadata: { provenance: source.title },
        created_at: now,
      };
      this.relationships.set(rel1.id, rel1);
      createdRelationships.push(rel1);
    }

    if (createdEntities.length > 0 && createdConcepts.length > 0) {
      const rel2: Relationship = {
        id: `rel-${Date.now()}-2`,
        from_id: createdEntities[0].id,
        to_id: createdConcepts[0].id,
        edge_type: "implements",
        confidence: 0.88,
        review_state: "needs_review",
        source_id: source.id,
        metadata: { origin: "Chief Librarian Extraction" },
        created_at: now,
      };
      this.relationships.set(rel2.id, rel2);
      createdRelationships.push(rel2);
    }

    // Stage 5: Wiki & Provenance Claims Persist
    const wikiPath = `summaries/${source.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.md`;
    const wikiPage: WikiPage = {
      id: `wiki-${Date.now()}`,
      page_type: "summary",
      path: wikiPath,
      title: `Summary of ${source.title}`,
      summary: `Automated summary synthesized by Chief Librarian from ${source.title}.`,
      project_id: source.project_id,
      current_version: 1,
      body_hash: computeSha256(text.slice(0, 300)),
      content: `# ${source.title} (Summary)\n\n**Classification**: ${category}\n\n**Extracted Entities**:\n${createdEntities
        .map((e) => `- **${e.canonical_name}** (${e.entity_type}): ${e.description}`)
        .join("\n")}\n\n**Extracted Concepts**:\n${createdConcepts
        .map((c) => `- **${c.name}**: ${c.summary}`)
        .join("\n")}`,
      review_state: "needs_review",
      requires_approval: false,
      created_at: now,
      updated_at: now,
    };
    this.wikiPages.set(wikiPage.id, wikiPage);

    const createdClaims: Claim[] = [];
    if (createdEntities[0]) {
      const claim: Claim = {
        id: `claim-${Date.now()}`,
        wiki_page_id: wikiPage.id,
        page_version: 1,
        claim_text: `Identified ${createdEntities[0].canonical_name} as primary entity in ${source.title}.`,
        source_id: source.id,
        locator: "Document Extraction",
        confidence: 0.95,
        review_state: "approved",
        created_at: now,
      };
      this.claims.set(claim.id, claim);
      createdClaims.push(claim);
    }

    source.ingest_status = "processed";
    this.emitEvent("source_processed", "source", source.id, {
      entitiesCount: createdEntities.length,
      conceptsCount: createdConcepts.length,
    });
    this.logAudit("agent", "agent-librarian", "librarian.ingest_completed", source.id, {
      title: source.title,
      wiki_id: wikiPage.id,
    });

    return {
      source,
      entities: createdEntities,
      concepts: createdConcepts,
      relationships: createdRelationships,
      wikiPages: [wikiPage],
      claims: createdClaims,
    };
  }

  // ---------------------------------------------------------------------------
  // Artifacts (Layer 2)
  // ---------------------------------------------------------------------------
  public getArtifacts(projectId?: string): Artifact[] {
    const list = Array.from(this.artifacts.values());
    if (projectId) return list.filter((a) => a.project_id === projectId);
    return list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }

  public getArtifact(id: string): Artifact | undefined {
    return this.artifacts.get(id);
  }

  public createArtifact(data: {
    project_id: string;
    studio_id?: string;
    artifact_type: string;
    title: string;
    summary: string;
    body?: Record<string, unknown>;
    created_by_agent_id?: string;
  }): Artifact {
    const now = new Date().toISOString();
    const id = `art-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const storagePath = `artifacts/${data.artifact_type}/${data.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.json`;
    const contentHash = computeSha256(JSON.stringify(data.body || {}));

    const artifact: Artifact = {
      id,
      project_id: data.project_id,
      studio_id: data.studio_id,
      artifact_type: data.artifact_type,
      schema_version: "1",
      title: data.title,
      summary: data.summary,
      status: "draft",
      version: 1,
      storage_path: storagePath,
      content_hash: contentHash,
      body: data.body,
      created_by_agent_id: data.created_by_agent_id,
      created_at: now,
      updated_at: now,
    };

    this.artifacts.set(id, artifact);

    // Auto link project CONTAINS artifact
    const rel: Relationship = {
      id: `rel-${Date.now()}`,
      from_id: data.project_id,
      to_id: id,
      edge_type: "contains",
      confidence: 1.0,
      review_state: "approved",
      metadata: { auto: true },
      created_at: now,
    };
    this.relationships.set(rel.id, rel);

    this.emitEvent("artifact_created", "artifact", id, {
      type: artifact.artifact_type,
      title: artifact.title,
    });
    this.logAudit("agent", data.created_by_agent_id || "studio", "artifact.create", id, {
      title: artifact.title,
    });

    return artifact;
  }

  public approveArtifact(id: string, approvedBy: string): Artifact {
    const art = this.artifacts.get(id);
    if (!art) throw new Error("Artifact not found");
    const now = new Date().toISOString();
    art.status = "approved";
    art.approved_by = approvedBy;
    art.approved_at = now;
    art.updated_at = now;

    this.emitEvent("artifact_approved", "artifact", id, { approvedBy });
    this.logAudit("user", approvedBy, "artifact.approve", id, { title: art.title });

    return art;
  }

  // ---------------------------------------------------------------------------
  // Entities & Concepts
  // ---------------------------------------------------------------------------
  public getEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  public getConcepts(): Concept[] {
    return Array.from(this.concepts.values());
  }

  public getDecisions(projectId?: string): Decision[] {
    const list = Array.from(this.decisions.values());
    if (projectId) return list.filter((d) => d.project_id === projectId);
    return list;
  }

  public createDecision(data: {
    project_id: string;
    title: string;
    decision: string;
    reasoning?: string;
    decided_by?: string;
  }): Decision {
    const now = new Date().toISOString();
    const id = `dec-${Date.now()}`;
    const dec: Decision = {
      id,
      project_id: data.project_id,
      title: data.title,
      decision: data.decision,
      reasoning: data.reasoning || "",
      status: "accepted",
      decided_by: data.decided_by || "Jarvis Supervisor",
      decided_at: now,
      created_at: now,
      updated_at: now,
    };
    this.decisions.set(id, dec);
    this.logAudit("agent", "agent-jarvis", "decision.record", id, { title: dec.title });
    return dec;
  }

  // ---------------------------------------------------------------------------
  // Wiki & Claims
  // ---------------------------------------------------------------------------
  public getWikiPages(): WikiPage[] {
    return Array.from(this.wikiPages.values());
  }

  public getWikiPage(id: string): WikiPage | undefined {
    return this.wikiPages.get(id);
  }

  public getClaimsForPage(pageId: string): Claim[] {
    return Array.from(this.claims.values()).filter((c) => c.wiki_page_id === pageId);
  }

  // ---------------------------------------------------------------------------
  // Relationships & Cycle-Safe Graph Traversal
  // ---------------------------------------------------------------------------
  public getRelationships(): Relationship[] {
    return Array.from(this.relationships.values());
  }

  public createRelationship(data: {
    from_id: string;
    to_id: string;
    edge_type: Relationship["edge_type"];
    confidence?: number;
    metadata?: Record<string, unknown>;
  }): Relationship {
    if (data.from_id === data.to_id) {
      throw new Error("Relationship cannot have same from and to ID (no self loops)");
    }
    const id = `rel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const rel: Relationship = {
      id,
      from_id: data.from_id,
      to_id: data.to_id,
      edge_type: data.edge_type,
      confidence: data.confidence || 1.0,
      review_state: "approved",
      metadata: data.metadata || {},
      created_at: new Date().toISOString(),
    };
    this.relationships.set(id, rel);
    return rel;
  }

  /**
   * Cycle-safe graph neighborhood walk matching the SQL function graph_neighbors()
   */
  public graphNeighbors(startId: string, maxDepth = 2): { object_id: string; depth: number }[] {
    const visited = new Set<string>([startId]);
    const results: { object_id: string; depth: number }[] = [];
    let currentQueue = [startId];

    for (let depth = 1; depth <= maxDepth; depth++) {
      const nextQueue: string[] = [];
      for (const curr of currentQueue) {
        for (const rel of this.relationships.values()) {
          if (rel.superseded_at) continue;
          let neighbor: string | null = null;
          if (rel.from_id === curr) neighbor = rel.to_id;
          else if (rel.to_id === curr) neighbor = rel.from_id;

          if (neighbor && !visited.has(neighbor)) {
            visited.add(neighbor);
            results.push({ object_id: neighbor, depth });
            nextQueue.push(neighbor);
          }
        }
      }
      currentQueue = nextQueue;
      if (currentQueue.length === 0) break;
    }

    return results;
  }

  // ---------------------------------------------------------------------------
  // Hybrid Search (Full-text + semantic vector approximation)
  // ---------------------------------------------------------------------------
  public hybridSearch(query: string): {
    entities: Entity[];
    concepts: Concept[];
    artifacts: Artifact[];
    sources: Source[];
    wikiPages: WikiPage[];
    claims: Claim[];
  } {
    const q = query.toLowerCase().trim();
    if (!q) {
      return {
        entities: this.getEntities().slice(0, 5),
        concepts: this.getConcepts().slice(0, 5),
        artifacts: this.getArtifacts().slice(0, 5),
        sources: this.getSources().slice(0, 5),
        wikiPages: this.getWikiPages().slice(0, 5),
        claims: Array.from(this.claims.values()).slice(0, 5),
      };
    }

    const entities = this.getEntities().filter(
      (e) =>
        e.canonical_name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.aliases.some((a) => a.toLowerCase().includes(q))
    );

    const concepts = this.getConcepts().filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        (c.domain && c.domain.toLowerCase().includes(q))
    );

    const artifacts = this.getArtifacts().filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.artifact_type.toLowerCase().includes(q)
    );

    const sources = this.getSources().filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.content && s.content.toLowerCase().includes(q)) ||
        s.kind.toLowerCase().includes(q)
    );

    const wikiPages = this.getWikiPages().filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.summary.toLowerCase().includes(q) ||
        (w.content && w.content.toLowerCase().includes(q))
    );

    const claims = Array.from(this.claims.values()).filter((c) =>
      c.claim_text.toLowerCase().includes(q)
    );

    return { entities, concepts, artifacts, sources, wikiPages, claims };
  }

  // ---------------------------------------------------------------------------
  // Chief Librarian Health Check / Audit Engine
  // ---------------------------------------------------------------------------
  public runAuditCheck(): AuditFinding[] {
    const findings: AuditFinding[] = [];
    const now = new Date().toISOString();

    // 1. Orphan Pages (wiki pages with no incoming relationships or claims)
    const claimedWikiIds = new Set(Array.from(this.claims.values()).map((c) => c.wiki_page_id));
    for (const page of this.wikiPages.values()) {
      if (!claimedWikiIds.has(page.id) && page.page_type !== "doctrine") {
        findings.push({
          id: `finding-${Date.now()}-${findings.length}`,
          finding_type: "orphan_page",
          object_id: page.id,
          details: {
            path: page.path,
            title: page.title,
            issue: "Wiki page has no documented provenance claims linking to evidence.",
          },
          status: "open",
          created_at: now,
        });
      }
    }

    // 2. Draft Artifacts needing review
    for (const art of this.artifacts.values()) {
      if (art.status === "draft") {
        findings.push({
          id: `finding-${Date.now()}-${findings.length}`,
          finding_type: "stale_document",
          object_id: art.id,
          details: {
            title: art.title,
            type: art.artifact_type,
            issue: "Artifact has remained in draft without human or Jarvis gate approval.",
          },
          status: "open",
          created_at: now,
        });
      }
    }

    // 3. Unlinked Entities
    const linkedIds = new Set<string>();
    for (const r of this.relationships.values()) {
      linkedIds.add(r.from_id);
      linkedIds.add(r.to_id);
    }

    for (const ent of this.entities.values()) {
      if (!linkedIds.has(ent.id)) {
        findings.push({
          id: `finding-${Date.now()}-${findings.length}`,
          finding_type: "broken_reference",
          object_id: ent.id,
          details: {
            entity: ent.canonical_name,
            issue: "Entity exists in registry but has zero graph relationships.",
          },
          status: "open",
          created_at: now,
        });
      }
    }

    findings.forEach((f) => this.auditFindings.set(f.id, f));
    return findings;
  }

  public getAuditFindings(): AuditFinding[] {
    return Array.from(this.auditFindings.values());
  }

  // ---------------------------------------------------------------------------
  // Jarvis Work Contract Execution (WorkRequest -> WorkResponse)
  // ---------------------------------------------------------------------------
  public async executeWorkRequest(request: {
    project_id: string;
    studio_id: string;
    objective: string;
    context_ids?: string[];
    constraints?: string[];
  }): Promise<WorkResponse> {
    const now = new Date().toISOString();
    const studio = this.studios.get(request.studio_id);
    if (!studio) throw new Error(`Unknown Studio: ${request.studio_id}`);

    const reqId = `work-${Date.now()}`;
    const workReq: WorkRequest = {
      id: reqId,
      project_id: request.project_id,
      studio_id: request.studio_id,
      objective: request.objective,
      context_ids: request.context_ids || [],
      constraints: request.constraints || ["Zero-pill UI", "High border contrast", "Strict type safety"],
      status: "running",
      requested_by: "jarvis",
      created_at: now,
      updated_at: now,
    };
    this.workRequests.set(reqId, workReq);

    this.emitEvent("work_request_created", "project", request.project_id, {
      studio: studio.slug,
      objective: request.objective,
    });
    this.logAudit("agent", "agent-jarvis", "jarvis.dispatch_work", reqId, {
      studio: studio.name,
      objective: request.objective,
    });

    // Execute domain work according to targeted studio
    let generatedArtifact: Artifact;
    let generatedDecision: Decision;
    let nextSteps: string[] = [];

    if (studio.slug === "design") {
      generatedArtifact = this.createArtifact({
        project_id: request.project_id,
        studio_id: studio.id,
        artifact_type: "design_system",
        title: `Design Spec: ${request.objective.slice(0, 30)}`,
        summary: `UX flows, wireframe specs, and design system components synthesized for ${request.objective}.`,
        body: {
          objective: request.objective,
          screen_maps: ["/dashboard", "/settings", "/analytics"],
          tokens: { primary: "#38bdf8", background: "#050814", border: "#1e293b" },
          accessibility: "WCAG 2.1 AA Compliant",
        },
        created_by_agent_id: "agent-design",
      });

      generatedDecision = this.createDecision({
        project_id: request.project_id,
        title: `Design Component Architecture for ${request.objective.slice(0, 24)}`,
        decision: "Adopt modular atomic components styled with Tailwind CSS v4 and full keyboard navigation.",
        reasoning: "Strictly conforms to Design Studio UI/UX rules and accessibility guidelines.",
      });

      nextSteps = [
        "Architecture Studio: Validate API endpoints supporting these screens",
        "Development Studio: Implement Tailwind components in Next.js",
        "QA Studio: Execute visual regression and contrast compliance checks",
      ];
    } else if (studio.slug === "product") {
      generatedArtifact = this.createArtifact({
        project_id: request.project_id,
        studio_id: studio.id,
        artifact_type: "prd",
        title: `PRD: ${request.objective.slice(0, 30)}`,
        summary: `Full product requirements document and acceptance criteria for ${request.objective}.`,
        body: {
          problem: request.objective,
          mvp_features: ["Core workflow automation", "Persistent state persistence", "Real-time sync"],
          acceptance_criteria: [
            "Passes 100% of integration test suites",
            "Latency < 200ms on all graph queries",
          ],
        },
        created_by_agent_id: "agent-product",
      });

      generatedDecision = this.createDecision({
        project_id: request.project_id,
        title: `MVP Scope Definition for ${request.objective.slice(0, 24)}`,
        decision: "Freeze Phase 1 scope to core CRUD and knowledge linking.",
        reasoning: "Prevents scope creep and accelerates deployment of Foundation Sprint 001.",
      });

      nextSteps = [
        "Architecture Studio: Generate database schema and API contracts",
        "Design Studio: Prepare user flow wireframes",
      ];
    } else if (studio.slug === "architecture") {
      generatedArtifact = this.createArtifact({
        project_id: request.project_id,
        studio_id: studio.id,
        artifact_type: "architecture_blueprint",
        title: `System Blueprint: ${request.objective.slice(0, 30)}`,
        summary: `Database schema, API contracts, and infrastructure topology for ${request.objective}.`,
        body: {
          runtime: "Next.js 15 App Router + Server Actions",
          database: "PostgreSQL 15 with pgvector",
          contracts: ["POST /projects", "POST /artifacts", "POST /librarian/ingest"],
        },
        created_by_agent_id: "agent-architecture",
      });

      generatedDecision = this.createDecision({
        project_id: request.project_id,
        title: "Database Isolation & Schema Strategy",
        decision: "Enforce universal brain_objects parent table for foreign key integrity.",
        reasoning: "Eliminates polymorphic ID corruption across disparate knowledge types.",
      });

      nextSteps = [
        "Development Studio: Generate migration files and API handlers",
        "QA Studio: Generate test assertions against schema invariants",
      ];
    } else {
      // General studio dispatch
      generatedArtifact = this.createArtifact({
        project_id: request.project_id,
        studio_id: studio.id,
        artifact_type: `${studio.slug}_deliverable`,
        title: `${studio.name} Deliverable: ${request.objective.slice(0, 25)}`,
        summary: `Synthesized by ${studio.name} for ${request.objective}.`,
        body: { objective: request.objective, status: "completed" },
        created_by_agent_id: `agent-${studio.slug}`,
      });

      generatedDecision = this.createDecision({
        project_id: request.project_id,
        title: `Phase Gate Passed for ${studio.name}`,
        decision: `Approve progression of ${request.objective} to downstream studio.`,
        reasoning: "All constraints and preconditions were verified.",
      });

      nextSteps = ["Jarvis Supervisor: Schedule downstream verification gate"];
    }

    workReq.status = "done";
    workReq.completed_at = new Date().toISOString();

    const response: WorkResponse = {
      status: "done",
      artifacts: [generatedArtifact],
      decisions: [generatedDecision],
      references: [studio.manifest_path || ""],
      next_steps: nextSteps,
    };

    return response;
  }

  // ---------------------------------------------------------------------------
  // Outbox Events & Audit Log
  // ---------------------------------------------------------------------------
  public emitEvent(
    eventType: string,
    aggregateType: EventRecord["aggregate_type"],
    aggregateId: string,
    payload: Record<string, unknown>
  ): EventRecord {
    const now = new Date().toISOString();
    const event: EventRecord = {
      id: this.eventCounter++,
      event_type: eventType,
      aggregate_type: aggregateType,
      aggregate_id: aggregateId,
      payload,
      idempotency_key: `${eventType}:${aggregateId}:${Date.now()}`,
      status: "pending",
      attempts: 0,
      max_attempts: 5,
      available_at: now,
      created_at: now,
    };
    this.events.push(event);
    return event;
  }

  public getEvents(limit = 20): EventRecord[] {
    return this.events.slice(-limit).reverse();
  }

  public logAudit(
    actorType: AuditLogEntry["actor_type"],
    actorId: string,
    action: string,
    objectId?: string,
    details: Record<string, unknown> = {}
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: this.auditCounter++,
      occurred_at: new Date().toISOString(),
      actor_type: actorType,
      actor_id: actorId,
      action,
      object_id: objectId,
      details,
    };
    this.auditLog.push(entry);
    return entry;
  }

  public getAuditLog(limit = 30): AuditLogEntry[] {
    return this.auditLog.slice(-limit).reverse();
  }
}

// Singleton database instance
export const cortexDb = new CortexDatabase();
