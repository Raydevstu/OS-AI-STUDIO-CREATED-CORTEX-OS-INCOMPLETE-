"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Shield,
  FileText,
  Boxes,
  Palette,
  Network,
  Code,
  ShieldCheck,
  Rocket,
  Compass,
  Send,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Check,
  X,
  Layers,
  Database,
  Terminal,
  Clock,
  BookOpen,
  ArrowRight,
  Fingerprint,
  Cpu,
  Eye,
  FileCheck,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Project, Source, Artifact, Entity, Concept, Decision, WikiPage, Claim, Relationship, AuditLogEntry, AuditFinding } from "@/lib/cortex-types";
import { CORTEX_STUDIOS, StudioDefinition } from "@/lib/studios-data";

interface WarRoomProps {
  onSwitchToBrainMode: () => void;
  onOpenTerminalWithPrompt?: (prompt: string) => void;
}

export default function WarRoom({ onSwitchToBrainMode }: WarRoomProps) {
  // Global Project & Navigation State
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("project-cortex");
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectSlug, setNewProjectSlug] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  // Left Panel: Research & Sources State
  const [sources, setSources] = useState<Source[]>([]);
  const [sourceSearch, setSourceSearch] = useState("");
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceKind, setSourceKind] = useState<Source["kind"]>("markdown");
  const [sourceContent, setSourceContent] = useState("");
  const [sourceUri, setSourceUri] = useState("");
  const [selectedSourceForView, setSelectedSourceForView] = useState<Source | null>(null);
  const [ingestionLoading, setIngestionLoading] = useState(false);
  const [lastIngestPipeline, setLastIngestPipeline] = useState<Record<string, string> | null>(null);

  // Center Panel: Mission Control & Jarvis State
  const [jarvisObjective, setJarvisObjective] = useState("Build CortexOS Foundation Service (Sprint 001)");
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(2); // 0=Discovery, 1=Product, 2=Design, 3=Arch, 4=Dev, 5=QA, 6=Release
  const [activeStudioSlug, setActiveStudioSlug] = useState<string>("design");
  const [councilFeed, setCouncilFeed] = useState<{
    id: string;
    sender: string;
    role: string;
    text: string;
    timestamp: string;
    status: "queued" | "running" | "done" | "blocked" | "failed";
  }[]>([
    {
      id: "feed-1",
      sender: "Jarvis",
      role: "Supervisor",
      text: "CortexOS Kernel 4C foundation online. Architecture locked. Preparing Design Studio MVP environment.",
      timestamp: "10:00:15",
      status: "done",
    },
    {
      id: "feed-2",
      sender: "Chief Librarian",
      role: "Memory Gatekeeper",
      text: "Ingested 'CortexOS Consolidated Spec v0.1'. Extracted 5 entities, 4 concepts, and 7 active relationships. Wiki provenance claims verified.",
      timestamp: "10:01:22",
      status: "done",
    },
    {
      id: "feed-3",
      sender: "Product Studio",
      role: "Product Specialist",
      text: "PRD v1 published and approved. MVP scope locked. Passed Quality Gate #1 to Design Studio.",
      timestamp: "10:02:45",
      status: "done",
    },
    {
      id: "feed-4",
      sender: "Design Studio",
      role: "Lead UI/UX Architect",
      text: "Executing Design Studio MVP: Stealth obsidian design system and zero-pill UI rules applied. Ready for wireframe synthesis.",
      timestamp: "10:03:10",
      status: "running",
    },
  ]);
  const [jarvisInput, setJarvisInput] = useState("");
  const [isExecutingJarvis, setIsExecutingJarvis] = useState(false);

  // Right Panel: Workbench Tabs & Tools
  const [workbenchTab, setWorkbenchTab] = useState<"studio" | "prd" | "schema" | "api" | "wiki" | "artifacts">("studio");
  const [studioSubTab, setStudioSubTab] = useState<"files" | "templates" | "playbooks" | "memory">("files");
  const [selectedStudioFile, setSelectedStudioFile] = useState<string>("design-system.md");

  // Artifacts, Wiki, and Audit Data
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [wikiPages, setWikiPages] = useState<WikiPage[]>([]);
  const [selectedWikiPage, setSelectedWikiPage] = useState<WikiPage | null>(null);
  const [claimsForSelectedPage, setClaimsForSelectedPage] = useState<Claim[]>([]);
  const [auditFindings, setAuditFindings] = useState<AuditFinding[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  // API Tester State
  const [apiEndpoint, setApiEndpoint] = useState<string>("/api/projects");
  const [apiMethod, setApiMethod] = useState<"GET" | "POST">("GET");
  const [apiPayload, setApiPayload] = useState<string>("{}");
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  // PRD Builder State
  const [prdTitle, setPrdTitle] = useState("Healthcare CRM Patient Triage");
  const [prdProblem, setPrdProblem] = useState("Patients experience 45+ minute triage delays across specialist handoffs.");
  const [prdPersonas, setPrdPersonas] = useState("Triage Nurses, Specialist Physicians, Clinic Administrators");
  const [prdMvpScope, setPrdMvpScope] = useState("Real-time patient intake board, automated urgency scoring, specialist availability routing.");
  const [prdAcceptanceCriteria, setPrdAcceptanceCriteria] = useState("1. All referral transitions logged in under 100ms.\n2. Inbound voice notes transcribed via Chief Librarian.\n3. HIPAA audit log entries recorded on every record access.");
  const [prdNonGoals, setPrdNonGoals] = useState("Direct payment processing, patient mobile app (deferred to Sprint 004).");
  const [prdSaving, setPrdSaving] = useState(false);

  // Studio Phase list
  const PHASES = [
    { slug: "discovery", name: "Discovery", icon: Compass },
    { slug: "product", name: "Product", icon: Boxes },
    { slug: "design", name: "Design", icon: Palette },
    { slug: "architecture", name: "Architecture", icon: Network },
    { slug: "development", name: "Development", icon: Code },
    { slug: "qa", name: "QA", icon: ShieldCheck },
    { slug: "release", name: "Release", icon: Rocket },
  ];

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------
  const fetchAllData = useCallback(async () => {
    try {
      const [projRes, srcRes, artRes, auditRes, searchRes] = await Promise.all([
        fetch("/api/projects"),
        fetch(`/api/sources?projectId=${selectedProjectId}`),
        fetch(`/api/artifacts?projectId=${selectedProjectId}`),
        fetch("/api/librarian/audit"),
        fetch("/api/search?q="),
      ]);

      if (projRes.ok) {
        const data = await projRes.json();
        setProjects(data.projects || []);
      }
      if (srcRes.ok) {
        const data = await srcRes.json();
        setSources(data.sources || []);
      }
      if (artRes.ok) {
        const data = await artRes.json();
        setArtifacts(data.artifacts || []);
      }
      if (auditRes.ok) {
        const data = await auditRes.json();
        setAuditFindings(data.findings || []);
        setAuditLog(data.auditLog || []);
      }
      if (searchRes.ok) {
        const data = await searchRes.json();
        const pages = data.results?.wikiPages || [];
        setWikiPages(pages);
      }
    } catch (e) {
      console.error("Failed to fetch War Room data:", e);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    let active = true;
    const initFetch = async () => {
      try {
        const [projRes, srcRes, artRes, auditRes, searchRes] = await Promise.all([
          fetch("/api/projects"),
          fetch(`/api/sources?projectId=${selectedProjectId}`),
          fetch(`/api/artifacts?projectId=${selectedProjectId}`),
          fetch("/api/librarian/audit"),
          fetch("/api/search?q="),
        ]);

        if (!active) return;
        if (projRes.ok) {
          const data = await projRes.json();
          setProjects(data.projects || []);
        }
        if (srcRes.ok) {
          const data = await srcRes.json();
          setSources(data.sources || []);
        }
        if (artRes.ok) {
          const data = await artRes.json();
          setArtifacts(data.artifacts || []);
        }
        if (auditRes.ok) {
          const data = await auditRes.json();
          setAuditFindings(data.findings || []);
          setAuditLog(data.auditLog || []);
        }
        if (searchRes.ok) {
          const data = await searchRes.json();
          const pages = data.results?.wikiPages || [];
          setWikiPages(pages);
          if (pages.length > 0) {
            setSelectedWikiPage((prev) => prev || pages[0]);
          }
        }
      } catch (err) {
        console.error("War Room init fetch error:", err);
      }
    };
    initFetch();
    return () => {
      active = false;
    };
  }, [selectedProjectId]);

  // Handle Project Change
  const handleSelectProject = (projId: string) => {
    setSelectedProjectId(projId);
    const proj = projects.find((p) => p.id === projId);
    if (proj) {
      setJarvisObjective(`Coordinate ${proj.name}`);
    }
  };

  // Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName || !newProjectSlug) return;
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName,
          slug: newProjectSlug,
          description: newProjectDesc,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsNewProjectModalOpen(false);
        setNewProjectName("");
        setNewProjectSlug("");
        setNewProjectDesc("");
        await fetchAllData();
        if (data.project) {
          setSelectedProjectId(data.project.id);
        }
      }
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  // Ingest Source through Chief Librarian
  const handleIngestSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceTitle || !sourceContent) return;
    setIngestionLoading(true);
    try {
      const res = await fetch("/api/librarian/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: selectedProjectId,
          title: sourceTitle,
          kind: sourceKind,
          text: sourceContent,
          uri: sourceUri || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastIngestPipeline(data.pipeline);
        setIsAddSourceModalOpen(false);
        setSourceTitle("");
        setSourceContent("");
        setSourceUri("");
        await fetchAllData();

        // Add to Council Feed
        setCouncilFeed((prev) => [
          {
            id: `feed-${Date.now()}`,
            sender: "Chief Librarian",
            role: "Memory Gatekeeper",
            text: `Processed & classified source '${data.data?.source?.title}'. Generated ${data.data?.entities?.length || 1} entities, ${data.data?.concepts?.length || 1} concepts, and updated Knowledge Graph.`,
            timestamp: new Date().toLocaleTimeString(),
            status: "done",
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error("Ingestion failed:", err);
    } finally {
      setIngestionLoading(false);
    }
  };

  // Execute Jarvis Work Request
  const handleDispatchJarvis = async (customPrompt?: string) => {
    const objective = customPrompt || jarvisInput;
    if (!objective.trim()) return;

    setIsExecutingJarvis(true);
    setJarvisInput("");

    // Add running entry
    const entryId = `feed-${Date.now()}`;
    setCouncilFeed((prev) => [
      {
        id: entryId,
        sender: "Jarvis",
        role: "Supervisor",
        text: `Executing objective: "${objective}" → Routing to ${CORTEX_STUDIOS[activeStudioSlug]?.name || "Studio"}.`,
        timestamp: new Date().toLocaleTimeString(),
        status: "running",
      },
      ...prev,
    ]);

    try {
      const res = await fetch("/api/jarvis/work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: selectedProjectId,
          studio_id: `studio-${activeStudioSlug}`,
          objective,
          constraints: CORTEX_STUDIOS[activeStudioSlug]?.constraints || ["Strict type safety"],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await fetchAllData();

        // Update entry to done
        setCouncilFeed((prev) =>
          prev.map((item) =>
            item.id === entryId
              ? {
                  ...item,
                  status: "done",
                  text: `Completed objective: "${objective}". Generated artifact "${data.artifacts?.[0]?.title || "Deliverable"}". Decisions registered.`,
                }
              : item
          )
        );
      }
    } catch (err) {
      console.error("Jarvis execution error:", err);
      setCouncilFeed((prev) =>
        prev.map((item) =>
          item.id === entryId
            ? { ...item, status: "failed", text: `Execution failed for objective: "${objective}".` }
            : item
        )
      );
    } finally {
      setIsExecutingJarvis(false);
    }
  };

  // Approve Artifact
  const handleApproveArtifact = async (artifactId: string) => {
    try {
      const res = await fetch("/api/artifacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: artifactId,
          action: "approve",
          approved_by: "Ray (System Architect)",
        }),
      });
      if (res.ok) {
        await fetchAllData();
        setCouncilFeed((prev) => [
          {
            id: `feed-${Date.now()}`,
            sender: "Jarvis",
            role: "Supervisor",
            text: `Human Architect approved artifact '${artifactId}'. Governance gate cleared.`,
            timestamp: new Date().toLocaleTimeString(),
            status: "done",
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error("Failed to approve artifact:", err);
    }
  };

  // Run Chief Librarian Audit Check
  const handleRunAudit = async () => {
    try {
      const res = await fetch("/api/librarian/audit", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setAuditFindings(data.findings || []);
        setCouncilFeed((prev) => [
          {
            id: `feed-${Date.now()}`,
            sender: "Chief Librarian",
            role: "Memory Gatekeeper",
            text: `Health audit completed: ${data.count} open findings analyzed across pages, references, and artifacts.`,
            timestamp: new Date().toLocaleTimeString(),
            status: "done",
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error("Failed to run audit:", err);
    }
  };

  // Execute Live API Test
  const handleExecuteApiTest = async () => {
    setApiLoading(true);
    setApiResponse(null);
    try {
      const options: RequestInit = {
        method: apiMethod,
        headers: { "Content-Type": "application/json" },
      };
      if (apiMethod === "POST") {
        options.body = apiPayload;
      }
      const res = await fetch(apiEndpoint, options);
      const json = await res.json();
      setApiResponse(JSON.stringify(json, null, 2));
    } catch (err: unknown) {
      const error = err as Error;
      setApiResponse(JSON.stringify({ error: error.message }, null, 2));
    } finally {
      setApiLoading(false);
    }
  };

  // Save PRD Builder
  const handleSavePrd = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrdSaving(true);
    try {
      const res = await fetch("/api/artifacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: selectedProjectId,
          studio_id: "studio-product",
          artifact_type: "prd",
          title: prdTitle,
          summary: prdProblem.slice(0, 150),
          body: {
            problem: prdProblem,
            personas: prdPersonas.split(",").map((s) => s.trim()),
            mvp_scope: prdMvpScope,
            acceptance_criteria: prdAcceptanceCriteria,
            non_goals: prdNonGoals,
          },
          created_by_agent_id: "agent-product",
        }),
      });

      if (res.ok) {
        await fetchAllData();
        setWorkbenchTab("artifacts");
        setCouncilFeed((prev) => [
          {
            id: `feed-${Date.now()}`,
            sender: "Product Studio",
            role: "Product Specialist",
            text: `Formulated and registered PRD '${prdTitle}' in Brain Service. Ready for Architecture Studio verification.`,
            timestamp: new Date().toLocaleTimeString(),
            status: "done",
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error("Failed to save PRD:", err);
    } finally {
      setPrdSaving(false);
    }
  };

  const currentStudio = CORTEX_STUDIOS[activeStudioSlug] || CORTEX_STUDIOS.design;

  // Filter sources
  const filteredSources = sources.filter((s) =>
    s.title.toLowerCase().includes(sourceSearch.toLowerCase()) ||
    s.kind.toLowerCase().includes(sourceSearch.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-[#050814] text-slate-200 flex flex-col font-sans select-none overflow-hidden">
      {/* ===================================================================== */}
      {/* TOP HEADER: Mode Toggle, Project Picker & System Telemetry            */}
      {/* ===================================================================== */}
      <header className="h-14 px-4 sm:px-6 bg-[#070b19] border-b border-slate-800/80 backdrop-blur-xl flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                CortexOS
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-500/30">
                  WAR ROOM
                </span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <span>Kernel v1.0</span>
                <span>•</span>
                <span className="text-emerald-400">Chief Librarian Active</span>
              </div>
            </div>
          </div>

          {/* Project Selector */}
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono">PROJECT:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => handleSelectProject(e.target.value)}
              className="bg-slate-900 border border-slate-700/70 text-white text-xs rounded-lg px-2.5 py-1 font-mono focus:outline-none focus:border-cyan-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.slug})
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
              title="Create New Project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Controls: Mode Toggle, Audit findings badge & Switcher */}
        <div className="flex items-center gap-3">
          {/* Audit findings badge */}
          {auditFindings.length > 0 && (
            <button
              onClick={handleRunAudit}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono hover:bg-amber-500/20 transition-colors"
              title="Click to run health check"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{auditFindings.length} Audits</span>
            </button>
          )}

          {/* Switch to Brain Mode Button */}
          <button
            onClick={onSwitchToBrainMode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shadow-sm shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>🧠 3D Brain Mode</span>
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 3-PANEL WAR ROOM WORKSPACE                                            */}
      {/* Left: Research/Knowledge (NotebookLM style)                           */}
      {/* Center: Mission Control (Jarvis & Agent Council)                      */}
      {/* Right: Workbench (Studios & Artifact Tools - VS Code style)           */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
        {/* =================================================================== */}
        {/* LEFT PANEL: Research & Knowledge Intake (NotebookLM-style)          */}
        {/* =================================================================== */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col bg-[#060916] shrink-0 overflow-hidden">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold tracking-wider text-slate-200 uppercase font-mono">
                Knowledge Intake
              </span>
            </div>
            <button
              onClick={() => setIsAddSourceModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-medium transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Drop Source</span>
            </button>
          </div>

          {/* Chief Librarian Pipeline Status Banner */}
          <div className="px-3.5 py-2.5 bg-gradient-to-r from-cyan-950/40 to-slate-900 border-b border-slate-800 text-[11px]">
            <div className="flex items-center justify-between text-slate-300 font-mono text-[10px] mb-1">
              <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                LIBRARIAN PIPELINE
              </span>
              <span className="text-slate-400">Stage 1 → 5</span>
            </div>
            <div className="grid grid-cols-5 gap-1 text-[9px] text-center font-mono mt-1.5">
              <div className="bg-slate-800/90 py-1 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                Ingest
              </div>
              <div className="bg-slate-800/90 py-1 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                Classify
              </div>
              <div className="bg-slate-800/90 py-1 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                Extract
              </div>
              <div className="bg-slate-800/90 py-1 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                Relate
              </div>
              <div className="bg-slate-800/90 py-1 rounded border border-cyan-500/30 text-cyan-300 font-bold">
                Persist
              </div>
            </div>
          </div>

          {/* Search Sources */}
          <div className="p-3 border-b border-slate-800/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search raw sources & evidence..."
                value={sourceSearch}
                onChange={(e) => setSourceSearch(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Sources List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredSources.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No sources matched. Click &quot;Drop Source&quot; to ingest transcripts, PRDs, PDFs, or URLs.
              </div>
            ) : (
              filteredSources.map((src) => (
                <div
                  key={src.id}
                  onClick={() => setSelectedSourceForView(src)}
                  className="p-3 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {src.title}
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase shrink-0">
                      {src.kind}
                    </span>
                  </div>
                  <div className="mt-1.5 text-[11px] text-slate-400 line-clamp-2">
                    {src.content ? src.content.slice(0, 100) : "Raw immutable evidence file registered."}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      {src.ingest_status}
                    </span>
                    <span className="text-slate-400 truncate max-w-[120px]">
                      #{src.content_hash.slice(0, 8)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Quick Action */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
            <button
              onClick={() => setIsAddSourceModalOpen(true)}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ingest Meeting Note / PRD / URL</span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CENTER PANEL: Mission Control (Jarvis Supervisor & Agent Council)   */}
        {/* =================================================================== */}
        <div className="flex-1 flex flex-col bg-[#050814] overflow-hidden min-w-[320px]">
          {/* Pinned Jarvis Status Banner */}
          <div className="p-4 bg-gradient-to-r from-slate-950 via-[#070d1e] to-slate-950 border-b border-slate-800/80 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  JARVIS SUPERVISOR PINNED SUMMARY
                </div>
                <div className="text-sm font-bold text-white mt-0.5">{jarvisObjective}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  GATES: PASSING
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-500/40 text-indigo-300">
                  STUDIO: {activeStudioSlug.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Studio Phase Timeline Stepper */}
            <div className="mt-3 pt-3 border-t border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                <span>EXECUTION LIFECYCLE (STRICT ROUTING)</span>
                <span className="text-cyan-400">Phase {currentPhaseIndex + 1} of 7</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {PHASES.map((ph, idx) => {
                  const isCurrent = idx === currentPhaseIndex;
                  const isDone = idx < currentPhaseIndex;
                  return (
                    <button
                      key={ph.slug}
                      onClick={() => {
                        setCurrentPhaseIndex(idx);
                        setActiveStudioSlug(ph.slug);
                        setWorkbenchTab("studio");
                      }}
                      className={`p-1.5 rounded-lg border text-center transition-all ${
                        isCurrent
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-sm shadow-cyan-500/20"
                          : isDone
                          ? "bg-slate-900 border-emerald-500/30 text-emerald-400"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="text-[10px] font-mono truncate">{ph.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Agent Council Discussion & Run Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between px-1">
              <span>AGENT COUNCIL RUN FEED (REAL RUN STATES)</span>
              <span>{councilFeed.length} Events</span>
            </div>

            {councilFeed.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {item.sender}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {item.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span>{item.timestamp}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-semibold uppercase ${
                        item.status === "done"
                          ? "text-emerald-400 bg-emerald-950/60 border border-emerald-500/30"
                          : item.status === "running"
                          ? "text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 animate-pulse"
                          : "text-amber-400 bg-amber-950/60 border border-amber-500/30"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed font-sans">{item.text}</div>
              </div>
            ))}
          </div>

          {/* Quick Jarvis Action Presets */}
          <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
            <span className="text-slate-400 shrink-0">FAST ACTION:</span>
            <button
              onClick={() => handleDispatchJarvis("Execute Design Studio MVP: generate wireframe and token spec")}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 shrink-0 transition-colors"
            >
              🎨 Run Design MVP
            </button>
            <button
              onClick={() => handleDispatchJarvis("Enforce Architecture Studio verification gate on PRD v1")}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 shrink-0 transition-colors"
            >
              📐 Verify Architecture
            </button>
            <button
              onClick={handleRunAudit}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 shrink-0 transition-colors"
            >
              🩺 Check Contradictions
            </button>
          </div>

          {/* Jarvis Command Input Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDispatchJarvis();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Direct Jarvis Supervisor (e.g. 'Synthesize healthcare CRM design system', 'Approve architecture gate')..."
                  value={jarvisInput}
                  onChange={(e) => setJarvisInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                disabled={isExecutingJarvis || !jarvisInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/20"
              >
                {isExecutingJarvis ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Dispatch</span>
              </button>
            </form>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT PANEL: Workbench & Studios (VS Code style dockable/tabbed)    */}
        {/* =================================================================== */}
        <div className="w-full md:w-96 lg:w-[480px] flex flex-col bg-[#070b19] shrink-0 overflow-hidden">
          {/* Workbench Tool Selector Tabs */}
          <div className="h-10 px-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1 overflow-x-auto shrink-0 font-mono text-xs">
            <button
              onClick={() => setWorkbenchTab("studio")}
              className={`px-3 py-1.5 rounded-t-lg border-b-2 font-medium transition-colors ${
                workbenchTab === "studio"
                  ? "border-cyan-400 text-white bg-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              Studios ({activeStudioSlug})
            </button>
            <button
              onClick={() => setWorkbenchTab("prd")}
              className={`px-3 py-1.5 rounded-t-lg border-b-2 font-medium transition-colors ${
                workbenchTab === "prd"
                  ? "border-cyan-400 text-white bg-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              PRD Builder
            </button>
            <button
              onClick={() => setWorkbenchTab("schema")}
              className={`px-3 py-1.5 rounded-t-lg border-b-2 font-medium transition-colors ${
                workbenchTab === "schema"
                  ? "border-cyan-400 text-white bg-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              Database ERD
            </button>
            <button
              onClick={() => setWorkbenchTab("api")}
              className={`px-3 py-1.5 rounded-t-lg border-b-2 font-medium transition-colors ${
                workbenchTab === "api"
                  ? "border-cyan-400 text-white bg-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              API Tester
            </button>
            <button
              onClick={() => setWorkbenchTab("wiki")}
              className={`px-3 py-1.5 rounded-t-lg border-b-2 font-medium transition-colors ${
                workbenchTab === "wiki"
                  ? "border-cyan-400 text-white bg-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              LLM Wiki
            </button>
            <button
              onClick={() => setWorkbenchTab("artifacts")}
              className={`px-3 py-1.5 rounded-t-lg border-b-2 font-medium transition-colors ${
                workbenchTab === "artifacts"
                  ? "border-cyan-400 text-white bg-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              Artifacts ({artifacts.length})
            </button>
          </div>

          {/* Workbench Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* --------------------------------------------------------------- */}
            {/* TAB 1: Studio Environment Inspector (Design Studio MVP)        */}
            {/* --------------------------------------------------------------- */}
            {workbenchTab === "studio" && (
              <div className="space-y-4">
                {/* Studio Header Card */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-pink-400 uppercase tracking-wider">
                        {currentStudio.badge} ENVIRONMENT
                      </span>
                      <h3 className="text-sm font-bold text-white">{currentStudio.name}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-slate-400">
                        {currentStudio.agent.name}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">{currentStudio.mission}</p>
                </div>

                {/* Subtabs: Files, Templates, Playbooks, Memory */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                  <button
                    onClick={() => setStudioSubTab("files")}
                    className={`flex-1 py-1 rounded text-center transition-colors ${
                      studioSubTab === "files" ? "bg-slate-800 text-white font-bold" : "text-slate-400"
                    }`}
                  >
                    Files ({Object.keys(currentStudio.files).length})
                  </button>
                  <button
                    onClick={() => setStudioSubTab("templates")}
                    className={`flex-1 py-1 rounded text-center transition-colors ${
                      studioSubTab === "templates" ? "bg-slate-800 text-white font-bold" : "text-slate-400"
                    }`}
                  >
                    Templates ({currentStudio.templates.length})
                  </button>
                  <button
                    onClick={() => setStudioSubTab("playbooks")}
                    className={`flex-1 py-1 rounded text-center transition-colors ${
                      studioSubTab === "playbooks" ? "bg-slate-800 text-white font-bold" : "text-slate-400"
                    }`}
                  >
                    Playbooks ({currentStudio.playbooks.length})
                  </button>
                  <button
                    onClick={() => setStudioSubTab("memory")}
                    className={`flex-1 py-1 rounded text-center transition-colors ${
                      studioSubTab === "memory" ? "bg-slate-800 text-white font-bold" : "text-slate-400"
                    }`}
                  >
                    Memory ({currentStudio.memory.length})
                  </button>
                </div>

                {/* Subtab Content: Files */}
                {studioSubTab === "files" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
                      {Object.keys(currentStudio.files).map((f) => (
                        <button
                          key={f}
                          onClick={() => setSelectedStudioFile(f)}
                          className={`px-2.5 py-1 rounded-md border text-[11px] shrink-0 transition-colors ${
                            selectedStudioFile === f
                              ? "bg-pink-950/70 border-pink-500/50 text-pink-300 font-bold"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                      {currentStudio.files[selectedStudioFile] ||
                        currentStudio.files["design-system.md"] ||
                        currentStudio.files["agent.md"]}
                    </div>
                  </div>
                )}

                {/* Subtab Content: Templates */}
                {studioSubTab === "templates" && (
                  <div className="space-y-3">
                    {currentStudio.templates.map((tmpl) => (
                      <div key={tmpl.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                        <div className="text-xs font-bold text-white">{tmpl.title}</div>
                        <div className="text-[11px] text-slate-400 mt-1">{tmpl.description}</div>
                        <pre className="mt-2 p-2 rounded bg-slate-950 text-[10px] font-mono text-slate-300 overflow-x-auto">
                          {tmpl.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subtab Content: Playbooks */}
                {studioSubTab === "playbooks" && (
                  <div className="space-y-3">
                    {currentStudio.playbooks.map((pb) => (
                      <div key={pb.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                        <div className="text-xs font-bold text-white">{pb.title}</div>
                        <ol className="mt-2 space-y-1.5 text-xs text-slate-300 list-decimal list-inside">
                          {pb.steps.map((st, i) => (
                            <li key={i} className="leading-relaxed">
                              {st}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subtab Content: Memory */}
                {studioSubTab === "memory" && (
                  <div className="space-y-3">
                    {currentStudio.memory.map((m) => (
                      <div key={m.key} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                        <div className="text-[10px] font-mono text-pink-400 uppercase">#{m.key}</div>
                        <div className="text-xs text-slate-200 mt-1 leading-relaxed">{m.insight}</div>
                        <div className="text-[10px] text-slate-400 mt-2 font-mono">
                          Provenance: {m.provenance}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --------------------------------------------------------------- */}
            {/* TAB 2: PRD Builder Tool                                         */}
            {/* --------------------------------------------------------------- */}
            {workbenchTab === "prd" && (
              <form onSubmit={handleSavePrd} className="space-y-3.5">
                <div className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Product Requirements Document Builder
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">PRD TITLE</label>
                  <input
                    type="text"
                    value={prdTitle}
                    onChange={(e) => setPrdTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">1. PROBLEM STATEMENT</label>
                  <textarea
                    rows={2}
                    value={prdProblem}
                    onChange={(e) => setPrdProblem(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">2. TARGET PERSONAS</label>
                  <input
                    type="text"
                    value={prdPersonas}
                    onChange={(e) => setPrdPersonas(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">3. MVP SCOPE</label>
                  <textarea
                    rows={2}
                    value={prdMvpScope}
                    onChange={(e) => setPrdMvpScope(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">4. ACCEPTANCE CRITERIA</label>
                  <textarea
                    rows={3}
                    value={prdAcceptanceCriteria}
                    onChange={(e) => setPrdAcceptanceCriteria(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-rose-400 block mb-1">5. STRICT NON-GOALS (CRITICAL)</label>
                  <textarea
                    rows={2}
                    value={prdNonGoals}
                    onChange={(e) => setPrdNonGoals(e.target.value)}
                    className="w-full bg-slate-900 border border-rose-900/40 rounded-lg p-2.5 text-xs text-rose-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={prdSaving}
                  className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  {prdSaving ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5" />}
                  <span>Save & Register PRD Artifact</span>
                </button>
              </form>
            )}

            {/* --------------------------------------------------------------- */}
            {/* TAB 3: Database Schema & ERD Explorer (brain_schema_v1.sql)     */}
            {/* --------------------------------------------------------------- */}
            {workbenchTab === "schema" && (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 uppercase tracking-wider">
                    PostgreSQL v1 Schema & ERD
                  </span>
                  <span className="text-[10px] text-emerald-400">14 Tables • pgvector</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    {
                      table: "brain_objects",
                      desc: "Universal object registry for FK integrity",
                      cols: ["id uuid PK", "object_type enum", "created_at timestamptz"],
                    },
                    {
                      table: "projects",
                      desc: "Canonical software development workspaces",
                      cols: ["id uuid PK FK", "slug text UQ", "name text", "status project_status"],
                    },
                    {
                      table: "studios",
                      desc: "The 7 rich specialist operating environments",
                      cols: ["id uuid PK FK", "slug text UQ", "name text", "manifest_hash char(64)"],
                    },
                    {
                      table: "artifacts",
                      desc: "Layer 2: typed, versioned deliverables",
                      cols: ["id uuid PK FK", "project_id FK", "artifact_type text", "content_hash char(64)"],
                    },
                    {
                      table: "sources",
                      desc: "Layer 1: raw immutable evidence with SHA-256",
                      cols: ["id uuid PK FK", "kind source_kind", "trust trust_level", "storage_path text"],
                    },
                    {
                      table: "relationships",
                      desc: "Layer 4: 13 edge types with cycle-safe walk",
                      cols: ["from_id uuid FK", "to_id uuid FK", "edge_type enum", "superseded_at timestamptz"],
                    },
                    {
                      table: "wiki_pages",
                      desc: "Layer 3: git-versioned markdown knowledge",
                      cols: ["path text UQ", "page_type enum", "body_hash char(64)", "requires_approval bool"],
                    },
                    {
                      table: "claims",
                      desc: "Provenance: every wiki fact links to evidence",
                      cols: ["wiki_page_id FK", "source_id FK", "claim_text text", "confidence real"],
                    },
                    {
                      table: "events",
                      desc: "Transactional outbox for reliable worker queue",
                      cols: ["id bigserial PK", "idempotency_key text UQ", "status event_status"],
                    },
                    {
                      table: "embeddings",
                      desc: "pgvector HNSW cosine search index",
                      cols: ["object_id FK", "embedding vector(1536)", "model text"],
                    },
                  ].map((t) => (
                    <div key={t.table} className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between text-cyan-300 font-bold text-xs">
                        <span>{t.table}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{t.desc}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-1 text-[11px] text-slate-300">
                        {t.cols.map((c, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="text-slate-400">•</span>
                            <span>{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------- */}
            {/* TAB 4: API Designer & Live Test Bench                           */}
            {/* --------------------------------------------------------------- */}
            {workbenchTab === "api" && (
              <div className="space-y-3 font-mono text-xs">
                <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Live Brain Service API Test Bench
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={apiMethod}
                      onChange={(e) => setApiMethod(e.target.value as "GET" | "POST")}
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                    </select>
                    <select
                      value={apiEndpoint}
                      onChange={(e) => setApiEndpoint(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="/api/projects">/api/projects</option>
                      <option value="/api/artifacts">/api/artifacts</option>
                      <option value="/api/sources">/api/sources</option>
                      <option value="/api/graph">/api/graph</option>
                      <option value="/api/search?q=cortex">/api/search?q=cortex</option>
                      <option value="/api/librarian/audit">/api/librarian/audit</option>
                      <option value="/api/studios">/api/studios</option>
                      <option value="/api/jarvis/work">/api/jarvis/work (POST)</option>
                    </select>
                  </div>

                  {apiMethod === "POST" && (
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">REQUEST BODY (JSON)</label>
                      <textarea
                        rows={4}
                        value={apiPayload}
                        onChange={(e) => setApiPayload(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-[11px] text-cyan-300 focus:outline-none"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleExecuteApiTest}
                    disabled={apiLoading}
                    className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    {apiLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    <span>Execute Live API Request</span>
                  </button>

                  {apiResponse && (
                    <div className="mt-3">
                      <div className="text-[10px] text-slate-400 mb-1">RESPONSE BODY:</div>
                      <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-emerald-300 max-h-72 overflow-y-auto leading-relaxed">
                        {apiResponse}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --------------------------------------------------------------- */}
            {/* TAB 5: LLM Wiki & Provenance Explorer                           */}
            {/* --------------------------------------------------------------- */}
            {workbenchTab === "wiki" && (
              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 uppercase tracking-wider">
                    Derived LLM Wiki (Layer 3)
                  </span>
                  <span className="text-[10px] text-slate-400">{wikiPages.length} Pages</span>
                </div>

                {/* Wiki Page Selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  {wikiPages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => {
                        setSelectedWikiPage(page);
                        // Fetch claims for page
                        fetch("/api/search?q=")
                          .then((r) => r.json())
                          .then((data) => {
                            const c = (data.results?.claims || []).filter(
                              (item: Claim) => item.wiki_page_id === page.id
                            );
                            setClaimsForSelectedPage(c);
                          });
                      }}
                      className={`px-2.5 py-1 rounded-md border shrink-0 transition-colors ${
                        selectedWikiPage?.id === page.id
                          ? "bg-cyan-950/70 border-cyan-500/50 text-cyan-300 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {page.title}
                    </button>
                  ))}
                </div>

                {selectedWikiPage && (
                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-3 font-sans">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="font-bold text-sm text-white font-mono">{selectedWikiPage.title}</div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                        {selectedWikiPage.page_type}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
                      {selectedWikiPage.content || selectedWikiPage.summary}
                    </div>

                    {/* Claims Section */}
                    <div className="pt-3 border-t border-slate-800/80">
                      <div className="text-[10px] font-mono text-cyan-400 mb-2 uppercase">
                        PROVENANCE CLAIMS & VERBATIM CITATIONS ({claimsForSelectedPage.length})
                      </div>
                      {claimsForSelectedPage.length === 0 ? (
                        <div className="text-[11px] text-slate-500 font-mono">
                          No direct claims registered for this page yet.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {claimsForSelectedPage.map((claim) => (
                            <div
                              key={claim.id}
                              className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300"
                            >
                              <div className="italic text-cyan-200">&quot;{claim.claim_text}&quot;</div>
                              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                                <span>Locator: {claim.locator || "Source Body"}</span>
                                <span className="text-emerald-400">Confidence: {(claim.confidence * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --------------------------------------------------------------- */}
            {/* TAB 6: Artifacts & Human Approvals                              */}
            {/* --------------------------------------------------------------- */}
            {workbenchTab === "artifacts" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-200 uppercase tracking-wider">
                    Typed Artifacts Registry (Layer 2)
                  </span>
                  <span className="text-[10px] text-slate-400">{artifacts.length} Deliverables</span>
                </div>

                {artifacts.map((art) => (
                  <div key={art.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-white">{art.title}</div>
                        <div className="text-[10px] font-mono text-cyan-400 mt-0.5">
                          Type: {art.artifact_type} • v{art.version}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          art.status === "approved"
                            ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300"
                            : "bg-amber-950/80 border border-amber-500/40 text-amber-300"
                        }`}
                      >
                        {art.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{art.summary}</p>

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="truncate max-w-[180px]">Hash: #{art.content_hash.slice(0, 10)}</span>
                      {art.status === "approved" ? (
                        <span className="text-emerald-400">Approved by {art.approved_by}</span>
                      ) : (
                        <button
                          onClick={() => handleApproveArtifact(art.id)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
                        >
                          Approve Artifact
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: Ingest New Source (Chief Librarian Dropzone)                 */}
      {/* ===================================================================== */}
      {isAddSourceModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a0f1d] border border-slate-700/80 rounded-2xl w-full max-w-lg p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Chief Librarian Source Ingestion
                </h3>
              </div>
              <button
                onClick={() => setIsAddSourceModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIngestSource} className="space-y-3.5 mt-4">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">SOURCE TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. Healthcare CRM Architecture RFC, Discovery Call Notes..."
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">SOURCE KIND</label>
                  <select
                    value={sourceKind}
                    onChange={(e) => setSourceKind(e.target.value as Source["kind"])}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="markdown">Markdown</option>
                    <option value="transcript">Meeting Transcript</option>
                    <option value="pdf">PDF Document</option>
                    <option value="url">Web URL</option>
                    <option value="repo">GitHub Repository</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">URI / LOCATOR (OPTIONAL)</label>
                  <input
                    type="text"
                    placeholder="https://... or file path"
                    value={sourceUri}
                    onChange={(e) => setSourceUri(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">RAW CONTENT / EVIDENCE BODY</label>
                <textarea
                  rows={6}
                  placeholder="Paste verbatim raw notes, transcript text, markdown specifications, or requirements here..."
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-3 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-300 font-mono">
                ℹ️ The Chief Librarian will compute SHA-256 hash, classify the document, extract entities and concepts, and generate wiki claims automatically.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSourceModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ingestionLoading}
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white flex items-center gap-2 transition-colors"
                >
                  {ingestionLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Run Chief Librarian Ingestion</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: Create New Project                                           */}
      {/* ===================================================================== */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a0f1d] border border-slate-700/80 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">Create New Project</h3>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-3.5 mt-4">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">PROJECT NAME</label>
                <input
                  type="text"
                  placeholder="e.g. NextGen Autonomous Billing"
                  value={newProjectName}
                  onChange={(e) => {
                    setNewProjectName(e.target.value);
                    if (!newProjectSlug) {
                      setNewProjectSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                    }
                  }}
                  required
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">SLUG (URL SAFE)</label>
                <input
                  type="text"
                  placeholder="e.g. nextgen-billing"
                  value={newProjectSlug}
                  onChange={(e) => setNewProjectSlug(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">DESCRIPTION</label>
                <textarea
                  rows={3}
                  placeholder="Objective and domain scope..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: View Raw Source Detail                                      */}
      {/* ===================================================================== */}
      {selectedSourceForView && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0a0f1d] border border-slate-700/80 rounded-2xl w-full max-w-2xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div>
                <div className="text-[10px] font-mono text-cyan-400 uppercase">
                  RAW EVIDENCE #{selectedSourceForView.content_hash.slice(0, 12)}
                </div>
                <h3 className="text-sm font-bold text-white">{selectedSourceForView.title}</h3>
              </div>
              <button
                onClick={() => setSelectedSourceForView(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 my-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {selectedSourceForView.content || "Content hash verified; raw binary stored in immutable bucket."}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
              <span>Path: {selectedSourceForView.storage_path}</span>
              <span className="text-emerald-400">Trust: {selectedSourceForView.trust}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
