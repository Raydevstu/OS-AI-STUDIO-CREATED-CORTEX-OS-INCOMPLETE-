"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import WarRoom from "@/components/WarRoom";
import NodeInspector from "@/components/NodeInspector";
import OsDashboard from "@/components/OsDashboard";
import VaultExplorer from "@/components/VaultExplorer";
import GrillMeInterviewer from "@/components/GrillMeInterviewer";
import AuditEngine from "@/components/AuditEngine";
import CortexTerminal from "@/components/CortexTerminal";
import ArchitectureModal from "@/components/ArchitectureModal";
import { BrainNode, KEY_NODES } from "@/lib/knowledge-data";
import {
  Globe,
  LayoutDashboard,
  Layers,
  Flame,
  Activity,
  Terminal,
  HelpCircle,
  Sparkles,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

// Dynamically load Three.js 3D Brain without SSR
const Brain3D = dynamic(() => import("@/components/Brain3D"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-full bg-[#050814] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
        <span className="w-4 h-4 rounded-full bg-cyan-400 animate-ping" />
      </div>
      <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
        Loading CortexOS 3D Constellation...
      </div>
    </div>
  ),
});

export default function Home() {
  // Top-Level Mode: War Room (Execution Interface) vs Brain Mode (3D Constellation)
  const [appMode, setAppMode] = useState<"warroom" | "brain">("warroom");

  // Brain Mode subtabs
  const [activeTab, setActiveTab] = useState<
    "brain" | "dashboard" | "vault" | "grillme" | "audit" | "terminal"
  >("brain");

  const [selectedNode, setSelectedNode] = useState<BrainNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [terminalPrompt, setTerminalPrompt] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectConnectedNode = (nodeId: string) => {
    const found = KEY_NODES.find((n) => n.id === nodeId);
    if (found) {
      setSelectedNode(found);
    } else {
      setSelectedNode({
        id: nodeId,
        title: nodeId.replace(/^node-/, "").replace(/-/g, " "),
        category: "Projects",
        summary: `Connected node in CortexOS constellation knowledge graph.`,
        notes: `# Knowledge Node: ${nodeId}\n\nAuto-linked cross-reference via Chief Librarian and LLM Wiki crawling.`,
        stalenessDays: 14,
        needsAttention: false,
        connections: [],
        tags: ["connected-node"],
        x: 0,
        y: 0,
        z: 0,
        radius: 5,
      });
    }
  };

  const handleAskAiAboutNode = (node: BrainNode) => {
    setSelectedNode(null);
    setTerminalPrompt(
      `Tell me everything about "${node.title}" in my ${node.category} knowledge vault and how it connects to my software development objectives.`
    );
    setActiveTab("terminal");
  };

  const handleOpenTerminalWithPrompt = (prompt?: string) => {
    if (prompt) setTerminalPrompt(prompt);
    setActiveTab("terminal");
  };

  // If in War Room mode, render the execution interface
  if (appMode === "warroom") {
    return (
      <main className="relative w-screen h-screen overflow-hidden bg-[#050814] flex flex-col font-sans select-none">
        <WarRoom
          onSwitchToBrainMode={() => setAppMode("brain")}
          onOpenTerminalWithPrompt={(prompt) => {
            setTerminalPrompt(prompt);
            setAppMode("brain");
            setActiveTab("terminal");
          }}
        />

        {toastMessage && (
          <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-200 text-xs px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2 font-mono">
            <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    );
  }

  // Otherwise, render 3D Brain Mode
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#050814] flex flex-col font-sans select-none">
      {/* Top OS Navigation Header */}
      <header className="h-14 px-4 sm:px-6 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("brain")}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                CortexOS
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-500/30">
                  BRAIN MODE
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                3D Constellation & Memory
              </div>
            </div>
          </button>
        </div>

        {/* View Switcher Tabs within Brain Mode */}
        <nav className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800/80 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("brain")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "brain"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">3D Constellation</span>
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "dashboard"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">OS Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("vault")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "vault"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">4C Vault / AGENTS.md</span>
          </button>
          <button
            onClick={() => setActiveTab("grillme")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "grillme"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Grill Me</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "audit"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Audit Engine</span>
          </button>
          <button
            onClick={() => setActiveTab("terminal")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "terminal"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Astra Terminal</span>
          </button>
        </nav>

        {/* Right Switch to War Room button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Architecture</span>
          </button>

          <button
            onClick={() => setAppMode("warroom")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/50 text-xs font-bold transition-all shadow-md shadow-indigo-500/10 active:scale-95"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>⚔️ War Room Mode</span>
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <div className="relative flex-1 w-full h-[calc(100vh-56px)] overflow-hidden">
        {activeTab === "brain" && (
          <Brain3D
            onSelectNode={(node) => setSelectedNode(node)}
            selectedNodeId={selectedNode?.id}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {activeTab === "dashboard" && (
          <div className="w-full h-full overflow-y-auto">
            <OsDashboard
              onOpenBrain={() => setActiveTab("brain")}
              onOpenGrillMe={() => setActiveTab("grillme")}
              onOpenAudit={() => setActiveTab("audit")}
              onOpenTerminal={handleOpenTerminalWithPrompt}
            />
          </div>
        )}

        {activeTab === "vault" && (
          <div className="w-full h-full overflow-y-auto">
            <VaultExplorer
              onIngestToGraph={(title) => {
                showToast(`Note "${title}" ingested into Chief Librarian memory!`);
              }}
            />
          </div>
        )}

        {activeTab === "grillme" && (
          <div className="w-full h-full overflow-y-auto">
            <GrillMeInterviewer />
          </div>
        )}

        {activeTab === "audit" && (
          <div className="w-full h-full overflow-y-auto">
            <AuditEngine />
          </div>
        )}

        {activeTab === "terminal" && (
          <div className="w-full h-full overflow-y-auto">
            <CortexTerminal initialPrompt={terminalPrompt} />
          </div>
        )}

        {/* Slide-over Node Inspector */}
        <NodeInspector
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onSelectConnectedNode={handleSelectConnectedNode}
          onAskAiAboutNode={handleAskAiAboutNode}
        />

        {/* Architecture Modal */}
        <ArchitectureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-200 text-xs px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2 font-mono">
          <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
