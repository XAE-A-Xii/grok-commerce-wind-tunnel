import { describe, expect, it } from "vitest";
import { amazonAsinFromUrl, isWeakProductTitle, parseProductHtml } from "../src/lib/engine/productPage";

describe("parseProductHtml", () => {
  it("reads an Amazon product title, price, and image", () => {
    const html = `
      <html><head><title>Syphiby Dress : Amazon.co.uk: Fashion</title></head>
      <body>
        <span id="productTitle">Syphiby Womens Flowy Square Neck Chiffon Tunic Tops</span>
        <a id="bylineInfo" href="/stores/Syphiby">Visit the Syphiby Store</a>
        <img data-old-hires="https://m.media-amazon.com/images/I/71Z99hXlHSL._AC_SL1500_.jpg" />
        <script>{"priceAmount":21.99}</script>
      </body></html>`;

    const product = parseProductHtml(html);
    expect(product.title).toBe("Syphiby Womens Flowy Square Neck Chiffon Tunic Tops");
    expect(product.brand).toBe("Syphiby");
    expect(product.price).toBe(21.99);
    expect(product.imageUrl).toContain("71Z99hXlHSL");
    expect(product.source).toBe("open_graph");
  });

  it("reads JSON-LD when the offer price is an array or a lowPrice", () => {
    const pencil = parseProductHtml(`
      <script type="application/ld+json">
        {"@type":"Product","name":"Apple Pencil Pro","brand":{"@type":"Brand","name":"Apple"},
         "image":"https://store.example/pencil.jpg",
         "offers":[{"@type":"Offer","price":129,"priceCurrency":"GBP"}]}
      </script>`);
    expect(pencil.title).toBe("Apple Pencil Pro");
    expect(pencil.brand).toBe("Apple");
    expect(pencil.price).toBe(129);
    expect(pencil.imageUrl).toBe("https://store.example/pencil.jpg");
    expect(pencil.source).toBe("json_ld");

    const bag = parseProductHtml(`
      <script type="application/ld+json">
        {"@graph":[{"@type":"Product","name":"Acme Drawstring Bag","offers":{"@type":"AggregateOffer","lowPrice":"6.00","priceCurrency":"USD"},"image":["https://cdn.example/bag.png"]}]}
      </script>`);
    expect(bag.title).toBe("Acme Drawstring Bag");
    expect(bag.price).toBe(6);
    expect(bag.imageUrl).toBe("https://cdn.example/bag.png");
  });

  it("reads Open Graph tags when content comes before property", () => {
    const html = `<meta content="Ceramic Pour Over Kettle" property="og:title" />
      <meta content="https://cdn.example/kettle.jpg" property="og:image" />
      <meta content="42.00" property="product:price:amount" />`;
    const product = parseProductHtml(html);
    expect(product.title).toBe("Ceramic Pour Over Kettle");
    expect(product.price).toBe(42);
    expect(product.imageUrl).toBe("https://cdn.example/kettle.jpg");
  });

  it("rejects storefront boilerplate and bare ASINs as product titles", () => {
    expect(isWeakProductTitle("Best Deals on RoyalDeals.co.uk")).toBe(true);
    expect(isWeakProductTitle("B0CQYHB88J")).toBe(true);
    expect(isWeakProductTitle("Syphiby Womens Flowy Square Neck Chiffon Tunic Tops")).toBe(false);
    expect(amazonAsinFromUrl("https://uk.royaldeals.co.uk/product/amazon-essentials-womens-fit-and-flare/B097K6KZ8K/")).toBe("B097K6KZ8K");
    expect(amazonAsinFromUrl("https://www.amazon.co.uk/Casual-Leggings/dp/B0CQYHB88J?th=1")).toBe("B0CQYHB88J");
  });
});
