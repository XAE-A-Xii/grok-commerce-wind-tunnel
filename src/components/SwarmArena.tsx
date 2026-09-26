"use client";

import React, { useState } from "react";
import { Users, ShoppingBag, Eye, XCircle, ArrowUpRight } from "lucide-react";
import { AgentShoppingTrace, ProductSKU, ShoppingAgent } from "@/types";

interface SwarmArenaProps {
  traces: AgentShoppingTrace[];
  agents: ShoppingAgent[];
  merchantSKU: ProductSKU;
  competitors: ProductSKU[];
}

export const SwarmArena: React.FC<SwarmArenaProps> = ({
  traces,
  agents,
  merchantSKU,
  competitors,
}) => {
  const [filter, setFilter] = useState<string>("all");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const getAgentById = (id: string) => agents.find((a) => a.id === id);

  const filteredTraces = traces.filter((t) => {
    if (filter === "all") return true;
    if (filter === "merchant") return t.chosenSKUId === merchantSKU.id;
    if (filter === "comp_a") return t.chosenSKUId === competitors[0]?.id;
    if (filter === "comp_b") return t.chosenSKUId === competitors[1]?.id;
    if (filter === "comp_c") return t.chosenSKUId === competitors[2]?.id;
    if (filter === "bounced") return t.finalDecision === "no_purchase";
    return true;
  });

  const selectedTrace = traces.find((t) => t.agentId === selectedAgentId);
  const selectedAgent = selectedAgentId ? getAgentById(selectedAgentId) : null;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <h3 className="text-base font-bold text-white tracking-wide uppercase font-mono">
              STAGE 1: 200 BUYER SWARM TELEMETRY
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time individual agent decision paths and counter-evaluation logs
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === "all"
                ? "bg-slate-700 text-white font-bold"
                : "bg-surface text-slate-400 hover:text-white"
            }`}
          >
            All (200)
          </button>
          <button
            onClick={() => setFilter("merchant")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === "merchant"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold"
                : "bg-surface text-slate-400 hover:text-white"
            }`}
          >
            Your SKU (62)
          </button>
          <button
            onClick={() => setFilter("comp_b")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === "comp_b"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                : "bg-surface text-slate-400 hover:text-white"
            }`}
          >
            Comp B: Racer (48)
          </button>
          <button
            onClick={() => setFilter("comp_a")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === "comp_a"
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold"
                : "bg-surface text-slate-400 hover:text-white"
            }`}
          >
            Comp A: Moto (54)
          </button>
          <button
            onClick={() => setFilter("comp_c")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === "comp_c"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold"
                : "bg-surface text-slate-400 hover:text-white"
            }`}
          >
            Comp C: Budget (22)
          </button>
          <button
            onClick={() => setFilter("bounced")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === "bounced"
                ? "bg-crimson/20 text-crimson border border-crimson/30 font-bold"
                : "bg-surface text-slate-400 hover:text-white"
            }`}
          >
            Bounced (14)
          </button>
        </div>
      </div>

      {/* Grid of Agent Nodes */}
      <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5 py-6">
        {filteredTraces.map((trace) => {
          const isMerchant = trace.chosenSKUId === merchantSKU.id;
          const isCompB = trace.chosenSKUId === competitors[1]?.id;
          const isCompA = trace.chosenSKUId === competitors[0]?.id;
          const isCompC = trace.chosenSKUId === competitors[2]?.id;
          const isBounced = trace.finalDecision === "no_purchase";
          const isSelected = trace.agentId === selectedAgentId;

          let colorClass = "bg-slate-700";
          if (isMerchant) colorClass = "bg-emerald-500 hover:bg-emerald-400";
          else if (isCompB) colorClass = "bg-amber-500 hover:bg-amber-400";
          else if (isCompA) colorClass = "bg-blue-500 hover:bg-blue-400";
          else if (isCompC) colorClass = "bg-purple-500 hover:bg-purple-400";
          else if (isBounced) colorClass = "bg-crimson hover:bg-rose-400";

          return (
            <button
              key={trace.agentId}
              onClick={() => setSelectedAgentId(trace.agentId)}
              title={`${trace.agentId} - Decision: ${trace.chosenSKUId || "Bounced"}`}
              className={`h-6 w-full rounded transition-all transform hover:scale-125 focus:outline-none ${colorClass} ${
                isSelected ? "ring-2 ring-white scale-125 shadow-lg" : "opacity-85 hover:opacity-100"
              }`}
            />
          );
        })}
      </div>

      {/* Selected Agent Inspector */}
      {selectedTrace && (
        <div className="mt-2 rounded-xl bg-surface/90 border border-white/10 p-4 transition-all animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan" />
              <span className="font-mono text-xs font-bold text-white uppercase">
                AGENT INSPECTOR: {selectedTrace.agentId}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  selectedTrace.chosenSKUId === merchantSKU.id
                    ? "bg-emerald-500/20 text-emerald-400"
                    : selectedTrace.finalDecision === "no_purchase"
                    ? "bg-crimson/20 text-crimson"
                    : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {selectedTrace.chosenSKUId === merchantSKU.id
                  ? "PURCHASED YOUR SKU"
                  : selectedTrace.finalDecision === "no_purchase"
                  ? "BOUNCED (NO PURCHASE)"
                  : `DEFECTED TO: ${selectedTrace.chosenSKUId?.toUpperCase()}`}
              </span>
            </div>
            {selectedAgent && (
              <span className="text-xs font-mono text-slate-400">
                Budget: £{selectedAgent.budget} • Max WTP: £{selectedAgent.maxWTP}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
            <div>
              <p className="text-slate-400 font-mono text-[11px] mb-1">BUYER PROFILE & PREFERENCES:</p>
              {selectedAgent ? (
                <ul className="space-y-1 text-slate-300 font-mono">
                  <li>• Style: <span className="text-white">{selectedAgent.stylePreference.replace("_", " ")}</span></li>
                  <li>• Silhouette Cut: <span className="text-white">{selectedAgent.silhouettePreference.replace("_", " ")}</span></li>
                  <li>• Color Preference: <span className="text-white">{selectedAgent.colorPreference.replace("_", " ")}</span></li>
                  <li>• Material Spec: <span className="text-white">{selectedAgent.materialRequirement.replace("_", " ")}</span></li>
                </ul>
              ) : (
                <p className="text-slate-400 italic">Synthetic buyer profile loaded.</p>
              )}
            </div>

            <div className="rounded-lg bg-black/40 p-3 border border-white/5">
              <p className="text-crimson font-mono text-[11px] font-semibold mb-1 flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5" />
                EXPLICIT REJECTION REASON FOR YOUR SKU:
              </p>
              <p className="text-slate-200 text-xs italic leading-relaxed">
                "{selectedTrace.rejectionReasons[merchantSKU.id] || "No rejection logged — agent purchased Your SKU."}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
