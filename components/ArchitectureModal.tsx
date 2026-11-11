"use client";

import React from "react";
import { X, Layers, Cpu, Database, Calendar, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ArchitectureModal({ isOpen, onClose }: ArchitectureModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">What&apos;s in Herk Brain / CortexOS?</h2>
              <p className="text-xs text-slate-400">
                The Four Cs Architecture & Karpathy LLM Wiki Blueprint
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The 4C Model Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> 1. CONTEXT (Foundation)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Evergreen, durable knowledge that changes infrequently: Personal background, company
              structure, quarterly goals, tone guidelines, and avatar pain points.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> 2. CONNECTIONS (Integrations)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Everyday tools holding dynamic, real-time data: YouTube API, Google Calendar, Gmail,
              Slack, ClickUp sprint tasks, and GitHub repositories.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono font-bold text-purple-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> 3. CAPABILITIES (Skills & Agents)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Reusable agent skills routed via <code className="text-cyan-400">AGENTS.md</code>:
              YouTube Strategist, Code Architect, Grill Me, and LLM Wiki cross-referencer.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> 4. CADENCE (Autonomy)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Autonomous background routines: 8:00 AM inbox triage, 9:00 AM sprint prioritization,
              6:00 PM daily work summary, and weekly 4C health audits.
            </p>
          </div>
        </div>

        {/* The 3D Brain Constellation */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-950 border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            The 3D Brain & Karpathy LLM Wiki Concept
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Rather than a flat note dump, Andrej Karpathy&apos;s LLM Wiki concept lets AI continuously
            crawl documents, deduce semantic cross-references, and build a 3D spherical constellation
            (935 nodes, 3,296 connections) that tracks note staleness and alerts you when
            documentation needs a refresh.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
