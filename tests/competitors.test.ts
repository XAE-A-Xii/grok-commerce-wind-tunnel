import { describe, expect, it } from "vitest";
import { CATEGORY_SCHEMAS, discoverCompetitors, pickLiveCompetitors } from "../src/lib/engine/categoryOntology";

describe("competitor discovery", () => {
  it("keeps real product links and drops roundups", () => {
    const picked = pickLiveCompetitors(
      [
        { title: "Best waterproof trousers 2024", url: "https://www.reddit.com/r/hiking/comments/1", content: "" },
        {
          title: "Regatta Women's Pack-It Overtrousers | Amazon.co.uk: Fashion",
          url: "https://www.amazon.co.uk/dp/B00REGATTA1",
          content: "Price £24.99",
        },
        {
          title: "Craghoppers Women's Kiwi Trousers",
          url: "https://www.amazon.co.uk/dp/B00CRAGHOP",
          content: "£32.00",
        },
        {
          title: "Peter Storm Waterproof Overtrousers",
          url: "https://www.amazon.co.uk/dp/B00PETER01",
          content: "",
        },
      ],
      {
        title: "Mountain Warehouse Womens Waterproof Overtrousers",
        price: 29.99,
        sourceUrl: "https://www.amazon.co.uk/dp/B00Z2RL0AK",
      },
      CATEGORY_SCHEMAS.outerwear
    );

    expect(picked).toHaveLength(3);
    expect(picked.map((competitor) => competitor.sourceUrl)).toEqual([
      "https://www.amazon.co.uk/dp/B00REGATTA1",
      "https://www.amazon.co.uk/dp/B00CRAGHOP",
      "https://www.amazon.co.uk/dp/B00PETER01",
    ]);
    expect(picked[0].title).toBe("Regatta Women's Pack-It Overtrousers");
    expect(picked[0].price).toBe(24.99);
    expect(picked.some((competitor) => competitor.title.toLowerCase().includes("best"))).toBe(false);
  });

  it("does not compare waterproof trousers with moto jackets when search is unavailable", async () => {
    const previous = process.env.TAVILY_API_KEY;
    delete process.env.TAVILY_API_KEY;
    const competitors = await discoverCompetitors(
      {
        id: "merchant",
        title: "Mountain Warehouse Womens Waterproof Overtrousers",
        brand: "Mountain Warehouse",
        category: "outerwear",
        price: 29.99,
        currency: "GBP",
        attributes: {},
        sourceUrl: "https://www.amazon.co.uk/dp/B00Z2RL0AK",
      },
      CATEGORY_SCHEMAS.outerwear
    );
    if (previous === undefined) delete process.env.TAVILY_API_KEY;
    else process.env.TAVILY_API_KEY = previous;

    expect(competitors.map((competitor) => competitor.sourceUrl).every((url) => url.startsWith("http"))).toBe(true);
    expect(competitors.some((competitor) => competitor.title.includes("Moto"))).toBe(false);
    expect(competitors.some((competitor) => competitor.title.includes("Regatta"))).toBe(true);
  });
});
