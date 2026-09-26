import { NextRequest, NextResponse } from "next/server";
import { generateDynamicGrokRedesign } from "@/lib/engine/dynamicRedesign";
import { generateGrokRedesign } from "@/lib/engine/grokRedesign";
import { evaluateCortexStimuli } from "@/lib/engine/cortexEvaluator";
import { getCategorySchema, discoverCompetitors } from "@/lib/engine/categoryOntology";
import { FROZEN_ROUND1_REPORT } from "@/lib/data/fixtureExperiment";
import { MERCHANT_SKU } from "@/lib/data/seedSKUs";
import { CommerceProduct, CategorySchema } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sku, commerceProduct, report, categorySchema, competitors } = body;

    const targetSKU = sku || MERCHANT_SKU;
    const targetReport = report || FROZEN_ROUND1_REPORT;

    // Check if this is the explicit rehearsal jacket fixture
    const isRehearsalFixture =
      process.env.DEMO_MODE === "fixture" &&
      targetSKU.title.toLowerCase().includes("black racing");

    if (isRehearsalFixture) {
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
    }

    // Dynamic Multi-Category Redesign
    const targetCommerce: CommerceProduct = commerceProduct || {
      id: targetSKU.id,
      title: targetSKU.title,
      brand: targetSKU.brand || "Merchant",
      category: "general_commerce",
      price: targetSKU.price,
      currency: "GBP",
      attributes: {},
      imageUrl: targetSKU.imageUrl,
      sourceUrl: targetSKU.url,
      isMerchantSKU: true,
    };

    const schema: CategorySchema = categorySchema || await getCategorySchema(targetCommerce.category, targetCommerce.title);
    const comps: CommerceProduct[] = competitors && competitors.length > 0 ? competitors : await discoverCompetitors(targetCommerce, schema);

    const [redesign, cortex] = await Promise.all([
      generateDynamicGrokRedesign(targetCommerce, targetReport, schema, comps),
      evaluateCortexStimuli(
        targetCommerce.imageUrl || "/assets/jacket_original.png",
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
