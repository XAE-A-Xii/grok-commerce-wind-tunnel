import { NextRequest, NextResponse } from "next/server";
import { runDiscoverySwarm, runParallelHeldOutSwarm } from "@/lib/engine/simulator";
import { generateBuyerCohort } from "@/lib/engine/dynamicEngine";
import { runDynamicSwarmSimulation } from "@/lib/engine/dynamicSimulator";
import { runDynamicParallelHeldOutRetest } from "@/lib/engine/dynamicRedesign";
import { getCategorySchema, discoverCompetitors } from "@/lib/engine/categoryOntology";
import { COMPETITOR_SKUS, COUNTERFACTUAL_VARIANT_B } from "@/lib/data/seedSKUs";
import { DISCOVERY_AGENTS, HELD_OUT_AGENTS } from "@/lib/data/buyerPersonas";
import { FROZEN_ROUND1_REPORT, FROZEN_COUNTERFACTUAL_RESULT } from "@/lib/data/fixtureExperiment";
import { CommerceProduct, ProductSKU, CategorySchema } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sku, commerceProduct, competitors, categorySchema, mode, variantBSKU, variantBProduct, grokProposal } = body;

    // Check if this is the explicit rehearsal jacket fixture
    const isRehearsalFixture =
      process.env.DEMO_MODE === "fixture" &&
      ((sku && sku.title.toLowerCase().includes("black racing")) ||
       (commerceProduct && commerceProduct.title.toLowerCase().includes("black racing")));

    // 1. Parallel Rerun (Round 2 Held-Out Market Retest)
    if (mode === "parallel_rerun") {
      if (isRehearsalFixture) {
        const result = await runParallelHeldOutSwarm(
          sku,
          variantBSKU || COUNTERFACTUAL_VARIANT_B,
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
          validationStatus: "validated",
          latencyMs: result.latencyMs,
        });
      }

      // Dynamic Parallel Held-Out Retest
      const targetCommerce: CommerceProduct = commerceProduct || {
        id: sku?.id || "merchant_prod",
        title: sku?.title || "Product Under Test",
        brand: sku?.brand || "Merchant",
        category: "general_commerce",
        price: sku?.price || 99,
        currency: "GBP",
        attributes: {},
        sourceUrl: sku?.url || "",
        isMerchantSKU: true,
      };

      const schema: CategorySchema = categorySchema || await getCategorySchema(targetCommerce.category, targetCommerce.title);
      const comps: CommerceProduct[] = competitors || await discoverCompetitors(targetCommerce, schema);

      const targetVariantB: CommerceProduct = variantBProduct || {
        ...targetCommerce,
        id: `${targetCommerce.id}_variant_b`,
        title: variantBSKU?.title || "Redesigned Proposition Variant B",
        price: variantBSKU?.price || targetCommerce.price,
        attributes: targetCommerce.attributes,
        isMerchantSKU: true,
      };

      const rerunResult = await runDynamicParallelHeldOutRetest(
        targetCommerce,
        targetVariantB,
        comps,
        schema,
        grokProposal || {
          redesignedSKU: targetVariantB,
          targetBOM: targetVariantB.price * 0.42,
          grossMarginPct: 58.0,
          recommendedBatchSize: 100,
          designChanges: [],
          executiveSummary: "Dynamic counterfactual rerun on held-out agents.",
          source: "recorded_frozen",
          latencyMs: 120,
        }
      );

      return NextResponse.json({
        success: true,
        mode: "parallel_rerun",
        baselineReport: rerunResult.baselineReport,
        counterfactualReport: rerunResult.counterfactualReport,
        counterfactualResult: rerunResult.counterfactualResult,
        reclaimedTraces: rerunResult.reclaimedTraces,
        validationStatus: rerunResult.validationStatus,
        latencyMs: rerunResult.latencyMs,
      });
    }

    // 2. Round 1 Discovery Swarm (200 Agents)
    if (isRehearsalFixture) {
      const result = await runDiscoverySwarm(
        sku,
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
    }

    // Dynamic Swarm Execution
    const targetProduct: CommerceProduct = commerceProduct || {
      id: sku?.id || `prod_${Date.now()}`,
      title: sku?.title || "Product Under Test",
      brand: sku?.brand || "Merchant Store",
      category: "general_commerce",
      price: sku?.price || 99.0,
      currency: "GBP",
      attributes: {},
      sourceUrl: sku?.url || "",
      isMerchantSKU: true,
    };

    const schema: CategorySchema = categorySchema || await getCategorySchema(targetProduct.category, targetProduct.title);
    const comps: CommerceProduct[] = competitors && competitors.length > 0 ? competitors : await discoverCompetitors(targetProduct, schema);

    const allPrices = [targetProduct.price, ...comps.map((c) => c.price)];
    const priceDist = {
      min: Math.min(...allPrices) * 0.8,
      max: Math.max(...allPrices) * 1.2,
      mean: allPrices.reduce((a, b) => a + b, 0) / allPrices.length,
    };

    // Dynamically generate 200 category-specific heterogeneous buyer personas
    const discoveryCohort = generateBuyerCohort(schema, priceDist, "discovery_seed_v1", 200);

    // Run the local multi-attribute utility swarm
    const dynamicResult = runDynamicSwarmSimulation(
      targetProduct,
      comps,
      schema,
      discoveryCohort,
      "swarm_eval_seed_v1"
    );

    return NextResponse.json({
      success: true,
      mode: "discovery",
      report: dynamicResult.report,
      traces: dynamicResult.traces,
      competitors: comps,
      buyers: discoveryCohort.map((agent) => ({
        id: agent.id,
        cohort: agent.cohort,
        budget: Math.round(agent.budget),
        maxWTP: Math.round(agent.maxWTP),
      })),
      categorySchema: schema,
      latencyMs: dynamicResult.latencyMs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to execute swarm simulation." },
      { status: 500 }
    );
  }
}
