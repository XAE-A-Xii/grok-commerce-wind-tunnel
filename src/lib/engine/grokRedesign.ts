import { LostDemandReport, ProductSKU } from "@/types";
import { COUNTERFACTUAL_VARIANT_B } from "@/lib/data/seedSKUs";

export interface GrokRedesignProposal {
  redesignedSKU: ProductSKU;
  targetBOM: number; // £38.00
  grossMarginPct: number; // 57.3%
  recommendedBatchSize: number; // 100 units
  designChanges: Array<{
    dimension: string;
    from: string;
    to: string;
    rationale: string;
    targetedDriver: string;
  }>;
  executiveSummary: string;
  source: "xai_live" | "recorded_frozen";
  latencyMs: number;
}

const FROZEN_GROK_PROPOSAL: GrokRedesignProposal = {
  redesignedSKU: COUNTERFACTUAL_VARIANT_B,
  targetBOM: 38.0,
  grossMarginPct: 57.3,
  recommendedBatchSize: 100,
  designChanges: [
    {
      dimension: "Silhouette",
      from: "Regular / Fitted",
      to: "Oversized Boxy (dropped shoulder, relaxed chest)",
      rationale:
        "Directly neutralizes the #1 rejection driver (31.9% of lost buyers). Reclaims street-style shoppers who defected to Competitor B.",
      targetedDriver: "Wrong Silhouette (too fitted / regular)",
    },
    {
      dimension: "Material",
      from: "Polyurethane (PU) Faux Leather",
      to: "Heavyweight Distressed Vegan Suede / Oil-Wax Canvas blend",
      rationale:
        "Eliminates 'plastic / cheap synthetic' sensory friction (21.0% of rejections) without incurring buffalo leather BOM costs.",
      targetedDriver: "Material Perception (too synthetic / plastic)",
    },
    {
      dimension: "Colorway",
      from: "Solid Black",
      to: "Oil-Wax Distressed Brown",
      rationale:
        "Captures the dominant seasonal palette preference (16.7% of rejections) seen across defection traces to Competitor B.",
      targetedDriver: "Colorway Preference (wanted distressed brown)",
    },
    {
      dimension: "Price & Positioning",
      from: "£99.00 (+ £4.99 shipping)",
      to: "£89.00 (Free Next-Day Delivery)",
      rationale:
        "Undercuts Competitor B (£111.00) by £22.00 and breaks psychological £90 ceiling, while maintaining healthy 57.3% gross margin on £38 BOM.",
      targetedDriver: "Price Sensitivity (competitor cheaper)",
    },
    {
      dimension: "Hardware & Detailing",
      from: "Standard chrome zip",
      to: "Antiqued brass hardware with vintage racing collar snap",
      rationale:
        "Satisfies motorsport detailing expectation (8.7% of rejections) with negligible £1.20 BOM impact.",
      targetedDriver: "Missing Vintage Details (lacks patches/hardware)",
    },
  ],
  executiveSummary:
    "Grok analyzed 138 lost shopper traces from Round 1. 52.9% of rejections stemmed from silhouette and material mismatch against trend leader Competitor B. Variant B converts these weaknesses into an aggressive value wedge at £89.00 with 57.3% gross margin.",
  source: "recorded_frozen",
  latencyMs: 340,
};

/**
 * Generates counterfactual product redesign via xAI Grok API (grok-4.7)
 * or returns the frozen benchmark proposal if offline or in fixture mode.
 */
export async function generateGrokRedesign(
  originalSKU: ProductSKU,
  lostDemandReport: LostDemandReport
): Promise<GrokRedesignProposal> {
  const startTime = Date.now();
  const apiKey = process.env.XAI_API_KEY;
  const model = process.env.GROK_MODEL || "grok-4.7";

  if (!apiKey || process.env.DEMO_MODE === "fixture") {
    return {
      ...FROZEN_GROK_PROPOSAL,
      latencyMs: Date.now() - startTime,
    };
  }

  try {
    const prompt = `You are the lead product strategist at GSV Autonomous Commerce Wind Tunnel.
Analyze the following lost demand report for product "${originalSKU.title}" (£${originalSKU.price}):
Total Agents: ${lostDemandReport.totalAgents}
Choice Share Won: ${(lostDemandReport.merchantChoiceShare * 100).toFixed(1)}%
Non-Capture Rate: ${(lostDemandReport.nonCaptureRate * 100).toFixed(1)}%
Top Rejection Drivers:
${lostDemandReport.rejectionDrivers.map((d) => `- ${d.reason}: ${d.percentage}% (${d.count} buyers)`).join("\n")}

Generate a counterfactual physical redesign (Variant B) with:
1. Revised title, silhouette, material, colorway, price (£89.00 recommended), BOM (£38.00).
2. Explicit mapping from each change to the rejection driver it neutralizes.
3. Summary of competitive advantage against competitors.
Respond in valid JSON matching the GrokRedesignProposal format.`;

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
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
        source: "xai_live",
        latencyMs: Date.now() - startTime,
      };
    }
  } catch (err) {
    console.warn("Grok API call failed or timed out, using frozen proposal", err);
  }

  return {
    ...FROZEN_GROK_PROPOSAL,
    latencyMs: Date.now() - startTime,
  };
}
