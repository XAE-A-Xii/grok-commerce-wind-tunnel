import { createClient } from "@supabase/supabase-js";
import { ShopifyDraftRecord, LostDemandReport, CounterfactualResult } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-gsv-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SavedExperimentRecord {
  id: string;
  skuUrl: string;
  timestamp: string;
  round1Report: LostDemandReport;
  counterfactualResult: CounterfactualResult;
  shopifyDraft?: ShopifyDraftRecord;
}

// In-memory cache for live demo resilience if Supabase is offline or not configured
const inMemoryExperiments: Map<string, SavedExperimentRecord> = new Map();

/**
 * Saves a completed wind tunnel experiment run to Supabase and in-memory cache.
 */
export async function saveExperimentRun(record: SavedExperimentRecord): Promise<boolean> {
  inMemoryExperiments.set(record.id, record);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.DEMO_MODE === "fixture") {
    return true;
  }

  try {
    const { error } = await supabase.from("experiments").insert([
      {
        id: record.id,
        sku_url: record.skuUrl,
        round1_data: record.round1Report,
        counterfactual_data: record.counterfactualResult,
        shopify_draft: record.shopifyDraft,
        created_at: record.timestamp,
      },
    ]);

    if (error) {
      console.warn("Supabase insert notice (using in-memory):", error.message);
    }
    return true;
  } catch (err) {
    console.warn("Failed saving experiment to Supabase:", err);
    return true;
  }
}

/**
 * Fetches recent experiments.
 */
export async function getRecentExperiments(): Promise<SavedExperimentRecord[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.DEMO_MODE === "fixture") {
    return Array.from(inMemoryExperiments.values());
  }

  try {
    const { data, error } = await supabase
      .from("experiments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error || !data) {
      return Array.from(inMemoryExperiments.values());
    }

    return data.map((d: any) => ({
      id: d.id,
      skuUrl: d.sku_url,
      timestamp: d.created_at,
      round1Report: d.round1_data,
      counterfactualResult: d.counterfactual_data,
      shopifyDraft: d.shopify_draft,
    }));
  } catch (err) {
    return Array.from(inMemoryExperiments.values());
  }
}
