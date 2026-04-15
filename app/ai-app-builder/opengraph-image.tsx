import {
  createMarketingOgImage,
  marketingOgImageContentType,
  marketingOgImageSize
} from "@/lib/marketing/opengraph";

export const alt = "Neroa AI app builder";
export const size = marketingOgImageSize;
export const contentType = marketingOgImageContentType;
export const runtime = "edge";

export default function OpenGraphImage() {
  return createMarketingOgImage({
    eyebrow: "AI app builder",
    title: "Use an AI app builder that guides the product, not just the prompt.",
    summary:
      "Neroa connects scope, MVP, budget, build, and launch for SaaS, internal software, external apps, and mobile apps.",
    chips: ["Guided app flow", "Scope before stack", "DIY and managed lanes"]
  });
}
