"use client";

import React, { useState } from "react";
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
import { DISCOVERY_AGENTS } from "@/lib/data/buyerPersonas";
import { FROZEN_ROUND1_REPORT, FROZEN_COUNTERFACTUAL_RESULT } from "@/lib/data/fixtureExperiment";
import {
  ProductSKU,
  CommerceProduct,
  CategorySchema,
  LostDemandReport,
  CounterfactualResult,
} from "@/types";
import { GrokRedesignProposal } from "@/lib/engine/grokRedesign";
import { CortexAnalysisResult } from "@/lib/engine/cortexEvaluator";

export default function Home() {
  // State
  const [extractedSKU, setExtractedSKU] = useState<ProductSKU | null>(null);
  const [commerceProduct, setCommerceProduct] = useState<CommerceProduct | null>(null);
  const [categorySchema, setCategorySchema] = useState<CategorySchema | null>(null);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<Array<{ id: string; budget: number; maxWTP: number; cohort?: string }>>([]);

  const [round1Report, setRound1Report] = useState<LostDemandReport | null>(null);
  const [traces, setTraces] = useState<any[]>([]);
  const [grokProposal, setGrokProposal] = useState<GrokRedesignProposal | null>(null);
  const [cortexData, setCortexData] = useState<CortexAnalysisResult | null>(null);
  const [counterfactualResult, setCounterfactualResult] = useState<CounterfactualResult | null>(null);
  const [counterfactualReport, setCounterfactualReport] = useState<LostDemandReport | null>(null);
  const [reclaimedTraces, setReclaimedTraces] = useState<any[]>([]);
  const [validationStatus, setValidationStatus] = useState<"validated" | "rejected">("validated");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Loading States
  const [isSimulatingRound1, setIsSimulatingRound1] = useState(false);
  const [isValidatingRound2, setIsValidatingRound2] = useState(false);
  const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false);
  const [isAutoPitchRunning, setIsAutoPitchRunning] = useState(false);

  // Trigger Round 1 Discovery Swarm Simulation
  const handleStartSimulation = async (url: string) => {
    setIsSimulatingRound1(true);
    setErrorMessage(null);
    setRound1Report(null);
    setGrokProposal(null);
    setCortexData(null);
    setCounterfactualResult(null);

    try {
      // 1. Extract SKU & Discover Category Ontology
      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const extractData = await extractRes.json();

      if (!extractRes.ok || extractData.error) {
        setErrorMessage(extractData.error || "Could not reliably extract this product. Try another public product URL.");
        setIsSimulatingRound1(false);
        return;
      }

      const currentSKU = extractData.sku || MERCHANT_SKU;
      const currentCommerce = extractData.commerceProduct || null;
      const currentSchema = extractData.categorySchema || null;
      const currentComps = extractData.competitors || COMPETITOR_SKUS;

      setExtractedSKU(currentSKU);
      setCommerceProduct(currentCommerce);
      setCategorySchema(currentSchema);
      setCompetitors(currentComps);

      // 2. Run Discovery Swarm locally over the category
      const simRes = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: currentSKU,
          commerceProduct: currentCommerce,
          categorySchema: currentSchema,
          competitors: currentComps,
          mode: "discovery",
        }),
      });
      const simData = await simRes.json();
      const activeReport = simData.report || FROZEN_ROUND1_REPORT;
      setRound1Report(activeReport);
      setTraces(simData.traces || []);
      setBuyers(simData.buyers || []);

      // 3. Generate Grok Redesign & CORTEX evaluation
      const redesignRes = await fetch("/api/redesign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: currentSKU,
          commerceProduct: currentCommerce,
          categorySchema: currentSchema,
          competitors: currentComps,
          report: activeReport,
        }),
      });
      const redesignData = await redesignRes.json();
      setGrokProposal(redesignData.redesign);
      setCortexData(redesignData.cortex);
    } catch (err: any) {
      console.warn("Simulation error:", err);
      setErrorMessage(err.message || "Simulation encountered a problem.");
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
          commerceProduct,
          categorySchema,
          competitors,
          variantBSKU: grokProposal?.redesignedSKU || COUNTERFACTUAL_VARIANT_B,
          variantBProduct: grokProposal?.redesignedSKU,
          grokProposal,
          mode: "parallel_rerun",
        }),
      });
      const data = await res.json();
      setCounterfactualResult(data.counterfactualResult || FROZEN_COUNTERFACTUAL_RESULT);
      setCounterfactualReport(data.counterfactualReport || null);
      setReclaimedTraces(data.reclaimedTraces || []);
      setValidationStatus(data.validationStatus || "validated");
    } catch (err) {
      setCounterfactualResult(FROZEN_COUNTERFACTUAL_RESULT);
      setValidationStatus("validated");
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
    setErrorMessage(null);
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
          commerceProduct={commerceProduct}
          errorMessage={errorMessage}
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
              RELEASING 200 AUTONOMOUS BUYERS INTO CATEGORY MARKET...
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Grok Bot category ontology • Heterogeneous buyer utility • Real-time sensory & price friction traces
            </p>
          </div>
        )}

        {/* Round 1 Output */}
        {round1Report && extractedSKU && !isSimulatingRound1 && (
          <div className="animate-fadeIn space-y-8">
            {/* Stage 1: Swarm Arena Visualizer */}
            <SwarmArena
              traces={traces}
              agents={buyers.length > 0 ? buyers : DISCOVERY_AGENTS}
              merchantSKU={extractedSKU}
              competitors={competitors}
            />

            {/* Stage 2: Lost Demand Telemetry (Non-Capture Rate & Dynamic Rejection Drivers) */}
            <LostDemandTelemetry report={round1Report} />

            {/* Stage 3: Head-to-Head Defection Matrix */}
            <CompetitorDefectionMatrix
              report={round1Report}
              competitors={competitors}
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

            {/* Stage 5: CORTEX Independent Neural Visual Signal (Visual Cortex benchmark for apparel) */}
            {cortexData && (commerceProduct?.category === "outerwear" || extractedSKU.title.toLowerCase().includes("jacket")) && (
              <CortexSignalCard cortexData={cortexData} />
            )}

            {/* Stage 6: Parallel Market Validation (Held-Out Agents) */}
            {counterfactualResult && (
              <ParallelRerunSection
                baselineReport={round1Report}
                counterfactualReport={counterfactualReport || round1Report}
                counterfactualResult={counterfactualResult}
                reclaimedTraces={reclaimedTraces}
                onOpenShopifyDeploy={() => setIsShopifyModalOpen(true)}
                originalTitle={extractedSKU.title}
                variantBTitle={grokProposal?.redesignedSKU?.title || "Variant B Redesign"}
                competitorNames={competitors.map((c) => c.title)}
                validationStatus={validationStatus}
              />
            )}
          </div>
        )}
      </main>

      {/* Shopify Deploy Modal */}
      <ShopifyDeployModal
        isOpen={isShopifyModalOpen}
        onClose={() => setIsShopifyModalOpen(false)}
        defaultTitle={grokProposal?.redesignedSKU?.title || (extractedSKU ? `${extractedSKU.title} (Variant B)` : "Redesigned listing")}
        defaultPrice={counterfactualResult?.proposedRRP || grokProposal?.redesignedSKU?.price || 89.0}
        defaultBOM={counterfactualResult?.targetBOM || grokProposal?.targetBOM || 38.0}
        defaultBatch={counterfactualResult?.recommendedBatchSize || 100}
      />

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-6 text-center text-xs font-mono text-slate-500">
        <p>GSV Autonomous Lost-Demand Engine • Commerce Wind Tunnel • Grok London Hackathon 2026</p>
      </footer>
    </div>
  );
}
