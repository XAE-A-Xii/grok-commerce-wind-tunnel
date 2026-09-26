# GSV — Autonomous Lost-Demand Engine (Commerce Wind Tunnel)

## The One-Line Pitch

**"Paste any product URL. GSV releases autonomous buyer agents into the live market, watches which product they actually choose—including competitors—explains why your product lost, generates a counterfactual redesign, and reruns the market to prove whether that fix wins demand back before you manufacture it."**

---

## Why This Is Fundamentally Distinct

### What it is NOT:
- **NOT an AI Focus Group / Reviewer:** We do not ask synthetic users *"Do you like this page?"* Agents are given an autonomous shopping objective (*"Find an autumn racing jacket under £100 that fits your vintage/streetwear style"*) and actively shop across your SKU and competitors.
- **NOT an AI CRO / Page Copy Optimizer:** Tools like StorePilot and VariantX tweak hero headlines and button copy. GSV diagnoses **product proposition failure** (wrong silhouette, cheap synthetic feel, colorway mismatch, pricing elasticity) and redesigns the physical product specification.
- **NOT Generic Synthetic Buyer Traffic:** We don't just simulate clicks. We perform an **Autonomous Counterfactual Market Experiment**.

---

## The Complete Loop

```text
                  MERCHANT PRODUCT URL
                           │
                           ▼
                  PRODUCT UNDER TEST
                           │
                  Tavily competitor scan
                           │
                           ▼
                  200 BUYER AGENTS
                           │
                  independently shop
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
     YOUR SKU        COMPETITOR A      COMPETITOR B
         │                 │                 │
         └─────────────────┼─────────────────┘
                           ▼
                     BUY / REJECT
                           │
                           ▼
                    LOST DEMAND MAP
             31% Won · 62% Competitors · 7% No Purchase
                           │
                           ▼
                 GROK RE-DESIGNS PRODUCT
                    Variant B Proposed
                           │
                 CORTEX Neural Stimulus Check
                    (+24% relative response)
                           │
                           ▼
               COUNTERFACTUAL MARKET RERUN
              200 Held-Out Validation Agents
                           │
                           ▼
                 DID WE WIN THEM BACK?
             Original 31% ──▶ Variant B 49%
             Δ AGENT CHOICE SHARE: +18pp
                           │
                           ▼
                 DEPLOY RECOMMENDATION
               [CREATE SHOPIFY DRAFT]
```

---

## Step-by-Step Walkthrough

### 1. The Merchant Pastes a Product URL
- Example: `https://shop.com/products/black-racing-jacket`
- GSV extracts:
  - Title: Black Racing Jacket
  - Price: £99.00
  - Silhouette: Regular / Fitted
  - Material: Polyurethane (PU) Faux Leather
  - Colorway: Solid Black
  - Rating: 4.2★
- Tavily finds comparable market offerings (Competitor A at £109, Competitor B at £111, Competitor C at £69).

---

### 2. Swarm 1: 200 Autonomous Buyers Shop the Category
Instead of being surveyed, 200 agents with distinct budgets, aesthetics, and constraints receive shopping objectives and autonomously evaluate the market.

**Observable Swarm Telemetry:**
- **Agent 041:** Vintage oversized jacket under £100 $\rightarrow$ inspected Your SKU $\rightarrow$ rejected: *"Too fitted and synthetic-looking"* $\rightarrow$ searched alternatives $\rightarrow$ inspected Competitor B $\rightarrow$ **PURCHASED Competitor B**.
- **Agent 092:** Inspected Your SKU $\rightarrow$ Price acceptable ✓ $\rightarrow$ Style acceptable ✓ $\rightarrow$ Colour unacceptable ✕ $\rightarrow$ **PURCHASED Competitor C**.

---

### 3. The Lost Demand Map (Merchant Intelligence)
```text
──────────────────────────────────────────────────────────
GSV MARKET TEST
200 Autonomous Buyers
──────────────────────────────────────────────────────────
YOUR PRODUCT WON:      31.0% (62 buyers)
COMPETITORS WON:       62.0% (124 buyers)
NO PURCHASE (BOUNCED):  7.0% (14 buyers)

NON-CAPTURE RATE:      69.0%
──────────────────────────────────────────────────────────
WHY YOU LOST (138 Inspecting Buyers):
• Wrong silhouette:          31.9% (44 buyers)
• Material perception:       21.0% (29 buyers)
• Colorway preference:       16.7% (23 buyers)
• Price sensitivity:         13.8% (19 buyers)
• Missing vintage details:    8.7% (12 buyers)
• Other:                      8.0% (11 buyers)
──────────────────────────────────────────────────────────
WHO BEAT YOU:
• Competitor B:  41 lost buyers (Won on: oversized silhouette, brown distressed finish)
• Competitor A:  29 lost buyers (Won on: genuine leather texture, premium hardware)
• Competitor C:  17 lost buyers (Won on: aggressive sub-£70 pricing)
──────────────────────────────────────────────────────────
```

---

### 4. Counterfactual Product Redesign (Grok)
Grok analyzes the lost demand traces and formulates **Variant B**:
- **Current SKU:** Black / Regular fit / PU Faux Leather / £99
- **GSV Counterfactual (Variant B):** Oil-wax Distressed Brown / Oversized Boxy / Heavyweight Vegan Suede / **£89** (Undercuts Competitor B by £22; unlocks price sweet spot) / Target BOM £38 (57.3% margin).

---

### 5. CORTEX Neural Visual Stimulus Check
Visual stimuli across Original SKU, Variant A, and Variant B are tested for relative cortical activation:
- Original SKU: 68.0 baseline
- Variant A: 75.0 (+10.3%)
- **Variant B: 84.3 (+24.0% relative cortical response)**

---

### 6. Swarm 2: Counterfactual Market Rerun (200 Held-Out Agents)
A fresh, held-out cohort of 200 buyer agents shops the market with Variant B in place of the Original SKU.

**Results:**
- Original Product Choice Share: **31%**
- Counterfactual Variant B Choice Share: **49%**
- **$\Delta$ AGENT CHOICE SHARE: +18 percentage points**
- 36 lost buyers reclaimed directly from competitors!

---

### 7. Merchant Action: Deploy & Shopify Draft
Grok Merchant Agent issues the deployment directive:
- Deploy Variant B.
- Expected market choice-share improvement: **+18 percentage points**.
- Click **`[CREATE SHOPIFY DRAFT]`**: Stages the draft product into Supabase / Shopify store.