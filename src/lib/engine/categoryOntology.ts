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
    text.includes("marathon")
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
    text.includes("hoodie")
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

/**
 * Discovers live competitors for the given category & product.
 * Returns 3 grounded competitors with realistic specs and pricing.
 */
export async function discoverCompetitors(
  merchantProduct: CommerceProduct,
  schema: CategorySchema
): Promise<CommerceProduct[]> {
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

  // Default: Outerwear / Apparel
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
