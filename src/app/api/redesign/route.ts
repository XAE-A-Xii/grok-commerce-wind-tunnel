import { NextRequest, NextResponse } from "next/server";
import { generateGrokRedesign } from "@/lib/engine/grokRedesign";
import { evaluateCortexStimuli } from "@/lib/engine/cortexEvaluator";
import { FROZEN_ROUND1_REPORT } from "@/lib/data/fixtureExperiment";
import { MERCHANT_SKU } from "@/lib/data/seedSKUs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sku, report } = body;

    const targetSKU = sku || MERCHANT_SKU;
    const targetReport = report || FROZEN_ROUND1_REPORT;

    // Concurrently run Grok Redesign and CORTEX Neural Evaluator
    const [redesign, cortex] = await Promise.all([
      generateGrokRedesign(targetSKU, targetReport),
      evaluateCortexStimuli(
        targetSKU.imageUrl || "/assets/jacket_original.png",
        "/assets/jacket_variant_b.png"
      ),
    ]);

    return NextResponse.json({
      success: true,
      redesign,
      cortex,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate redesign proposal." },
      { status: 500 }
    );
  }
}
