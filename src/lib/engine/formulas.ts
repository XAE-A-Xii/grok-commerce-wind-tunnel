/**
 * GSV Engine - Pure Deterministic Mathematical Formulas
 * Spec Reference: SPEC-001 Section 3
 * 
 * ZERO FABRICATED METRICS LAW:
 * All quantitative values must be computed deterministically through these pure functions.
 * No external network calls, side effects, or randomized logic are permitted in this module.
 */

/**
 * Rounds a number to exactly 1 decimal place.
 */
export function round1D(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Rounds a number to exactly 2 decimal places.
 */
export function round2D(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculates choice share percentage for an entity in the market.
 * Example: 62 purchases out of 200 agents -> 31.0%
 */
export function calculateChoiceSharePct(purchases: number, totalAgents: number): number {
  if (totalAgents <= 0) return 0.0;
  return round1D((purchases / totalAgents) * 100);
}

/**
 * Calculates choice share as a decimal fraction (0.0 to 1.0).
 * Example: 62 purchases out of 200 agents -> 0.31
 */
export function calculateChoiceShareFraction(purchases: number, totalAgents: number): number {
  if (totalAgents <= 0) return 0.0;
  return round2D(purchases / totalAgents);
}

/**
 * Calculates Non-Capture Rate.
 * Formula: 100% - ChoiceShare(Merchant)
 * Spec: 100% - 31.0% = 69.0%
 */
export function calculateNonCaptureRate(merchantPurchases: number, totalAgents: number): {
  percentage: number;
  fraction: number;
} {
  const sharePct = calculateChoiceSharePct(merchantPurchases, totalAgents);
  const nonCapturePct = round1D(100 - sharePct);
  const nonCaptureFraction = round2D(nonCapturePct / 100);

  return {
    percentage: nonCapturePct,
    fraction: nonCaptureFraction,
  };
}

export interface RawRejectionCount {
  reason: string;
  count: number;
}

export interface RejectionDriverResult {
  reason: string;
  count: number;
  percentage: number;
}

/**
 * Calculates rejection driver distribution across rejected agents.
 * Formula: Percentage(r) = round1D((Count(r) / N_rejected) * 100)
 * Note: Per SPEC-001, individual rounded percentages may sum to 100.1% (+-0.1pp rounding allowance).
 */
export function calculateRejectionDrivers(
  rejectionCounts: RawRejectionCount[],
  totalRejected: number
): RejectionDriverResult[] {
  if (totalRejected <= 0) {
    return rejectionCounts.map((item) => ({ ...item, percentage: 0 }));
  }

  return rejectionCounts.map((item) => ({
    reason: item.reason,
    count: item.count,
    percentage: round1D((item.count / totalRejected) * 100),
  }));
}

/**
 * Calculates delta choice share in percentage points (pp).
 * Example: 49.0% - 31.0% = +18.0 pp
 */
export function calculateDeltaChoiceShare(
  baselineSharePct: number,
  counterfactualSharePct: number
): number {
  return round1D(counterfactualSharePct - baselineSharePct);
}

/**
 * Calculates commercial gross margin percentage.
 * Formula: ((RRP - BOM) / RRP) * 100
 * Example: RRP £89.00, BOM £38.00 -> 57.3%
 */
export function calculateGrossMargin(rrp: number, bom: number): number {
  if (rrp <= 0) return 0.0;
  return round1D(((rrp - bom) / rrp) * 100);
}

/**
 * Calculates relative neural stimulus signal delta.
 * Formula: round1D(((variantScore - baselineScore) / baselineScore) * 100)
 * Example: (84.3 - 68.0) / 68.0 = +24.0%
 */
export function calculateRelativeStimulusDelta(
  baselineScore: number,
  variantScore: number
): number {
  if (baselineScore <= 0) return 0.0;
  return round1D(((variantScore - baselineScore) / baselineScore) * 100);
}
