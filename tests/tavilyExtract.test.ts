import { afterEach, describe, expect, it, vi } from "vitest";
import { extractProductFromUrl } from "../src/lib/engine/extractor";

const PRODUCT_URL = "https://www.amazon.co.uk/dp/B07G372NH2";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Tavily page extraction", () => {
  const originalKey = process.env.TAVILY_API_KEY;

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    if (originalKey === undefined) delete process.env.TAVILY_API_KEY;
    else process.env.TAVILY_API_KEY = originalKey;
  });

  it("extracts a blocked product page with the documented Tavily Extract request", async () => {
    process.env.TAVILY_API_KEY = "tvly-test-key";
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const href = String(input);
      if (href === "https://api.tavily.com/extract") {
        return jsonResponse({
          results: [
            {
              url: PRODUCT_URL,
              raw_content:
                "Jump to content\nMain menu\n# Chunky Block Heel Chelsea Ankle Boots\nBrand: Example Fashion\nPrice: £39.99\nA suede ankle boot.",
              images: ["https://cdn.example/boots.jpg"],
            },
          ],
          failed_results: [],
        });
      }
      return new Response("robot check", { status: 503 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const extraction = await extractProductFromUrl(PRODUCT_URL);

    const extractCall = fetchMock.mock.calls.find((call) => String(call[0]) === "https://api.tavily.com/extract");
    expect(extractCall).toBeTruthy();
    const init = extractCall?.[1];
    const headers = new Headers(init?.headers);
    expect(headers.get("authorization")).toBe("Bearer tvly-test-key");
    const body = JSON.parse(String(init?.body));
    expect(body.urls).toEqual([PRODUCT_URL]);
    expect(body.extract_depth).toBe("advanced");
    expect(body.include_images).toBe(true);
    expect(body.query).toBeTruthy();
    expect(body.api_key).toBeUndefined();

    expect(extraction.source).toBe("tavily_extract");
    expect(extraction.commerceProduct.title).toBe("Chunky Block Heel Chelsea Ankle Boots");
    expect(extraction.commerceProduct.price).toBe(39.99);
    expect(extraction.commerceProduct.imageUrl).toBe("https://cdn.example/boots.jpg");
  });

  it("reads a mobile Amazon link from the desktop product page", async () => {
    delete process.env.TAVILY_API_KEY;
    const mobile = "https://www.amazon.co.uk/gp/aw/d/B07G372NH2/?th=1&psc=1";
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const href = String(input);
      if (href === "https://www.amazon.co.uk/dp/B07G372NH2") {
        return new Response(
          `<span id="productTitle">DREAM PAIRS Women's High Heel Suede Chelsea Boots</span>
           <script>{"priceAmount":38.99}</script>
           <img src="https://m.media-amazon.com/images/I/boot.jpg" data-old-hires="https://m.media-amazon.com/images/I/boot.jpg" />`,
          { status: 200, headers: { "Content-Type": "text/html" } }
        );
      }
      return new Response("robot check", { status: 503 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const extraction = await extractProductFromUrl(mobile);

    expect(fetchMock.mock.calls.some((call) => String(call[0]) === "https://www.amazon.co.uk/dp/B07G372NH2")).toBe(true);
    expect(extraction.commerceProduct.title).toBe("DREAM PAIRS Women's High Heel Suede Chelsea Boots");
    expect(extraction.commerceProduct.price).toBe(38.99);
    expect(extraction.commerceProduct.imageUrl).toBe("https://m.media-amazon.com/images/I/boot.jpg");
  });

  it("does not treat an HTTP 200 failed_results payload as a fetched product page", async () => {
    process.env.TAVILY_API_KEY = "tvly-test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const href = String(input);
        if (href === "https://api.tavily.com/extract") {
          return jsonResponse({
            results: [],
            failed_results: [{ url: "https://blocked.example/", error: "Failed to retrieve content" }],
          });
        }
        if (href === "https://api.tavily.com/search") {
          return jsonResponse({ results: [] });
        }
        return new Response("robot check", { status: 503 });
      })
    );

    await expect(extractProductFromUrl("https://blocked.example/")).rejects.toThrow(
      "Could not reliably extract this product. Try another public product URL."
    );
  });
});
