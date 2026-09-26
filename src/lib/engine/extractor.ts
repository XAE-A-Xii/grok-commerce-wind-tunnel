import { ProductSKU } from "@/types";
import { MERCHANT_SKU } from "@/lib/data/seedSKUs";

export interface ExtractionResult {
  sku: ProductSKU;
  source: "fixture" | "json_ld" | "open_graph" | "grok_fallback" | "synthetic_generated";
  latencyMs: number;
}

/**
 * Extracts product metadata from any ecommerce URL following the SPEC-001 Extraction Ladder:
 * Step 1: Demo Fixture intercept (instant for known demo URLs)
 * Step 2: Schema.org Product JSON-LD
 * Step 3: OpenGraph & Meta Tags
 * Step 4: Fallback synthetic profile derived from URL slug
 */
export async function extractProductFromUrl(url: string): Promise<ExtractionResult> {
  const startTime = Date.now();
  const normalizedUrl = url.trim().toLowerCase();

  // 1. Fixture Intercept for Zero-Latency Demo Mode
  if (
    normalizedUrl.includes("black-racing-jacket") ||
    normalizedUrl.includes("shop.com") ||
    process.env.DEMO_MODE === "fixture"
  ) {
    return {
      sku: { ...MERCHANT_SKU, url },
      source: "fixture",
      latencyMs: Date.now() - startTime,
    };
  }

  // 2. Live HTTP Fetch Attempt
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const html = await res.text();

      // Step 2: Try JSON-LD Product Extraction
      const jsonLdMatch = html.match(
        /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
      );
      if (jsonLdMatch) {
        for (const tag of jsonLdMatch) {
          try {
            const jsonText = tag.replace(/<\/?script[^>]*>/gi, "");
            const data = JSON.parse(jsonText);
            const product =
              data["@type"] === "Product"
                ? data
                : Array.isArray(data["@graph"])
                ? data["@graph"].find((item: any) => item["@type"] === "Product")
                : null;

            if (product && product.name) {
              const price =
                typeof product.offers?.price === "number"
                  ? product.offers.price
                  : parseFloat(product.offers?.price || "89.0");
              const img = Array.isArray(product.image)
                ? product.image[0]
                : typeof product.image === "string"
                ? product.image
                : product.image?.url || "/assets/jacket_original.png";

              return {
                sku: {
                  id: `sku_extracted_${Date.now()}`,
                  url,
                  brand: product.brand?.name || "Extracted Brand",
                  title: product.name,
                  price: isNaN(price) ? 89.0 : price,
                  silhouette: "Regular Fit",
                  material: product.material || "Synthetic Blend",
                  colorway: product.color || "Standard",
                  rating: parseFloat(product.aggregateRating?.ratingValue || "4.2"),
                  imageUrl: img,
                  isMerchantSKU: true,
                },
                source: "json_ld",
                latencyMs: Date.now() - startTime,
              };
            }
          } catch (e) {
            // continue parsing
          }
        }
      }

      // Step 3: OpenGraph & Meta Fallback
      const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1];
      const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1];
      const ogPrice = html.match(/<meta[^>]*property=["'](?:og|product):price:amount["'][^>]*content=["']([^"']+)["']/i)?.[1];

      if (ogTitle) {
        return {
          sku: {
            id: `sku_og_${Date.now()}`,
            url,
            brand: "Merchant Store",
            title: ogTitle,
            price: ogPrice ? parseFloat(ogPrice) : 99.0,
            silhouette: "Regular",
            material: "Standard Garment Blend",
            colorway: "Solid",
            rating: 4.1,
            imageUrl: ogImage || "/assets/jacket_original.png",
            isMerchantSKU: true,
          },
          source: "open_graph",
          latencyMs: Date.now() - startTime,
        };
      }
    }
  } catch (err) {
    // Network or abort error; gracefully proceed to fallback
  }

  // Step 4: Synthetic Fallback Derived from URL slug
  const slug = url.split("/").pop()?.replace(/[-_]/g, " ") || "Apparel Item";
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    sku: {
      id: `sku_slug_${Date.now()}`,
      url,
      brand: "Merchant Store",
      title: title.length > 3 ? title : MERCHANT_SKU.title,
      price: 89.0,
      silhouette: "Fitted / Regular",
      material: "PU Synthetic Leather",
      colorway: "Black",
      rating: 4.0,
      imageUrl: "/assets/jacket_original.png",
      isMerchantSKU: true,
    },
    source: "synthetic_generated",
    latencyMs: Date.now() - startTime,
  };
}
