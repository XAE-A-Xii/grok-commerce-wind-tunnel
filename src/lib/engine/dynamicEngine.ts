import {
  CategorySchema,
  DynamicBuyerAgent,
  DecisionDimension,
} from "@/types";

/**
 * Deterministic pseudo-random number generator (Mulberry32).
 * Allows repeatable cohorts with seeded variation ("discovery" vs "validation_held_out").
 */
export function createMulberry32(seedStr: string): () => number {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
  }
  let a = h ^ 0xdeadbeef;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface PriceDistribution {
  min: number;
  max: number;
  mean: number;
}

/**
 * Dynamically generates a heterogeneous cohort of 200 buyer personas
 * tuned to the specific category ontology and price distribution.
 */
export function generateBuyerCohort(
  categorySchema: CategorySchema,
  priceDist: PriceDistribution,
  seed: string = "discovery_v1",
  count: number = 200
): DynamicBuyerAgent[] {
  const rng = createMulberry32(seed);
  const cohort: DynamicBuyerAgent[] = [];
  const cohortType = seed.includes("held_out") || seed.includes("validation") ? "held_out" : "discovery";

  for (let i = 1; i <= count; i++) {
    const id = `A${String(i).padStart(3, "0")}`;

    // 1. Budget and Willingness-To-Pay (WTP)
    // Distributed around the category price distribution
    const priceSpread = priceDist.max - priceDist.min || 50;
    const budgetBase = priceDist.min + rng() * priceSpread;
    const budget = Math.round(budgetBase);
    const maxWTP = Math.round(budget * (1.05 + rng() * 0.25));

    // 2. Price sensitivity: [0.15 to 0.95]
    // Inversely related to budget with noise
    const rawSensitivity = 1.0 - (budget - priceDist.min) / (priceSpread * 1.3 || 1);
    const priceSensitivity = Math.max(0.15, Math.min(0.95, Math.round((rawSensitivity + (rng() * 0.3 - 0.15)) * 100) / 100));

    // 3. Dimension Weights & Ideal Values
    const dimensionWeights: Record<string, number> = {};
    const idealValues: Record<string, string | number | boolean> = {};

    for (const dim of categorySchema.decision_dimensions) {
      // Weight sampled around dim.importance_mean (+/- 0.25)
      const weight = Math.max(0.05, Math.min(1.0, dim.importance_mean + (rng() * 0.5 - 0.25)));
      dimensionWeights[dim.key] = Math.round(weight * 100) / 100;

      // Ideal values based on dimension type
      if (dim.type === "numeric") {
        if (dim.direction === "lower_better") {
          // e.g. weight (g), price
          idealValues[dim.key] = 0;
        } else if (dim.direction === "higher_better") {
          // e.g. cushioning (0-1), battery (hours)
          idealValues[dim.key] = 1.0;
        } else {
          // Target value
          idealValues[dim.key] = 0.5 + rng() * 0.5;
        }
      } else if (dim.type === "boolean") {
        // e.g. ANC true
        idealValues[dim.key] = rng() > 0.3; // 70% want it
      } else if (dim.type === "categorical" && dim.options && dim.options.length > 0) {
        // Pick preferred style/option
        const optIndex = Math.floor(rng() * dim.options.length);
        idealValues[dim.key] = dim.options[optIndex];
      }
    }

    cohort.push({
      id,
      cohort: cohortType,
      budget,
      maxWTP,
      priceSensitivity,
      dimensionWeights,
      idealValues,
      brandLoyalty: Math.round(rng() * 0.5 * 100) / 100,
    });
  }

  return cohort;
}
