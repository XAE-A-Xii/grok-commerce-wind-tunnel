import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GSV — Autonomous Lost-Demand Engine | Commerce Wind Tunnel",
  description:
    "Simulate 200 autonomous discovery buyer agents against live competitors, pinpoint lost demand drivers, generate counterfactual product redesigns, and validate with held-out parallel market testing.",
  keywords: [
    "autonomous agents",
    "synthetic buyers",
    "ecommerce wind tunnel",
    "lost demand",
    "grok",
    "cortex",
    "counterfactual testing",
  ],
};

export const viewport: Viewport = {
  themeColor: "#070A0F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-slate-100 antialiased selection:bg-cyan/20 selection:text-cyan-200">
        <div className="relative min-h-screen flex flex-col bg-grid-pattern">
          {children}
        </div>
      </body>
    </html>
  );
}
