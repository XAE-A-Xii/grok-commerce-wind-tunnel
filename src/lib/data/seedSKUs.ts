import { ProductSKU } from "@/types";

export const MERCHANT_SKU: ProductSKU = {
  id: "sku_merchant_001",
  url: "https://shop.com/products/black-racing-jacket",
  brand: "Aura Athletics",
  title: "Black Racing Jacket",
  price: 99.0,
  silhouette: "Regular / Fitted",
  material: "Polyurethane (PU) Faux Leather",
  colorway: "Solid Black",
  rating: 4.1,
  imageUrl: "/assets/jacket_original.svg",
  isMerchantSKU: true,
};

export const COMPETITOR_SKUS: ProductSKU[] = [
  {
    id: "sku_comp_a",
    url: "https://competitor-a.co.uk/products/classic-moto-leather",
    brand: "Apex Moto",
    title: "Classic Moto Leather Jacket",
    price: 109.0,
    silhouette: "Slim / Rigid Fit",
    material: "Top-Grain Buffalo Leather",
    colorway: "Matte Black",
    rating: 4.6,
    imageUrl: "/assets/jacket_comp_a.svg",
    isMerchantSKU: false,
  },
  {
    id: "sku_comp_b",
    url: "https://vintage-garage.com/products/oversized-racer-brown",
    brand: "Vintage Garage",
    title: "Oversized Distressed Racer Jacket",
    price: 111.0,
    silhouette: "Oversized Boxy",
    material: "Aged Cowhide / Distressed Suede",
    colorway: "Distressed Oil Brown",
    rating: 4.8,
    imageUrl: "/assets/jacket_comp_b.svg",
    isMerchantSKU: false,
  },
  {
    id: "sku_comp_c",
    url: "https://fastfashion-racer.com/products/biker-bomber",
    brand: "Urban Biker",
    title: "Budget Biker Bomber",
    price: 69.0,
    silhouette: "Standard Bomber",
    material: "Lightweight Synthetic Polyester",
    colorway: "Black / White Trim",
    rating: 3.7,
    imageUrl: "/assets/jacket_comp_c.svg",
    isMerchantSKU: false,
  },
];

export const ALL_SEED_SKUS: ProductSKU[] = [MERCHANT_SKU, ...COMPETITOR_SKUS];

export const COUNTERFACTUAL_VARIANT_B: ProductSKU = {
  id: "sku_variant_b",
  url: "https://shop.com/products/brown-oversized-vintage-motorsport-jacket",
  brand: "Aura Athletics",
  title: "Brown Oversized Vintage Motorsport Jacket",
  price: 89.0,
  silhouette: "Oversized Boxy",
  material: "Heavyweight Distressed Vegan Suede / Oil-Wax Canvas blend",
  colorway: "Oil-Wax Distressed Brown",
  rating: 4.9,
  imageUrl: "/assets/jacket_variant_b.svg",
  isMerchantSKU: true,
};
