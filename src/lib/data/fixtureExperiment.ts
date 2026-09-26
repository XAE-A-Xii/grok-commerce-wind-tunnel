import { LostDemandReport, CounterfactualResult } from "@/types";

/**
 * GSV Frozen Telemetry Data - SPEC-001 Reference Fixture
 * Guarantees zero-latency, zero-variance demo playback during presentations.
 */

export const FROZEN_ROUND1_REPORT: LostDemandReport = {
  totalAgents: 200,
  merchantPurchases: 62,
  merchantChoiceShare: 0.31, // 31.0%
  competitorPurchases: 124,
  competitorChoiceShare: 0.62, // 62.0%
  competitorBreakdown: [
    {
      id: "sku_comp_a",
      name: "Apex Moto Classic Moto",
      purchases: 54,
      choiceShare: 0.27, // 27.0%
      price: 109.0,
    },
    {
      id: "sku_comp_b",
      name: "Vintage Garage Oversized Racer",
      purchases: 48,
      choiceShare: 0.24, // 24.0%
      price: 111.0,
    },
    {
      id: "sku_comp_c",
      name: "Urban Biker Budget Bomber",
      purchases: 22,
      choiceShare: 0.11, // 11.0%
      price: 69.0,
    },
  ],
  noPurchaseCount: 14,
  noPurchaseRate: 0.07, // 7.0%
  nonCaptureRate: 0.69, // 69.0%
  rejectionDrivers: [
    {
      reason: "Wrong Silhouette (too fitted / regular)",
      count: 44,
      percentage: 31.9,
    },
    {
      reason: "Material Perception (too synthetic / plastic)",
      count: 29,
      percentage: 21.0,
    },
    {
      reason: "Colorway Preference (wanted distressed brown)",
      count: 23,
      percentage: 16.7,
    },
    {
      reason: "Price Sensitivity (competitor cheaper)",
      count: 19,
      percentage: 13.8,
    },
    {
      reason: "Missing Vintage Details (lacks patches/hardware)",
      count: 12,
      percentage: 8.7,
    },
    {
      reason: "Other",
      count: 11,
      percentage: 8.0,
    },
  ],
  headToHeadDefection: [
    {
      competitorId: "sku_comp_b",
      competitorName: "Vintage Garage Oversized Racer",
      lostBuyerCount: 41,
      whyTheyWon: [
        "Oversized boxy silhouette matches current streetwear trend",
        "Rich distressed oil-brown tone",
        "Authentic motorsport embroidery detailing",
      ],
      whyTheyLost: ["Priced £12 higher at £111.00"],
    },
    {
      competitorId: "sku_comp_a",
      competitorName: "Apex Moto Classic Moto",
      lostBuyerCount: 29,
      whyTheyWon: [
        "Top-grain buffalo leather texture perception",
        "Heavyweight premium hardware & zippers",
      ],
      whyTheyLost: ["Rigid and restrictive fit", "Priced at £109.00"],
    },
    {
      competitorId: "sku_comp_c",
      competitorName: "Urban Biker Budget Bomber",
      lostBuyerCount: 17,
      whyTheyWon: ["Sub-£70 aggressive entry price point (£69.00)"],
      whyTheyLost: ["Cheap polyester feel", "Low durability ratings"],
    },
  ],
};

export const FROZEN_COUNTERFACTUAL_RESULT: CounterfactualResult = {
  baselineChoiceShare: 0.31, // 31.0% (62/200)
  counterfactualChoiceShare: 0.49, // 49.0% (98/200)
  deltaPercentagePoints: 18.0, // +18.0 pp uplift
  reclaimedBuyerCount: 36,
  reclaimedSources: {
    fromCompetitorB: 16,
    fromCompetitorA: 10,
    fromCompetitorC: 6,
    fromBounces: 4,
  },
  cortex: {
    originalScore: 68.0,
    variantAScore: 75.0,
    variantBScore: 84.3,
    relativeDeltaB: 24.0,
    labeledNotice: "Recorded CORTEX model evaluation (cached for demo resilience)",
  },
  recommendedBatchSize: 100,
  proposedRRP: 89.0,
  targetBOM: 38.0,
  grossMarginPct: 57.3,
};
