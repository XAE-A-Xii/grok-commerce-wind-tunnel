import { describe, it, expect } from "vitest";
import { runDiscoverySwarm, runParallelHeldOutSwarm } from "../src/lib/engine/simulator";
import { MERCHANT_SKU, COMPETITOR_SKUS, COUNTERFACTUAL_VARIANT_B } from "../src/lib/data/seedSKUs";
import { DISCOVERY_AGENTS, HELD_OUT_AGENTS } from "../src/lib/data/buyerPersonas";

describe("Swarm Simulator Integration Suite (SPEC-001 Verification)", () => {
  it("runs Round 1 Discovery Swarm (200 agents) with exact deterministic telemetry", async () => {
    const result = await runDiscoverySwarm(
      MERCHANT_SKU,
      COMPETITOR_SKUS,
      DISCOVERY_AGENTS
    );

    const { report, traces } = result;

    // Total agents
    expect(report.totalAgents).toBe(200);
    expect(traces.length).toBe(200);

    // Merchant performance
    expect(report.merchantPurchases).toBe(62);
    expect(report.merchantChoiceShare).toBe(0.31);

    // Competitors
    expect(report.competitorPurchases).toBe(124);
    expect(report.competitorChoiceShare).toBe(0.62);

    // Bounces & Non-Capture Rate
    expect(report.noPurchaseCount).toBe(14);
    expect(report.noPurchaseRate).toBe(0.07);
    expect(report.nonCaptureRate).toBe(0.69);

    // Rejection drivers (N=138 non-retained buyers)
    const totalRejected = report.rejectionDrivers.reduce((acc, d) => acc + d.count, 0);
    expect(totalRejected).toBe(138);

    const silhouetteDriver = report.rejectionDrivers.find((d) =>
      d.reason.includes("Silhouette")
    );
    expect(silhouetteDriver?.count).toBe(44);
    expect(silhouetteDriver?.percentage).toBe(31.9);

    const materialDriver = report.rejectionDrivers.find((d) =>
      d.reason.includes("Material")
    );
    expect(materialDriver?.count).toBe(29);
    expect(materialDriver?.percentage).toBe(21.0);
  });

  it("runs Round 2 Parallel Held-Out Swarm (200 agents) and proves +18.0pp uplift", async () => {
    const result = await runParallelHeldOutSwarm(
      MERCHANT_SKU,
      COUNTERFACTUAL_VARIANT_B,
      COMPETITOR_SKUS,
      HELD_OUT_AGENTS
    );

    const { counterfactualReport, counterfactualResult, reclaimedTraces } = result;

    // Baseline vs Counterfactual Choice Share
    expect(counterfactualResult.baselineChoiceShare).toBe(0.31);
    expect(counterfactualResult.counterfactualChoiceShare).toBe(0.49);
    expect(counterfactualResult.deltaPercentagePoints).toBe(18.0);

    // Reclaimed buyer count
    expect(counterfactualResult.reclaimedBuyerCount).toBe(36);
    expect(reclaimedTraces.length).toBe(36);

    // Reclaimed source breakdown
    expect(counterfactualResult.reclaimedSources.fromCompetitorB).toBe(16);
    expect(counterfactualResult.reclaimedSources.fromCompetitorA).toBe(10);
    expect(counterfactualResult.reclaimedSources.fromCompetitorC).toBe(6);
    expect(counterfactualResult.reclaimedSources.fromBounces).toBe(4);

    // Commercial economics
    expect(counterfactualResult.proposedRRP).toBe(89.0);
    expect(counterfactualResult.targetBOM).toBe(38.0);
    expect(counterfactualResult.grossMarginPct).toBe(57.3);
    expect(counterfactualResult.recommendedBatchSize).toBe(100);
  });
});
