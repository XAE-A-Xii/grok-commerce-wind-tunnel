export interface PageProduct {
  title: string;
  price: number | null;
  brand: string;
  imageUrl: string;
  source: "json_ld" | "open_graph";
}

const EMPTY: PageProduct = {
  title: "",
  price: null,
  brand: "",
  imageUrl: "",
  source: "open_graph",
};

export function parseProductHtml(html: string): PageProduct {
  const fromJsonLd = parseJsonLd(html);
  const fromDom = parseDom(html);

  const title = firstUsable(fromJsonLd.title, fromDom.title);
  const price = fromJsonLd.price ?? fromDom.price;
  const imageUrl = fromJsonLd.imageUrl || fromDom.imageUrl;
  const brand = fromJsonLd.brand || fromDom.brand;

  if (!title && price == null && !imageUrl) return EMPTY;

  return {
    title,
    price,
    brand,
    imageUrl,
    source: fromJsonLd.title && fromJsonLd.title === title ? "json_ld" : "open_graph",
  };
}

export function isWeakProductTitle(title: string): boolean {
  const cleaned = collapse(title);
  if (cleaned.length < 3) return true;
  if (/^[A-Z0-9]{10}$/i.test(cleaned)) return true;
  const lower = cleaned.toLowerCase();
  return (
    lower.includes("best deals on") ||
    lower.includes("robot check") ||
    lower.includes("captcha") ||
    lower.includes("just a moment") ||
    lower.includes("access denied") ||
    lower === "amazon.co.uk" ||
    lower.startsWith("amazon.com")
  );
}

export function amazonAsinFromUrl(url: string): string | null {
  const explicit = url.match(/(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/product\/)([A-Z0-9]{10})(?:[/?#]|$)/i);
  if (explicit && looksLikeAsin(explicit[1])) return explicit[1].toUpperCase();

  try {
    const segments = new URL(url).pathname.split("/").filter(Boolean);
    for (let i = segments.length - 1; i >= 0; i--) {
      if (looksLikeAsin(segments[i])) return segments[i].toUpperCase();
    }
  } catch {
    return null;
  }
  return null;
}

function parseJsonLd(html: string): PageProduct {
  const blocks = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of blocks) {
    const jsonText = block.replace(/<\/?script[^>]*>/gi, "").trim();
    if (!jsonText) continue;
    try {
      const products: any[] = [];
      collectProducts(JSON.parse(jsonText), products);
      for (const product of products) {
        const title = usable(typeof product.name === "string" ? product.name : "");
        if (!title) continue;
        const brand =
          typeof product.brand === "string"
            ? product.brand
            : typeof product.brand?.name === "string"
            ? product.brand.name
            : "";
        return {
          title,
          price: priceFromOffers(product.offers),
          brand,
          imageUrl: firstImage(product.image),
          source: "json_ld",
        };
      }
    } catch {
      continue;
    }
  }
  return EMPTY;
}

function parseDom(html: string): PageProduct {
  const productTitle = usable(textContent(html.match(/id=["']productTitle["'][^>]*>([\s\S]*?)<\//i)?.[1] || ""));
  const documentTitle = usable(cleanDocumentTitle(textContent(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "")));
  const ogTitle = usable(metaContent(html, "og:title"));
  const title = firstUsable(productTitle, ogTitle, documentTitle);

  const priceAmount = html.match(/"priceAmount"\s*:\s*([0-9]+(?:\.[0-9]+)?)/)?.[1];
  const offscreen = html.match(/class=["'][^"']*a-offscreen[^"']*["'][^>]*>\s*[£$€]\s*([0-9]+(?:\.[0-9]{2})?)/i)?.[1];
  const ogPrice = metaContent(html, "product:price:amount") || metaContent(html, "og:price:amount");
  const symbol = html.match(/(?:£|\$|€)\s*([0-9]{1,5}(?:\.[0-9]{2})?)/)?.[1];
  const price = positive(priceAmount) ?? positive(offscreen) ?? positive(ogPrice) ?? positive(symbol);

  const byline = textContent(html.match(/<a[^>]*id=["']bylineInfo["'][^>]*>([\s\S]*?)<\/a>/i)?.[1] || "");
  const brand = byline
    .replace(/^visit the\s+/i, "")
    .replace(/\s+store$/i, "")
    .replace(/^brand:\s*/i, "")
    .trim();

  const hires = html.match(/data-old-hires=["'](https?:[^"']+)["']/i)?.[1];
  const dynamic = decode(html.match(/data-a-dynamic-image=["']([^"']+)["']/i)?.[1] || "").match(/https?:[^"\\]+/)?.[0];
  const hiResJson = html.match(/"hiRes"\s*:\s*"(https?:[^"]+)"/)?.[1];
  const ogImage = metaContent(html, "og:image") || metaContent(html, "twitter:image");

  return {
    title,
    price,
    brand,
    imageUrl: hires || dynamic || hiResJson || ogImage || "",
    source: "open_graph",
  };
}

function collectProducts(node: any, out: any[]) {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach((item) => collectProducts(item, out));
    return;
  }
  if (typeof node !== "object") return;
  const type = node["@type"];
  const types = Array.isArray(type) ? type : type ? [type] : [];
  if (types.includes("Product") && node.name) out.push(node);
  if (node["@graph"]) collectProducts(node["@graph"], out);
}

function priceFromOffers(offers: any): number | null {
  if (!offers) return null;
  if (Array.isArray(offers)) {
    for (const offer of offers) {
      const price = priceFromOffers(offer);
      if (price != null) return price;
    }
    return null;
  }
  const raw = offers.price ?? offers.lowPrice ?? offers.highPrice ?? offers.priceSpecification?.price;
  return positive(raw);
}

function firstImage(image: any): string {
  if (!image) return "";
  if (typeof image === "string") return image.startsWith("http") ? image : "";
  if (Array.isArray(image)) return firstImage(image[0]);
  if (typeof image.url === "string") return image.url;
  return "";
}

function metaContent(html: string, key: string): string {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const attrs: Record<string, string> = {};
    const attrPattern = /([\w:-]+)\s*=\s*["']([^"']*)["']/gi;
    let match: RegExpExecArray | null;
    while ((match = attrPattern.exec(tag)) !== null) {
      attrs[match[1].toLowerCase()] = decode(match[2]);
    }
    const id = (attrs.property || attrs.name || "").toLowerCase();
    if (id === key.toLowerCase() && attrs.content) return attrs.content;
  }
  return "";
}

function cleanDocumentTitle(title: string): string {
  return title
    .replace(/\s*[:|]\s*Amazon\.[a-z.]+.*$/i, "")
    .replace(/\s+[-|]\s*Amazon\.[a-z.]+.*$/i, "")
    .trim();
}

function usable(title: string): string {
  const cleaned = collapse(decode(title));
  return cleaned && !isWeakProductTitle(cleaned) ? cleaned : "";
}

function firstUsable(...titles: string[]): string {
  return titles.find((title) => title.length > 0) || "";
}

function positive(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const value = typeof raw === "number" ? raw : parseFloat(String(raw).replace(/,/g, ""));
  if (!Number.isFinite(value) || value <= 0 || value > 100000) return null;
  return value;
}

function looksLikeAsin(value: string): boolean {
  return /^[A-Z0-9]{10}$/i.test(value) && /[A-Z]/i.test(value) && /\d/.test(value);
}

function textContent(value: string): string {
  return value.replace(/<[^>]+>/g, " ");
}

function collapse(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function decode(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
