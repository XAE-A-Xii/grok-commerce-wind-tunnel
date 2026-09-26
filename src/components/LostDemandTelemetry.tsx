"use client";

import React from "react";
import { AlertTriangle, TrendingDown, Target, ShoppingBag, BarChart3 } from "lucide-react";
import { LostDemandReport } from "@/types";

interface LostDemandTelemetryProps {
  report: LostDemandReport;
}

export const LostDemandTelemetry: React.FC<LostDemandTelemetryProps> = ({ report }) => {
  return (
    <div className="space-y-6 mb-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Merchant Choice Share */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>YOUR SKU CHOICE SHARE</span>
            <span className="text-emerald-400 font-bold">WON</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-emerald-400">
              {(report.merchantChoiceShare * 100).toFixed(1)}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({report.merchantPurchases}/{report.totalAgents} buyers)
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${report.merchantChoiceShare * 100}%` }}
            />
          </div>
        </div>

        {/* Non-Capture Rate */}
        <div className="glass-panel rounded-2xl p-5 border border-crimson/30 relative overflow-hidden glow-crimson">
          <div className="flex items-center justify-between text-xs font-mono text-crimson mb-2">
            <span className="flex items-center gap-1.5 font-bold">
              <TrendingDown className="h-4 w-4" />
              NON-CAPTURE RATE
            </span>
            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-crimson/20 border border-crimson/30">
              LEAKED DEMAND
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-crimson">
              {(report.nonCaptureRate * 100).toFixed(1)}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({report.competitorPurchases + report.noPurchaseCount}/{report.totalAgents} lost)
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-crimson h-full rounded-full transition-all duration-1000"
              style={{ width: `${report.nonCaptureRate * 100}%` }}
            />
          </div>
        </div>

        {/* Competitor vs Bounces Split */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>MARKET ABSORPTION</span>
            <span className="text-amber-400 font-bold">DEFECTED</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black font-mono text-amber-400">
              {(report.competitorChoiceShare * 100).toFixed(1)}%
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({report.competitorPurchases} buyers)
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400 font-mono">
            + {(report.noPurchaseRate * 100).toFixed(1)}% bounced ({report.noPurchaseCount} buyers bought nothing)
          </p>
        </div>
      </div>

      {/* Rejection Drivers Bar Chart */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                STAGE 2: WHY YOUR PRODUCT LOST DEMAND (N = 138 NON-RETAINED BUYERS)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggregated sensory and commercial friction logged from shopper agent traces
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
            Total Rejections: 138 (100.1% sum)
          </span>
        </div>

        <div className="space-y-4">
          {report.rejectionDrivers.map((driver, idx) => (
            <div key={driver.reason} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-200 flex items-center gap-2">
                  <span className="text-slate-500 font-bold">#{idx + 1}</span>
                  {driver.reason}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{driver.count} agents</span>
                  <span className="text-white font-bold w-12 text-right">
                    {driver.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    idx === 0
                      ? "bg-gradient-to-r from-crimson to-amber-500"
                      : idx === 1
                      ? "bg-amber-500"
                      : idx === 2
                      ? "bg-cyan"
                      : "bg-slate-500"
                  }`}
                  style={{ width: `${Math.min(driver.percentage * 2.5, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
