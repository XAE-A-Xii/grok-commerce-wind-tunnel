import { NextRequest, NextResponse } from "next/server";
import { extractProductFromUrl } from "@/lib/engine/extractor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid ecommerce product URL is required." },
        { status: 400 }
      );
    }

    const extraction = await extractProductFromUrl(url);

    return NextResponse.json({
      success: true,
      sku: extraction.sku,
      source: extraction.source,
      latencyMs: extraction.latencyMs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to extract SKU data from URL." },
      { status: 500 }
    );
  }
}
