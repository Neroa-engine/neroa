import {
  createMarketingOgImage,
  marketingOgImageContentType,
  marketingOgImageSize
} from "@/lib/marketing/opengraph";

export const alt = "Managed software build service with Neroa";
export const size = marketingOgImageSize;
export const contentType = marketingOgImageContentType;
export const runtime = "edge";

export default function OpenGraphImage() {
  return createMarketingOgImage({
    eyebrow: "Managed software build service",
    title: "Use Neroa when you want structured software execution, not black-box delivery.",
    summary:
      "Managed Build adds phased delivery, approval checkpoints, launch coordination, and guided visibility for more execution-heavy products.",
    chips: ["Phased delivery", "Approval checkpoints", "Launch support"]
  });
}
