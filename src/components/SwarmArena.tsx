"use client";

import React, { useState } from "react";
import { Users, ShoppingBag, Eye, XCircle, ArrowUpRight } from "lucide-react";
import { AgentShoppingTrace, ProductSKU, ShoppingAgent, CommerceProduct } from "@/types";

interface SwarmArenaProps {
  traces: any[];
  agents: ShoppingAgent[];
  merchantSKU: ProductSKU;
  competitors: any[];
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

  const merchantWins = traces.filter((t) => (t.chosenSKUId || t.chosenProductId) === merchantSKU.id).length;
  const bouncedWins = traces.filter((t) => t.finalDecision === "no_purchase" || t.action === "no_purchase").length;

  const comp0 = competitors[0];
  const comp1 = competitors[1];
  const comp2 = competitors[2];

  const comp0Wins = comp0 ? traces.filter((t) => (t.chosenSKUId || t.chosenProductId) === comp0.id).length : 0;
  const comp1Wins = comp1 ? traces.filter((t) => (t.chosenSKUId || t.chosenProductId) === comp1.id).length : 0;
  const comp2Wins = comp2 ? traces.filter((t) => (t.chosenSKUId || t.chosenProductId) === comp2.id).length : 0;

  const filteredTraces = traces.filter((t) => {
    const chosen = t.chosenSKUId || t.chosenProductId;
    const isBounced = t.finalDecision === "no_purchase" || t.action === "no_purchase";

    if (filter === "all") return true;
    if (filter === "merchant") return chosen === merchantSKU.id;
    if (filter === "comp_0") return chosen === comp0?.id;
    if (filter === "comp_1") return chosen === comp1?.id;
    if (filter === "comp_2") return chosen === comp2?.id;
    if (filter === "bounced") return isBounced;
    return true;
  });

  const selectedTrace = traces.find((t) => t.agentId === selectedAgentId);
  const selectedAgent = selectedAgentId ? getAgentById(selectedAgentId) : null;

  // Format rejection reason
  const getRejectionText = (trace: any) => {
    if (!trace) return "";
    if (trace.reasons && Array.isArray(trace.reasons) && trace.reasons.length > 0) {
      return trace.reasons
        .map((r: any) => `${r.dimension}: desired ${r.desired}, observed ${r.observed} (impact: ${r.impact})`)
        .join(" • ");
    }
    if (trace.rejectionReasons && typeof trace.rejectionReasons === "object") {
      const vals = Object.values(trace.rejectionReasons);
      if (vals.length > 0) return String(vals[0]);
    }
    return "Agent preferred competitor attribute or price profile.";
  };

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

        {/* Dynamic Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === "all"
                ? "bg-slate-700 text-white font-bold"
                : "bg-surface text-slate-400 hover:text-white"
            }`}
          >
            All ({traces.length || 200})
          </button>
          <button
            onClick={() => setFilter("merchant")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === "merchant"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold"
                : "bg-surface text-slate-400 hover:text-white"
            }`}
          >
            Your SKU ({merchantWins})
          </button>
          {comp1 && (
            <button
              onClick={() => setFilter("comp_1")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === "comp_1"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                  : "bg-surface text-slate-400 hover:text-white"
              }`}
            >
              {comp1.title.split(" ")[0]} ({comp1Wins})
            </button>
          )}
          {comp0 && (
            <button
              onClick={() => setFilter("comp_0")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === "comp_0"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold"
                  : "bg-surface text-slate-400 hover:text-white"
              }`}
            >
              {comp0.title.split(" ")[0]} ({comp0Wins})
            </button>
          )}
          {comp2 && (
            <button
              onClick={() => setFilter("comp_2")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === "comp_2"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold"
                  : "bg-surface text-slate-400 hover:text-white"
              }`}
            >
              {comp2.title.split(" ")[0]} ({comp2Wins})
            </button>
          )}
          <button
            onClick={() => setFilter("bounced")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              filter === "bounced"
                ? "bg-crimson/20 text-crimson border border-crimson/30 font-bold"
                : "bg-surface text-slate-400 hover:text-white"
            }`}
          >
            Bounced ({bouncedWins})
          </button>
        </div>
      </div>

      {/* Grid of Agent Nodes */}
      <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5 py-6">
        {filteredTraces.map((trace) => {
          const chosen = trace.chosenSKUId || trace.chosenProductId;
          const isMerchant = chosen === merchantSKU.id;
          const isComp1 = comp1 && chosen === comp1.id;
          const isComp0 = comp0 && chosen === comp0.id;
          const isComp2 = comp2 && chosen === comp2.id;
          const isBounced = trace.finalDecision === "no_purchase" || trace.action === "no_purchase";
          const isSelected = trace.agentId === selectedAgentId;

          let colorClass = "bg-slate-700";
          if (isMerchant) colorClass = "bg-emerald-500 hover:bg-emerald-400";
          else if (isComp1) colorClass = "bg-amber-500 hover:bg-amber-400";
          else if (isComp0) colorClass = "bg-blue-500 hover:bg-blue-400";
          else if (isComp2) colorClass = "bg-purple-500 hover:bg-purple-400";
          else if (isBounced) colorClass = "bg-crimson hover:bg-rose-400";

          return (
            <button
              key={trace.agentId}
              onClick={() => setSelectedAgentId(trace.agentId)}
              title={`${trace.agentId} - Decision: ${chosen || "Bounced"}`}
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
                  (selectedTrace.chosenSKUId || selectedTrace.chosenProductId) === merchantSKU.id
                    ? "bg-emerald-500/20 text-emerald-400"
                    : (selectedTrace.finalDecision === "no_purchase" || selectedTrace.action === "no_purchase")
                    ? "bg-crimson/20 text-crimson"
                    : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {(selectedTrace.chosenSKUId || selectedTrace.chosenProductId) === merchantSKU.id
                  ? "PURCHASED YOUR SKU"
                  : (selectedTrace.finalDecision === "no_purchase" || selectedTrace.action === "no_purchase")
                  ? "BOUNCED (NO PURCHASE)"
                  : `DEFECTED TO: ${selectedTrace.chosenSKUId || selectedTrace.chosenProductId}`}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {selectedAgent ? `Budget: £${selectedAgent.budget} • Max WTP: £${selectedAgent.maxWTP}` : "Autonomous Buyer Persona"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
            <div>
              <p className="text-slate-400 font-mono text-[11px] mb-1">BUYER PROFILE & PREFERENCES:</p>
              {selectedAgent ? (
                <ul className="space-y-1 text-slate-300 font-mono">
                  <li>• Budget: <span className="text-white">£{selectedAgent.budget}</span></li>
                  <li>• Max WTP: <span className="text-white">£{selectedAgent.maxWTP}</span></li>
                  <li>• Cohort: <span className="text-white">{selectedAgent.cohort}</span></li>
                </ul>
              ) : (
                <p className="text-slate-400 italic">Synthetic heterogeneous buyer persona evaluated locally.</p>
              )}
            </div>

            <div className="rounded-lg bg-black/40 p-3 border border-white/5">
              <p className="text-crimson font-mono text-[11px] font-semibold mb-1 flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5" />
                EXPLICIT REJECTION REASON FOR YOUR SKU:
              </p>
              <p className="text-slate-200 text-xs italic leading-relaxed">
                "{getRejectionText(selectedTrace)}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
