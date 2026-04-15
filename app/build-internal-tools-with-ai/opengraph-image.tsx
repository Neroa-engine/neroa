import {
  createMarketingOgImage,
  marketingOgImageContentType,
  marketingOgImageSize
} from "@/lib/marketing/opengraph";

export const alt = "Build internal tools with AI using Neroa";
export const size = marketingOgImageSize;
export const contentType = marketingOgImageContentType;
export const runtime = "edge";

export default function OpenGraphImage() {
  return createMarketingOgImage({
    eyebrow: "Build internal tools with AI",
    title: "Turn messy internal workflows into structured internal software.",
    summary:
      "Use Neroa to plan dashboards, CRMs, workflow systems, and internal tools with scope, budget, and execution clarity.",
    chips: ["Workflow-first planning", "Internal software", "DIY or managed"]
  });
}
