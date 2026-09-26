import { describe, it, expect } from "vitest";
import {
  round1D,
  round2D,
  calculateChoiceSharePct,
  calculateChoiceShareFraction,
  calculateNonCaptureRate,
  calculateRejectionDrivers,
  calculateDeltaChoiceShare,
  calculateGrossMargin,
  calculateRelativeStimulusDelta,
} from "../src/lib/engine/formulas";

describe("GSV Pure Mathematical Engine (SPEC-001 Verification)", () => {
  it("computes accurate baseline choice shares for 200 discovery agents", () => {
    const totalAgents = 200;
    const merchantPurchases = 62;
    const competitorAPurchases = 54;
    const competitorBPurchases = 48;
    const competitorCPurchases = 22;
    const noPurchaseCount = 14;

    // Check sum of cohorts
    const totalPurchases =
      merchantPurchases +
      competitorAPurchases +
      competitorBPurchases +
      competitorCPurchases +
      noPurchaseCount;
    expect(totalPurchases).toBe(200);

    // Merchant SKU
    expect(calculateChoiceSharePct(merchantPurchases, totalAgents)).toBe(31.0);
    expect(calculateChoiceShareFraction(merchantPurchases, totalAgents)).toBe(0.31);

    // Competitors
    expect(calculateChoiceSharePct(competitorAPurchases, totalAgents)).toBe(27.0);
    expect(calculateChoiceSharePct(competitorBPurchases, totalAgents)).toBe(24.0);
    expect(calculateChoiceSharePct(competitorCPurchases, totalAgents)).toBe(11.0);

    const totalCompetitorPurchases =
      competitorAPurchases + competitorBPurchases + competitorCPurchases;
    expect(calculateChoiceSharePct(totalCompetitorPurchases, totalAgents)).toBe(62.0);

    // No Purchase
    expect(calculateChoiceSharePct(noPurchaseCount, totalAgents)).toBe(7.0);

    // Sum of shares: 31.0 + 62.0 + 7.0 = 100.0%
    const sumShares =
      calculateChoiceSharePct(merchantPurchases, totalAgents) +
      calculateChoiceSharePct(totalCompetitorPurchases, totalAgents) +
      calculateChoiceSharePct(noPurchaseCount, totalAgents);
    expect(sumShares).toBe(100.0);
  });

  it("calculates Non-Capture Rate accurately as 69.0%", () => {
    const nonCapture = calculateNonCaptureRate(62, 200);
    expect(nonCapture.percentage).toBe(69.0);
    expect(nonCapture.fraction).toBe(0.69);
  });

  it("calculates rejection drivers for 138 non-retained buyers with <=0.1pp rounding allowance", () => {
    const rawCounts = [
      { reason: "Wrong Silhouette (too fitted / regular)", count: 44 },
      { reason: "Material Perception (too synthetic / plastic)", count: 29 },
      { reason: "Colorway Preference (wanted distressed brown)", count: 23 },
      { reason: "Price Sensitivity (competitor cheaper)", count: 19 },
      { reason: "Missing Vintage Details (lacks patches/hardware)", count: 12 },
      { reason: "Other", count: 11 },
    ];

    const totalRejected = rawCounts.reduce((acc, cur) => acc + cur.count, 0);
    expect(totalRejected).toBe(138); // 200 - 62 = 138

    const drivers = calculateRejectionDrivers(rawCounts, totalRejected);

    expect(drivers[0].percentage).toBe(31.9);
    expect(drivers[1].percentage).toBe(21.0);
    expect(drivers[2].percentage).toBe(16.7);
    expect(drivers[3].percentage).toBe(13.8);
    expect(drivers[4].percentage).toBe(8.7);
    expect(drivers[5].percentage).toBe(8.0);

    const sumPct = round1D(drivers.reduce((acc, cur) => acc + cur.percentage, 0));
    expect(sumPct).toBe(100.1);
    expect(Math.abs(sumPct - 100.0)).toBeLessThanOrEqual(0.1);
  });

  it("calculates counterfactual uplift delta accurately as +18.0 percentage points", () => {
    const baselineShare = 31.0;
    const counterfactualShare = 49.0;
    const delta = calculateDeltaChoiceShare(baselineShare, counterfactualShare);
    expect(delta).toBe(18.0);

    // Verify buyer counts
    const baselineBuyers = 62;
    const counterfactualBuyers = 98; // 49% of 200
    const reclaimed = counterfactualBuyers - baselineBuyers;
    expect(reclaimed).toBe(36);

    // Verify reclaimed breakdown sums to 36
    const reclaimedSources = {
      fromCompetitorB: 16,
      fromCompetitorA: 10,
      fromCompetitorC: 6,
      fromBounces: 4,
    };
    const sumReclaimed =
      reclaimedSources.fromCompetitorB +
      reclaimedSources.fromCompetitorA +
      reclaimedSources.fromCompetitorC +
      reclaimedSources.fromBounces;
    expect(sumReclaimed).toBe(36);
  });

  it("calculates commercial gross margin for £89 RRP and £38 BOM as 57.3%", () => {
    const rrp = 89.0;
    const bom = 38.0;
    const margin = calculateGrossMargin(rrp, bom);
    expect(margin).toBe(57.3);
  });

  it("calculates CORTEX relative neural stimulus delta as +24.0%", () => {
    const baselineScore = 68.0;
    const variantBScore = 84.3;
    const deltaPct = calculateRelativeStimulusDelta(baselineScore, variantBScore);
    expect(deltaPct).toBe(24.0);
  });
});
