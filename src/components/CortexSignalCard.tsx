"use client";

import React from "react";
import { BrainCircuit, Activity, Info, Sparkles } from "lucide-react";
import { CortexAnalysisResult } from "@/lib/engine/cortexEvaluator";

interface CortexSignalCardProps {
  cortexData: CortexAnalysisResult;
}

export const CortexSignalCard: React.FC<CortexSignalCardProps> = ({ cortexData }) => {
  const { evaluation, breakdown } = cortexData;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              STAGE 5: CORTEX INDEPENDENT NEURAL VISUAL STIMULUS SIGNAL
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cortical salience and visual attention activation across candidate product imagery
          </p>
        </div>

        {/* Caching/Source Transparency Notice */}
        <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
          {evaluation.labeledNotice}
        </span>
      </div>

      {/* 3 Candidate Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {breakdown.map((item) => {
          const isWinner = item.stimulusId === "stim_variant_b";
          const isBaseline = item.stimulusId === "stim_original";

          return (
            <div
              key={item.stimulusId}
              className={`rounded-xl p-5 border transition-all ${
                isWinner
                  ? "bg-purple-950/20 border-purple-500/40 shadow-lg shadow-purple-500/10"
                  : "bg-surface/70 border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-slate-400 uppercase font-bold">
                  {item.name}
                </span>
                {isWinner && (
                  <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300 border border-purple-500/30">
                    +24.0% CORTICAL DELTA
                  </span>
                )}
                {isBaseline && (
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                    BASELINE
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span
                  className={`text-3xl font-black font-mono ${
                    isWinner ? "text-purple-300" : "text-slate-200"
                  }`}
                >
                  {item.corticalSignalScore.toFixed(1)}
                </span>
                <span className="text-xs font-mono text-slate-500">/ 100 Cortical Signal</span>
              </div>

              {/* Sub-signals */}
              <div className="space-y-2 text-xs font-mono text-slate-300 pt-3 border-t border-white/5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Visual Cortex Salience:</span>
                  <span className="font-bold">{item.visualSalienceScore.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Parietal Attention ROI:</span>
                  <span className="font-bold">{item.parietalAttentionScore.toFixed(1)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scientific Disclaimer Footer */}
      <div className="mt-5 rounded-lg bg-black/30 p-3 border border-white/5 flex items-start gap-2 text-slate-400 text-xs">
        <Info className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong className="text-slate-300">Scientific Disclaimer:</strong> CORTEX measures relative visual saliency and attentional signal strength across rendered product mockups; it operates as an independent visual prior alongside the autonomous buyer swarms and does not assert direct human checkout conversion.
        </p>
      </div>
    </div>
  );
};
