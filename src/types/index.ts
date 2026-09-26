// 1. Extracted Product Under Test & Competitor SKUs
export interface ProductSKU {
  id: string;
  url: string;
  brand: string;
  title: string;
  price: number;
  silhouette: string;
  material: string;
  colorway: string;
  rating: number;
  imageUrl: string;
  isMerchantSKU: boolean;
}

// 2. Buyer Agent Persona
export interface ShoppingAgent {
  id: string;
  cohort: 'discovery' | 'held_out';
  budget: number;
  stylePreference: string;
  silhouettePreference: string;
  colorPreference: string;
  materialRequirement: string;
  maxWTP: number;
  shoppingObjective: string;
}

// 3. Agent Shopping Journey Trace
export interface AgentShoppingTrace {
  agentId: string;
  inspectedSKUs: string[];
  finalDecision: 'purchased' | 'no_purchase';
  chosenSKUId?: string;
  rejectionReasons: Record<string, string>; // SKU id -> reason string
  reclaimedByVariantB?: boolean;
}

// 4. Lost Demand Telemetry Report (Round 1)
export interface LostDemandReport {
  totalAgents: number; // 200
  merchantPurchases: number; // 62
  merchantChoiceShare: number; // 0.31 (31.0%)
  competitorPurchases: number; // 124
  competitorChoiceShare: number; // 0.62 (62.0%)
  competitorBreakdown: Array<{
    id: string;
    name: string;
    purchases: number;
    choiceShare: number;
    price: number;
  }>;
  noPurchaseCount: number; // 14
  noPurchaseRate: number; // 0.07 (7.0%)
  nonCaptureRate: number; // 0.69 (69.0%)
  rejectionDrivers: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  headToHeadDefection: Array<{
    competitorId: string;
    competitorName: string;
    lostBuyerCount: number;
    whyTheyWon: string[];
    whyTheyLost: string[];
  }>;
}

// 5. CORTEX Neural Stimulus Comparison
export interface CortexEvaluation {
  originalScore: number; // 68.0
  variantAScore: number; // 75.0
  variantBScore: number; // 84.3 (+24% relative response)
  relativeDeltaB: number; // +24.0%
  labeledNotice: string;
}

// 6. Counterfactual Experiment Result (Round 2 Parallel Market)
export interface CounterfactualResult {
  baselineChoiceShare: number; // 0.31 (31.0%)
  counterfactualChoiceShare: number; // 0.49 (49.0%)
  deltaPercentagePoints: number; // +18.0 pp
  reclaimedBuyerCount: number; // 36
  reclaimedSources: {
    fromCompetitorB: number; // 16
    fromCompetitorA: number; // 10
    fromCompetitorC: number; // 6
    fromBounces: number; // 4
  };
  cortex: CortexEvaluation;
  recommendedBatchSize: number; // 100 units
  proposedRRP: number; // £89.00
  targetBOM: number; // £38.00
  grossMarginPct: number; // 57.3%
}

// 7. Shopify Deployment Record
export interface ShopifyDraftRecord {
  id?: string;
  created_at?: string;
  shopify_product_id?: string;
  shopify_draft_url?: string;
  original_sku_url: string;
  counterfactual_title: string;
  target_rrp: number;
  target_bom: number;
  gross_margin_pct: number;
  choice_share_uplift_pp: number; // 18.0
  initial_pilot_units: number; // 100
  status: 'draft_created' | 'synced_to_shopify';
  preview_payload?: Record<string, unknown>;
}
