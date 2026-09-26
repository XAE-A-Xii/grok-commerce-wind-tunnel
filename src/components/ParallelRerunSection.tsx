"use client";

import React, { useState } from "react";
import { ArrowUpRight, TrendingUp, CheckCircle, RefreshCw, ShoppingCart, ShieldAlert, AlertTriangle } from "lucide-react";
import { CounterfactualResult, LostDemandReport } from "@/types";

interface ParallelRerunSectionProps {
  baselineReport: LostDemandReport;
  counterfactualReport: LostDemandReport;
  counterfactualResult: CounterfactualResult;
  reclaimedTraces: any[];
  onOpenShopifyDeploy: () => void;
  originalTitle?: string;
  variantBTitle?: string;
  competitorNames?: string[];
  validationStatus?: "validated" | "rejected";
}

export const ParallelRerunSection: React.FC<ParallelRerunSectionProps> = ({
  baselineReport,
  counterfactualReport,
  counterfactualResult,
  reclaimedTraces,
  onOpenShopifyDeploy,
  originalTitle = "Original Product Under Test",
  variantBTitle = "Variant B Counterfactual Redesign",
  competitorNames = ["Competitor A", "Competitor B", "Competitor C"],
  validationStatus = "validated",
}) => {
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);

  const baselineShare = (counterfactualResult.baselineChoiceShare * 100).toFixed(1);
  const counterfactualShare = (counterfactualResult.counterfactualChoiceShare * 100).toFixed(1);
  const deltaPP = counterfactualResult.deltaPercentagePoints.toFixed(1);
  const isPositive = counterfactualResult.deltaPercentagePoints > 0;

  return (
    <div
      className={`glass-panel rounded-2xl p-6 border shadow-2xl mb-8 ${
        isPositive
          ? "border-emerald-500/30 glow-emerald"
          : "border-amber-500/30 glow-crimson"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`p-1 rounded-md ${
                isPositive
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/20 text-amber-300"
              }`}
            >
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            </span>
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              STAGE 6: PARALLEL MARKET VALIDATION (200 HELD-OUT BUYERS)
            </h3>
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold border ${
                isPositive
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/20"
              }`}
            >
              {isPositive ? "COUNTERFACTUAL VALIDATED" : "COUNTERFACTUAL REJECTED"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            200 identical, held-out buyers shop Market Condition A (Original) vs Market Condition B (Variant B) concurrently
          </p>
        </div>

        {/* Primary Deploy CTA */}
        <button
          onClick={onOpenShopifyDeploy}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-300 transition-all font-mono"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>CREATE SHOPIFY DRAFT (£{counterfactualResult.proposedRRP.toFixed(2)})</span>
        </button>
      </div>

      {/* Main Choice Share Uplift Hero */}
      <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Baseline Card */}
        <div className="rounded-xl bg-surface/80 border border-white/10 p-5">
          <span className="text-[11px] font-mono text-slate-400 uppercase">
            MARKET CONDITION A (BASELINE)
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-slate-300">{baselineShare}%</span>
            <span className="text-xs font-mono text-slate-500">
              {baselineReport.merchantPurchases}/{baselineReport.totalAgents} buyers
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400 truncate">{originalTitle}</p>
        </div>

        {/* Delta Uplift Card */}
        <div
          className={`rounded-xl border p-5 flex flex-col justify-center text-center ${
            isPositive
              ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-400/50"
              : "bg-gradient-to-br from-amber-500/20 to-crimson/10 border-amber-400/50"
          }`}
        >
          <span
            className={`text-xs font-mono font-bold uppercase tracking-wider ${
              isPositive ? "text-emerald-400" : "text-amber-300"
            }`}
          >
            {isPositive ? "DEMONSTRATED MARKET UPLIFT" : "ADVERSARIAL SWARM VERDICT"}
          </span>
          <div
            className={`my-1 text-5xl font-black font-mono ${
              isPositive ? "text-emerald-400" : "text-amber-300"
            }`}
          >
            {isPositive ? `+${deltaPP} pp` : `${deltaPP} pp`}
          </div>
          <span
            className={`text-xs font-mono ${
              isPositive ? "text-emerald-300" : "text-amber-200"
            }`}
          >
            {isPositive
              ? `+${counterfactualResult.reclaimedBuyerCount} Reclaimed Buyers (Net new wins)`
              : "Swarm rejected proposition — proving evaluation independence"}
          </span>
        </div>

        {/* Counterfactual Card */}
        <div className="rounded-xl bg-surface/80 border border-emerald-500/30 p-5">
          <span className="text-[11px] font-mono text-emerald-400 uppercase font-semibold">
            MARKET CONDITION B (VARIANT B)
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-emerald-400">{counterfactualShare}%</span>
            <span className="text-xs font-mono text-slate-400">
              {counterfactualReport.merchantPurchases}/{counterfactualReport.totalAgents} buyers
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400 truncate">{variantBTitle}</p>
        </div>
      </div>

      {/* Reclaimed Demand Breakdown & Live Trace Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pt-5 border-t border-white/10">
        {/* Source of Reclaimed Demand */}
        <div>
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">
            WHERE RECLAIMED DEMAND WAS WON:
          </h4>
          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface/60 border border-white/5">
              <span className="text-amber-300 font-semibold">• From {competitorNames[1] || "Competitor B"}:</span>
              <span className="text-emerald-400 font-bold">
                +{counterfactualResult.reclaimedSources.fromCompetitorB} buyers
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface/60 border border-white/5">
              <span className="text-blue-300 font-semibold">• From {competitorNames[0] || "Competitor A"}:</span>
              <span className="text-emerald-400 font-bold">
                +{counterfactualResult.reclaimedSources.fromCompetitorA} buyers
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface/60 border border-white/5">
              <span className="text-purple-300 font-semibold">• From {competitorNames[2] || "Competitor C"}:</span>
              <span className="text-emerald-400 font-bold">
                +{counterfactualResult.reclaimedSources.fromCompetitorC} buyers
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface/60 border border-white/5">
              <span className="text-rose-300 font-semibold">• From Bounces (Non-Purchasers):</span>
              <span className="text-emerald-400 font-bold">
                +{counterfactualResult.reclaimedSources.fromBounces} buyers
              </span>
            </div>
          </div>
        </div>

        {/* Trace Stream of Reclaimed Buyers */}
        <div>
          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>RECLAIMED BUYER TRACES (AUDIT FEED):</span>
            <span className="text-[10px] text-emerald-400 font-normal">
              {reclaimedTraces.length} Traces Logged
            </span>
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {reclaimedTraces.slice(0, 8).map((trace: any, idx: number) => {
              const reasonText = trace.reasons && trace.reasons.length > 0
                ? `${trace.reasons[0].dimension}`
                : trace.rejectionReasons
                ? Object.values(trace.rejectionReasons)[0]
                : "Switched to Variant B";

              return (
                <div
                  key={trace.agentId || idx}
                  onClick={() => setSelectedTraceId(trace.agentId)}
                  className="cursor-pointer rounded-lg bg-black/40 p-2 border border-white/5 hover:border-emerald-500/40 text-[11px] font-mono transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">#{idx + 1}</span>
                    <span className="text-slate-300">{trace.agentId}</span>
                  </div>
                  <span className="text-slate-400 text-[10px] truncate max-w-[220px]">
                    {String(reasonText)}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">RECLAIMED</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
