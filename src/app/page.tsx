"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { UrlInputHero } from "@/components/UrlInputHero";
import { SwarmArena } from "@/components/SwarmArena";
import { LostDemandTelemetry } from "@/components/LostDemandTelemetry";
import { CompetitorDefectionMatrix } from "@/components/CompetitorDefectionMatrix";
import { GrokRedesignCard } from "@/components/GrokRedesignCard";
import { CortexSignalCard } from "@/components/CortexSignalCard";
import { ParallelRerunSection } from "@/components/ParallelRerunSection";
import { ShopifyDeployModal } from "@/components/ShopifyDeployModal";

import { MERCHANT_SKU, COMPETITOR_SKUS, COUNTERFACTUAL_VARIANT_B } from "@/lib/data/seedSKUs";
import { DISCOVERY_AGENTS, HELD_OUT_AGENTS } from "@/lib/data/buyerPersonas";
import { FROZEN_ROUND1_REPORT, FROZEN_COUNTERFACTUAL_RESULT } from "@/lib/data/fixtureExperiment";
import { ProductSKU, LostDemandReport, CounterfactualResult, AgentShoppingTrace } from "@/types";
import { GrokRedesignProposal } from "@/lib/engine/grokRedesign";
import { CortexAnalysisResult } from "@/lib/engine/cortexEvaluator";

export default function Home() {
  // State
  const [extractedSKU, setExtractedSKU] = useState<ProductSKU>(MERCHANT_SKU);
  const [round1Report, setRound1Report] = useState<LostDemandReport | null>(null);
  const [traces, setTraces] = useState<AgentShoppingTrace[]>([]);
  const [grokProposal, setGrokProposal] = useState<GrokRedesignProposal | null>(null);
  const [cortexData, setCortexData] = useState<CortexAnalysisResult | null>(null);
  const [counterfactualResult, setCounterfactualResult] = useState<CounterfactualResult | null>(null);
  const [reclaimedTraces, setReclaimedTraces] = useState<AgentShoppingTrace[]>([]);

  // Loading States
  const [isSimulatingRound1, setIsSimulatingRound1] = useState(false);
  const [isValidatingRound2, setIsValidatingRound2] = useState(false);
  const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false);
  const [isAutoPitchRunning, setIsAutoPitchRunning] = useState(false);

  // Trigger Round 1 Discovery Swarm Simulation
  const handleStartSimulation = async (url: string) => {
    setIsSimulatingRound1(true);
    setRound1Report(null);
    setGrokProposal(null);
    setCortexData(null);
    setCounterfactualResult(null);

    try {
      // 1. Extract SKU
      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const extractData = await extractRes.json();
      const currentSKU = extractData.sku || MERCHANT_SKU;
      setExtractedSKU(currentSKU);

      // 2. Run Discovery Swarm
      const simRes = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: currentSKU, mode: "discovery" }),
      });
      const simData = await simRes.json();
      setRound1Report(simData.report || FROZEN_ROUND1_REPORT);
      setTraces(simData.traces || []);

      // 3. Generate Grok Redesign & CORTEX evaluation
      const redesignRes = await fetch("/api/redesign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: currentSKU, report: simData.report }),
      });
      const redesignData = await redesignRes.json();
      setGrokProposal(redesignData.redesign);
      setCortexData(redesignData.cortex);
    } catch (err) {
      console.warn("Using offline fallback for simulation:", err);
      setRound1Report(FROZEN_ROUND1_REPORT);
    } finally {
      setIsSimulatingRound1(false);
    }
  };

  // Trigger Round 2 Parallel Market Validation Swarm (Held-Out Agents)
  const handleRunParallelValidation = async () => {
    setIsValidatingRound2(true);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: extractedSKU,
          variantBSKU: grokProposal?.redesignedSKU || COUNTERFACTUAL_VARIANT_B,
          mode: "parallel_rerun",
        }),
      });
      const data = await res.json();
      setCounterfactualResult(data.counterfactualResult || FROZEN_COUNTERFACTUAL_RESULT);
      setReclaimedTraces(data.reclaimedTraces || []);
    } catch (err) {
      setCounterfactualResult(FROZEN_COUNTERFACTUAL_RESULT);
    } finally {
      setIsValidatingRound2(false);
    }
  };

  // 1-Click 3-Minute Automated Pitch Sequence
  const handleAutoPitch = async () => {
    if (isAutoPitchRunning) return;
    setIsAutoPitchRunning(true);

    // Step 1: Release Swarm
    await handleStartSimulation("https://shop.com/products/black-racing-jacket");
    await new Promise((r) => setTimeout(r, 1200));

    // Step 2: Run Parallel Held-Out Validation
    await handleRunParallelValidation();
    await new Promise((r) => setTimeout(r, 1200));

    // Step 3: Open Shopify Deploy Modal
    setIsShopifyModalOpen(true);
    setIsAutoPitchRunning(false);
  };

  const handleReset = () => {
    setRound1Report(null);
    setGrokProposal(null);
    setCortexData(null);
    setCounterfactualResult(null);
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col font-sans selection:bg-cyan/20 selection:text-cyan-200">
      <Navbar
        onReset={handleReset}
        onAutoDemo={handleAutoPitch}
        isAutoRunning={isAutoPitchRunning}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Top URL Input Hero */}
        <UrlInputHero
          onStartSimulation={handleStartSimulation}
          isLoading={isSimulatingRound1}
          extractedSKU={extractedSKU}
        />

        {/* Loading Indicator for Swarm */}
        {isSimulatingRound1 && (
          <div className="my-12 text-center space-y-4">
            <div className="inline-block relative">
              <div className="w-16 h-16 rounded-full border-4 border-cyan/20 border-t-cyan animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-cyan">
                200
              </div>
            </div>
            <h3 className="text-lg font-bold text-white font-mono uppercase">
              RELEASING 200 DISCOVERY BUYER AGENTS INTO THE LIVE MARKET...
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Crawling category competitors • Traversing shopping funnels • Logging explicit sensory friction
            </p>
          </div>
        )}

        {/* Round 1 Output */}
        {round1Report && !isSimulatingRound1 && (
          <div className="animate-fadeIn space-y-8">
            {/* Stage 1: Swarm Arena Visualizer */}
            <SwarmArena
              traces={traces}
              agents={DISCOVERY_AGENTS}
              merchantSKU={extractedSKU}
              competitors={COMPETITOR_SKUS}
            />

            {/* Stage 2: Lost Demand Telemetry (Non-Capture Rate & Rejection Drivers) */}
            <LostDemandTelemetry report={round1Report} />

            {/* Stage 3: Head-to-Head Defection Matrix */}
            <CompetitorDefectionMatrix
              report={round1Report}
              competitors={COMPETITOR_SKUS}
            />

            {/* Stage 4: Grok Counterfactual Redesign */}
            {grokProposal && (
              <GrokRedesignCard
                originalSKU={extractedSKU}
                proposal={grokProposal}
                onRunParallelValidation={handleRunParallelValidation}
                isValidating={isValidatingRound2}
              />
            )}

            {/* Stage 5: CORTEX Independent Neural Visual Signal */}
            {cortexData && <CortexSignalCard cortexData={cortexData} />}

            {/* Stage 6: Parallel Market Validation (Held-Out Agents) */}
            {counterfactualResult && (
              <ParallelRerunSection
                baselineReport={round1Report}
                counterfactualReport={round1Report}
                counterfactualResult={counterfactualResult}
                reclaimedTraces={reclaimedTraces}
                onOpenShopifyDeploy={() => setIsShopifyModalOpen(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Shopify Deploy Modal */}
      <ShopifyDeployModal
        isOpen={isShopifyModalOpen}
        onClose={() => setIsShopifyModalOpen(false)}
        defaultTitle={grokProposal?.redesignedSKU.title || "Brown Oversized Vintage Motorsport Jacket"}
        defaultPrice={89.0}
        defaultBOM={38.0}
        defaultBatch={100}
      />

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-6 text-center text-xs font-mono text-slate-500">
        <p>GSV Autonomous Lost-Demand Engine • Commerce Wind Tunnel • Grok London Hackathon 2026</p>
      </footer>
    </div>
  );
}
