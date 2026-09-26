import { ShoppingAgent } from "@/types";

/**
 * Deterministic pseudo-random number generator (LCG)
 * Ensures reproducible 400 buyer personas across all runs with zero variance.
 */
function createPrng(seed: number) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const STYLES = [
  "vintage_racing",
  "streetwear_oversized",
  "classic_moto",
  "budget_sport",
  "cyberpunk_biker",
];

const SILHOUETTES = [
  "oversized_boxy",
  "oversized_boxy", // higher weight for current fashion trend
  "regular_fitted",
  "slim",
];

const COLORS = [
  "distressed_brown",
  "distressed_brown", // heavy weight
  "matte_black",
  "gloss_black",
  "worn_tan",
];

const MATERIALS = [
  "heavyweight_suede",
  "genuine_leather",
  "distressed_canvas",
  "vegan_suede",
  "polyurethane_pu",
];

export function generateAgents(
  cohort: "discovery" | "held_out",
  count: number = 200,
  seed: number = 42
): ShoppingAgent[] {
  const prng = createPrng(seed + (cohort === "held_out" ? 9999 : 0));
  const agents: ShoppingAgent[] = [];

  for (let i = 1; i <= count; i++) {
    const id = `agent_${cohort === "discovery" ? "disc" : "held"}_${String(i).padStart(3, "0")}`;
    const budget = Math.floor(70 + prng() * 70); // £70 - £140
    const maxWTP = Math.floor(budget * (0.85 + prng() * 0.25));
    const stylePreference = STYLES[Math.floor(prng() * STYLES.length)];
    const silhouettePreference = SILHOUETTES[Math.floor(prng() * SILHOUETTES.length)];
    const colorPreference = COLORS[Math.floor(prng() * COLORS.length)];
    const materialRequirement = MATERIALS[Math.floor(prng() * MATERIALS.length)];

    agents.push({
      id,
      cohort,
      budget,
      maxWTP,
      stylePreference,
      silhouettePreference,
      colorPreference,
      materialRequirement,
      shoppingObjective: `Looking for an authentic ${stylePreference.replace("_", " ")} jacket in ${colorPreference.replace("_", " ")}, preferring ${silhouettePreference.replace("_", " ")} cut within budget £${budget}.`,
    });
  }

  return agents;
}

export const DISCOVERY_AGENTS: ShoppingAgent[] = generateAgents("discovery", 200, 101);
export const HELD_OUT_AGENTS: ShoppingAgent[] = generateAgents("held_out", 200, 202);
export const ALL_AGENTS: ShoppingAgent[] = [...DISCOVERY_AGENTS, ...HELD_OUT_AGENTS];
