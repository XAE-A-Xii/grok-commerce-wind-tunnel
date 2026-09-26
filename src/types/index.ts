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

// 8. Dynamic Intermediate Representation (SPEC-002)
export interface DecisionDimension {
  key: string;
  label: string;
  type: "numeric" | "categorical" | "boolean";
  importance_mean: number; // 0.0 - 1.0
  direction?: "higher_better" | "lower_better" | "target";
  unit?: string;
  options?: string[]; // for categorical
}

export interface CategorySchema {
  category: string;
  categoryLabel: string;
  decision_dimensions: DecisionDimension[];
  typicalPriceRange: { min: number; max: number };
}

export interface CommerceProduct {
  id: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  attributes: Record<string, string | number | boolean>;
  imageUrl?: string;
  sourceUrl: string;
  isMerchantSKU?: boolean;
}

// 9. Dynamic Heterogeneous Buyer Agent
export interface DynamicBuyerAgent {
  id: string;
  cohort: "discovery" | "held_out";
  budget: number;
  maxWTP: number;
  priceSensitivity: number; // 0.0 (unconcerned) to 1.0 (extreme)
  dimensionWeights: Record<string, number>; // dimension.key -> importance (0-1)
  idealValues: Record<string, string | number | boolean>;
  brandLoyalty: number; // 0-1
}

// 10. Structured Rejection Reason & Trace Evidence
export interface RejectionReasonEvidence {
  dimension: string;
  desired: string | number;
  observed: string | number;
  impact: number; // negative impact on utility, e.g. -0.18
}

export interface DynamicDecisionTrace {
  agentId: string;
  chosenProductId?: string; // undefined if bounced
  action: "purchased" | "reject" | "no_purchase";
  utilities: Record<string, number>; // productId -> utility score
  reasons: RejectionReasonEvidence[];
  reclaimedByVariantB?: boolean;
}

export interface DynamicSwarmResult {
  categorySchema: CategorySchema;
  merchantProduct: CommerceProduct;
  competitors: CommerceProduct[];
  report: LostDemandReport;
  traces: DynamicDecisionTrace[];
  latencyMs: number;
  isLiveDynamic?: boolean;
}

