"use client";

import React from "react";
import { Swords, CheckCircle2, AlertOctagon, TrendingUp } from "lucide-react";
import { LostDemandReport } from "@/types";

interface CompetitorDefectionMatrixProps {
  report: LostDemandReport;
  competitors: Array<{ id: string; title?: string; price?: number; sourceUrl?: string; url?: string }>;
}

export const CompetitorDefectionMatrix: React.FC<CompetitorDefectionMatrixProps> = ({
  report,
  competitors,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Swords className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              STAGE 3: HEAD-TO-HEAD DEFECTION MATRIX (WHO BEAT YOU & WHY)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Where your lost shoppers went and the exact structural vulnerabilities to exploit
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {report.headToHeadDefection.map((comp) => {
          const skuData = competitors.find((c) => c.id === comp.competitorId);
          const listingUrl = skuData?.sourceUrl || skuData?.url || "";

          return (
            <div
              key={comp.competitorId}
              className="rounded-xl bg-surface/80 border border-white/10 p-5 flex flex-col justify-between hover:border-amber-400/30 transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{comp.competitorName}</h4>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      {typeof skuData?.price === "number" ? `£${skuData.price.toFixed(2)}` : "Price from the swarm market"}
                    </p>
                    {listingUrl.startsWith("http") && (
                      <a
                        href={listingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-[11px] font-mono text-cyan hover:underline"
                      >
                        Open listing
                      </a>
                    )}
                  </div>
                  <span className="rounded-lg bg-amber-500/20 px-2 py-1 text-xs font-mono font-bold text-amber-300 border border-amber-500/30">
                    {comp.lostBuyerCount} DEFECTED
                  </span>
                </div>

                {/* Win Factors */}
                <div className="mt-4 space-y-2">
                  <p className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    WHY THEY WON YOUR BUYERS:
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {comp.whyTheyWon.map((reason, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Vulnerability */}
                <div className="mt-4 space-y-2 pt-3 border-t border-white/5">
                  <p className="text-[11px] font-mono text-crimson font-semibold flex items-center gap-1.5">
                    <AlertOctagon className="h-3.5 w-3.5" />
                    THEIR VULNERABILITY (HOW TO WIN):
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {comp.whyTheyLost.map((vuln, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-crimson font-bold">•</span>
                        <span>{vuln}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 text-right">
                <span className="text-[11px] font-mono text-cyan flex items-center justify-end gap-1">
                  Target for Variant B Redesign
                  <TrendingUp className="h-3 w-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
