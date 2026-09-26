"use client";

import React from "react";
import { Zap, ShieldCheck, Cpu, Activity } from "lucide-react";

interface NavbarProps {
  onReset?: () => void;
  onAutoDemo?: () => void;
  isAutoRunning?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onReset,
  onAutoDemo,
  isAutoRunning,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070A0F]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan to-emerald-500 shadow-lg shadow-cyan/20">
            <Zap className="h-5 w-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">GSV</span>
              <span className="rounded bg-cyan/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase text-cyan border border-cyan/20">
                WIND TUNNEL
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Autonomous Lost-Demand Engine</p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 border border-slate-800">
            <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-300">400 AGENTS READY</span>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 border border-slate-800">
            <Cpu className="h-3.5 w-3.5 text-cyan" />
            <span className="text-slate-300">GROK-4.7 + CORTEX</span>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 border border-slate-800">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-300">SHOPIFY 2026-07</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onAutoDemo}
            disabled={isAutoRunning}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all shadow-md ${
              isAutoRunning
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-wait"
                : "bg-cyan/10 text-cyan border border-cyan/30 hover:bg-cyan/20 hover:border-cyan/50"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAutoRunning ? "bg-amber-400 animate-ping" : "bg-cyan"}`}></span>
            {isAutoRunning ? "AUTO-PITCH RUNNING..." : "3-MIN PITCH DEMO"}
          </button>
        </div>
      </div>
    </header>
  );
};
