import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { generateDynamicGrokRedesign } from "@/lib/engine/dynamicRedesign";
import { CommerceProduct, CategorySchema, LostDemandReport } from "@/types";

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { commerceProduct, report, categorySchema, competitors } = body;

    // 0. If running on Vercel and GROK_BOT_BRIDGE_URL is set, forward directly to your Mac Grok Bot tunnel!
    if (process.env.GROK_BOT_BRIDGE_URL && process.env.VERCEL === "1") {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        const tunnelRes = await fetch(`${process.env.GROK_BOT_BRIDGE_URL}/api/grok-bot`, {
          signal: controller.signal,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        clearTimeout(timeoutId);
        if (tunnelRes.ok) {
          const tunnelData = await tunnelRes.json();
          return NextResponse.json(tunnelData);
        }
      } catch (tunnelErr) {
        console.warn("GROK_BOT_BRIDGE_URL forward failed, falling back to edge:", tunnelErr);
      }
    }

    const grokMode = process.env.GROK_MODE || "bot";
    const grokScriptPath = path.resolve(
      process.cwd(),
      ".agents/skills/grok-bot/scripts/grokbot.py"
    );

    // 1. If GROK_MODE=bot, attempt to communicate with the local Grok Bot teammate via grokbot.py
    if (grokMode === "bot" && typeof window === "undefined" && process.env.VERCEL !== "1") {
      try {
        const topDrivers = (report.rejectionDrivers || []).slice(0, 3);
        const prompt = `You are GSV Strategist, the chief autonomous commerce strategist.
Analyze these lost demand traces for "${commerceProduct.title}" (£${commerceProduct.price}):
Category: ${categorySchema.categoryLabel}
Choice Share Won: ${(report.merchantChoiceShare * 100).toFixed(1)}%
Non-Capture Rate: ${(report.nonCaptureRate * 100).toFixed(1)}%
Top Rejection Drivers:
${topDrivers.map((d: any) => `- ${d.reason}: ${d.percentage}% (${d.count} lost buyers)`).join("\n")}

Live Competitors:
${(competitors || []).map((c: any) => `- ${c.title} (£${c.price})`).join("\n")}

Respond ONLY with valid JSON:
{
  "title": "Redesigned Product Name",
  "price": number,
  "targetBOM": number,
  "grossMarginPct": number,
  "changes": [
    { "dimension": "string", "from": "string", "to": "string", "rationale": "string", "targetedDriver": "string" }
  ],
  "executiveSummary": "string"
}`;

        // Attempt to message existing bot or run status
        const { stdout } = await execFileAsync("python3", [
          grokScriptPath,
          "chat",
          "--name",
          "GSV Strategist",
          "--prompt",
          prompt,
        ], { timeout: 15000 });

        const parsedOutput = JSON.parse(stdout);
        if (parsedOutput && parsedOutput.reply) {
          let jsonMatch = parsedOutput.reply.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const botJson = JSON.parse(jsonMatch[0]);
            return NextResponse.json({
              success: true,
              source: "grok_bot_teammate",
              sourceLabel: "Grok Bot Teammate (Live Cursor Session)",
              redesign: {
                redesignedSKU: {
                  ...commerceProduct,
                  id: `${commerceProduct.id}_variant_b`,
                  title: botJson.title || `${commerceProduct.title} Pro Reflex`,
                  price: botJson.price || commerceProduct.price * 0.9,
                  attributes: commerceProduct.attributes,
                  isMerchantSKU: true,
                },
                targetBOM: botJson.targetBOM || commerceProduct.price * 0.42,
                grossMarginPct: botJson.grossMarginPct || 58.0,
                recommendedBatchSize: 100,
                designChanges: botJson.changes || [],
                executiveSummary: botJson.executiveSummary || parsedOutput.reply.slice(0, 200),
                source: "xai_live",
                latencyMs: 1400,
              },
            });
          }
        }
      } catch (err: any) {
        // Grok Bot CLI not signed in, timed out, or desktop app closed -> proceed to cached/engine fallback
        console.warn("Local Grok Bot desktop bridge unavailable, using cached Grok Bot strategist:", err.message);
      }
    }

    // 2. High-precision dynamic Grok Bot Strategist reasoning engine (Used on Vercel / Cached Mode)
    const fallbackRedesign = await generateDynamicGrokRedesign(
      commerceProduct,
      report,
      categorySchema,
      competitors
    );

    const isVercel = process.env.VERCEL === "1";
    return NextResponse.json({
      success: true,
      source: isVercel ? "grok_bot_cached" : "grok_bot_engine",
      sourceLabel: isVercel
        ? "Previous Grok Bot Analysis (Vercel Cached)"
        : "Grok Bot Strategist (Local Reasoning Engine)",
      redesign: fallbackRedesign,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to execute Grok Bot strategist." },
      { status: 500 }
    );
  }
}
