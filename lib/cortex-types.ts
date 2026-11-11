// CortexOS Canonical Types matching brain_schema_v1.sql and brain_models_v1.py

export type ObjectType =
  | "project"
  | "source"
  | "artifact"
  | "entity"
  | "concept"
  | "decision"
  | "meeting"
  | "task"
  | "agent"
  | "studio"
  | "wiki_page";

export type EdgeType =
  | "created_by"
  | "contains"
  | "part_of"
  | "depends_on"
  | "references"
  | "implements"
  | "influences"
  | "derived_from"
  | "owned_by"
  | "uses"
  | "supersedes"
  | "blocks"
  | "mentions";

export type ReviewState = "unreviewed" | "needs_review" | "approved" | "rejected";
export type SourceKind =
  | "markdown"
  | "url"
  | "pdf"
  | "docx"
  | "transcript"
  | "repo"
  | "agent_output"
  | "other";
export type TrustLevel = "trusted" | "untrusted";
export type IngestStatus = "received" | "processing" | "processed" | "failed";
export type ProjectStatus = "active" | "paused" | "archived";
export type ArtifactStatus = "draft" | "in_review" | "approved" | "superseded" | "rejected";
export type DecisionStatus = "proposed" | "accepted" | "superseded" | "rejected";
export type TaskStatus = "todo" | "in_progress" | "blocked" | "done" | "cancelled";
export type WorkStatus =
  | "queued"
  | "running"
  | "awaiting_approval"
  | "done"
  | "failed"
  | "cancelled";
export type WikiPageType =
  | "entity"
  | "concept"
  | "decision"
  | "doctrine"
  | "pattern"
  | "playbook"
  | "summary"
  | "project";
export type EventStatus = "pending" | "processing" | "done" | "failed" | "dead";
export type ActorType = "user" | "agent" | "system";
export type FindingType =
  | "duplicate_concept"
  | "conflicting_architecture"
  | "orphan_page"
  | "broken_reference"
  | "stale_document"
  | "missing_summary"
  | "contradiction";
export type FindingStatus = "open" | "resolved" | "dismissed";

export interface BrainObject {
  id: string;
  object_type: ObjectType;
  created_at: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface Studio {
  id: string;
  slug: string;
  name: string;
  mission: string;
  status: "active" | "disabled";
  manifest_path?: string;
  manifest_version?: string;
  manifest_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  studio_id: string;
  name: string;
  role: string;
  model?: string;
  config: Record<string, unknown>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkRequest {
  id: string;
  project_id: string;
  studio_id: string;
  objective: string;
  context_ids: string[];
  constraints: string[];
  status: WorkStatus;
  requested_by: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface WorkResponse {
  status: WorkStatus;
  artifacts: Artifact[];
  decisions: Decision[];
  references: string[];
  next_steps: string[];
}

export interface Source {
  id: string;
  project_id?: string;
  kind: SourceKind;
  title: string;
  uri?: string;
  storage_path: string;
  content_hash: string;
  content?: string;
  mime_type?: string;
  byte_size?: number;
  trust: TrustLevel;
  ingest_status: IngestStatus;
  ingest_error?: string;
  metadata: Record<string, unknown>;
  ingested_at: string;
}

export interface Artifact {
  id: string;
  project_id: string;
  studio_id?: string;
  work_request_id?: string;
  artifact_type: string;
  schema_version: string;
  title: string;
  summary: string;
  status: ArtifactStatus;
  version: number;
  supersedes_id?: string;
  storage_path: string;
  content_hash: string;
  body?: Record<string, unknown>;
  created_by_agent_id?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Entity {
  id: string;
  canonical_name: string;
  entity_type: string;
  description: string;
  aliases: string[];
  metadata: Record<string, unknown>;
  review_state: ReviewState;
  confidence: number;
  merged_into_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Concept {
  id: string;
  name: string;
  summary: string;
  domain?: string;
  aliases: string[];
  review_state: ReviewState;
  confidence: number;
  merged_into_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Decision {
  id: string;
  project_id: string;
  title: string;
  decision: string;
  reasoning: string;
  status: DecisionStatus;
  supersedes_id?: string;
  decided_by?: string;
  decided_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee_agent_id?: string;
  artifact_id?: string;
  due_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WikiPage {
  id: string;
  page_type: WikiPageType;
  path: string;
  title: string;
  summary: string;
  project_id?: string;
  current_version: number;
  body_hash?: string;
  content?: string;
  review_state: ReviewState;
  requires_approval: boolean;
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: string;
  wiki_page_id: string;
  page_version?: number;
  claim_text: string;
  source_id?: string;
  artifact_id?: string;
  locator?: string;
  confidence: number;
  review_state: ReviewState;
  created_at: string;
}

export interface Relationship {
  id: string;
  from_id: string;
  to_id: string;
  edge_type: EdgeType;
  confidence: number;
  review_state: ReviewState;
  source_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  superseded_at?: string;
}

export interface EventRecord {
  id: number;
  event_type: string;
  aggregate_type?: ObjectType;
  aggregate_id?: string;
  payload: Record<string, unknown>;
  idempotency_key: string;
  status: EventStatus;
  attempts: number;
  max_attempts: number;
  available_at: string;
  locked_by?: string;
  locked_at?: string;
  last_error?: string;
  created_at: string;
  processed_at?: string;
}

export interface AuditLogEntry {
  id: number;
  occurred_at: string;
  actor_type: ActorType;
  actor_id: string;
  action: string;
  object_id?: string;
  details: Record<string, unknown>;
}

export interface AuditFinding {
  id: string;
  finding_type: FindingType;
  object_id?: string;
  details: Record<string, unknown>;
  status: FindingStatus;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

// Extraction contracts for Chief Librarian
export interface ExtractedEntity {
  name: string;
  entity_type: string;
  aliases: string[];
  description: string;
  evidence: string;
  locator?: string;
  confidence: number;
}

export interface ExtractedConcept {
  name: string;
  summary: string;
  domain?: string;
  evidence: string;
  locator?: string;
  confidence: number;
}

export interface ExtractedRelationship {
  from_name: string;
  to_name: string;
  edge_type: EdgeType;
  evidence: string;
  locator?: string;
  confidence: number;
}

export interface ExtractionResult {
  source_id: string;
  summary: string;
  category: string;
  entities: ExtractedEntity[];
  concepts: ExtractedConcept[];
  relationships: ExtractedRelationship[];
}
