"use client";

import React, { useState } from "react";
import { X, ShoppingBag, CheckCircle2, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";
import { ShopifyDraftRecord } from "@/types";

interface ShopifyDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle?: string;
  defaultPrice?: number;
  defaultBOM?: number;
  defaultBatch?: number;
}

export const ShopifyDeployModal: React.FC<ShopifyDeployModalProps> = ({
  isOpen,
  onClose,
  defaultTitle = "Brown Oversized Vintage Motorsport Jacket",
  defaultPrice = 89.0,
  defaultBOM = 38.0,
  defaultBatch = 100,
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [price, setPrice] = useState(defaultPrice);
  const [bom, setBOM] = useState(defaultBOM);
  const [batchUnits, setBatchUnits] = useState(defaultBatch);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedRecord, setDeployedRecord] = useState<ShopifyDraftRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const grossMargin = (((price - bom) / price) * 100).toFixed(1);

  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);

    try {
      const res = await fetch("/api/shopify/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          price,
          targetBOM: bom,
          pilotBatchUnits: batchUnits,
          imageUrl: "/assets/jacket_variant_b.png",
        }),
      });

      const data = await res.json();
      if (data.success && data.draftRecord) {
        setDeployedRecord(data.draftRecord);
      } else {
        setError(data.error || "Failed deploying draft product to Shopify.");
      }
    } catch (err: any) {
      setError(err.message || "Network error connecting to deployment API.");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-white/15 p-6 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
          <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400 border border-emerald-500/30">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono uppercase">
              CREATE SHOPIFY DRAFT PRODUCT
            </h3>
            <p className="text-xs text-slate-400">Shopify GraphQL Admin API (2026-07)</p>
          </div>
        </div>

        {/* Success View */}
        {deployedRecord ? (
          <div className="py-6 text-center space-y-4 animate-fadeIn">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">Draft Successfully Created!</h4>
              <p className="text-xs text-slate-400 mt-1">
                Saved in Shopify as status <span className="text-amber-400 font-mono font-bold">DRAFT</span> with verified margin.
              </p>
            </div>

            <div className="rounded-xl bg-black/50 p-4 border border-white/10 text-left text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Product ID:</span>
                <span className="text-white font-bold">{deployedRecord.shopify_product_id || deployedRecord.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Retail Price:</span>
                <span className="text-emerald-400 font-bold">£{deployedRecord.target_rrp.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gross Margin:</span>
                <span className="text-emerald-400 font-bold">{grossMargin}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pilot Exposure Cap:</span>
                <span className="text-cyan font-bold">{batchUnits} units</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={deployedRecord.shopify_draft_url || "#"}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-300 transition-all font-mono"
              >
                <span>OPEN IN SHOPIFY ADMIN</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        ) : (
          /* Form View */
          <div className="py-4 space-y-4">
            {error && (
              <div className="rounded-lg bg-crimson/20 border border-crimson/40 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            {/* Title Input */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                PRODUCT TITLE (VARIANT B)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl bg-black/40 px-3.5 py-2.5 text-xs text-white border border-white/10 focus:border-cyan focus:outline-none font-mono"
              />
            </div>

            {/* Pricing & BOM Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  TARGET RETAIL PRICE (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl bg-black/40 px-3.5 py-2.5 text-xs text-white border border-white/10 focus:border-cyan focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  TARGET BOM COST (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={bom}
                  onChange={(e) => setBOM(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl bg-black/40 px-3.5 py-2.5 text-xs text-white border border-white/10 focus:border-cyan focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Batch Units & Margin preview */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  PILOT BATCH EXPOSURE
                </label>
                <input
                  type="number"
                  value={batchUnits}
                  onChange={(e) => setBatchUnits(parseInt(e.target.value) || 100)}
                  className="w-full rounded-xl bg-black/40 px-3.5 py-2.5 text-xs text-white border border-white/10 focus:border-cyan focus:outline-none font-mono"
                />
              </div>
              <div className="rounded-xl bg-black/30 border border-white/5 p-2.5 flex flex-col justify-center text-center">
                <span className="text-[10px] font-mono text-slate-400">EXPECTED MARGIN</span>
                <span className="text-base font-black font-mono text-emerald-400">
                  {grossMargin}%
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-900/60 p-3 border border-white/5 text-[11px] text-slate-400 leading-relaxed font-mono">
              <ShieldCheck className="h-4 w-4 text-emerald-400 inline mr-1" />
              Executes GraphQL mutation <code className="text-white">productCreate</code> followed by{" "}
              <code className="text-white">productVariantsBulkUpdate</code>. Safe mode: created as <strong>DRAFT</strong>.
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDeploy}
                disabled={isDeploying}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50 transition-all font-mono"
              >
                {isDeploying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>DEPLOYING TO SHOPIFY GRAPHQL...</span>
                  </>
                ) : (
                  <>
                    <span>CONFIRM & CREATE SHOPIFY DRAFT</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
