"use client";

import React, { useState } from "react";
import { Search, Sparkles, ArrowRight, ShieldCheck, Tag, AlertCircle } from "lucide-react";
import { ProductSKU, CommerceProduct } from "@/types";

interface UrlInputHeroProps {
  onStartSimulation: (url: string) => void;
  isLoading: boolean;
  extractedSKU: ProductSKU | null;
  commerceProduct?: CommerceProduct | null;
  errorMessage?: string | null;
}

export const UrlInputHero: React.FC<UrlInputHeroProps> = ({
  onStartSimulation,
  isLoading,
  extractedSKU,
  commerceProduct,
  errorMessage,
}) => {
  const [url, setUrl] = useState("https://shop.com/products/black-racing-jacket");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onStartSimulation(url.trim());
    }
  };

  const setPreset = (presetUrl: string) => {
    setUrl(presetUrl);
    onStartSimulation(presetUrl);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-10">
      <div className="mx-auto max-w-4xl px-4 text-center">
        {/* Category Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan/10 px-3 py-1 text-xs font-mono font-medium text-cyan border border-cyan/20 mb-4">
          <Sparkles className="h-3.5 w-3.5 text-cyan" />
          <span>AUTONOMOUS COMMERCE WIND TUNNEL</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
          Where Did Your <span className="bg-gradient-to-r from-crimson to-amber-400 bg-clip-text text-transparent">Demand Leak</span>?
        </h1>
        <p className="mx-auto max-w-2xl text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
          Paste a public product URL. Grok Bot establishes category decision dimensions, 200 autonomous discovery buyers shop your live market locally, and an adversarial held-out retest proves if product changes reclaim demand.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl relative mb-4">
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a public product URL..."
              disabled={isLoading}
              className="w-full rounded-2xl bg-surface/90 py-4 pl-12 pr-44 text-sm text-slate-100 placeholder-slate-500 border border-surface-border shadow-2xl focus:border-cyan focus:outline-none focus:ring-2 focus:ring-cyan/20 transition-all font-mono"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-2 bottom-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 text-xs sm:text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 focus:outline-none disabled:opacity-50 flex items-center gap-2 transition-all font-sans"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>SIMULATING...</span>
                </>
              ) : (
                <>
                  <span>RELEASE SWARM</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Presets: The 3 Category Milestones */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-slate-500 flex items-center gap-1">
            <Tag className="h-3 w-3" /> Quick Test Presets:
          </span>
          <button
            type="button"
            onClick={() => setPreset("https://shop.com/products/black-racing-jacket")}
            className="rounded-lg bg-surface px-2.5 py-1 text-slate-300 hover:text-cyan border border-white/5 hover:border-cyan/30 transition-all"
          >
            🧥 Apparel: Racing Jacket (£99)
          </button>
          <button
            type="button"
            onClick={() => setPreset("https://shop.com/products/nike-air-zoom-pegasus")}
            className="rounded-lg bg-surface px-2.5 py-1 text-slate-300 hover:text-cyan border border-white/5 hover:border-cyan/30 transition-all"
          >
            👟 Footwear: Nike Pegasus (£130)
          </button>
          <button
            type="button"
            onClick={() => setPreset("https://shop.com/products/sony-wh-1000xm5")}
            className="rounded-lg bg-surface px-2.5 py-1 text-slate-300 hover:text-cyan border border-white/5 hover:border-cyan/30 transition-all"
          >
            🎧 Audio: Sony WH-1000XM5 (£299)
          </button>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="mt-4 mx-auto max-w-xl rounded-xl p-3 bg-crimson/15 border border-crimson/30 text-rose-300 text-xs font-mono flex items-center gap-2 text-left">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-crimson" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Extracted Product Badge if available */}
        {extractedSKU && !errorMessage && (
          <div className="mt-6 mx-auto max-w-xl text-left rounded-xl p-3.5 bg-surface/60 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center text-xs text-slate-400 font-mono">
                {extractedSKU.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={extractedSKU.imageUrl}
                    alt={extractedSKU.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "SKU"
                )}
              </div>
              <div>
                <p className="text-xs font-mono text-cyan flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  PRODUCT UNDER TEST {commerceProduct?.category && `• ${commerceProduct.category.toUpperCase()}`}
                </p>
                <h4 className="text-sm font-semibold text-white">{extractedSKU.title}</h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-mono font-bold text-white">£{extractedSKU.price.toFixed(2)}</span>
              <p className="text-[11px] text-slate-400">{extractedSKU.silhouette || "Standard Fit"}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
