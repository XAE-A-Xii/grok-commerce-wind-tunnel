import { NextRequest, NextResponse } from "next/server";
import { runDiscoverySwarm, runParallelHeldOutSwarm } from "@/lib/engine/simulator";
import { COMPETITOR_SKUS, COUNTERFACTUAL_VARIANT_B } from "@/lib/data/seedSKUs";
import { DISCOVERY_AGENTS, HELD_OUT_AGENTS } from "@/lib/data/buyerPersonas";
import { ProductSKU } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sku, mode, variantBSKU } = body;

    const targetSKU: ProductSKU = sku || {
      id: "sku_merchant_001",
      url: "https://shop.com/products/black-racing-jacket",
      brand: "Aura Athletics",
      title: "Black Racing Jacket",
      price: 99.0,
      silhouette: "Regular / Fitted",
      material: "Polyurethane (PU) Faux Leather",
      colorway: "Solid Black",
      rating: 4.1,
      imageUrl: "/assets/jacket_original.png",
      isMerchantSKU: true,
    };

    if (mode === "parallel_rerun") {
      const variantB = variantBSKU || COUNTERFACTUAL_VARIANT_B;
      const result = await runParallelHeldOutSwarm(
        targetSKU,
        variantB,
        COMPETITOR_SKUS,
        HELD_OUT_AGENTS
      );

      return NextResponse.json({
        success: true,
        mode: "parallel_rerun",
        baselineReport: result.baselineReport,
        counterfactualReport: result.counterfactualReport,
        counterfactualResult: result.counterfactualResult,
        reclaimedTraces: result.reclaimedTraces,
        latencyMs: result.latencyMs,
      });
    }

    // Default: Round 1 Discovery Swarm (200 agents)
    const result = await runDiscoverySwarm(
      targetSKU,
      COMPETITOR_SKUS,
      DISCOVERY_AGENTS
    );

    return NextResponse.json({
      success: true,
      mode: "discovery",
      report: result.report,
      traces: result.traces,
      competitors: COMPETITOR_SKUS,
      latencyMs: result.latencyMs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to execute swarm simulation." },
      { status: 500 }
    );
  }
}
