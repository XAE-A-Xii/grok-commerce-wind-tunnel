import { CategorySchema, CommerceProduct, DecisionDimension } from "@/types";

/**
 * Built-in Category Ontologies for Instant, Zero-Latency Grounding.
 * Grok Bot uses this as the baseline ontology or dynamically generates custom dimensions via LLM.
 */
export const CATEGORY_SCHEMAS: Record<string, CategorySchema> = {
  running_shoes: {
    category: "running_shoes",
    categoryLabel: "Performance Footwear & Running Shoes",
    typicalPriceRange: { min: 90, max: 180 },
    decision_dimensions: [
      {
        key: "cushioning",
        label: "Cushioning & Energy Return",
        type: "numeric",
        importance_mean: 0.82,
        direction: "higher_better",
        unit: "index (0-1)",
      },
      {
        key: "stability",
        label: "Arch Stability & Foot Support",
        type: "numeric",
        importance_mean: 0.64,
        direction: "higher_better",
        unit: "index (0-1)",
      },
      {
        key: "weight",
        label: "Shoe Weight",
        type: "numeric",
        importance_mean: 0.58,
        direction: "lower_better",
        unit: "grams",
      },
      {
        key: "price",
        label: "Retail Price",
        type: "numeric",
        importance_mean: 0.74,
        direction: "lower_better",
        unit: "£",
      },
      {
        key: "durability",
        label: "Outsole Durability",
        type: "numeric",
        importance_mean: 0.62,
        direction: "higher_better",
        unit: "index (0-1)",
      },
      {
        key: "style",
        label: "Aesthetic / Silhouette",
        type: "categorical",
        importance_mean: 0.51,
        options: ["performance", "cushioned_max", "sleek_racing", "trail_rugged"],
      },
    ],
  },
  wireless_headphones: {
    category: "wireless_headphones",
    categoryLabel: "Wireless Over-Ear & Audio Hardware",
    typicalPriceRange: { min: 80, max: 350 },
    decision_dimensions: [
      {
        key: "anc",
        label: "Active Noise Cancellation (ANC)",
        type: "boolean",
        importance_mean: 0.86,
      },
      {
        key: "battery_hours",
        label: "Battery Life (Playback Hours)",
        type: "numeric",
        importance_mean: 0.78,
        direction: "higher_better",
        unit: "hours",
      },
      {
        key: "comfort_weight",
        label: "Headband Weight & Clamping Comfort",
        type: "numeric",
        importance_mean: 0.66,
        direction: "lower_better",
        unit: "grams",
      },
      {
        key: "price",
        label: "Retail Price",
        type: "numeric",
        importance_mean: 0.75,
        direction: "lower_better",
        unit: "£",
      },
      {
        key: "sound_profile",
        label: "Acoustic Tuning & Bass Response",
        type: "numeric",
        importance_mean: 0.81,
        direction: "higher_better",
        unit: "index (0-1)",
      },
    ],
  },
  outerwear: {
    category: "outerwear",
    categoryLabel: "Apparel & Motorsport Outerwear",
    typicalPriceRange: { min: 60, max: 150 },
    decision_dimensions: [
      {
        key: "silhouette",
        label: "Silhouette & Cut",
        type: "categorical",
        importance_mean: 0.85,
        options: ["oversized_boxy", "regular_fitted", "slim", "relaxed"],
      },
      {
        key: "material_quality",
        label: "Material Perception & Texture",
        type: "numeric",
        importance_mean: 0.79,
        direction: "higher_better",
        unit: "index (0-1)",
      },
      {
        key: "colorway",
        label: "Colorway Palette",
        type: "categorical",
        importance_mean: 0.69,
        options: ["distressed_brown", "solid_black", "vintage_tan", "monochrome"],
      },
      {
        key: "price",
        label: "Retail Price",
        type: "numeric",
        importance_mean: 0.72,
        direction: "lower_better",
        unit: "£",
      },
      {
        key: "hardware_detailing",
        label: "Hardware Detailing & Trims",
        type: "numeric",
        importance_mean: 0.58,
        direction: "higher_better",
        unit: "index (0-1)",
      },
    ],
  },
  general_commerce: {
    category: "general_commerce",
    categoryLabel: "Consumer Goods & Lifestyle Products",
    typicalPriceRange: { min: 20, max: 150 },
    decision_dimensions: [
      {
        key: "build_quality",
        label: "Perceived Build Quality & Durability",
        type: "numeric",
        importance_mean: 0.80,
        direction: "higher_better",
        unit: "index (0-1)",
      },
      {
        key: "price",
        label: "Retail Price & Value Proposition",
        type: "numeric",
        importance_mean: 0.75,
        direction: "lower_better",
        unit: "£",
      },
      {
        key: "design_aesthetic",
        label: "Design Form Factor & Visual Appeal",
        type: "numeric",
        importance_mean: 0.70,
        direction: "higher_better",
        unit: "index (0-1)",
      },
      {
        key: "usability",
        label: "Everyday Usability & Ergonomics",
        type: "numeric",
        importance_mean: 0.65,
        direction: "higher_better",
        unit: "index (0-1)",
      },
    ],
  },
};

/**
 * Detects category from URL, title, or description.
 */
export function detectProductCategory(title: string, url: string = ""): string {
  const text = `${title} ${url}`.toLowerCase();

  if (
    text.includes("shoe") ||
    text.includes("pegasus") ||
    text.includes("running") ||
    text.includes("sneaker") ||
    text.includes("trainer") ||
    text.includes("marathon") ||
    text.includes("boot") ||
    text.includes("heel") ||
    text.includes("chelsea") ||
    text.includes("loafer") ||
    text.includes("sandal") ||
    text.includes("footwear")
  ) {
    return "running_shoes";
  }

  if (
    text.includes("headphone") ||
    text.includes("audio") ||
    text.includes("sony-wh") ||
    text.includes("anc") ||
    text.includes("wireless") ||
    text.includes("earphone") ||
    text.includes("earbuds")
  ) {
    return "wireless_headphones";
  }

  if (
    text.includes("jacket") ||
    text.includes("bomber") ||
    text.includes("coat") ||
    text.includes("outerwear") ||
    text.includes("racer") ||
    text.includes("leather") ||
    text.includes("hoodie") ||
    text.includes("dress") ||
    text.includes("shirt") ||
    text.includes("top") ||
    text.includes("pants") ||
    text.includes("trouser") ||
    text.includes("legging") ||
    text.includes("hiking") ||
    text.includes("skirt") ||
    text.includes("apparel") ||
    text.includes("clothing")
  ) {
    return "outerwear";
  }

  return "general_commerce";
}

/**
 * Obtains or synthesizes the category schema for a given product.
 * Calls Grok Bot if XAI_API_KEY is available, or uses the domain ontology table.
 */
export async function getCategorySchema(
  categoryKey: string,
  productTitle: string
): Promise<CategorySchema> {
  const baseSchema = CATEGORY_SCHEMAS[categoryKey] || CATEGORY_SCHEMAS.general_commerce;

  // Grok LLM dynamic schema enhancement if API key is provided
  const apiKey = process.env.XAI_API_KEY;
  if (apiKey && process.env.DEMO_MODE !== "fixture") {
    try {
      const prompt = `You are Grok Bot, the chief ontology architect for GSV Commerce Wind Tunnel.
Given the product title: "${productTitle}" in category "${categoryKey}", define what buyers care about.
Return a JSON object conforming to:
{
  "category": "${categoryKey}",
  "categoryLabel": "Human readable label",
  "typicalPriceRange": { "min": number, "max": number },
  "decision_dimensions": [
    { "key": "string", "label": "string", "type": "numeric"|"categorical"|"boolean", "importance_mean": 0.0-1.0, "direction": "higher_better"|"lower_better", "unit": "string" }
  ]
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
          temperature: 0.1,
          response_format: { type: "json_object" },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const parsed = JSON.parse(data.choices[0].message.content);
        if (parsed.decision_dimensions && parsed.decision_dimensions.length >= 3) {
          return parsed as CategorySchema;
        }
      }
    } catch (err) {
      console.warn("Grok dynamic schema generation fallback to ontology table:", err);
    }
  }

  return baseSchema;
}

export function pickLiveCompetitors(
  results: Array<{ title?: string; url?: string; content?: string }>,
  merchant: { title: string; price: number; sourceUrl?: string; currency?: string },
  schema: CategorySchema
): CommerceProduct[] {
  const merchantUrl = (merchant.sourceUrl || "").split("?")[0];
  const ranked = results
    .map((result, index) => ({ result, index, score: scoreCompetitorHit(result, merchantUrl) }))
    .filter((item) => item.score >= 2)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  const picked: CommerceProduct[] = [];
  for (const item of ranked) {
    if (picked.length >= 3) break;
    const title = cleanCompetitorTitle(item.result.title || "");
    const sourceUrl = item.result.url || "";
    if (!title || picked.some((competitor) => competitor.sourceUrl === sourceUrl)) continue;
    const price = priceFromSnippet(item.result.content || "", merchant.price, picked.length);
    picked.push({
      id: `comp_live_${picked.length}`,
      title,
      brand: title.split(" ")[0] || "Competitor",
      category: schema.category,
      price,
      currency: merchant.currency || "GBP",
      attributes: attributesForPrice(schema, price, picked.length),
      imageUrl: "",
      sourceUrl,
    });
  }
  return picked;
}

function scoreCompetitorHit(result: { title?: string; url?: string }, merchantUrl: string): number {
  const url = result.url || "";
  const title = (result.title || "").toLowerCase();
  if (!url.startsWith("http")) return -1;
  if (merchantUrl && url.split("?")[0] === merchantUrl) return -1;
  if (/google\.|youtube\.|facebook\.|reddit\.|wikipedia\.|pinterest\./i.test(url)) return -1;
  if (/amazon\.[^/]+\/s([/?]|$)/i.test(url)) return -1;
  if (/best |top \d|review|reddit|vs\b|roundup/.test(title)) return -1;
  let score = 1;
  if (/\/dp\/|\/gp\/product\/|\/product\/|\/products\//i.test(url)) score += 3;
  if (/amazon\.|regatta|decathlon|gooutdoors|blacks\.co|craghoppers/i.test(url)) score += 1;
  if (title.length >= 12) score += 1;
  return score;
}

function cleanCompetitorTitle(title: string): string {
  return title
    .replace(/\s*[:|]\s*Amazon\.[a-z.]+.*$/i, "")
    .replace(/\s+[-|–]\s*Amazon\.[a-z.]+.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function priceFromSnippet(text: string, merchantPrice: number, index: number): number {
  const match = text.match(/£\s*(\d{1,4}(?:\.\d{2})?)/);
  const parsed = match ? parseFloat(match[1]) : NaN;
  if (Number.isFinite(parsed) && parsed >= 5 && parsed <= 400) return parsed;
  const factor = index === 0 ? 1.12 : index === 1 ? 0.94 : 0.82;
  return Math.round(merchantPrice * factor);
}

function attributesForPrice(_schema: CategorySchema, price: number, _index: number): Record<string, string | number | boolean> {
  return { price };
}

/**
 * Discovers live competitors for the given category & product.
 * Returns 3 grounded competitors with realistic specs and pricing.
 */
export async function discoverCompetitors(
  merchantProduct: CommerceProduct,
  schema: CategorySchema
): Promise<CommerceProduct[]> {
  // 1. Live Web Discovery via Tavily Search (if TAVILY_API_KEY is present in env)
  if (process.env.TAVILY_API_KEY) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const searchRes = await fetch("https://api.tavily.com/search", {
        signal: controller.signal,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
        },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query: `${merchantProduct.title} buy alternative`,
          search_depth: "basic",
          max_results: 8,
        }),
      });
      clearTimeout(timeoutId);

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const liveCompetitors = pickLiveCompetitors(searchData.results || [], merchantProduct, schema);
        if (liveCompetitors.length >= 3) return liveCompetitors;
      }
    } catch (e) {
      // Tavily search failed or timed out, safely fall through to ontology tables
    }
  }

  // 2. Fallback to Category-Grounding Ontology Table
  const cat = schema.category;

  if (cat === "running_shoes") {
    return [
      {
        id: "comp_run_1",
        title: "Adidas Adizero Boston 12",
        brand: "Adidas",
        category: "running_shoes",
        price: 140,
        currency: "GBP",
        attributes: {
          cushioning: 0.85,
          stability: 0.60,
          weight: 260,
          price: 140,
          durability: 0.88,
          style: "performance",
        },
        imageUrl: "/assets/jacket_original.png",
        sourceUrl: "https://adidas.com/products/adizero-boston-12",
      },
      {
        id: "comp_run_2",
        title: "Hoka Clifton 9 Max Cushion",
        brand: "Hoka",
        category: "running_shoes",
        price: 135,
        currency: "GBP",
        attributes: {
          cushioning: 0.94,
          stability: 0.52,
          weight: 248,
          price: 135,
          durability: 0.72,
          style: "cushioned_max",
        },
        imageUrl: "/assets/jacket_original.png",
        sourceUrl: "https://hoka.com/products/clifton-9",
      },
      {
        id: "comp_run_3",
        title: "Asics Novablast 4",
        brand: "Asics",
        category: "running_shoes",
        price: 125,
        currency: "GBP",
        attributes: {
          cushioning: 0.89,
          stability: 0.68,
          weight: 260,
          price: 125,
          durability: 0.80,
          style: "performance",
        },
        imageUrl: "/assets/jacket_original.png",
        sourceUrl: "https://asics.com/products/novablast-4",
      },
    ];
  }

  if (cat === "wireless_headphones") {
    return [
      {
        id: "comp_audio_1",
        title: "Bose QuietComfort Ultra",
        brand: "Bose",
        category: "wireless_headphones",
        price: 329,
        currency: "GBP",
        attributes: {
          anc: true,
          battery_hours: 24,
          comfort_weight: 250,
          price: 329,
          sound_profile: 0.88,
        },
        imageUrl: "/assets/jacket_original.png",
        sourceUrl: "https://bose.com/products/qc-ultra",
      },
      {
        id: "comp_audio_2",
        title: "Sennheiser Momentum 4",
        brand: "Sennheiser",
        category: "wireless_headphones",
        price: 269,
        currency: "GBP",
        attributes: {
          anc: true,
          battery_hours: 60,
          comfort_weight: 293,
          price: 269,
          sound_profile: 0.93,
        },
        imageUrl: "/assets/jacket_original.png",
        sourceUrl: "https://sennheiser.com/products/momentum-4",
      },
      {
        id: "comp_audio_3",
        title: "Anker Soundcore Space One",
        brand: "Anker",
        category: "wireless_headphones",
        price: 89,
        currency: "GBP",
        attributes: {
          anc: true,
          battery_hours: 40,
          comfort_weight: 265,
          price: 89,
          sound_profile: 0.72,
        },
        imageUrl: "/assets/jacket_original.png",
        sourceUrl: "https://soundcore.com/products/space-one",
      },
    ];
  }

  // General Consumer Goods & Lifestyle Competitors
  if (cat === "general_commerce") {
    return [
      {
        id: "comp_gen_1",
        title: "Category Benchmark Leader Pro",
        brand: "Market Leader",
        category: "general_commerce",
        price: Math.round(merchantProduct.price * 1.15),
        currency: "GBP",
        attributes: {
          build_quality: 0.88,
          price: Math.round(merchantProduct.price * 1.15),
          design_aesthetic: 0.85,
          usability: 0.86,
        },
        imageUrl: "/assets/jacket_original.png",
        sourceUrl: merchantProduct.sourceUrl,
      },
      {
        id: "comp_gen_2",
        title: "Amazon Choice Direct Challenger",
        brand: "Top Rated Alternative",
        category: "general_commerce",
        price: Math.round(merchantProduct.price * 0.95),
        currency: "GBP",
        attributes: {
          build_quality: 0.80,
          price: Math.round(merchantProduct.price * 0.95),
          design_aesthetic: 0.82,
          usability: 0.84,
        },
        imageUrl: "/assets/jacket_original.png",
        sourceUrl: merchantProduct.sourceUrl,
      },
      {
        id: "comp_gen_3",
        title: "Value-Optimized Direct Brand",
        brand: "Value Direct",
        category: "general_commerce",
        price: Math.round(merchantProduct.price * 0.78),
        currency: "GBP",
        attributes: {
          build_quality: 0.68,
          price: Math.round(merchantProduct.price * 0.78),
          design_aesthetic: 0.70,
          usability: 0.74,
        },
        imageUrl: "/assets/jacket_original.png",
        sourceUrl: merchantProduct.sourceUrl,
      },
    ];
  }

  const outdoorTitle = merchantProduct.title.toLowerCase();
  if (/trouser|overtrouser|legging|hiking|rain pant/.test(outdoorTitle)) {
    const outdoor = [
      ["Regatta Women's Pack-It Overtrousers", "Regatta", "https://www.amazon.co.uk/s?k=Regatta+womens+waterproof+overtrousers"],
      ["Craghoppers Women's Kiwi Waterproof Trousers", "Craghoppers", "https://www.amazon.co.uk/s?k=Craghoppers+womens+waterproof+trousers"],
      ["Peter Storm Women's Waterproof Overtrousers", "Peter Storm", "https://www.amazon.co.uk/s?k=Peter+Storm+waterproof+overtrousers"],
    ] as const;
    return outdoor.map(([title, brand, sourceUrl], index) => {
      const price = Math.round(merchantProduct.price * (index === 0 ? 1.08 : index === 1 ? 1.2 : 0.86));
      return {
        id: `comp_outdoor_${index}`,
        title,
        brand,
        category: schema.category,
        price,
        currency: "GBP",
        attributes: attributesForPrice(schema, price, index),
        imageUrl: "",
        sourceUrl,
      };
    });
  }

  // Dresses & Casual Apparel Competitors
  const isDress = merchantProduct.title.toLowerCase().includes("dress") || merchantProduct.title.toLowerCase().includes("skirt");
  if (isDress) {
    return [
      {
        id: "comp_dress_zara",
        title: "Zara Flowing Casual Day Dress",
        brand: "Zara",
        category: "outerwear",
        price: 39,
        currency: "GBP",
        attributes: {
          silhouette: "oversized_boxy",
          material_quality: 0.84,
          colorway: "solid_black",
          price: 39,
          hardware_detailing: 0.70,
        },
        imageUrl: "/assets/jacket_original.png",
        sourceUrl: "https://zara.com/products/flowing-dress",
      },
      {
        id: "comp_dress_asos",
        title: "ASOS Design Relaxed Fit Day Dress",
        brand: "ASOS Design",
        category: "outerwear",
        price: 34,
        currency: "GBP",
        attributes: {
          silhouette: "oversized_boxy",
          material_quality: 0.78,
          colorway: "distressed_brown",
          price: 34,
          hardware_detailing: 0.65,
        },
        imageUrl: "/assets/jacket_original.png",
        sourceUrl: "https://asos.com/products/relaxed-dress",
      },
      {
        id: "comp_dress_mango",
        title: "Mango Breathable Cotton Blend Dress",
        brand: "Mango",
        category: "outerwear",
        price: 45,
        currency: "GBP",
        attributes: {
          silhouette: "regular_fitted",
          material_quality: 0.88,
          colorway: "solid_black",
          price: 45,
          hardware_detailing: 0.80,
        },
        imageUrl: "/assets/jacket_original.png",
        sourceUrl: "https://mango.com/products/cotton-dress",
      },
    ];
  }

  // Outerwear / Leather & Jackets Competitors
  return [
    {
      id: "comp_moto_a",
      title: "Apex Moto Classic Leather Racer",
      brand: "Apex Moto",
      category: "outerwear",
      price: 109,
      currency: "GBP",
      attributes: {
        silhouette: "slim",
        material_quality: 0.88,
        colorway: "solid_black",
        price: 109,
        hardware_detailing: 0.78,
      },
      imageUrl: "/assets/jacket_original.png",
      sourceUrl: "https://apex-moto.com/products/classic-racer",
    },
    {
      id: "comp_moto_b",
      title: "Vintage Garage Oversized Racer",
      brand: "Vintage Garage",
      category: "outerwear",
      price: 111,
      currency: "GBP",
      attributes: {
        silhouette: "oversized_boxy",
        material_quality: 0.82,
        colorway: "distressed_brown",
        price: 111,
        hardware_detailing: 0.85,
      },
      imageUrl: "/assets/jacket_original.png",
      sourceUrl: "https://vintage-garage.com/products/oversized-racer",
    },
    {
      id: "comp_moto_c",
      title: "Urban Biker Fast-Fashion Bomber",
      brand: "Urban Biker",
      category: "outerwear",
      price: 69,
      currency: "GBP",
      attributes: {
        silhouette: "regular_fitted",
        material_quality: 0.52,
        colorway: "solid_black",
        price: 69,
        hardware_detailing: 0.40,
      },
      imageUrl: "/assets/jacket_original.png",
      sourceUrl: "https://urban-biker.com/products/budget-bomber",
    },
  ];
}
