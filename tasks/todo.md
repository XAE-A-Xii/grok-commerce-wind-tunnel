# Task List: GSV — Autonomous Lost-Demand Engine (Commerce Wind Tunnel)

**Target Spec:** [docs/spec.md](file:///Users/prathamarora/projects/grok_hackathon/docs/spec.md) (SPEC-001 Frozen)  
**Implementation Plan:** [tasks/plan.md](file:///Users/prathamarora/projects/grok_hackathon/tasks/plan.md)  
**Tracking Mode:** Markdown Checklist (`tasks/todo.md`)

---

## Phase 1: Foundations & Pure Math Engine

### Task 1: Next.js 14 Scaffold & TypeScript Domain Contracts
**Description:** Initialize the Next.js 14 App Router project with TypeScript strict mode, Tailwind CSS dark theme tokens (`#070A0F`, `#0D131F`, emerald `#10B981`, cyan `#06B6D4`, crimson `#EF4444`), Lucide icons, and complete domain contracts in `src/types/index.ts` matching Section 6 of SPEC-001.

**Acceptance criteria:**
- [x] `package.json` contains Next.js 14, Tailwind, Lucide, Supabase, and testing dependencies.
- [x] `src/types/index.ts` exports `ProductSKU`, `ShoppingAgent`, `AgentShoppingTrace`, `LostDemandReport`, `CounterfactualResult`, and `ShopifyDraftRecord`.
- [x] Tailwind and global CSS configure dark-mode glassmorphic utility classes.

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Typecheck passes: `npx tsc --noEmit`
- [x] Manual check: Confirm directory layout matches SPEC-001 Section 5.

**Dependencies:** None  
**Files touched:**
- `package.json`
- `tsconfig.json`
- `tailwind.config.js`
- `src/types/index.ts`
- `src/app/globals.css`
- `src/app/layout.tsx`

---

### Task 2: Pure Mathematical Formulas (`lib/engine/formulas.ts`)
**Description:** Implement the pure deterministic mathematical engine in `src/lib/engine/formulas.ts`. Implements helper rounding functions (`round1D`, `round2D`), baseline Choice Share (31% Your SKU, 62% Competitors, 7% No-Purchase), Non-Capture Rate (69.0%), Rejection Driver percentages ($31.9\%, 21.0\%, 16.7\%, 13.8\%, 8.7\%, 8.0\%$), and Counterfactual Uplift ($\Delta\text{ChoiceShare} = +18.0\text{pp}$).

**Acceptance criteria:**
- [x] `calculateChoiceSharePct(purchases, total)` returns exact 1-decimal share percentages.
- [x] `calculateNonCaptureRate(merchantPurchases, total)` evaluates to `0.690` (69.0%).
- [x] `calculateRejectionDrivers(rejectionCounts, total)` returns exact counts summing to 138 and percentages summing to 100.1% ($\le 0.1\text{pp}$ rounding allowance).
- [x] `calculateDeltaChoiceShare(round1Share, round2Share)` returns `+18.0pp` (49.0% vs 31.0%).
- [x] Zero non-deterministic functions or external network calls exist in this file.

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit`
- [x] Manual check: Verify formula equations match Section 3 of SPEC-001.

**Dependencies:** Task 1  
**Files touched:**
- `src/lib/engine/formulas.ts`

---

### Task 3: Formula Verification Unit Test Suite
**Description:** Write and execute an automated test suite (`tests/formulas.test.ts`) that verifies every calculation against the values in SPEC-001, confirming zero fabricated metrics and mathematical consistency across rounding rules.

**Acceptance criteria:**
- [x] Unit tests verify:
  - Baseline Choice Share: Your SKU = 31.0% (62/200), Competitors = 62.0% (124/200), No-Purchase = 7.0% (14/200).
  - Non-Capture Rate = 69.0% (138/200).
  - Rejection drivers ($N=138$): Silhouette (31.9% / 44), Material (21.0% / 29), Color (16.7% / 23), Price (13.8% / 19), Vintage (8.7% / 12), Other (8.0% / 11).
  - Parallel Counterfactual Choice Share = 49.0% (98/200).
  - $\Delta\text{Choice Share} = +18.0\text{pp}$.
  - CORTEX relative response: Variant B = 84.3 (+24.0% vs 68.0 baseline).
  - Gross margin = 57.3% (£89 RRP vs £38 BOM).

**Verification:**
- [x] Tests pass: `npm test` (6/6 formula tests pass).
- [x] Zero assertion failures.

**Dependencies:** Task 2  
**Files touched:**
- `tests/formulas.test.ts`
- `vitest.config.ts`

---

## Checkpoint 1: Mathematical Engine Verified
- [x] All formula unit tests pass (`npm test`).
- [x] TypeScript strict compilation succeeds.
- [x] Core mathematical laws verified before building domain simulation.

---

## Phase 2: Domain Data, Extraction Ladder & Swarm Simulator

### Task 4: Domain Data & Seed Product Fixtures
**Description:** Implement `src/lib/data/seedSKUs.ts` with the default merchant URL (`https://shop.com/products/black-racing-jacket`) and real-world Competitor SKUs (Competitor A: Apex Moto £109, Competitor B: Vintage Garage £111, Competitor C: Urban Biker £69). Implement `src/lib/data/buyerPersonas.ts` generating 200 Discovery agents and 200 Held-Out validation agents with realistic budgets, style preferences, and constraints.

**Acceptance criteria:**
- [x] `seedSKUs.ts` exports `MERCHANT_SKU`, `COMPETITOR_SKUS`, and `COUNTERFACTUAL_VARIANT_B`.
- [x] `buyerPersonas.ts` exports 200 Discovery personas and 200 Held-Out personas with deterministic IDs, budgets (£70–£140), and styles.
- [x] Personas contain explicit requirement importance and price elasticity thresholds.

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit`
- [x] Unit test: Confirm cohort counts (`discovery: 200`, `held_out: 200`).

**Dependencies:** Task 1  
**Files touched:**
- `src/lib/data/seedSKUs.ts`
- `src/lib/data/buyerPersonas.ts`
- `src/lib/data/fixtureExperiment.ts`

---

### Task 5: SKU Extraction Ladder & Market Radar (`lib/engine/extractor.ts`, API Routes)
**Description:** Implement `src/lib/engine/extractor.ts` and API routes (`/api/extract`). Implements a robust extraction ladder for pasted URLs (Schema.org JSON-LD $\rightarrow$ OpenGraph / meta tags $\rightarrow$ Grok structured extraction $\rightarrow$ Tavily $\rightarrow$ Preset fixture). Respects `DEMO_MODE=fixture` for zero-failure stage resilience.

**Acceptance criteria:**
- [x] Extraction ladder parses Schema.org `Product` JSON-LD and falls back cleanly through OpenGraph and synthetic fallback.
- [x] When `DEMO_MODE=fixture` (or network fails), returns guaranteed high-fidelity preset product fixture instantly without network errors.
- [x] Market Radar returns 3 competing SKUs with price, features, and imagery.

**Verification:**
- [x] API endpoint test: `POST /api/extract` returns 200 JSON.
- [x] Fixture test: Runs with `DEMO_MODE=fixture` with network disconnected.

**Dependencies:** Task 4  
**Files touched:**
- `src/lib/engine/extractor.ts`
- `src/app/api/extract/route.ts`

---

### Task 6: Autonomous Market Swarm Simulation Engine (`lib/engine/simulator.ts`)
**Description:** Implement the multi-agent shopping swarm engine that simulates autonomous category shopping across Your SKU and Competitors A, B, and C. Implements both **Round 1 (Discovery Swarm — 200 agents)** and **Round 2 (Parallel Counterfactual Experiment — 200 Held-Out agents across Market A and Market B)**.

**Acceptance criteria:**
- [x] `runDiscoverySwarm(agents, skus)` returns exact 31% choice share, 62% competitor share, 7% no-purchase, and the 138-agent rejection breakdown.
- [x] `runParallelHeldOutSwarm(heldOutAgents, originalSkus, variantBSkus)` runs identical 200 held-out agents across both markets and outputs exact 49.0% choice share for Variant B (+18.0pp uplift).
- [x] Tracks individual agent defect trace (41 lost to B, 29 to A, 17 to C).

**Verification:**
- [x] Automated test: `tests/simulator.test.ts` validates that Round 1 and Round 2 output exact SPEC-001 numbers.
- [x] Typecheck passes: `npx tsc --noEmit`.

**Dependencies:** Tasks 2, 4  
**Files touched:**
- `src/lib/engine/simulator.ts`
- `src/app/api/simulate/route.ts`
- `tests/simulator.test.ts`

---

## Checkpoint 2: Swarm & Market Discovery Engine Functional
- [x] Extraction ladder successfully resolves URLs to structured attributes.
- [x] Discovery and Counterfactual swarm simulations execute deterministically.
- [x] Parallel market tests verify +18pp uplift on held-out agents.

---

## Phase 3: Grok Redesign, CORTEX & Shopify GraphQL API

### Task 7: Grok Product Redesigner & CORTEX Neural Evaluator
**Description:** Implement `src/lib/engine/grokRedesign.ts` and `src/lib/engine/cortexEvaluator.ts`. Grok (using configurable `XAI_MODEL=grok-4.7`) analyzes lost-demand traces to formulate Counterfactual Variant B (Oversized Boxy, Distressed Brown, £89). CORTEX evaluator compares visual stimuli (Original: 68.0, Variant A: 75.0, Variant B: 84.3 / +24.0% relative response), transparently labeling cached model results for demo resilience.

**Acceptance criteria:**
- [x] `generateGrokRedesign(sku, report)` uses `process.env.GROK_MODEL || 'grok-4.7'` to generate Variant B structured specifications.
- [x] `evaluateCortexStimuli(...)` returns relative cortical activation, visual salience, and parietal attention ROI (Variant B = 84.3).
- [x] UI metadata indicates: *"Recorded CORTEX model evaluation (cached for demo resilience)"*.
- [x] `DEMO_MODE=fixture` immediately supplies exact deterministic redesign without external LLM latency.

**Verification:**
- [x] API test: `POST /api/redesign` returns valid Variant B object.
- [x] CORTEX test: Variant B evaluates to 84.3 (+24% relative response).

**Dependencies:** Tasks 2, 6  
**Files touched:**
- `src/lib/engine/grokRedesign.ts`
- `src/lib/engine/cortexEvaluator.ts`
- `src/app/api/redesign/route.ts`

---

### Task 8: Shopify GraphQL Admin API (`2026-07`) & Supabase Persistence
**Description:** Implement `src/lib/shopify/client.ts` and `src/lib/supabase/client.ts`. Connects to Shopify GraphQL Admin API (`POST /admin/api/2026-07/graphql.json`) using a 2-step mutation: `productCreate` (creates DRAFT product) $\rightarrow$ `productVariantsBulkUpdate` (configures £89.00 price, SKU, and inventory). Persists full experiment telemetry to Supabase.

**Acceptance criteria:**
- [x] `createShopifyDraftProduct(variantB)` calls `productCreate` followed by variant pricing mutation to configure £89.00.
- [x] `saveExperimentRun(record)` inserts row into Supabase / in-memory store.
- [x] Graceful fallback: In `DEMO_MODE=fixture` or when credentials are unset, returns structured draft payload with live previewable direct admin link.

**Verification:**
- [x] API test: `POST /api/shopify/deploy` returns 200 with draft product ID or structured preview.
- [x] Payload validation: Verify mutation string matches 2026-07 specification.

**Dependencies:** Task 7  
**Files touched:**
- `src/lib/shopify/client.ts`
- `src/lib/supabase/client.ts`
- `src/app/api/shopify/deploy/route.ts`

---

## Checkpoint 3: Redesign & Commerce Deployment Ready
- [x] Grok redesign engine (`grok-4.7`) and CORTEX neural models respond correctly.
- [x] Shopify GraphQL 2-step draft creation and Supabase persistence functional.
- [x] All fallback fixtures operational for offline presentation.

---

## Phase 4: Wind Tunnel Frontend & Visualizers

### Task 9: URL Input Hero & Live Market Arena Swarm Visualizer
**Description:** Build `src/components/UrlInputHero.tsx` (URL input box with 1-click preset selector and "Release Swarm" CTA) and `src/components/SwarmArena.tsx` (interactive visualizer rendering 200 autonomous agent nodes with individual agent inspector).

**Acceptance criteria:**
- [x] Input hero allows pasting any URL or clicking preset (`Black Racing Jacket £99`).
- [x] Swarm Arena renders distinct visual nodes for 200 agents, filterable by merchant/competitor/bounce.
- [x] Agent Inspector displays individual agent profiles, budgets, and explicit rejection reasons.

**Verification:**
- [x] Visual check: Verified in live browser.
- [x] Interactive check: Clicking preset immediately populates input and triggers visual state.

**Dependencies:** Tasks 1, 4, 6  
**Files touched:**
- `src/components/UrlInputHero.tsx`
- `src/components/SwarmArena.tsx`

---

### Task 10: Lost Demand Map & Defection Telemetry Dashboard
**Description:** Build `src/components/LostDemandTelemetry.tsx` and `src/components/CompetitorDefectionMatrix.tsx`. Displays the post-swarm diagnosis: 31% Merchant Choice Share gauge, 62% Competitors Won, 7% No-Purchase (69% Non-Capture Rate), Rejection Drivers breakdown bar chart, and the "Who Beat You & Why" head-to-head comparison cards.

**Acceptance criteria:**
- [x] Visual gauge shows 31% Choice Share vs 62% Competitors vs 7% No-Purchase.
- [x] Rejection breakdown shows exact counts summing to 138 and percentages ($31.9\%, 21.0\%, 16.7\%, 13.8\%, 8.7\%, 8.0\%$).
- [x] Verification rule: Rejection counts sum to 138; rounded percentages differ from 100.0% by $\le 0.1\text{pp}$ (100.1%).
- [x] Interactive competitor cards reveal why Competitors B, A, and C captured demand.

**Verification:**
- [x] Visual check: High-contrast typography with emerald/crimson accents.
- [x] Number audit: All percentages and counts match SPEC-001.

**Dependencies:** Tasks 2, 6, 9  
**Files touched:**
- `src/components/LostDemandTelemetry.tsx`
- `src/components/CompetitorDefectionMatrix.tsx`

---

### Task 11: Counterfactual View, CORTEX Brain Radar & Parallel Rerun Uplift
**Description:** Build `src/components/GrokRedesignCard.tsx`, `src/components/CortexSignalCard.tsx`, and `src/components/ParallelRerunSection.tsx`. Renders side-by-side comparison between Current SKU and Grok Variant B, the CORTEX visual response radar (+24% for B), and the Round 2 parallel market rerun demonstrating the **+18 percentage points Choice Share uplift** (31% $\rightarrow$ 49%) in the held-out synthetic market with reclaimed buyer breakdown.

**Acceptance criteria:**
- [x] Side-by-side product card highlights physical changes (Distressed Brown, Oversized Boxy, £89).
- [x] CORTEX card displays 84.3 vs 68.0 cortical response index, labeled as recorded model evaluation.
- [x] Rerun results card visualizes the +18pp choice-share leap and 36 reclaimed buyers.

**Verification:**
- [x] Visual check: Before/after animated delta indicator (+18pp).
- [x] Data check: Reclaimed buyers trace to Competitors B, A, C and bounces.

**Dependencies:** Tasks 7, 10  
**Files touched:**
- `src/components/GrokRedesignCard.tsx`
- `src/components/CortexSignalCard.tsx`
- `src/components/ParallelRerunSection.tsx`

---

## Checkpoint 4: Complete Wind Tunnel Frontend Integrated
- [x] URL Hero, Swarm Arena, Lost Demand Map, and Counterfactual Rerun render seamlessly.
- [x] Zero UI layout shifts or console errors.
- [x] All data and animations fully interactive.

---

## Phase 5: Merchant Action, Auto-Run Pitch & Deployment Readiness

### Task 12: Shopify Deploy Modal & 1-Click "Auto-Run 3-Min Pitch" Toggle
**Description:** Build `src/components/ShopifyDeployModal.tsx` and `src/components/Navbar.tsx`. Modal features the **`[CREATE SHOPIFY DRAFT]`** action, showing real-time GraphQL mutation status and direct draft link. Navbar includes the **1-Click "3-Min Pitch Demo"** button.

**Acceptance criteria:**
- [x] Clicking `[CREATE SHOPIFY DRAFT]` triggers the `/api/shopify/deploy` route, displaying a success state and direct Shopify admin link.
- [x] Auto-Run toggle smoothly advances through the full 6-stage presentation in under 180 seconds.
- [x] User can manually run or auto-pitch at any time.

**Verification:**
- [x] Functional check: Verified in live browser subagent test session.
- [x] Action check: Draft product creation returns success status.

**Dependencies:** Tasks 8, 11  
**Files touched:**
- `src/components/ShopifyDeployModal.tsx`
- `src/components/Navbar.tsx`

---

### Task 13: End-to-End Build Verification & Stage Rehearsal
**Description:** Wire all components into `src/app/page.tsx`, run full production build (`npm run build`), verify zero ESLint/TypeScript errors, test complete offline demo resilience with `DEMO_MODE=fixture` (zero network calls).

**Acceptance criteria:**
- [x] `npm run build` succeeds with zero errors or warnings (14.9 kB route, 8/8 static pages).
- [x] All unit tests pass (`npm test`, 8/8 tests passed).
- [x] With `DEMO_MODE=fixture`, app operates 100% offline with zero failed network requests.
- [x] Ready for 16:30 code freeze.

**Verification:**
- [x] Build verification: `npm run build`
- [x] Rehearsal verification: Browser subagent end-to-end recording captured (`gsv_wind_tunnel_demo_1790422325373.webp`).

**Dependencies:** Tasks 1–12  
**Files touched:**
- `src/app/page.tsx`
- `tasks/todo.md`

---

## Final Checkpoint: Code Freeze Ready (16:30 BST)
- [x] All 13 tasks complete.
- [x] All unit tests and production build green.
- [x] Ready for stage demo presentation.

---

## Phase 6: Dynamic Multi-Category Commerce Wind Tunnel (SPEC-002)

### Task 14: Dynamic Domain Contracts & Seeded PRNG Buyer Factory
**Description:** Define `CommerceProduct`, `CategorySchema`, `DecisionDimension`, `DynamicBuyerAgent`, and `DynamicDecisionTrace` in `src/types/index.ts`. Implement seeded PRNG (`mulberry32`) buyer cohort factory (`generateBuyerCohort`) in `src/lib/engine/dynamicEngine.ts`.
**Acceptance criteria:**
- [x] Export `CommerceProduct` with dynamic attributes and category.
- [x] Seeded buyer cohort generation generates 200 heterogeneous buyers deterministically given a schema and price distribution.
- [x] Personas feature distinct budgets, max WTP, price sensitivity, and weighted dimension preferences.

### Task 15: Extraction Ladder & Tavily Grounding
**Description:** Upgrade `src/lib/engine/extractor.ts` and create `src/lib/engine/tavily.ts` with JSON-LD, OpenGraph, Tavily Extract, and Grok Normalizer.
**Acceptance criteria:**
- [x] Resolves public URLs into normalized `CommerceProduct` records.
- [x] Uses Tavily Extract / Search when API key is provided, with intelligent offline category fallbacks.
- [x] If extraction fails, returns explicit error: *"Could not reliably extract this product. Try another public product URL."* — zero secret jacket fallbacks for arbitrary URLs.

### Task 16: Category Ontology & Live Competitor Discovery
**Description:** Implement `src/lib/engine/categoryOntology.ts` to deduce category decision dimensions (cushioning, stability, weight for running shoes; battery, ANC, weight for headphones; silhouette, material for apparel) and discover live competitors via Tavily Search.
**Acceptance criteria:**
- [x] Produces category schema with weighted decision dimensions.
- [x] Identifies 3 realistic or live competitors for any category.

### Task 17: Local Multi-Attribute Swarm Simulator & Trace Engine
**Description:** Implement generic multi-attribute utility engine in `src/lib/engine/dynamicSimulator.ts`. Computes `utility(agent, product) = attributeFit + priceFit + noise`, logs structured rejection evidence, and derives real choice shares without hard-coded numbers.
**Acceptance criteria:**
- [x] Simulates 200 agents in <200ms locally.
- [x] Computes real choice share, real non-capture rate, and dynamically aggregated rejection drivers.

### Task 18: Grok Bot Counterfactual Redesign & Adversarial Retest
**Description:** Upgrade `src/lib/engine/grokRedesign.ts` and simulator to formulate category-appropriate physical redesigns and run parallel held-out market validation (Market A vs Market B) with real delta (+/- pp).
**Acceptance criteria:**
- [x] Formulates dynamic counterfactual specs based on the top empirical rejection drivers.
- [x] Reruns held-out 200 agents to measure real, non-hardcoded uplift (validates or rejects the counterfactual).

### Task 19: Frontend Dynamic Visualizers & Milestone Demos
**Description:** Update `UrlInputHero.tsx`, `SwarmArena.tsx`, `LostDemandTelemetry.tsx`, `GrokRedesignCard.tsx`, and `app/page.tsx`.
**Acceptance criteria:**
- [x] UI displays: *"Paste a public product URL"* with 3 quick test presets: Jacket, Running Shoes, Headphones.
- [x] Dynamically displays category, decision dimensions, competitors, rejection drivers, and counterfactual results.

### Task 20: Multi-Category Integration Test Suite & Vercel Readiness
**Description:** Implement automated test suite in `tests/dynamicEngine.test.ts` verifying Test 1 (Jacket), Test 2 (Running Shoes), Test 3 (Headphones). Verify `npm run build` passes with zero errors for Vercel deployment.
**Acceptance criteria:**
- [x] All 3 category tests pass with distinct competitors, dimensions, and rejection reasons.
- [x] `npm test` (13/13 passed) and `npm run build` (0 errors, 8/8 static pages) succeed cleanly.


