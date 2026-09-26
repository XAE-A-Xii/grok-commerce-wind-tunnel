"use client";

import React from "react";
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, DollarSign, Percent, Box } from "lucide-react";
import { ProductSKU } from "@/types";
import { GrokRedesignProposal } from "@/lib/engine/grokRedesign";

interface GrokRedesignCardProps {
  originalSKU: ProductSKU;
  proposal: GrokRedesignProposal;
  onRunParallelValidation: () => void;
  isValidating: boolean;
  sourceLabel?: string;
}

export const GrokRedesignCard: React.FC<GrokRedesignCardProps> = ({
  originalSKU,
  proposal,
  onRunParallelValidation,
  isValidating,
  sourceLabel,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-cyan/30 shadow-2xl glow-cyan mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-cyan/20 text-cyan">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              STAGE 4: GROK BOT — AUTONOMOUS PRODUCT STRATEGIST
            </h3>
            <span className="rounded bg-cyan/10 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan border border-cyan/20">
              {sourceLabel || "GROK BOT TEAMMATE"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{proposal.executiveSummary}</p>
        </div>

        {/* Validation CTA */}
        <button
          onClick={onRunParallelValidation}
          disabled={isValidating}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-blue-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan/25 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 transition-all font-mono"
        >
          {isValidating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              <span>TESTING 200 HELD-OUT AGENTS...</span>
            </>
          ) : (
            <>
              <span>TEST WITH HELD-OUT SWARM</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Grok Bot Autonomous Task Checklist */}
      <div className="my-4 p-3 rounded-xl bg-black/40 border border-white/5 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono text-slate-300">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Analysed Traces</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Compared Competitors</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Investigated Losses</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Checked Price Limits</span>
        </div>
        <div className="flex items-center gap-1.5 text-cyan">
          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Formulated Counterfactual</span>
        </div>
      </div>

      {/* Side-by-side SKU Comparison: CURRENT vs PROPOSED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
        {/* Original SKU */}
        <div className="rounded-xl bg-black/40 border border-white/5 p-5">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            CURRENT SKU (BASELINE)
          </span>
          <h4 className="text-base font-bold text-slate-200 mt-1">{originalSKU.title}</h4>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black font-mono text-slate-300">
              £{originalSKU.price.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-500">+ standard delivery</span>
          </div>

          <div className="mt-4 space-y-2 text-xs font-mono text-slate-400">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span>Silhouette / Cut:</span>
              <span className="text-slate-300 font-semibold">{originalSKU.silhouette}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span>Material / Spec:</span>
              <span className="text-slate-300 font-semibold">{originalSKU.material}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span>Colorway / Theme:</span>
              <span className="text-slate-300 font-semibold">{originalSKU.colorway}</span>
            </div>
          </div>
        </div>

        {/* Variant B Redesign */}
        <div className="rounded-xl bg-gradient-to-br from-cyan/10 to-emerald-500/10 border border-cyan/40 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-cyan font-bold uppercase tracking-wider">
              GROK PROPOSED COUNTERFACTUAL (VARIANT B)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
              OPTIMIZED VALUE WEDGE
            </span>
          </div>

          <h4 className="text-base font-bold text-white mt-1">
            {proposal.redesignedSKU.title}
          </h4>

          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-2xl font-black font-mono text-emerald-400">
              £{proposal.redesignedSKU.price.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-emerald-300">Free Next-Day Delivery Included</span>
          </div>

          {/* Unit Economics Bar */}
          <div className="mt-4 grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-black/40 border border-white/10 text-center font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">TARGET BOM</span>
              <span className="text-xs font-bold text-white">£{proposal.targetBOM.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">GROSS MARGIN</span>
              <span className="text-xs font-bold text-emerald-400">{proposal.grossMarginPct}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">PILOT BATCH</span>
              <span className="text-xs font-bold text-cyan">{proposal.recommendedBatchSize} units</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explicit Driver Mapping Table */}
      <div className="mt-4">
        <h5 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-3">
          HOW EACH CHANGE DIRECTLY NEUTRALIZES AN EMPIRICAL REJECTION DRIVER:
        </h5>
        <div className="space-y-2">
          {proposal.designChanges.map((change, i) => (
            <div
              key={i}
              className="rounded-xl bg-surface/70 border border-white/5 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="md:w-1/3">
                <span className="text-cyan font-mono font-bold">{change.dimension}: </span>
                <span className="text-slate-400 line-through mr-1">{change.from}</span>
                <span className="text-emerald-400 font-semibold">→ {change.to}</span>
              </div>
              <div className="md:w-1/2 text-slate-300 text-[11px] leading-relaxed">
                {change.rationale}
              </div>
              <div className="md:w-1/5 text-right">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-crimson/15 text-rose-300 border border-crimson/20">
                  Counters: {change.targetedDriver.split(" ")[0]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
