import { describe, it, expect } from "vitest";
import { extractProductFromUrl } from "../src/lib/engine/extractor";
import { getCategorySchema, discoverCompetitors, detectProductCategory } from "../src/lib/engine/categoryOntology";
import { generateBuyerCohort } from "../src/lib/engine/dynamicEngine";
import { runDynamicSwarmSimulation } from "../src/lib/engine/dynamicSimulator";
import { generateDynamicGrokRedesign, runDynamicParallelHeldOutRetest } from "../src/lib/engine/dynamicRedesign";

describe("Dynamic Multi-Category Commerce Wind Tunnel Engine (SPEC-002)", () => {
  // TEST 1: Apparel / Jacket URL
  it("TEST 1: Ingests jacket URL and outputs clothing dimensions, apparel competitors, and apparel rejection drivers", async () => {
    const url = "https://shop.com/products/black-racing-jacket";
    const extraction = await extractProductFromUrl(url);

    expect(extraction.commerceProduct.category).toBe("outerwear");
    expect(extraction.commerceProduct.price).toBe(99);

    const schema = await getCategorySchema(extraction.commerceProduct.category, extraction.commerceProduct.title);
    expect(schema.category).toBe("outerwear");
    const dimKeys = schema.decision_dimensions.map((d) => d.key);
    expect(dimKeys).toContain("silhouette");
    expect(dimKeys).toContain("material_quality");

    const competitors = await discoverCompetitors(extraction.commerceProduct, schema);
    expect(competitors.length).toBe(3);
    expect(competitors[0].title).toContain("Moto");

    const priceDist = { min: 69, max: 111, mean: 99 };
    const cohort = generateBuyerCohort(schema, priceDist, "test_jacket_cohort", 200);
    expect(cohort.length).toBe(200);

    const swarmResult = runDynamicSwarmSimulation(
      extraction.commerceProduct,
      competitors,
      schema,
      cohort,
      "test_jacket_swarm"
    );

    expect(swarmResult.report.totalAgents).toBe(200);
    expect(swarmResult.report.merchantPurchases + swarmResult.report.competitorPurchases + swarmResult.report.noPurchaseCount).toBe(200);
    expect(swarmResult.report.rejectionDrivers.length).toBeGreaterThan(0);
  });

  // TEST 2: Running Shoe URL
  it("TEST 2: Ingests running shoe URL and outputs footwear dimensions, running shoe competitors, and footwear rejection drivers", async () => {
    const url = "https://shop.com/products/nike-air-zoom-pegasus";
    const extraction = await extractProductFromUrl(url);

    expect(extraction.commerceProduct.category).toBe("running_shoes");
    expect(extraction.commerceProduct.title).toContain("Nike");

    const schema = await getCategorySchema(extraction.commerceProduct.category, extraction.commerceProduct.title);
    expect(schema.category).toBe("running_shoes");
    const dimKeys = schema.decision_dimensions.map((d) => d.key);
    expect(dimKeys).toContain("cushioning");
    expect(dimKeys).toContain("stability");
    expect(dimKeys).toContain("weight");

    const competitors = await discoverCompetitors(extraction.commerceProduct, schema);
    expect(competitors.length).toBe(3);
    const competitorTitles = competitors.map((c) => c.title);
    expect(competitorTitles.some((t) => t.includes("Adidas"))).toBe(true);
    expect(competitorTitles.some((t) => t.includes("Hoka"))).toBe(true);

    const priceDist = { min: 125, max: 140, mean: 133 };
    const cohort = generateBuyerCohort(schema, priceDist, "test_shoes_cohort", 200);
    expect(cohort.length).toBe(200);

    const swarmResult = runDynamicSwarmSimulation(
      extraction.commerceProduct,
      competitors,
      schema,
      cohort,
      "test_shoes_swarm"
    );

    expect(swarmResult.report.totalAgents).toBe(200);
    expect(swarmResult.traces.length).toBe(200);
    expect(swarmResult.report.merchantChoiceShare + swarmResult.report.competitorChoiceShare + swarmResult.report.noPurchaseRate).toBeCloseTo(1.0, 1);
    
    // Footwear rejection drivers
    const drivers = swarmResult.report.rejectionDrivers.map((d) => d.reason);
    expect(drivers.length).toBeGreaterThan(0);
  });

  // TEST 3: Wireless Headphones URL
  it("TEST 3: Ingests headphones URL and outputs audio dimensions, audio competitors, and electronics rejection drivers", async () => {
    const url = "https://shop.com/products/sony-wh-1000xm5";
    const extraction = await extractProductFromUrl(url);

    expect(extraction.commerceProduct.category).toBe("wireless_headphones");
    expect(extraction.commerceProduct.title).toContain("Sony");

    const schema = await getCategorySchema(extraction.commerceProduct.category, extraction.commerceProduct.title);
    expect(schema.category).toBe("wireless_headphones");
    const dimKeys = schema.decision_dimensions.map((d) => d.key);
    expect(dimKeys).toContain("anc");
    expect(dimKeys).toContain("battery_hours");

    const competitors = await discoverCompetitors(extraction.commerceProduct, schema);
    expect(competitors.length).toBe(3);
    const compNames = competitors.map((c) => c.brand);
    expect(compNames).toContain("Bose");
    expect(compNames).toContain("Sennheiser");

    const priceDist = { min: 89, max: 329, mean: 240 };
    const cohort = generateBuyerCohort(schema, priceDist, "test_headphones_cohort", 200);
    expect(cohort.length).toBe(200);

    const swarmResult = runDynamicSwarmSimulation(
      extraction.commerceProduct,
      competitors,
      schema,
      cohort,
      "test_audio_swarm"
    );

    expect(swarmResult.report.totalAgents).toBe(200);
    expect(swarmResult.report.merchantChoiceShare).toBeGreaterThan(0);
  });

  // TEST 4: Grok Redesign & Adversarial Held-Out Swarm Rerun
  it("runs Grok Redesign and held-out validation swarm on the same 200 held-out cohort", async () => {
    const url = "https://shop.com/products/nike-air-zoom-pegasus";
    const extraction = await extractProductFromUrl(url);
    const schema = await getCategorySchema(extraction.commerceProduct.category, extraction.commerceProduct.title);
    const competitors = await discoverCompetitors(extraction.commerceProduct, schema);

    const priceDist = { min: 125, max: 140, mean: 133 };
    const discoveryCohort = generateBuyerCohort(schema, priceDist, "discovery_test", 200);

    const round1Result = runDynamicSwarmSimulation(
      extraction.commerceProduct,
      competitors,
      schema,
      discoveryCohort,
      "discovery_test"
    );

    // Grok Redesign
    const proposal = await generateDynamicGrokRedesign(
      extraction.commerceProduct,
      round1Result.report,
      schema,
      competitors
    );

    expect(proposal.redesignedSKU).toBeDefined();
    expect(proposal.designChanges.length).toBeGreaterThan(0);

    // Parallel Held-Out Retest
    const rerun = await runDynamicParallelHeldOutRetest(
      extraction.commerceProduct,
      proposal.redesignedSKU,
      competitors,
      schema,
      proposal
    );

    expect(rerun.baselineReport.totalAgents).toBe(200);
    expect(rerun.counterfactualReport.totalAgents).toBe(200);
    expect(rerun.counterfactualResult).toBeDefined();
    expect(typeof rerun.counterfactualResult.deltaPercentagePoints).toBe("number");
    expect(rerun.validationStatus === "validated" || rerun.validationStatus === "rejected").toBe(true);
  });

  // TEST 5: Never secretly swap in jacket on extraction failure
  it("rejects non-extractable URLs with clear error and never secretly swaps in the jacket fixture", async () => {
    await expect(extractProductFromUrl("https://invalid-nonexistent-domain.xyz/")).rejects.toThrow(
      "Could not reliably extract this product. Try another public product URL."
    );
  });
});
