import { NextRequest, NextResponse } from "next/server";
import { createShopifyDraftProduct } from "@/lib/shopify/client";
import { saveExperimentRun } from "@/lib/supabase/client";
import { FROZEN_ROUND1_REPORT, FROZEN_COUNTERFACTUAL_RESULT } from "@/lib/data/fixtureExperiment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title = "Brown Oversized Vintage Motorsport Jacket",
      price = 89.0,
      targetBOM = 38.0,
      pilotBatchUnits = 100,
      imageUrl = "/assets/jacket_variant_b.png",
      skuUrl = "https://shop.com/products/black-racing-jacket",
    } = body;

    const result = await createShopifyDraftProduct({
      title,
      price,
      targetBOM,
      pilotBatchUnits,
      imageUrl,
      tags: ["GSV-Verified", "Counterfactual-Variant-B", "Margin-57.3%"],
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create draft in Shopify." },
        { status: 500 }
      );
    }

    // Persist experiment run record to Supabase
    const experimentId = `exp_${Date.now()}`;
    await saveExperimentRun({
      id: experimentId,
      skuUrl,
      timestamp: new Date().toISOString(),
      round1Report: FROZEN_ROUND1_REPORT,
      counterfactualResult: FROZEN_COUNTERFACTUAL_RESULT,
      shopifyDraft: result.draftRecord,
    });

    return NextResponse.json({
      success: true,
      draftRecord: result.draftRecord,
      experimentId,
      isMockDemo: result.isMockDemo,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed executing Shopify deployment." },
      { status: 500 }
    );
  }
}
