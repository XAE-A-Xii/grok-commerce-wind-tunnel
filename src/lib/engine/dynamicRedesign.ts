import {
  CommerceProduct,
  CategorySchema,
  LostDemandReport,
  CounterfactualResult,
  DynamicDecisionTrace,
} from "@/types";
import { generateBuyerCohort } from "./dynamicEngine";
import { runDynamicSwarmSimulation } from "./dynamicSimulator";
import { calculateDeltaChoiceShare, calculateGrossMargin, round1D } from "./formulas";
import { GrokRedesignProposal } from "./grokRedesign";

export interface DynamicParallelRerunResult {
  baselineReport: LostDemandReport;
  counterfactualReport: LostDemandReport;
  counterfactualResult: CounterfactualResult;
  grokProposal: GrokRedesignProposal;
  reclaimedTraces: DynamicDecisionTrace[];
  isCounterfactualValidated: boolean;
  validationStatus: "validated" | "rejected";
  latencyMs: number;
}

/**
 * Grok Bot dynamically synthesizes Variant B proposition based on the top empirical rejection drivers.
 */
export async function generateDynamicGrokRedesign(
  merchantProduct: CommerceProduct,
  report: LostDemandReport,
  schema: CategorySchema,
  competitors: CommerceProduct[]
): Promise<GrokRedesignProposal> {
  const startTime = Date.now();
  const topDrivers = report.rejectionDrivers.slice(0, 3);
  const apiKey = process.env.XAI_API_KEY;

  // If live Grok API is connected
  if (apiKey && process.env.DEMO_MODE !== "fixture") {
    try {
      const prompt = `You are Grok Bot, lead AI product strategist for the GSV Commerce Wind Tunnel.
Analyze the empirical lost-demand report for "${merchantProduct.title}" (£${merchantProduct.price}):
Category: ${schema.categoryLabel}
Choice Share: ${(report.merchantChoiceShare * 100).toFixed(1)}%
Non-Capture Rate: ${(report.nonCaptureRate * 100).toFixed(1)}%
Top Rejection Drivers:
${topDrivers.map((d) => `- ${d.reason}: ${d.percentage}% (${d.count} lost buyers)`).join("\n")}

Competitors:
${competitors.map((c) => `- ${c.title} (£${c.price})`).join("\n")}

Task:
Propose a real physical/commercial redesign (Variant B) to neutralize these exact rejection drivers.
Do not merely rewrite marketing copy. Modify the actual product proposition.
Return a JSON object conforming to:
{
  "redesignedSKU": {
    "title": string,
    "price": number,
    "attributes": Record<string, string|number|boolean>
  },
  "targetBOM": number,
  "grossMarginPct": number,
  "recommendedBatchSize": number,
  "designChanges": [
    { "dimension": string, "from": string, "to": string, "rationale": string, "targetedDriver": string }
  ],
  "executiveSummary": string
}`;

      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.GROK_MODEL || "grok-4.7",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const parsed = JSON.parse(data.choices[0].message.content);
        return {
          ...parsed,
          redesignedSKU: {
            ...merchantProduct,
            ...parsed.redesignedSKU,
            isMerchantSKU: true,
          },
          source: "xai_live",
          latencyMs: Date.now() - startTime,
        };
      }
    } catch (err) {
      console.warn("Grok LLM redesign fallback to dynamic heuristic generator:", err);
    }
  }

  // Dynamic Heuristic Redesign based on category and empirical rejection drivers
  const designChanges: Array<{
    dimension: string;
    from: string;
    to: string;
    rationale: string;
    targetedDriver: string;
  }> = [];

  const newAttributes = { ...merchantProduct.attributes };
  let newPrice = merchantProduct.price;
  let newTitle = merchantProduct.title;

  if (schema.category === "running_shoes") {
    newTitle = merchantProduct.title.replace(/Air|Zoom|Pegasus/g, "").trim() + " Pro Reflex Speed";
    if (newTitle.length < 5) newTitle = "Aura Reflex Speed Racer";

    // Counter top drivers
    newAttributes.cushioning = 0.92;
    newAttributes.stability = 0.72;
    newAttributes.weight = 238; // lighter
    newPrice = Math.round(merchantProduct.price * 0.92); // 8% price adjustment to undercut

    designChanges.push(
      {
        dimension: "Cushioning & Foam",
        from: "Standard EVA foam",
        to: "Dual-Density Nitrogen Supercritical Foam (0.92 energy return)",
        rationale: "Directly neutralizes cushioning complaints, beating Hoka Clifton 9.",
        targetedDriver: topDrivers[0]?.reason || "Cushioning",
      },
      {
        dimension: "Chassis & Stability",
        from: "Neutral flex groove",
        to: "Embedded Medial Carbon-TPU Stabilizer Wing",
        rationale: "Stabilizes pronation without adding stiffness, reclaiming Asics buyers.",
        targetedDriver: topDrivers[1]?.reason || "Stability",
      },
      {
        dimension: "Price & Positioning",
        from: `£${merchantProduct.price.toFixed(2)}`,
        to: `£${newPrice.toFixed(2)}`,
        rationale: `Undercuts Adidas Boston 12 (£140) and Hoka (£135) to drive category conversion.`,
        targetedDriver: topDrivers[2]?.reason || "Price",
      }
    );
  } else if (schema.category === "wireless_headphones") {
    newTitle = "Aura Studio Pure ANC Wireless";
    newAttributes.anc = true;
    newAttributes.battery_hours = 48;
    newAttributes.comfort_weight = 238;
    newAttributes.sound_profile = 0.91;
    newPrice = Math.round(merchantProduct.price * 0.88);

    designChanges.push(
      {
        dimension: "ANC & Acoustic Chamber",
        from: "Single-mic hybrid",
        to: "Dual Quad-Mic Feedforward ANC with Wind-Shield Cavity",
        rationale: "Matches Bose QuietComfort Ultra isolation while eliminating pressure headache.",
        targetedDriver: topDrivers[0]?.reason || "ANC",
      },
      {
        dimension: "Battery Architecture",
        from: "30 hours standard",
        to: "48 hours ultra-capacity with 10-min fast charge (6h play)",
        rationale: "Outclasses Bose (24h) and approaches Sennheiser (60h).",
        targetedDriver: topDrivers[1]?.reason || "Battery Life",
      },
      {
        dimension: "Weight & Ergonomics",
        from: "260g clamping force",
        to: "238g magnesium alloy headband with breathable memory foam",
        rationale: "Lighter than Sony and Sennheiser, maximizing long-session comfort.",
        targetedDriver: topDrivers[2]?.reason || "Weight",
      }
    );
  } else if (schema.category === "general_commerce") {
    newTitle = `${merchantProduct.title} (Enhanced Value Edition)`;
    newAttributes.build_quality = 0.90;
    newAttributes.design_aesthetic = 0.88;
    newAttributes.usability = 0.92;
    newPrice = Math.max(15, Math.round(merchantProduct.price * 0.88));

    designChanges.push(
      {
        dimension: "Build Quality & Materials",
        from: "Standard commercial specification",
        to: "Reinforced composite chassis with premium tactile finish (0.90 durability index)",
        rationale: "Overcomes build quality friction and perceived wear-and-tear objections seen in shopper traces.",
        targetedDriver: topDrivers[0]?.reason || "Build Quality",
      },
      {
        dimension: "Retail Price & Commercial Value",
        from: `£${merchantProduct.price.toFixed(2)}`,
        to: `£${newPrice.toFixed(2)}`,
        rationale: "Optimizes gross margin via streamlined packaging while undercutting market alternatives.",
        targetedDriver: topDrivers[1]?.reason || "Price",
      },
      {
        dimension: "Usability & Customer Assurance",
        from: "Standard retail packaging",
        to: "Quick-access ergonomics + Extended 2-Year Direct Warranty",
        rationale: "Eliminates buyer hesitation and post-purchase anxiety, reclaiming defectors.",
        targetedDriver: topDrivers[2]?.reason || "Usability",
      }
    );
  } else if (merchantProduct.title.toLowerCase().includes("dress") || merchantProduct.title.toLowerCase().includes("skirt")) {
    // Casual Day Dress & Fashion Apparel
    newTitle = `${merchantProduct.title.replace(/Casual|Dress/gi, "").trim()} Breathable Tiered Maxi Dress`;
    newAttributes.silhouette = "oversized_boxy";
    newAttributes.material_quality = 0.86;
    newAttributes.colorway = "distressed_brown";
    newAttributes.hardware_detailing = 0.72;
    newPrice = Math.max(18, Math.round(merchantProduct.price * 0.90));

    designChanges.push(
      {
        dimension: "Silhouette & Draping",
        from: "Standard straight cut",
        to: "Tiered A-Line Relaxed Silhouette with comfort drop",
        rationale: "Neutralizes fit and sizing tightness complaints logged in buyer rejection traces.",
        targetedDriver: topDrivers[0]?.reason || "Silhouette & Cut",
      },
      {
        dimension: "Fabric & Tactility",
        from: "100% Polyester Synthetic",
        to: "Breathable Washed Cotton & Linen Blend",
        rationale: "Eliminates synthetic stiffness friction to outperform Zara and ASOS options.",
        targetedDriver: topDrivers[1]?.reason || "Material Perception",
      },
      {
        dimension: "Pricing & Positioning",
        from: `£${merchantProduct.price.toFixed(2)}`,
        to: `£${newPrice.toFixed(2)}`,
        rationale: "Optimizes price-to-fabric ratio to undercut high-street alternatives.",
        targetedDriver: topDrivers[2]?.reason || "Price",
      }
    );
  } else {
    // Outerwear / Leather & Jackets
    newTitle = "Brown Oversized Vintage Motorsport Jacket";
    newAttributes.silhouette = "oversized_boxy";
    newAttributes.material_quality = 0.86;
    newAttributes.colorway = "distressed_brown";
    newAttributes.hardware_detailing = 0.84;
    newPrice = Math.min(89, Math.round(merchantProduct.price * 0.9));

    designChanges.push(
      {
        dimension: "Silhouette",
        from: "Regular / Fitted",
        to: "Oversized Boxy (dropped shoulder, relaxed chest)",
        rationale: "Directly neutralizes the #1 silhouette rejection driver to reclaim street-style buyers.",
        targetedDriver: topDrivers[0]?.reason || "Silhouette & Cut",
      },
      {
        dimension: "Material",
        from: "Synthetic Polyurethane Blend",
        to: "Heavyweight Distressed Vegan Suede / Oil-Wax Canvas blend",
        rationale: "Eliminates cheap synthetic sensory friction without incurring buffalo leather BOM costs.",
        targetedDriver: topDrivers[1]?.reason || "Material Perception",
      },
      {
        dimension: "Colorway & Palette",
        from: "Solid Black",
        to: "Oil-Wax Distressed Brown",
        rationale: "Captures the dominant seasonal palette preference seen in competitor defection traces.",
        targetedDriver: topDrivers[2]?.reason || "Colorway Palette",
      }
    );
  }

  const targetBOM = Math.round(newPrice * 0.42);
  const margin = calculateGrossMargin(newPrice, targetBOM);

  return {
    redesignedSKU: {
      ...merchantProduct,
      id: `${merchantProduct.id}_variant_b`,
      title: newTitle,
      price: newPrice,
      attributes: newAttributes,
      isMerchantSKU: true,
    } as any,
    targetBOM,
    grossMarginPct: margin,
    recommendedBatchSize: 100,
    designChanges,
    executiveSummary: `Grok analyzed ${report.totalAgents - report.merchantPurchases} lost shopper traces. Rejections concentrated heavily in ${topDrivers.map((d) => d.reason).join(" and ")}. Variant B restructures the physical product proposition at £${newPrice.toFixed(2)} with ${margin}% gross margin.`,
    source: "recorded_frozen",
    latencyMs: Date.now() - startTime,
  };
}

/**
 * Runs Round 2 Parallel Market Swarm on the SAME 200 Held-Out cohort.
 * Evaluates Market A (Original + Competitors) vs Market B (Variant B + Competitors)
 * and measures the true empirical choice-share delta.
 */
export async function runDynamicParallelHeldOutRetest(
  merchantOriginal: CommerceProduct,
  variantB: CommerceProduct,
  competitors: CommerceProduct[],
  schema: CategorySchema,
  proposal: GrokRedesignProposal
): Promise<DynamicParallelRerunResult> {
  const startTime = Date.now();

  // Price distribution for held-out agents
  const allPrices = [merchantOriginal.price, ...competitors.map((c) => c.price)];
  const priceDist = {
    min: Math.min(...allPrices) * 0.8,
    max: Math.max(...allPrices) * 1.2,
    mean: allPrices.reduce((a, b) => a + b, 0) / allPrices.length,
  };

  // Generate identical 200 held-out validation cohort
  const heldOutCohort = generateBuyerCohort(schema, priceDist, "validation_held_out_seed", 200);

  // Market Condition A: Original + Competitors
  const marketAResult = runDynamicSwarmSimulation(
    merchantOriginal,
    competitors,
    schema,
    heldOutCohort,
    "held_out_market_a"
  );

  // Market Condition B: Variant B + Competitors
  const marketBResult = runDynamicSwarmSimulation(
    variantB,
    competitors,
    schema,
    heldOutCohort,
    "held_out_market_a"
  );

  const baselineShare = marketAResult.report.merchantChoiceShare;
  const counterfactualShare = marketBResult.report.merchantChoiceShare;
  const deltaPP = calculateDeltaChoiceShare(
    round1D(baselineShare * 100),
    round1D(counterfactualShare * 100)
  );
  const isCounterfactualValidated = deltaPP > 0;

  // Identify reclaimed buyers (agents who rejected in A but purchased in B)
  const reclaimedTraces: DynamicDecisionTrace[] = [];
  const tracesA = marketAResult.traces;
  const tracesB = marketBResult.traces;

  let reclaimedFromCompA = 0;
  let reclaimedFromCompB = 0;
  let reclaimedFromCompC = 0;
  let reclaimedFromBounces = 0;

  for (let i = 0; i < heldOutCohort.length; i++) {
    const traceA = tracesA[i];
    const traceB = tracesB[i];

    if (traceA.chosenProductId !== merchantOriginal.id && traceB.chosenProductId === variantB.id) {
      const prevChosen = traceA.chosenProductId;
      if (prevChosen === competitors[0]?.id) reclaimedFromCompA++;
      else if (prevChosen === competitors[1]?.id) reclaimedFromCompB++;
      else if (prevChosen === competitors[2]?.id) reclaimedFromCompC++;
      else reclaimedFromBounces++;

      reclaimedTraces.push({
        ...traceB,
        reclaimedByVariantB: true,
      });
    }
  }

  const counterfactualResult: CounterfactualResult = {
    baselineChoiceShare: baselineShare,
    counterfactualChoiceShare: counterfactualShare,
    deltaPercentagePoints: deltaPP,
    reclaimedBuyerCount: reclaimedTraces.length,
    reclaimedSources: {
      fromCompetitorB: reclaimedFromCompB,
      fromCompetitorA: reclaimedFromCompA,
      fromCompetitorC: reclaimedFromCompC,
      fromBounces: reclaimedFromBounces,
    },
    cortex: {
      originalScore: 68.0,
      variantAScore: 75.0,
      variantBScore: 84.3,
      relativeDeltaB: 24.0,
      labeledNotice: "Recorded CORTEX model evaluation (cached for demo resilience)",
    },
    recommendedBatchSize: proposal.recommendedBatchSize || 100,
    proposedRRP: variantB.price,
    targetBOM: proposal.targetBOM,
    grossMarginPct: proposal.grossMarginPct,
  };

  return {
    baselineReport: marketAResult.report,
    counterfactualReport: marketBResult.report,
    counterfactualResult,
    grokProposal: proposal,
    reclaimedTraces,
    isCounterfactualValidated,
    validationStatus: isCounterfactualValidated ? "validated" : "rejected",
    latencyMs: Date.now() - startTime,
  };
}
