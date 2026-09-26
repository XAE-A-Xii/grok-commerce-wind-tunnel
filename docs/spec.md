# SPEC-001: GSV — Autonomous Lost-Demand Engine (Commerce Wind Tunnel)
**Track:** Merchant Tooling (Blended with Agentic Commerce)  
**Event:** Grok Bot Commerce London Hackathon  
**Target Code Freeze:** 16:30 BST (Saturday, 26th September)  
**Status:** FROZEN (Source of Truth)

---

## 1. Executive Summary & Core Value Proposition

> **"Paste your product URL. We release autonomous buyer agents into the live market, see exactly why they choose competitors, redesign your product proposition, and rerun the market to measure whether that fix wins demand back before you manufacture it."**

### Why This Is Fundamentally Distinct:
- **Not an AI Reviewer / Focus Group:** We don't ask agents *"Do you like this page?"* Agents receive autonomous shopping objectives (*"Find an autumn racing jacket under £100"*) and shop across both your SKU and live competitor SKUs.
- **Not Page CRO / Copy Optimization:** We don't tweak hero headlines or button colors. We diagnose **product proposition failure** (silhouette, material, colorway, pricing) and redesign the physical product specification.
- **The Core Novelty — Autonomous Counterfactual Market Experiment:**  
  $$\text{Paste SKU URL} \longrightarrow \text{Market Shopping Swarm} \longrightarrow \text{Lost Demand Map} \longrightarrow \text{Grok Redesign} \longrightarrow \text{CORTEX Signal} \longrightarrow \text{Parallel Held-Out Market Rerun} \longrightarrow \mathbf{\Delta \text{Choice Share (+18pp)}} \longrightarrow \text{Shopify GraphQL Draft & Supabase}$$

---

## 2. Phase 0: Capability Map

| Module ID | Responsibility | Depends On |
| :--- | :--- | :--- |
| `sku-extractor` | Extracts product attributes (title, price, silhouette, material, colorway, images) from a pasted URL or test fixture. | — |
| `market-radar` | Uses Tavily Search API to identify real-world competitor SKUs in the exact product category with pricing, features, and imagery. | `sku-extractor` |
| `swarm-market-sim-r1` | 200 discovery buyer agents shop the competitive market (Your SKU vs Competitor A, B, C) with individual budgets, styles, and constraints. | `market-radar` |
| `lost-demand-engine` | Pure mathematical calculation of Choice Share, Non-Capture Rate (69%), Rejection Drivers, and "Who Beat You & Why" telemetry. | `swarm-market-sim-r1` |
| `grok-product-redesigner` | Observes lost demand traces and synthesizes Counterfactual Variant B (Distressed Brown, Oversized Boxy, £89). | `lost-demand-engine` |
| `cortex-visual-eval` | Evaluates visual stimuli across Original, Variant A, and Variant B for relative predicted cortical response (+24% for B). | `grok-product-redesigner` |
| `swarm-counterfactual-r2` | Evaluates identical 200 held-out agents across parallel markets (Market A: Original vs Market B: Variant B) to measure $+18\text{pp}$ simulated choice share uplift. | `grok-product-redesigner`, `cortex-visual-eval` |
| `shopify-deploy-engine` | Grok Merchant Agent creates real draft product via Shopify GraphQL Admin API (`2026-07`) and persists experiment telemetry in Supabase. | `swarm-counterfactual-r2` |
| `web-ui-wind-tunnel` | High-aesthetic Next.js dashboard with URL input, live shopping swarm visualizer, lost-demand telemetry, and 1-click Auto-Run 3-min pitch toggle. | All modules |

**Build Order:**  
`sku-extractor` $\rightarrow$ `market-radar` $\rightarrow$ `swarm-market-sim-r1` $\rightarrow$ `lost-demand-engine` $\rightarrow$ `grok-product-redesigner` $\rightarrow$ `cortex-visual-eval` $\rightarrow$ `swarm-counterfactual-r2` $\rightarrow$ `shopify-deploy-engine` $\rightarrow$ `web-ui-wind-tunnel`

---

## 3. Pure Mathematical Formulations & Data Contracts (`lib/engine/formulas.ts`)

All metrics displayed in the application are computed deterministically from agent choice traces.

### Rounding Utilities:
```typescript
export const round1D = (v: number) => Math.round(v * 10) / 10;
export const round2D = (v: number) => Math.round(v * 100) / 100;
```

---

### 3.1 Stage 1: Initial Competitive Market Swarm (200 Discovery Agents)

A cohort of $N = 200$ autonomous discovery buyer agents is released into the competitive market containing:
- **Your SKU:** Black Racing Jacket (£99, Regular fit, PU Leather)
- **Competitor A:** Vintage Cafe Racer (£109, Slim fit, Genuine Cowhide)
- **Competitor B:** Oversized Motorsport Jacket (£111, Oversized boxy, Distressed Brown)
- **Competitor C:** Fast-Fashion Biker (£69, Regular fit, Synthetic)

#### 1. Baseline Agent Choice Share (Round 1):
$$\text{ChoiceShare}(k) = \frac{N_{\text{purchased}}(k)}{N_{\text{total}}}$$

| Product | Purchases ($N=200$) | Agent Choice Share |
| :--- | :---: | :---: |
| **Your SKU** | **62** | **31.0%** |
| **Competitor A** | 54 | 27.0% |
| **Competitor B** | 48 | 24.0% |
| **Competitor C** | 22 | 11.0% |
| **No Purchase (Bounced)** | 14 | 7.0% |

$$\text{Non-Capture Rate} = 100\% - 31.0\% = \mathbf{69.0\%}$$
*(UI Display: "Your product won 31% — Non-Capture Rate: 69% of category demand")*

#### 2. Rejection Drivers (Why Your SKU Lost):
Aggregated from explicit rejection logging across the $N_{\text{rejected}} = 138$ agents that inspected Your SKU but chose competitors or bounced:

$$\text{Percentage}(r) = \text{round1D}\left(\frac{\text{Count}(r)}{138} \times 100\right)$$

| Rejection Driver | Agent Count ($N=138$) | Percentage |
| :--- | :---: | :---: |
| **Wrong Silhouette (too fitted / regular)** | 44 | **31.9%** |
| **Material Perception (too synthetic / plastic)** | 29 | **21.0%** |
| **Colorway Preference (wanted distressed brown)** | 23 | **16.7%** |
| **Price Sensitivity (competitor cheaper)** | 19 | **13.8%** |
| **Missing Vintage Details (lacks patches/hardware)**| 12 | **8.7%** |
| **Other** | 11 | **8.0%** |
| **Total** | **138** | **100.1%** |

#### 3. Head-to-Head Defection Matrix (Who Beat You & Why):
- **Competitor B (Won 48 buyers, 41 defected directly from Your SKU):**
  - *Win Factors:* Oversized silhouette (+), distressed brown aesthetic (+), authentic motorsport detailing (+).
  - *Vulnerability:* Price is £12 higher than Your SKU (-).
- **Competitor A (Won 54 buyers, 29 defected from Your SKU):**
  - *Win Factors:* Genuine leather feel (+), premium hardware (+).
  - *Vulnerability:* Too slim/rigid fit (-), £10 higher price (-).
- **Competitor C (Won 22 buyers, 17 defected from Your SKU):**
  - *Win Factors:* Sub-£70 aggressive entry price (+).
  - *Vulnerability:* Low quality ratings, cheap zipper (-).

---

### 3.2 Stage 2: Grok Counterfactual Redesign (Variant B)

Grok receives the structured lost-demand telemetry and formulates the counterfactual product proposition designed to reclaim lost buyers from Competitor B and C:

```text
CURRENT SKU:
- Title: Black Racing Jacket
- Silhouette: Regular / Fitted
- Colour: Solid Black
- Material: Polyurethane (PU) Faux Leather
- Price: £99.00
- Shipping: £4.99 standard

GROK COUNTERFACTUAL REDESIGN (Variant B):
- Title: Brown Oversized Vintage Motorsport Jacket
- Silhouette: Oversized Boxy (dropped shoulder, relaxed chest)
- Colour: Oil-Wax Distressed Brown
- Material: Heavyweight Distressed Vegan Suede / Oil-Wax Canvas blend
- Price: £89.00 (Undercuts Competitor B by £22; sits below £90 sweet spot)
- Shipping: Free Next-Day Delivery
- Target BOM: £38.00 (57.3% Gross Margin)
```

---

### 3.3 Stage 3: CORTEX Independent Visual Stimulus Signal

Visual stimuli for Original SKU, Variant A, and Variant B are evaluated through the neural response layer:

| Stimulus | Relative Cortical Signal ($N$) | Visual Cortex Salience | Parietal Attention ROI |
| :--- | :---: | :---: | :---: |
| **Original SKU** | Baseline: **68.0** | 65.0 | 67.0 |
| **Variant A** | +10.3% response: **75.0** | 73.0 | 74.0 |
| **Variant B** | **+24.0% relative response: 84.3** | **85.0** | **86.0** |

*Scientific Disclaimer:* CORTEX measures relative stimulus saliency across candidate visuals; it does not claim human conversion probability.

---

### 3.4 Stage 4: Parallel Counterfactual Market Experiment (200 Held-Out Agents)

To eliminate cohort drift, **200 fresh, held-out buyer personas** are tested in two isolated, parallel market conditions with identical competitor states:
- **Market Condition A (Baseline):** Held-Out Agents shop Your Original SKU vs Competitors A, B, C.
- **Market Condition B (Counterfactual):** The exact same Held-Out Agents shop Variant B vs Competitors A, B, C.

#### 1. Counterfactual Agent Choice Share:
| Product | Market Condition A (Original) | Market Condition B (Variant B) | $\Delta$ Choice Share |
| :--- | :---: | :---: | :---: |
| **Merchant Product** | **31.0%** (62/200) | **49.0%** (98/200) | **+18.0 percentage points** |
| **Competitor A** | 27.0% (54/200) | 22.0% (44/200) | -5.0 pp |
| **Competitor B** | 24.0% (48/200) | 16.0% (32/200) | -8.0 pp |
| **Competitor C** | 11.0% (22/200) | 8.0% (16/200) | -3.0 pp |
| **No Purchase** | 7.0% (14/200) | 5.0% (10/200) | -2.0 pp |

#### 2. Reclaimed Demand Analysis:
$$\Delta \text{ChoiceShare} = 49.0\% - 31.0\% = \mathbf{+18.0 \text{ percentage points}}$$
- **Reclaimed from Competitor B:** 16 buyers won back due to matching oversized brown styling at £22 lower price point.
- **Reclaimed from Competitor A:** 10 buyers won back due to relaxed silhouette and sub-£90 price.
- **Reclaimed from Competitor C:** 6 buyers won back due to perceived value leap.
- **Reclaimed from Bounces:** 4 buyers who previously found nothing suitable.

---

### 3.5 Stage 5: Merchant Action & Real Shopify GraphQL Deployment

- **Decision:** `DEPLOY COUNTERFACTUAL VARIANT B`
- **Measured Simulated Market Improvement:** `+18.0 percentage points choice share`
- **Target Retail Price:** £89.00
- **Target BOM Cost:** £38.00
- **Gross Margin:** $57.3\%$
- **Pilot Batch Exposure:** 100 units (Low-risk inventory pilot)
- **1-Click Action:** **`[CREATE SHOPIFY DRAFT]`**
  - Executes Shopify GraphQL Admin API (`2026-07`):
    ```graphql
    mutation CreateDraftProduct($input: ProductCreateInput!) {
      productCreate(input: $input) {
        product {
          id
          title
          status
          tags
          variants(first: 1) {
            edges {
              node {
                id
                price
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
    ```
  - Input variables:
    ```json
    {
      "input": {
        "title": "Brown Oversized Vintage Motorsport Jacket",
        "descriptionHtml": "<p>Heavyweight oil-wax distressed vegan suede racing jacket with relaxed dropped shoulders and antique brass hardware. Engineered via GSV Counterfactual Market Optimization.</p>",
        "status": "DRAFT",
        "tags": ["GSV-Counterfactual", "Variant-B", "Pilot-100"]
      }
    }
    ```
  - Persists full experiment telemetry record into Supabase `product_briefs` table.
  - Fail-safe fallback: If live Shopify API credentials (`SHOPIFY_SHOP_DOMAIN`, `SHOPIFY_ADMIN_ACCESS_TOKEN`) are not set, persists to Supabase and opens an interactive Shopify Admin draft preview drawer displaying the GraphQL mutation payload and response.

---

## 4. Tech Stack & Commands

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript 5.x (Strict mode)
* **Styling:** Tailwind CSS + Vanilla CSS tokens (Dark theme `#0B0F17`, emerald `#10B981`, cyan `#06B6D4`, crimson `#EF4444` for lost demand)
* **Icons:** `lucide-react`
* **Data & Persistence:** `@supabase/supabase-js`
* **Commerce Integration:** Shopify GraphQL Admin API (`POST /admin/api/2026-07/graphql.json`)
* **Market Search:** `@tavily/core` or REST API
* **Reasoning Engine:** xAI Grok API (`grok-beta` / Grok 2)
* **Execution Commands:**
  ```bash
  Dev:   npm run dev       # Starts local dev server at http://localhost:3000
  Build: npm run build     # Validates production build for Vercel deployment
  Lint:  npm run lint      # ESLint validation
  Test:  npm test          # Runs pure mathematical test suite
  ```

---

## 5. Project Structure

```text
/
├── docs/
│   └── spec.md                      # This specification
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout, fonts, meta tags
│   │   ├── page.tsx                 # Master Wind Tunnel dashboard (URL input to action)
│   │   ├── globals.css              # Custom tokens, animations, glassmorphism
│   │   └── api/
│   │       ├── extract/route.ts     # SKU feature extraction from URL
│   │       ├── market/route.ts      # Tavily competitor search
│   │       ├── simulate/route.ts    # Parallel Market A & B simulation
│   │       ├── redesign/route.ts    # Grok Counterfactual Variant B generation
│   │       └── shopify/route.ts     # Shopify GraphQL Admin API draft creation & Supabase
│   ├── components/
│   │   ├── url-input-hero.tsx       # Paste URL + Instant preset selector
│   │   ├── market-arena.tsx         # Live shopping swarm visualizer (Your SKU vs Competitors)
│   │   ├── lost-demand-map.tsx      # Choice share gauges, non-capture rate, who beat you
│   │   ├── counterfactual-view.tsx  # Side-by-side comparison (Original vs Variant B) + CORTEX
│   │   ├── rerun-results.tsx        # Swarm Round 2 comparison (+18pp uplift)
│   │   └── shopify-deploy-modal.tsx # Shopify GraphQL draft creation & confirmation drawer
│   ├── lib/
│   │   ├── data/
│   │   │   ├── seed-products.ts     # Preset URLs & competitor catalog fixtures
│   │   │   └── buyer-agents.ts      # 200 Discovery + 200 Held-Out validation personas
│   │   ├── engine/
│   │   │   ├── formulas.ts          # Pure math: ChoiceShare, RejectionDrivers, DeltaShare
│   │   │   ├── market-swarm.ts      # Multi-agent category shopping logic
│   │   │   └── cortex.ts            # Relative neural signal models
│   │   ├── grok.ts                  # Grok API client & counterfactual redesign prompts
│   │   ├── shopify.ts               # Shopify GraphQL Admin API client (2026-07)
│   │   ├── supabase.ts              # Supabase persistence client
│   │   └── tavily.ts                # Tavily competitive search integration
│   └── types/
│       └── index.ts                 # TypeScript domain interfaces
└── public/
    └── assets/                      # Photorealistic jacket visuals (Original, Competitors, Variant B)
```

---

## 6. TypeScript Contracts & Interfaces

```typescript
// 1. Extracted Product Under Test
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
  rejectionReasons: Record<string, string>;
  reclaimedByVariantB?: boolean;
}

// 4. Lost Demand Telemetry Report
export interface LostDemandReport {
  totalAgents: number; // 200
  merchantChoiceShare: number; // 0.31 (31%)
  nonCaptureRate: number; // 0.69 (69%)
  competitorChoiceShares: Record<string, number>;
  noPurchaseRate: number; // 0.07 (7%)
  rejectionDrivers: Array<{ reason: string; percentage: number; count: number }>;
  headToHeadDefection: Array<{
    competitorId: string;
    lostBuyerCount: number;
    whyTheyWon: string[];
    whyTheyLost: string[];
  }>;
}

// 5. Counterfactual Experiment Result
export interface CounterfactualResult {
  originalChoiceShare: number; // 0.31
  counterfactualChoiceShare: number; // 0.49
  deltaPercentagePoints: number; // +18.0
  reclaimedBuyerCount: number; // 36
  cortexComparison: {
    originalScore: number; // 68.0
    variantAScore: number; // 75.0
    variantBScore: number; // 84.3 (+24% relative response)
  };
  recommendedBatchSize: number; // 100 units
}

// 6. Shopify Deployment Record
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
  initial_pilot_units: number;    // 100
  status: 'draft_created' | 'synced_to_shopify';
}
```

---

## 7. Supabase Database Schema

```sql
CREATE TABLE IF NOT EXISTS product_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  shopify_product_id TEXT,
  shopify_draft_url TEXT,
  original_sku_url TEXT NOT NULL,
  counterfactual_title TEXT NOT NULL,
  target_rrp NUMERIC(10, 2) NOT NULL,
  target_bom NUMERIC(10, 2) NOT NULL,
  gross_margin_pct NUMERIC(5, 2) NOT NULL,
  choice_share_uplift_pp NUMERIC(5, 2) NOT NULL, -- 18.0
  initial_pilot_units INTEGER NOT NULL DEFAULT 100,
  key_changes JSONB NOT NULL,
  status TEXT DEFAULT 'draft_created'
);
```

---

## 8. Success Criteria (Definition of Done)

- [ ] Merchant can paste any product URL or select a 1-click preset (`https://shop.com/products/black-racing-jacket`).
- [ ] Round 1 Swarm simulates 200 discovery buyers shopping the category live with observable telemetry.
- [ ] Lost Demand Map deterministically renders:
  - 31% Merchant Choice Share, **69% Non-Capture Rate**.
  - Rejection drivers strictly matching counts: Silhouette (31.9%), Material (21.0%), Color (16.7%), Price (13.8%), Details (8.7%), Other (8.0%).
  - Defection breakdown to Competitor B (41 lost buyers), Competitor A (29), Competitor C (17).
- [ ] Grok Counterfactual Engine proposes Variant B (Distressed Brown, Oversized, £89).
- [ ] CORTEX visual signal highlights Variant B with +24% relative cortical response (84.3 vs 68.0).
- [ ] 1-Click **`[CREATE SHOPIFY DRAFT]`** triggers real Shopify GraphQL Admin API (`2026-07`) mutation (with graceful Supabase + preview fallback if credentials unset).
- [ ] 1-Click "Auto-Run 3-Min Pitch" allows seamless stage demonstration in under 180 seconds.

---

## 9. SPEC-002: Dynamic Multi-Category Commerce Wind Tunnel Architecture

### 9.1 The Core Problem & Architectural Shift
The static jacket fixture proved the UX, but the core product promise of a true "Commerce Wind Tunnel" requires dynamic evaluation across arbitrary product categories (apparel, footwear, electronics, etc.). When a judge pastes *any public product URL*:
1. The system must not force a jacket fixture on non-jacket products.
2. The 200-agent simulation runs locally, fast (<3s), and deterministically seeded.
3. In `DEMO_MODE=live` (or any dynamic URL), outcomes are not hard-coded. Merchant choice share is derived directly from the agent choices.
4. Grok Bot creates the category ontology/schema, Tavily grounds the competitive market, the local Swarm simulates heterogeneous buyers, Grok redesigns the proposition, and a held-out swarm retests the result adversarially.

### 9.2 The 10-Step Pipeline
```
ANY PUBLIC PRODUCT URL
  ↓ 1. PRODUCT EXTRACTION (JSON-LD / OpenGraph / Tavily Extract)
  ↓ 2. PRODUCT NORMALISATION (Grok Bot → structured CommerceProduct)
  ↓ 3. LIVE COMPETITOR DISCOVERY (Tavily Search / Category grounding)
  ↓ 4. CATEGORY SCHEMA (Grok Bot identifies decision dimensions)
  ↓ 5. DYNAMIC PERSONA FACTORY (generate 200 category-specific buyers locally)
  ↓ 6. LOCAL SWARM (inspect → compare → reject → buy via generic utility)
  ↓ 7. REAL TRACE-DERIVED METRICS (dynamic choice share & rejection drivers)
  ↓ 8. GROK BOT REDESIGN (structured counterfactual product proposition)
  ↓ 9. SAME HELD-OUT SWARM RETEST (adversarial validation: PASS or REJECT)
  ↓ 10. SHOPIFY DRAFT (create draft with dynamic title, price & attributes)
```

### 9.3 Dynamic Data Contracts
```typescript
export interface DecisionDimension {
  key: string;
  label: string;
  type: "numeric" | "categorical" | "boolean";
  importance_mean: number; // 0.0 - 1.0
  direction?: "higher_better" | "lower_better" | "target";
  unit?: string;
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
```

### 9.4 Generic Utility Function
For each agent $a$ and product $p$:
$$\text{utility}(a, p) = \text{attributeFit}(a, p) + \text{priceFit}(a, p) + \text{seededNoise}(a, p)$$
If $\max_p(\text{utility}(a, p)) < \text{reservationUtility}(a)$, the agent logs a bounce (`no_purchase`).
Every non-choice produces explicit trace evidence:
```json
{
  "agentId": "A041",
  "productId": "merchant-sku",
  "action": "reject",
  "reasons": [
    { "dimension": "price", "desired": "<=130", "observed": 145, "impact": -0.18 },
    { "dimension": "stability", "desired": 0.8, "observed": 0.5, "impact": -0.12 }
  ]
}
```
All rejection drivers in the dashboard are computed from these logged reasons rather than static strings.

