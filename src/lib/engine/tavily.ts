export interface TavilyRecoveredProduct {
  title: string;
  price: number | null;
  imageUrl: string;
  source: "tavily_extract" | "tavily_search";
}

const NAV_LINE =
  /^(jump to(?: content)?|main menu|menu|search|home|cart|sign in|log in|cookie|skip to(?: content)?|navigation|appearance|donate|personal tools)$/i;

/**
 * Tavily Extract authenticates with a bearer token and reports per-URL failures
 * in `failed_results` even when the HTTP status is 200.
 * https://docs.tavily.com/documentation/api-reference/endpoint/extract
 * https://docs.tavily.com/documentation/api-reference/introduction
 */
export async function recoverProductWithTavily(
  url: string,
  apiKey: string
): Promise<TavilyRecoveredProduct | null> {
  const extracted = await extractUrl(url, apiKey);
  if (extracted) return extracted;
  return searchForUrl(url, apiKey);
}

export function parseTavilyProduct(
  raw: string,
  images: string[] = []
): { title: string; price: number | null; imageUrl: string } {
  const lines = raw
    .split("\n")
    .map((line) => line.replace(/^#+\s*/, "").replace(/[*_`]/g, "").trim())
    .filter((line) => line.length > 3 && !NAV_LINE.test(line) && !isGarbageLine(line) && !/^brand\s*:/i.test(line));

  return {
    title: lines[0]?.replace(/\s+/g, " ") || "",
    price: parsePrice(raw),
    imageUrl: images.find((image) => /^https?:\/\//i.test(image) && !isGarbageLine(image)) || "",
  };
}

async function extractUrl(url: string, apiKey: string): Promise<TavilyRecoveredProduct | null> {
  const response = await fetch("https://api.tavily.com/extract", {
    method: "POST",
    headers: tavilyHeaders(apiKey),
    body: JSON.stringify({
      urls: [url],
      extract_depth: "advanced",
      include_images: true,
      format: "markdown",
      query: "product title brand price",
      chunks_per_source: 5,
      timeout: 12,
    }),
    signal: AbortSignal.timeout(14000),
  });

  if (!response.ok) return null;

  const data = await response.json();
  const page = (data.results || []).find(
    (result: { raw_content?: string }) => typeof result.raw_content === "string" && result.raw_content.trim().length > 0
  );
  if (!page) return null;

  const parsed = parseTavilyProduct(page.raw_content, page.images || []);
  if (parsed.title.length < 3) return null;

  return { ...parsed, source: "tavily_extract" };
}

async function searchForUrl(url: string, apiKey: string): Promise<TavilyRecoveredProduct | null> {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: tavilyHeaders(apiKey),
    body: JSON.stringify({
      query: searchQuery(url),
      search_depth: "basic",
      max_results: 5,
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) return null;

  const data = await response.json();
  for (const result of data.results || []) {
    const title = String(result.title || "")
      .replace(/- Amazon\..*$/i, "")
      .trim();
    if (title.length < 3 || isGarbageLine(title) || title === url) continue;
    const parsed = parseTavilyProduct(`${title}\n${result.content || ""}`, []);
    if (parsed.title.length < 3) continue;
    return {
      title: parsed.title,
      price: parsed.price,
      imageUrl: "",
      source: "tavily_search",
    };
  }

  return null;
}

function searchQuery(url: string): string {
  const asin = url.match(/\/(?:dp|d)\/([A-Z0-9]{10})/i)?.[1];
  return asin ? `${asin} amazon.co.uk` : url;
}

function tavilyHeaders(apiKey: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

function parsePrice(text: string): number | null {
  const labeled = text.match(
    /(?:price|rrp|cost)[^0-9£$€]{0,16}(?:£|\$|€)?\s*(\d{1,5}(?:[.,]\d{2})?)/i
  );
  const symbol = text.match(/(?:£|\$|€)\s*(\d{1,5}(?:[.,]\d{2})?)/);
  const raw = labeled?.[1] || symbol?.[1];
  if (!raw) return null;
  const value = parseFloat(raw.replace(",", "."));
  if (!Number.isFinite(value) || value <= 0 || value > 100000) return null;
  return value;
}

function isGarbageLine(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    lower.includes("uedata") ||
    lower.includes("fls-eu") ||
    lower.includes("robot check") ||
    lower.includes("captcha") ||
    lower.includes("just a moment") ||
    lower.includes("access denied") ||
    lower.includes("batch/1/") ||
    lower.startsWith("![") ||
    lower.includes("fls-")
  );
}
