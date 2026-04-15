import {
  createMarketingOgImage,
  marketingOgImageContentType,
  marketingOgImageSize
} from "@/lib/marketing/opengraph";

export const alt = "Build SaaS with AI using Neroa";
export const size = marketingOgImageSize;
export const contentType = marketingOgImageContentType;
export const runtime = "edge";

export default function OpenGraphImage() {
  return createMarketingOgImage({
    eyebrow: "Build SaaS with AI",
    title: "Build SaaS with AI through a guided product path.",
    summary:
      "Use Neroa to move from SaaS idea to scope, MVP, budget, build planning, and launch with clearer execution logic.",
    chips: ["SaaS planning", "Budget-aware MVP", "DIY or managed"]
  });
}
