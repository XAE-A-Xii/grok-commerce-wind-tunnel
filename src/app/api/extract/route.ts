import { NextRequest, NextResponse } from "next/server";
import { extractProductFromUrl } from "@/lib/engine/extractor";
import { getCategorySchema, discoverCompetitors } from "@/lib/engine/categoryOntology";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid public product URL is required." },
        { status: 400 }
      );
    }

    const extraction = await extractProductFromUrl(url);
    const categorySchema = await getCategorySchema(
      extraction.commerceProduct.category,
      extraction.commerceProduct.title
    );
    const competitors = await discoverCompetitors(
      extraction.commerceProduct,
      categorySchema
    );

    return NextResponse.json({
      success: true,
      sku: extraction.sku,
      commerceProduct: extraction.commerceProduct,
      categorySchema,
      competitors,
      source: extraction.source,
      latencyMs: extraction.latencyMs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Could not reliably extract this product. Try another public product URL." },
      { status: 400 }
    );
  }
}
