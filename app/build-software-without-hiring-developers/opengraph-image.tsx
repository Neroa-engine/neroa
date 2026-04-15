import {
  createMarketingOgImage,
  marketingOgImageContentType,
  marketingOgImageSize
} from "@/lib/marketing/opengraph";

export const alt = "Build software without hiring developers using Neroa";
export const size = marketingOgImageSize;
export const contentType = marketingOgImageContentType;
export const runtime = "edge";

export default function OpenGraphImage() {
  return createMarketingOgImage({
    eyebrow: "Build software without hiring developers",
    title: "Start the software build before a full traditional team is required.",
    summary:
      "Neroa helps founders and operators scope, pace, and build software with guided AI support and monthly Engine Credits.",
    chips: ["Lower capital barrier", "Monthly credits", "Structured execution"]
  });
}
