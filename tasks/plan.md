# Implementation Plan: GSV — Autonomous Lost-Demand Engine (Commerce Wind Tunnel)

**Document:** `tasks/plan.md`  
**Governing Spec:** [docs/spec.md](file:///Users/prathamarora/projects/grok_hackathon/docs/spec.md) (SPEC-001 Frozen)  
**Task List Target:** [tasks/todo.md](file:///Users/prathamarora/projects/grok_hackathon/tasks/todo.md)  
**Mode:** PLAN (Zero implementation code written)

---

## 1. Executive Summary

GSV creates an autonomous counterfactual market simulator for eCommerce merchants:
1. Merchant pastes any product SKU URL (e.g. `https://shop.com/products/black-racing-jacket`).
2. SKU feature extractor processes page using an extraction ladder (JSON-LD $\rightarrow$ OpenGraph $\rightarrow$ Grok structured extraction $\rightarrow$ Tavily $\rightarrow$ Preset fixture).
3. Market Radar discovers real-world competitor SKUs via Tavily.
4. 200 discovery buyer agents autonomously shop the category, establishing baseline choice share (**31% Your SKU vs 62% Competitors vs 7% No-Purchase**) and exposing the Lost Demand Map.
5. Grok (`grok-4.7`) analyzes lost-demand traces to formulate **Variant B** (Oversized Boxy, Distressed Brown, £89).
6. CORTEX evaluates visual stimuli, confirming a **+24% relative cortical response** for Variant B (labeled as recorded CORTEX model evaluation for demo resilience).
7. A parallel market experiment across 200 identical held-out validation personas demonstrates a **+18 percentage point simulated choice-share uplift** (31% $\rightarrow$ 49%).
8. Grok Merchant Agent executes **`[CREATE SHOPIFY DRAFT]`** using the Shopify GraphQL Admin API (`2026-07`) via `productCreate` + `productVariantsBulkUpdate` (setting the £89 price) and records the experiment in Supabase.

---

## 2. Architectural Invariants

* **Development Law:**
  $$\text{Raw Swarm Traces} \longrightarrow \text{Pure Functions (formulas.ts)} \longrightarrow \text{Structured Evidence} \longrightarrow \text{Grok Decision}$$
* **No Invented Metrics & Grounded Rounding:**
  All choice shares and rejection counts sum to $138$ (displayed rounded percentages $31.9\%, 21.0\%, 16.7\%, 13.8\%, 8.7\%, 8.0\%$ totaling $100.1\%$ within $\le 0.1\text{pp}$ rounding allowance).
* **Controlled Parallel Validation:**
  Identical 200 held-out buyer personas shop in parallel across Market A (Original SKU) and Market B (Variant B) with identical competitor offerings, guaranteeing that measured $+18\text{pp}$ uplift is free from cohort variation.
* **Modern Shopify 2-Step GraphQL Admin API (`2026-07`):**
  Draft products are created using `productCreate`, followed by `productVariantsBulkUpdate` to configure the £89.00 price and variant properties.
* **Explicit `DEMO_MODE` Switching:**
  - `DEMO_MODE=live`: Real-time network calls to Tavily, Grok (`grok-4.7`), and Shopify GraphQL.
  - `DEMO_MODE=fixture`: Bypasses external networks completely for zero-latency, zero-failure stage resilience at Fleek.
* **Transparent Scientific Labeling:**
  CORTEX output is labeled as *"Recorded CORTEX model evaluation (cached for demo resilience)"*, preserving honest scientific claims.

---

## 3. Dependency Graph

```text
Next.js 14 Scaffold & TypeScript Contracts (Task 1)
        │
        ▼
Pure Mathematical Formulas: formulas.ts (Task 2)
        │
        ▼
Formula Verification Unit Tests (Task 3) ──▶ [CHECKPOINT 1]
        │
        ▼
Domain Data: Seed SKUs & 400 Personas (Task 4)
        │
        ├──▶ SKU Extraction Ladder & Market Radar (Task 5)
        └──▶ Swarm Simulation Engine: Market A & B (Task 6) ──▶ [CHECKPOINT 2]
                │
                ▼
Grok Redesign (grok-4.7) & CORTEX Neural Evaluator (Task 7)
        │
        ▼
Shopify GraphQL Admin API (productCreate + variant price) & Supabase (Task 8) ──▶ [CHECKPOINT 3]
        │
        ▼
UI Components: URL Hero & Swarm Arena Visualizer (Task 9)
        │
        ▼
UI Components: Lost Demand Map & Rejection Drivers (Task 10)
        │
        ▼
UI Components: Counterfactual View & Rerun Uplift (Task 11) ──▶ [CHECKPOINT 4]
        │
        ▼
Shopify Deploy Modal & 1-Click Auto-Run 3-Min Pitch (Task 12)
        │
        ▼
End-to-End Build & Stage Verification (Task 13) ──▶ [FINAL CHECKPOINT]
```

---

## 4. Phase Overview

- **Phase 1: Foundations & Pure Math Engine** (Tasks 1–3)
- **Phase 2: Domain Data, Extraction Ladder & Swarm Simulator** (Tasks 4–6)
- **Phase 3: Grok Redesign, CORTEX & Shopify GraphQL API** (Tasks 7–8)
- **Phase 4: Wind Tunnel Frontend & Visualizers** (Tasks 9–11)
- **Phase 5: Merchant Action, Auto-Run Pitch & Deployment Readiness** (Tasks 12–13)
